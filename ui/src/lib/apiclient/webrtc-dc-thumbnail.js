/**
 * WebRTC DataChannel Thumbnail helper
 * Creates a data channel on a given RTCPeerConnection to receive
 * binary thumbnail frames from the remote peer.
 *
 * Each thumbnail message is a binary packet where the first 16 bytes
 * represent an ID (opaque bytes) and the remainder is the thumbnail
 * binary content. The helper provides `receiveThumbnail(id)` which
 * resolves with a Blob/ArrayBuffer for the requested id.
 */
export default class WebRTCDataChannelThumbnail {
    constructor(pc, label = 'thumbnail', options = { ordered: false, maxRetransmits: 3 }, defaultTimeout = 10000) {
        this.pc = pc;
        this.label = label;
        this.options = options;
        this.dc = null;
        this.connected = false;

        // Maps and queues
        this._pending = new Map(); // id -> {resolve,reject,timer}
        this._queued = new Map(); // id -> ArrayBuffer (or Blob)
        this._defaultTimeout = defaultTimeout;

        this.createDataChannel();
    }

    createDataChannel() {
        try {
            if (!this.dc || this.dc.readyState === 'closed') {
                this.dc = this.pc.createDataChannel(this.label, this.options);
                this.setupDataChannel(this.dc);
            }
        } catch (error) {
            console.warn('Thumbnail data channel creation skipped:', error && error.message ? error.message : error);
        }
    }

    setupDataChannel(dc) {
        dc.binaryType = 'arraybuffer';

        dc.onopen = () => {
            console.log('Thumbnail data channel opened');
            this.connected = true;
        };

        dc.onclose = () => {
            console.log('Thumbnail data channel closed');
            this.connected = false;
        };

        dc.onerror = (err) => {
            console.error('Thumbnail data channel error:', err);
        };

        dc.onmessage = (event) => {
            const handle = (ab) => {
                try {
                    if (!(ab instanceof ArrayBuffer)) return;
                    const u8 = new Uint8Array(ab);
                    if (u8.length <= 16) return; // invalid

                    const idBytes = u8.subarray(0, 16);
                    const content = ab.slice(16);

                    // Prepare ID variants for flexible matching
                    const textId = new TextDecoder().decode(idBytes);
                    const hexId = Array.from(idBytes).map(b => b.toString(16).padStart(2, '0')).join('');
                    const base64Id = (function (buf) {
                        let bytes = new Uint8Array(buf);
                        let binary = '';
                        const chunk = 0x8000;
                        for (let i = 0; i < bytes.length; i += chunk) {
                            binary += String.fromCharCode.apply(null, Array.from(bytes.subarray(i, i + chunk)));
                        }
                        return btoa(binary);
                    })(idBytes.buffer.slice(idBytes.byteOffset, idBytes.byteOffset + idBytes.byteLength));

                    // Store content under all variants for later retrieval
                    this._queued.set(textId, content);
                    this._queued.set(hexId, content);
                    this._queued.set(base64Id, content);

                    // If there's a pending waiter for any of these ids, resolve it
                    const tryResolve = (k) => {
                        const p = this._pending.get(k);
                        if (p) {
                            clearTimeout(p.timer);
                            this._pending.delete(k);
                            p.resolve(new Blob([content]));
                            return true;
                        }
                        return false;
                    };

                    if (tryResolve(textId)) return;
                    if (tryResolve(hexId)) return;
                    if (tryResolve(base64Id)) return;

                } catch (err) {
                    console.error('Error handling thumbnail message:', err);
                }
            };

            if (event.data instanceof Blob) {
                event.data.arrayBuffer().then(handle).catch(err => console.error(err));
            } else {
                handle(event.data);
            }
        };
    }

    receiveThumbnail(id, timeoutMs) {
        const timeout = typeof timeoutMs === 'number' ? timeoutMs : this._defaultTimeout;
        return new Promise((resolve, reject) => {
            // If already queued, return immediately
            if (this._queued.has(id)) {
                const content = this._queued.get(id);
                this._queued.delete(id);
                resolve(new Blob([content]));
                return;
            }

            // Otherwise register pending
            const timer = setTimeout(() => {
                this._pending.delete(id);
                reject(new Error('Thumbnail receive timeout'));
            }, timeout);

            this._pending.set(id, { resolve, reject, timer });
        });
    }
}

// Expose globally
window.WebRTCDataChannelThumbnail = WebRTCDataChannelThumbnail;
