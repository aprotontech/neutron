/**
 * WebRTC DataChannel Image Transfer
 *
 * Provides a small helper that uses the existing WebRTCDataChannelRPC
 * to negotiate a temporary datachannel label and then transfers image
 * binary data over that temporary channel. Incoming image channels are
 * detected via `pc.ondatachannel` and reassembled into a Blob URL which
 * is delivered to registered callbacks.
 */
export default class WebRTCDataChannelFileContent {
    constructor(pc) {
        this.pc = pc;
        this._channels = new Map(); // label -> RTCDataChannel
        this._pendingReceivers = new Map(); // label -> { resolve, reject, expectedSize, timer }
        this._channelTransfers = new Map(); // label -> transfer object
        this._streamReceivers = new Map(); // label -> { controller, expectedSize, timer, idleTimeout, lastDataTime }
        this._idleTimers = new Map(); // label -> idle timeout timer
    }

    // Actively create (or attach to) a datachannel by `label` and wait until
    // `expectedSize` bytes have been received (or the channel closes). Returns a
    // Promise that resolves to a blob URL when the full image is received.
    receiveFileContent(label, expectedSize = null, timeoutMs = -1, idleTimeout = 10000, mimeType = 'application/octet-stream') {
        // 使用流式读取功能，然后转换为 Blob
        return this.receiveFileContentStream(label, expectedSize, timeoutMs, idleTimeout)
            .then(stream => {
                return new Promise((resolve, reject) => {
                    const reader = stream.getReader();
                    const chunks = [];
                    let totalSize = 0;
                    let isFinished = false;

                    function pump() {
                        reader.read().then(({ done, value }) => {
                            if (done) {
                                // 所有数据读取完成
                                console.log("receiveFileContent: stream finished, total size:", totalSize);
                                isFinished = true;
                                const blob = new Blob(chunks, { type: mimeType });
                                resolve(blob);
                                return;
                            }

                            console.log("receiveFileContent: received chunk size:", value.byteLength || value.length || 0);
                            chunks.push(value);
                            totalSize += value.byteLength || value.length || 0;

                            // 如果指定了预期大小，检查是否已达到
                            if (expectedSize !== null && totalSize >= expectedSize) {
                                console.log("receiveFileContent: reached expected size", expectedSize);
                                // 取消读取器，因为我们已经有足够的数据
                                reader.cancel("reached expected size").then(() => {
                                    console.log("receiveFileContent: reader cancelled");
                                }).catch(err => {
                                    console.error("receiveFileContent: error cancelling reader", err);
                                });

                                // 立即创建 Blob，不等待流结束
                                const blob = new Blob(chunks, { type: mimeType });
                                resolve(blob);
                                return;
                            }

                            pump();
                        }).catch(err => {
                            console.error("receiveFileContent: error reading stream", err);
                            if (!isFinished) {
                                reject(err);
                            }
                        });
                    }

                    pump();

                    // 添加超时处理（如果 timeoutMs > 0）
                    let timeoutTimer = null;
                    if (timeoutMs > 0) {
                        timeoutTimer = setTimeout(() => {
                            if (!isFinished) {
                                console.error("receiveFileContent: timeout after", timeoutMs, "ms");
                                reader.cancel("timeout").finally(() => {
                                    reject(new Error(`receiveFileContent timeout after ${timeoutMs}ms`));
                                });
                            }
                        }, timeoutMs);

                        // 清理超时定时器
                        Promise.resolve().then(() => {
                            // 在 Promise 解析或拒绝时清理定时器
                            const cleanup = () => {
                                if (timeoutTimer) {
                                    clearTimeout(timeoutTimer);
                                }
                            };
                            // 使用 finally 确保清理
                            return new Promise((res, rej) => {
                                // 这个 Promise 永远不会解析，只是用来附加清理逻辑
                            }).finally(cleanup);
                        }).catch(() => { }); // 忽略错误
                    }
                });
            });
    }

