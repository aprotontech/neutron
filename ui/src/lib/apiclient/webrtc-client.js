/**
 * WebRTC Client for P2P File Transfer
 * Handles file listing and P2P transmission of files
 */

import { v4 as uuidv4 } from 'uuid';
import BaseClient from './base-client.js';
import WebRTCDataChannelRPC from './webrtc-dc-rpc.js';
import WebRTCDataChannelThumbnail from './webrtc-dc-thumbnail.js';
import WebRTCDataChannelFileContent from './webrtc-dc-file.js';
import * as proto from '../proto/message_pb.js';
import WebRTCDataChannelVideo from './webrtc-dc-video.js'

const RemoteMessage = proto.RemoteMessage;

// Helper function to create a Struct from a plain JavaScript object
function createStructFromObject(obj) {
    if (!obj || typeof obj !== 'object') {
        return null;
    }

    // Try to use google-protobuf if available
    try {
        // In browser environment, google-protobuf might be available globally
        let structPb;
        if (typeof require !== 'undefined') {
            // Node.js environment
            structPb = require('google-protobuf/google/protobuf/struct_pb.js');
        } else if (typeof window !== 'undefined' && window.google_protobuf_struct_pb) {
            // Browser environment with global variable
            structPb = window.google_protobuf_struct_pb;
        } else {
            // Try to import dynamically
            structPb = globalThis.google_protobuf_struct_pb;
        }

        if (!structPb) {
            console.warn('google-protobuf struct_pb not available');
            return null;
        }

        const Struct = structPb.Struct;
        const Value = structPb.Value;

        const struct = new Struct();
        const fields = {};

        for (const [key, value] of Object.entries(obj)) {
            fields[key] = Value.fromJavaScript(value);
        }

        struct.setFields(fields);
        return struct;
    } catch (e) {
        // If we can't create a Struct, return null
        console.warn('Could not create Struct from object:', e);
        return null;
    }
}

export default class WebRTCClient extends BaseClient {
    constructor(wsaddr, clientId, storageServerId, token, auth_failed_callback) {
        super();
        // token should be provided by the caller (app); do not access storage here
        this.token = token || '';
        this.pc = null;
        this.dc = null;
        this.dataChannelQueue = [];
        this.connected = false;
        this.clientId = clientId; // Unique identifier for this client
        this.storageServerId = storageServerId
        this.auth_failed_callback = auth_failed_callback

        wsaddr += '?token=' + encodeURIComponent(this.token);
        console.log("websocket server: ", wsaddr)

        this.signalingSocket = new WebSocket(wsaddr);

        // Track whether socket ever opened successfully
        this._socketOpened = false;
        // Initialize WebRTC peer connection
        const config = {
            iceServers: [
                { urls: ['stun:stun.l.google.com:19302'] },
                { urls: ['stun:stun1.l.google.com:19302'] }
            ]
        };
        this.pc = new RTCPeerConnection(config);
        // Create RPC-capable data channel helper bound to this peer connection
        this.rpc = new WebRTCDataChannelRPC(this.pc);
        // Thumbnail data channel helper (receives binary thumbnails)
        this.thumbnail = new WebRTCDataChannelThumbnail(this.pc);

        // Handle common auth failure cases on socket errors/close
        this.signalingSocket.onerror = (ev) => {
            console.error('Signaling socket error', JSON.stringify(ev), ev.error, ev.message);
            // If socket never opened, likely auth rejection during handshake
            if (!this._socketOpened) {
                // Give the server a brief moment to send a close reason, then redirect
                setTimeout(() => { this.auth_failed_callback() }, 200);
            }
        };

        this.signalingSocket.onclose = (ev) => {
            console.warn('Signaling socket closed', JSON.stringify(ev), ev.error, ev.message);
            // Heuristics: if server indicated 401 in reason or closed before open, redirect
            const reason = (ev && ev.reason) ? String(ev.reason) : '';
            if (ev && (ev.code === 401 || reason.indexOf('401') !== -1 || /unauthor/i.test(reason) || !this._socketOpened)) {
                this.auth_failed_callback()
                return;
            }
        };

        this.init();
    }

    // RPC now handled by WebRTCDataChannelRPC helper attached at runtime

