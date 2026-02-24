/**
 * WebRTC DataChannel RPC helper
 * Creates a data channel on a given RTCPeerConnection and provides
 * JSON-RPC-like request/response semantics over that datachannel.
 */

import { v4 as uuidv4 } from 'uuid';

import { neutron } from '../proto/neutron_pb.js';
const RemoteMessage = neutron.RemoteMessage;

export default class WebRTCDataChannelRPC {
    constructor(pc, label = 'rpc', options = { ordered: true, maxRetransmits: 3 }, defaultTimeout = 10000) {
        this.pc = pc;
        this.label = label;
        this.options = options;
        this.dc = null;
        this.dataChannelQueue = [];
        this.connected = false;

        // RPC state
        this._rpcPending = new Map(); // id -> {resolve,reject,timer}
        this._rpcHandlers = {}; // cmd -> handler
        this._rpcDefaultTimeout = defaultTimeout; // ms

        this.createDataChannel()
    }

    generateRpcId() {
        return Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10);
    }

    registerRpcHandler(cmd, fn) {
        this._rpcHandlers[cmd] = fn;
    }

    sendRpc(cmd, data, timeoutMs) {
        const id = this.generateRpcId();
        const timeout = typeof timeoutMs === 'number' ? timeoutMs : this._rpcDefaultTimeout;

        return new Promise((resolve, reject) => {
            const timer = setTimeout(() => {
                this._rpcPending.delete(id);
                reject(new Error('RPC timeout'));
            }, timeout);

            this._rpcPending.set(id, { resolve, reject, timer });

            try {
                const payload_type = data.constructor.name.charAt(0).toLowerCase() + data.constructor.name.slice(1);
                const remoteMsg = new RemoteMessage();
                remoteMsg.type = cmd;
                remoteMsg.source = this.clientId;
                remoteMsg.id = id;
                remoteMsg.destination = this.storageServerId;
                remoteMsg[payload_type] = data;

                const encodedMsg = RemoteMessage.encode(remoteMsg).finish();

                this.sendMessage(encodedMsg);
            } catch (e) {
                console.error('Failed to create or send protobuf RPC message:', e);
                reject(new Error('Failed to create protobuf message: ' + e.message));
            }
        });
    }

    createDataChannel() {
        try {
            if (!this.dc || this.dc.readyState === 'closed') {
                this.dc = this.pc.createDataChannel(this.label, this.options);
                this.setupDataChannel(this.dc);
            }
        } catch (error) {
            console.log('Data channel creation skipped:', error && error.message ? error.message : error);
        }
    }

    setupDataChannel(dc) {
        dc.onopen = () => {
            console.log('Data channel opened');
            this.connected = true;
            this.flushQueue();
        };

        dc.onclose = () => {
            console.log('Data channel closed');
            this.connected = false;
        };

        dc.onerror = (error) => {
            console.error('Data channel error:', error);
        };

        dc.onmessage = (event) => {
            let msg = null;
            console.log('Received message on data channel:', event.data);
            try {
                const remoteMsg = RemoteMessage.decode(new Uint8Array(event.data));

                // Check if this is a response message
                if (remoteMsg.type === '@response') {
                    const pending = this._rpcPending.get(remoteMsg.id);
                    if (pending) {
                        clearTimeout(pending.timer);
                        this._rpcPending.delete(remoteMsg.id);

                        // Extract payload based on message type
                        let payload = null;
                        let error = null;

                        // Check for error message first
                        if (remoteMsg.error) {
                            // This is an error response
                            error = remoteMsg.error.error || 'Unknown error';
                        } else {
                            // Extract payload based on message type
                            payload = remoteMsg[remoteMsg.payload]
                        }

                        if (error) {
                            pending.reject(new Error(error));
                        } else {
                            pending.resolve(payload);
                        }
                    } else {
                        console.warn('No pending RPC for id', remoteMsg.id);
                    }
                    return;
                }

                // For non-response messages, convert to JSON format for handler compatibility
                msg = {
                    type: remoteMsg.type,
                    id: remoteMsg.id,
                    data: remoteMsg[remoteMsg.payload]
                };
            } catch (err) {
                console.error('Failed to parse protobuf message:', err);
                return;
            }

            const handler = this._rpcHandlers[msg.type];
            if (handler) {
                Promise.resolve()
                    .then(() => handler(msg.data, msg.id))
                    .then((result) => {
                        this.sendMessage({ type: '@response', id: msg.id, data: result });
                    })
                    .catch((err) => {
                        this.sendMessage({ type: '@response', id: msg.id, data: { error: String(err) } });
                    });
            } else {
                this.sendMessage({ type: '@response', id: msg.id, data: { error: 'no handler for ' + msg.type } });
            }
        };
    }

    sendMessage(message) {
        if (this.dc && this.dc.readyState === 'open') {
            try {
                // Create and send protobuf message
                this.dc.send(message);
            } catch (e) {
                console.error('Failed to send message over datachannel:', e);
                this.dataChannelQueue.push(message);
            }
        } else {
            this.dataChannelQueue.push(message);
        }
    }

    flushQueue() {
        while (this.dataChannelQueue.length > 0 && this.dc && this.dc.readyState === 'open') {
            try {
                const remoteMsg = this.dataChannelQueue.shift();
                this.dc.send(remoteMsg);

            } catch (e) {
                console.error('Failed to flush queued message:', e);
                // push back and break to avoid tight loop
                this.dataChannelQueue.unshift(remoteMsg);
                break;
            }
        }
    }
}

// Expose globally for existing code to instantiate
window.WebRTCDataChannelRPC = WebRTCDataChannelRPC;
