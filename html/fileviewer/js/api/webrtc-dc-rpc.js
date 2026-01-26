/**
 * WebRTC DataChannel RPC helper
 * Creates a data channel on a given RTCPeerConnection and provides
 * JSON-RPC-like request/response semantics over that datachannel.
 */
class WebRTCDataChannelRPC {
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
            try {
                msg = JSON.parse(event.data);
            } catch (err) {
                console.warn('Received non-JSON message:', event.data);
                return;
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
}

// Expose globally for existing code to instantiate
window.WebRTCDataChannelRPC = WebRTCDataChannelRPC;