    remoteMessage(type, source, destination, id, payload) {
        const msg = new RemoteMessage();
        if (type) msg.setType(type);
        if (source) msg.setSource(source);
        if (destination) msg.setDestination(destination);
        if (id) msg.setId(id);
        if (payload) {
            // Convert plain JavaScript object to Struct if needed
            const structPayload = createStructFromObject(payload);
            if (structPayload) {
                msg.setPayload(structPayload);
            }
        }
        return msg;
    }

    async init() {
        try {
            var remoteCandidates = [];

            this.signalingSocket.onopen = async () => {
                console.log("Signaling socket connected");
                this._socketOpened = true;

                // Handle ICE candidates
                this.pc.onicecandidate = (event) => {
                    if (event.candidate) {
                        console.log('ICE candidate:', event.candidate);
                        // Create payload with candidate data
                        const payload = { data: event.candidate.toJSON() };

                        // Create protobuf message
                        const msg = this.remoteMessage('candidate', this.clientId, this.storageServerId, null, payload);
                        this.signalingSocket.send(msg.serializeBinary());
                    }
                };

                // Handle connection state changes
                this.pc.onconnectionstatechange = () => {
                    console.log('Connection state:', this.pc.connectionState);
                    this.connected = this.pc.connectionState === 'connected';
                };

                const offer = await this.pc.createOffer();
                await this.pc.setLocalDescription(offer);

                // Create payload with offer data
                // Create payload with offer data
                const payload = { data: offer };

                // Create protobuf message
                const msg = this.remoteMessage('offer', this.clientId, this.storageServerId, null, payload);
                this.signalingSocket.send(msg.serializeBinary());

            }

            this.signalingSocket.onmessage = async (message) => {
                console.log("got message", message.data)

                // Try to parse as protobuf first
                let m;
                if (message.data instanceof ArrayBuffer || message.data instanceof Uint8Array) {
                    // Parse as protobuf
                    const msg = RemoteMessage.deserializeBinary(new Uint8Array(message.data));
                    m = {
                        type: msg.getType(),
                        source: msg.getSource(),
                        destination: msg.getDestination(),
                        id: msg.getId(),
                        payload: msg.getPayload() ? msg.getPayload().toJavaScript() : {}
                    };
                    console.log("Parsed protobuf message:", m);
                } else {
                    // Fallback to JSON for backward compatibility
                    try {
                        m = JSON.parse(message.data);
                    } catch (e) {
                        console.error("Failed to parse message:", e);
                        return;
                    }
                }

                if (m.type == "answer") {
                    await this.pc.setRemoteDescription(new RTCSessionDescription({
                        type: 'answer',
                        sdp: m.payload.data.sdp,
                    }));
                    console.log("finished set answer")

                    for (const candidate of remoteCandidates) {
                        console.log("adding remote candidate", candidate)
                        await this.pc.addIceCandidate(new RTCIceCandidate(candidate));
                    }
                } else if (m.type == "candidate") {
                    const candidateData = m.payload.data;
                    if (this.pc.remoteDescription == null) {
                        remoteCandidates.push(candidateData);
                        return;
                    }
                    await this.pc.addIceCandidate(new RTCIceCandidate(candidateData));
                } else if (m.type == "answer+candidates") {
                    this.pc.setRemoteDescription(m.payload.data)
                }
            }


        } catch (error) {
            console.error('WebRTC initialization error:', error);
        }
    }

    createDataChannel() {
        // Try to create data channel
        try {
            if (!this.dc || this.dc.readyState === 'closed') {
                this.dc = this.pc.createDataChannel('files', {
                    ordered: true,
                    maxRetransmits: 3
                });
                this.setupDataChannel(this.dc);
            }
        } catch (error) {
            console.log('Data channel creation skipped:', error.message);
        }
    }
    // Data channel + RPC handling migrated to WebRTCDataChannelRPC helper.
    // Provide a small compatibility passthrough for registering handlers.
    registerRpcHandler(cmd, fn) {
        if (this.rpc) this.rpc.registerRpcHandler(cmd, fn);
    }

    async getConnectionStatus() {
        // Status: connecting, connected, disconnected, error
        const wsState = this.signalingSocket.readyState;
        const pcState = this.pc.connectionState;

        // WebSocket状态
        if (wsState === WebSocket.CONNECTING) {
            return "connecting";
        }

        if (wsState === WebSocket.CLOSED || wsState === WebSocket.CLOSING) {
            return "disconnected";
        }

        if (wsState === WebSocket.OPEN) {
            // WebSocket已连接，检查WebRTC状态
            if (pcState === 'connected') {
                return "connected";
            } else if (pcState === 'connecting' || pcState === 'new') {
                return "connecting";
            } else if (pcState === 'disconnected' || pcState === 'failed' || pcState === 'closed') {
                return "disconnected";
            }
        }

        return "unknown";
    }

