/**
 * WebRTC DataChannel RPC helper
 * Creates a data channel on a given RTCPeerConnection and provides
 * JSON-RPC-like request/response semantics over that datachannel.
 */
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

        // Try to import protobuf library for parsing protobuf messages
        this._protobuf = null;
        this._RemoteMessage = null;
        this._initProtobuf();

        this.createDataChannel()
    }

    // Initialize protobuf library if available
    _initProtobuf() {
        try {
            // Try to import from global scope or module
            if (typeof neutron !== 'undefined') {
                this._protobuf = neutron;
                this._RemoteMessage = neutron.RemoteMessage;
            } else if (typeof window !== 'undefined' && window.neutron) {
                this._protobuf = window.neutron;
                this._RemoteMessage = window.neutron.RemoteMessage;
            }
        } catch (e) {
            console.warn('Failed to initialize protobuf library:', e);
        }
    }

    generateRpcId() {
        return Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10);
    }

    registerRpcHandler(cmd, fn) {
        this._rpcHandlers[cmd] = fn;
    }

    sendRpc(cmd, data = {}, timeoutMs) {
        const id = this.generateRpcId();
        const msg = { type: cmd, id: id, data: data };
        const timeout = typeof timeoutMs === 'number' ? timeoutMs : this._rpcDefaultTimeout;

        return new Promise((resolve, reject) => {
            const timer = setTimeout(() => {
                this._rpcPending.delete(id);
                reject(new Error('RPC timeout'));
            }, timeout);

            this._rpcPending.set(id, { resolve, reject, timer });
            this.sendMessage(msg);
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

            // First try to parse as protobuf if we have the library
            if (this._RemoteMessage && (event.data instanceof ArrayBuffer || event.data instanceof Uint8Array)) {
                try {
                    const remoteMsg = this._RemoteMessage.decode(new Uint8Array(event.data));

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
                                payload = remoteMsg.error.toObject ? remoteMsg.error.toObject() : {};
                            } else {
                                // Extract payload based on message type
                                payload = this._extractPayloadFromRemoteMessage(remoteMsg);
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

                    // For non-response messages, convert to JSON format
                    msg = {
                        type: remoteMsg.type,
                        id: remoteMsg.id,
                        data: this._extractPayloadFromRemoteMessage(remoteMsg)
                    };
                } catch (err) {
                    console.warn('Failed to parse protobuf message, falling back to JSON:', err);
                }
            }

            // If not protobuf or parsing failed, try JSON
            if (!msg) {
                try {
                    msg = JSON.parse(event.data);
                } catch (err) {
                    console.warn('Received non-JSON message:', event.data);
                    return;
                }
            }

            if (msg.type === '@response') {
                const pending = this._rpcPending.get(msg.id);
                if (pending) {
                    clearTimeout(pending.timer);
                    this._rpcPending.delete(msg.id);
                    if (msg.data && msg.data.error) {
                        pending.reject(new Error(msg.data.error));
                    } else {
                        pending.resolve(msg.data);
                    }
                } else {
                    console.warn('No pending RPC for id', msg.id);
                }
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
                this.dc.send(JSON.stringify(message));
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
            const message = this.dataChannelQueue.shift();
            try {
                this.dc.send(JSON.stringify(message));
            } catch (e) {
                console.error('Failed to flush queued message:', e);
                // push back and break to avoid tight loop
                this.dataChannelQueue.unshift(message);
                break;
            }
        }
    }

    // Extract payload from RemoteMessage based on its type
    _extractPayloadFromRemoteMessage(remoteMsg) {
        if (!remoteMsg) return {};

        // Check for error message first
        if (remoteMsg.error) {
            return remoteMsg.error.toObject ? remoteMsg.error.toObject() : {};
        }

        // Extract payload based on message type
        let payload = {};

        // Check all possible payload types
        if (remoteMsg.listFilesResponse) {
            payload = remoteMsg.listFilesResponse.toObject ? remoteMsg.listFilesResponse.toObject() : {};
        } else if (remoteMsg.getFileInfoResponse) {
            payload = remoteMsg.getFileInfoResponse.toObject ? remoteMsg.getFileInfoResponse.toObject() : {};
        } else if (remoteMsg.prepareFileReceiveResponse) {
            payload = remoteMsg.prepareFileReceiveResponse.toObject ? remoteMsg.prepareFileReceiveResponse.toObject() : {};
        } else if (remoteMsg.getThumbnailResponse) {
            payload = remoteMsg.getThumbnailResponse.toObject ? remoteMsg.getThumbnailResponse.toObject() : {};
        } else if (remoteMsg.getFileSystemVersionResponse) {
            payload = remoteMsg.getFileSystemVersionResponse.toObject ? remoteMsg.getFileSystemVersionResponse.toObject() : {};
        } else if (remoteMsg.imageRepoHistoryResponse) {
            payload = remoteMsg.imageRepoHistoryResponse.toObject ? remoteMsg.imageRepoHistoryResponse.toObject() : {};
        } else if (remoteMsg.playVideoResponse) {
            payload = remoteMsg.playVideoResponse.toObject ? remoteMsg.playVideoResponse.toObject() : {};
        } else if (remoteMsg.payload) {
            // Fallback for other payload types
            payload = remoteMsg.payload.toObject ? remoteMsg.payload.toObject() : {};
        }

        return payload;
    }
}

// Expose globally for existing code to instantiate
window.WebRTCDataChannelRPC = WebRTCDataChannelRPC;