    // 流式接收文件内容，返回 ReadableStream 对象
    receiveFileContentStream(label, expectedSize = null, timeoutMs = -1, idleTimeout = 10000) {
        if (!label) return Promise.reject(new Error('label required'));

        if (this._streamReceivers.has(label)) {
            return Promise.reject(new Error('already waiting for this label'));
        }

        return new Promise((resolve, reject) => {
            // 如果 timeoutMs 为 -1，则不设置超时定时器
            let timer = null;
            if (timeoutMs > 0) {
                timer = setTimeout(() => {
                    this._streamReceivers.delete(label);
                    reject(new Error('receiveFileContentStream timeout'));
                }, timeoutMs);
            }

            // 创建 ReadableStream
            const stream = new ReadableStream({
                start: (controller) => {
                    this._streamReceivers.set(label, { controller, expectedSize, timer, idleTimeout, lastDataTime: Date.now() });

                    // 如果通道已经存在，直接返回
                    const existing = this._channels.get(label);
                    if (existing) return;

                    // 否则主动创建数据通道
                    try {
                        const dc = this.pc.createDataChannel(label, { ordered: true, maxRetransmits: 10 });
                        this._setupChannel(dc, 'application/octet-stream');
                    } catch (e) {
                        clearTimeout(timer);
                        this._streamReceivers.delete(label);
                        reject(e);
                        // 不需要调用 controller.error，因为流还没有被返回给调用者
                    }
                },
                cancel: (reason) => {
                    // 清理资源
                    const receiver = this._streamReceivers.get(label);
                    if (receiver) {
                        clearTimeout(receiver.timer);
                        this._streamReceivers.delete(label);
                    }
                    const channel = this._channels.get(label);
                    if (channel) {
                        channel.close();
                    }
                }
            });

            resolve(stream);
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
            // 清理 idle 定时器
            const idleTimer = this._idleTimers.get(label);
            if (idleTimer) {
                clearTimeout(idleTimer);
                this._idleTimers.delete(label);
            }
            // resolve pending if exists
            const pending = this._pendingReceivers.get(label);
            if (pending) {
                clearTimeout(pending.timer);
                this._pendingReceivers.delete(label);
                pending.resolve(blob);
            }

            // 完成流式读取
            const streamReceiver = this._streamReceivers.get(label);
            if (streamReceiver) {
                clearTimeout(streamReceiver.timer);
                this._streamReceivers.delete(label);
                streamReceiver.controller.close();
            }

            channel.close();
        };

        // 检查 idleTimeout 的函数
        const checkIdleTimeout = () => {
            const streamReceiver = this._streamReceivers.get(label);
            if (!streamReceiver || !streamReceiver.idleTimeout || streamReceiver.idleTimeout <= 0) {
                return;
            }

            const now = Date.now();
            const timeSinceLastData = now - streamReceiver.lastDataTime;

            if (timeSinceLastData > streamReceiver.idleTimeout) {
                // 空闲超时，网络故障
                console.error(`File Content channel idle timeout after ${streamReceiver.idleTimeout}ms`);

                // 清理资源
                const idleTimer = this._idleTimers.get(label);
                if (idleTimer) {
                    clearTimeout(idleTimer);
                    this._idleTimers.delete(label);
                }

                // 拒绝流式读取
                if (streamReceiver) {
                    clearTimeout(streamReceiver.timer);
                    this._streamReceivers.delete(label);
                    streamReceiver.controller.error(new Error(`Network idle timeout after ${streamReceiver.idleTimeout}ms`));
                }

                // 拒绝传统接收器
                const pending = this._pendingReceivers.get(label);
                if (pending) {
                    clearTimeout(pending.timer);
                    this._pendingReceivers.delete(label);
                    pending.reject(new Error(`Network idle timeout after ${streamReceiver.idleTimeout}ms`));
                }

                channel.close();
            } else {
                // 重新设置检查定时器
                const remainingTime = streamReceiver.idleTimeout - timeSinceLastData;
                const nextCheckTimer = setTimeout(checkIdleTimeout, Math.min(remainingTime, 1000));
                this._idleTimers.set(label, nextCheckTimer);
            }
        };

        // 启动 idleTimeout 检查（如果有设置）
        const streamReceiver = this._streamReceivers.get(label);
        if (streamReceiver && streamReceiver.idleTimeout && streamReceiver.idleTimeout > 0) {
            const idleTimer = setTimeout(checkIdleTimeout, streamReceiver.idleTimeout);
            this._idleTimers.set(label, idleTimer);
        }

        channel.onmessage = (ev) => {
            if (ev.data instanceof ArrayBuffer) {
                transfer.chunks.push(ev.data);
                transfer.receivedBytes += ev.data.byteLength || ev.data.length || 0;

                // 处理流式读取
                const streamReceiver = this._streamReceivers.get(label);
                if (streamReceiver) {
                    streamReceiver.controller.enqueue(new Uint8Array(ev.data));
                    // 更新最后接收时间
                    streamReceiver.lastDataTime = Date.now();
                }

                const pending = this._pendingReceivers.get(label);

                // 使用流式读取的预期大小（如果有），否则使用传统接收器的预期大小
                const expected = streamReceiver ? streamReceiver.expectedSize :
                    (pending ? pending.expectedSize : (transfer.meta ? transfer.meta.size : null));
                if (expected != null && transfer.receivedBytes >= expected) {
                    finishTransfer();
                }
            }
        };

        channel.onclose = () => {
            // 清理 idle 定时器
            const idleTimer = this._idleTimers.get(label);
            if (idleTimer) {
                clearTimeout(idleTimer);
                this._idleTimers.delete(label);
            }

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

                // 处理流式读取的错误
                const streamReceiver = this._streamReceivers.get(label);
                if (streamReceiver) {
                    clearTimeout(streamReceiver.timer);
                    this._streamReceivers.delete(label);
                    streamReceiver.controller.error(new Error('channel closed before data received'));
                }
            }
        };

        channel.onerror = (e) => {
            console.error('File Content channel error', e);
            // 清理 idle 定时器
            const idleTimer = this._idleTimers.get(label);
            if (idleTimer) {
                clearTimeout(idleTimer);
                this._idleTimers.delete(label);
            }

            const pending = this._pendingReceivers.get(label);
            if (pending) {
                clearTimeout(pending.timer);
                this._pendingReceivers.delete(label);
                pending.reject(e || new Error('datachannel error'));
            }

            // 处理流式读取的错误
            const streamReceiver = this._streamReceivers.get(label);
            if (streamReceiver) {
                clearTimeout(streamReceiver.timer);
                this._streamReceivers.delete(label);
                streamReceiver.controller.error(e || new Error('datachannel error'));
            }
        };
    }

    // This helper is receive-only: it listens for incoming temporary
    // file datachannels (labels starting with `img-`) and emits a blob URL
    // via registered `onReceive` callbacks when the file is fully received.
}

window.WebRTCDataChannelFileContent = WebRTCDataChannelFileContent;