    /**
     * List files in directory
     * For now, returns mock data simulating P2P response
     */
    async listFiles(path = '/') {
        // Use RPC over data channel to request listing from remote peer
        try {
            const resp = await this.rpc.sendRpc('listFiles', { path: path });
            //console.log(resp)
            return resp;
        } catch (err) {
            console.error('listFiles RPC error:', err);
            throw err;
        }
    }

    async getFileContent(filePath, mimeType = 'application/octet-stream', stream = false, offset = 0, size = null, timeoutMs = -1, idleTimeout = 10000) {
        console.log('Requesting file content via WebRTC:', filePath, 'mimeType:', mimeType, 'stream:', stream, 'timeoutMs:', timeoutMs, 'idleTimeout:', idleTimeout);
        const id = uuidv4();
        const label = mimeType.replaceAll('/', '-') + '-' + id;

        // Create file content helper
        const filedc = new WebRTCDataChannelFileContent(this.pc);

        try {
            // Ask remote peer to prepare and send the file on the given label
            const resp = await this.rpc.sendRpc('prepareFileReceive', { "path": filePath, "label": label, "offset": offset, "size": size });
            console.log("Requested file receive via WebRTC:", filePath, JSON.stringify(resp));

            const fileSize = resp["size"] || null;
            console.log("recv size: ", fileSize)

            if (stream) {
                // Return ReadableStream for streaming
                return await filedc.receiveFileContentStream(label, fileSize, timeoutMs, idleTimeout);
            } else {
                // Return Blob for direct download
                const blob = await filedc.receiveFileContent(label, fileSize, timeoutMs, idleTimeout, mimeType);
                console.log("Received file content as blob, size:", blob.size);
                return blob;
            }
        } catch (err) {
            console.error('WebRTC file transfer failed:', err);
            throw err;
        }
    }

    async getFileThumbnail(filePath, maxSize = 200) {
        try {
            // Ask remote peer (via RPC) to prepare/produce a thumbnail.
            // The server should respond with an id that will be sent over
            // the thumbnail datachannel as a binary packet (first 16 bytes = id).
            const resp = await this.rpc.sendRpc('getThumbnail', { path: filePath, size: maxSize });
            const thumbId = (resp && resp.id) ? resp.id : resp;
            if (!thumbId) return null;

            // Wait for binary thumbnail data on the thumbnail datachannel
            const blob = await this.thumbnail.receiveThumbnail(thumbId, 30000);
            return blob;
        } catch (err) {
            console.error('getFileThumbnail error:', err);
            throw err;
        }
    }

    async playVideo(filepath) {

    }

    async getFileUrl(filePath, mimeType) {
        console.log('Generating file URL via WebRTC for:', filePath, 'type:', mimeType);

        try {
            // Get file content as blob (stream = false)
            const blob = await this.getFileContent(filePath, mimeType, false);

            // Create object URL from blob
            const objectUrl = URL.createObjectURL(blob);
            console.log("Created object URL for file:", filePath, "size:", blob.size);
            return objectUrl;
        } catch (err) {
            // Fallback to a placeholder URL if WebRTC transfer fails
            console.warn('WebRTC file transfer failed, using fallback URL:', err);
            return 'webrtc://' + filePath;
        }
    }

    async getFileInfo(filePath) {
        return await this.rpc.sendRpc('getFileInfo', { path: filePath });
    }

    async getFileSystemVersion() {
        return await this.rpc.sendRpc('getFileSystemVersion', {});
    }

    async getImageRepoHistory(version, lastId, count) {
        try {
            const resp = await this.rpc.sendRpc('getImageRepoHistory', {
                "types": ["image", "video"],
                "version": version,
                "lastId": lastId,
                "count": count
            });

            console.log('getImageRepoHistory response:', resp);

            // 确保返回正确的格式
            if (resp && typeof resp === 'object') {
                return {
                    total: resp.total || 0,
                    version: resp.version | "",
                    items: resp.items || []
                };
            } else {
                throw new Error("response format error")
            }
        } catch (err) {
            console.error('getImageRepoHistory error:', err);
            // 返回空结果而不是抛出错误，避免UI崩溃
            return {
                total: 0,
                version: "",
                items: []
            };
        }
    }
}
