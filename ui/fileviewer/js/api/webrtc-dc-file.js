/**
 * WebRTC DataChannel Image Transfer
 *
 * Provides a small helper that uses the existing WebRTCDataChannelRPC
 * to negotiate a temporary datachannel label and then transfers image
 * binary data over that temporary channel. Incoming image channels are
 * detected via `pc.ondatachannel` and reassembled into a Blob URL which
 * is delivered to registered callbacks.
 */
class WebRTCDataChannelFileContent {
    constructor(pc) {
        this.pc = pc;
        this._channels = new Map(); // label -> RTCDataChannel
        this._pendingReceivers = new Map(); // label -> { resolve, reject, expectedSize, timer }
        this._channelTransfers = new Map(); // label -> transfer object
    }

    // Actively create (or attach to) a datachannel by `label` and wait until
    // `expectedSize` bytes have been received (or the channel closes). Returns a
    // Promise that resolves to a blob URL when the full image is received.
    receiveFileContent(label, expectedSize = null, timeoutMs = 15000, mimeType = 'application/octet-stream') {
        if (!label) return Promise.reject(new Error('label required'));

        if (this._pendingReceivers.has(label)) {
            return Promise.reject(new Error('already waiting for this label'));
        }

        return new Promise((resolve, reject) => {
            const timer = setTimeout(() => {
                this._pendingReceivers.delete(label);
                reject(new Error('receiveImage timeout'));
            }, timeoutMs);

            this._pendingReceivers.set(label, { resolve, reject, expectedSize, timer });

            // If channel already exists, rely on its handlers to resolve when enough data arrives.
            const existing = this._channels.get(label);
            if (existing) return;

            // Otherwise, proactively create the datachannel to allow the remote to send on it.
            try {
                const dc = this.pc.createDataChannel(label, { ordered: false, maxRetransmits: 3 });
                this._setupChannel(dc, mimeType);
            } catch (e) {
                clearTimeout(timer);
                this._pendingReceivers.delete(label);
                reject(e);
            }
        });
    }

    _setupChannel(channel, mimeType, callback) {
        if (!channel || !channel.label) return;
        channel.binaryType = 'arraybuffer';

        const label = channel.label;
        this._channels.set(label, channel);

        let transfer = { meta: null, chunks: [], receivedBytes: 0 };
        this._channelTransfers.set(label, transfer);

        const finishTransfer = () => {
            const blob = new Blob(transfer.chunks, { type: mimeType });
            // cleanup
            this._channels.delete(label);
            this._channelTransfers.delete(label);
            // resolve pending if exists
            const pending = this._pendingReceivers.get(label);
            if (pending) {
                clearTimeout(pending.timer);
                this._pendingReceivers.delete(label);
                pending.resolve(blob);
            }

            channel.close();
        };

        channel.onmessage = (ev) => {
            if (ev.data instanceof ArrayBuffer) {
                transfer.chunks.push(ev.data);
                transfer.receivedBytes += ev.data.byteLength || ev.data.length || 0;
                const pending = this._pendingReceivers.get(label);
                const expected = pending ? pending.expectedSize : (transfer.meta ? transfer.meta.size : null);
                if (expected != null && transfer.receivedBytes >= expected) {
                    finishTransfer();
                }
            }
        };

        channel.onclose = () => {
            // finish with what we have
            if (transfer.chunks.length > 0) {
                finishTransfer();
            } else {
                // no data received; reject pending if any
                const pending = this._pendingReceivers.get(label);
                if (pending) {
                    clearTimeout(pending.timer);
                    this._pendingReceivers.delete(label);
                    pending.reject(new Error('channel closed before data received'));
                }
            }
        };

        channel.onerror = (e) => {
            console.error('File Contnt channel error', e);
            const pending = this._pendingReceivers.get(label);
            if (pending) {
                clearTimeout(pending.timer);
                this._pendingReceivers.delete(label);
                pending.reject(e || new Error('datachannel error'));
            }
        };
    }

    // This helper is receive-only: it listens for incoming temporary
    // file datachannels (labels starting with `img-`) and emits a blob URL
    // via registered `onReceive` callbacks when the file is fully received.
}

window.WebRTCDataChannelFileContent = WebRTCDataChannelFileContent;
