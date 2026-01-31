/**
 * WebRTC Client for P2P File Transfer
 * Handles file listing and P2P transmission of files
 */

import BaseClient from './base-client.js';
import WebRTCDataChannelRPC from './webrtc-dc-rpc.js';
import WebRTCDataChannelThumbnail from './webrtc-dc-thumbnail.js';
import WebRTCDataChannelFileContent from './webrtc-dc-file.js';

export default class WebRTCClient extends BaseClient {
    constructor(token) {
        super();
        // token should be provided by the caller (app); do not access storage here
        this.token = token || '';
        this.pc = null;
        this.dc = null;
        this.dataChannelQueue = [];
        this.connected = false;
        this.sourceId = "xyz"; // Unique identifier for this client


        //const host = window.location.host;
        const host = window.API_HOST
        const protocol = window.location.protocol;
        let wsaddr = '';
        if (protocol === 'https:') {
            wsaddr = 'wss://' + host + '/ws';
        } else {
            wsaddr = 'ws://' + host + '/ws';
        }
        wsaddr += '?token=' + encodeURIComponent(this.token);

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
            console.error('Signaling socket error', ev);
            // If socket never opened, likely auth rejection during handshake
            if (!this._socketOpened) {
                // Give the server a brief moment to send a close reason, then redirect
                setTimeout(() => { window.location.href = '/login.html'; }, 200);
            }
        };

        this.signalingSocket.onclose = (ev) => {
            console.warn('Signaling socket closed', ev);
            // Heuristics: if server indicated 401 in reason or closed before open, redirect
            const reason = (ev && ev.reason) ? String(ev.reason) : '';
            if (ev && (ev.code === 401 || reason.indexOf('401') !== -1 || /unauthor/i.test(reason) || !this._socketOpened)) {
                window.location.href = '/login.html';
                return;
            }
        };

        this.init();
    }

    // RPC now handled by WebRTCDataChannelRPC helper attached at runtime

    async init() {
        try {
            var remoteCandidates = [];

            this.signalingSocket.onopen = async () => {
                console.log("Signaling socket connected");
                this._socketOpened = true;
                this.signalingSocket.send(JSON.stringify({
                    type: 'regist',
                    source: this.sourceId,
                    destination: "",
                    data: null
                }));

                // Handle ICE candidates
                this.pc.onicecandidate = (event) => {
                    if (event.candidate) {
                        console.log('ICE candidate:', event.candidate);
                        this.signalingSocket.send(JSON.stringify({
                            type: 'candidate',
                            source: this.sourceId,
                            destination: "file-server",
                            data: event.candidate.toJSON(),
                        }));
                    }
                };

                // Handle connection state changes
                this.pc.onconnectionstatechange = () => {
                    console.log('Connection state:', this.pc.connectionState);
                    this.connected = this.pc.connectionState === 'connected';
                };

                const offer = await this.pc.createOffer();
                await this.pc.setLocalDescription(offer);

                this.signalingSocket.send(JSON.stringify({
                    type: 'offer',
                    source: this.sourceId,
                    destination: "file-server",
                    data: offer
                }));

            }

            this.signalingSocket.onmessage = async (message) => {
                console.log(message.data)
                var m = JSON.parse(message.data)
                if (m.type == "answer") {
                    await this.pc.setRemoteDescription(new RTCSessionDescription({
                        type: 'answer',
                        sdp: m.data.sdp,
                    }));
                    console.log("finished set awnser")

                    for (const candidate of remoteCandidates) {
                        console.log("adding remote candidate", candidate)
                        await this.pc.addIceCandidate(new RTCIceCandidate(candidate));
                    }
                } else if (m.type == "candidate") {
                    if (this.pc.remoteDescription == null) {
                        remoteCandidates.push(m.data);
                        return;
                    }
                    await this.pc.addIceCandidate(new RTCIceCandidate(m.data));
                } else if (m.type == "answer+candidates") {
                    this.pc.setRemoteDescription(m.data)
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



    async getFileContent(filePath) {
        // Send request via WebRTC data channel
        // This would establish a separate data transfer channel
        // For demonstration, return a blob

        console.log('Requesting file content via WebRTC:', filePath);

        // In production, this would:
        // 1. Send a request message via data channel
        // 2. Establish a new data channel for file transfer
        // 3. Receive file chunks and reassemble them

        throw new Error('Not implemented in demo mode');
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
            const blob = await this.thumbnail.receiveThumbnail(thumbId, 15000);
            return blob;
        } catch (err) {
            console.error('getFileThumbnail error:', err);
            throw err;
        }
    }

    async getFileUrl(filePath) {
        console.log('Generating file URL via WebRTC for:', filePath);
        const id = Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
        const label = 'img-' + id;

        return new Promise(async (resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error('image transfer timeout'));
            }, 15000);

            // register a one-time receiver
            // Image transfer helper (handles incoming image channels)
            const filedc = new WebRTCDataChannelFileContent(this.pc);

            try {
                // Ask remote peer to prepare and send the image on the given label
                const resp = await this.rpc.sendRpc('prepareFileReceive', { "path": filePath, "label": label });
                console.log("Requested file receive via WebRTC:", filePath, resp);
                var data = await filedc.receiveFileContent(label, resp["size"], 15000, "image/jpeg");
                console.log("get content", data)
                resolve(URL.createObjectURL(data));
            } catch (err) {
                clearTimeout(timeout);
                reject(err);
            }
        });

        // Non-image fallback
        return 'webrtc://' + filePath;
    }

    async getFileInfo(filePath) {
        // Request file info via WebRTC data channel
        console.log('Requesting file info via WebRTC:', filePath);

        // In production, send request and wait for response
        throw new Error('Not implemented in demo mode');
    }
}
