

export default class WebRTCDataChannelVideo {

    constructor(pc) {
        this.pc = pc
        this.mediaSource = null;
        this.sourceBuffer = null;
        this.isInitialized = false;
        this.isPlaying = false;
        this.receivedBytes = 0;
        this.chunkCount = 0;
        this.dataQueue = null;
    }

    setupDataChannels() {
        this.pc.ondatachannel = (event) => {
            const channel = event.channel;
            this.updateStatus(`数据通道已创建: ${channel.label}`);

            if (channel.label === 'control') {
                channel.onopen = () => {
                    this.updateStatus('控制通道已连接');
                };

                channel.onmessage = (event) => {
                    try {
                        const data = JSON.parse(event.data);
                        this.handleControlMessage(data);
                    } catch (e) {
                        console.error('解析控制消息失败:', e);
                    }
                };
            }

            if (channel.label === 'videoData') {
                channel.onopen = () => {
                    this.updateStatus('视频数据通道已连接，开始接收数据...');
                };

                channel.onmessage = (event) => {
                    this.handleVideoData(event.data);
                };

                channel.onclose = () => {
                    this.updateStatus('视频数据通道已关闭');
                };
            }
        };
    }

    handleControlMessage(data) {
        this.updateStatus(`收到控制消息: ${JSON.stringify(data)}`);
    }

    processDataQueue() {
        if (!this.dataQueue || this.dataQueue.length === 0) {
            return;
        }

        if (this.sourceBuffer.updating) {
            return;
        }

        try {
            const data = this.dataQueue.shift();
            const videoData = data.slice(8);
            this.sourceBuffer.appendBuffer(videoData);

            // 递归处理队列中的下一个数据
            setTimeout(() => this.processDataQueue(), 0);
        } catch (error) {
            console.error('处理队列数据失败:', error);
        }
    }

    recreateSourceBuffer() {
        this.updateStatus('重新创建SourceBuffer...');

        if (this.mediaSource && this.mediaSource.readyState === 'open') {
            try {
                if (this.sourceBuffer) {
                    this.mediaSource.removeSourceBuffer(this.sourceBuffer);
                }

                const mimeType = 'video/mp4; codecs="avc1.4D401F"';
                this.sourceBuffer = this.mediaSource.addSourceBuffer(mimeType);
                this.sourceBuffer.mode = 'sequence';

                this.sourceBuffer.onupdateend = () => {
                    this.updateStatus('SourceBuffer更新完成');
                    this.processDataQueue();
                };

                this.sourceBuffer.onerror = (event) => {
                    console.error('=== SourceBuffer重新创建后错误 ===');
                    console.error('错误事件:', event);

                    const sb = event.target || this.sourceBuffer;
                    if (sb) {
                        console.error('SourceBuffer状态:', {
                            updating: sb.updating,
                            buffered: sb.buffered.length,
                            mode: sb.mode,
                            timestampOffset: sb.timestampOffset
                        });

                        // 尝试获取错误详情
                        let errorDetails = '未知错误';
                        if (sb.error) {
                            errorDetails = sb.error.message || String(sb.error);
                        } else if (event.error) {
                            errorDetails = event.error.message || String(event.error);
                        }

                        const errorMessage = `SourceBuffer错误: ${errorDetails}`;
                        console.error('错误信息:', errorMessage);
                        this.showError(errorMessage);

                        // 如果连续失败，可能需要重置整个MediaSource
                        this.errorCount = (this.errorCount || 0) + 1;
                        if (this.errorCount > 3) {
                            this.updateStatus('多次创建SourceBuffer失败，尝试完全重置...');
                            this.resetVideoPlayer();
                            this.errorCount = 0;
                        }
                    }
                };

                this.updateStatus('SourceBuffer重新创建成功');

                // 重新处理队列中的数据
                this.dataQueue = [];

            } catch (error) {
                this.showError(`重新创建SourceBuffer失败: ${error}`);
            }
        }
    }

    handleVideoData(data) {
        // 验证数据
        if (!data || !(data instanceof ArrayBuffer) && !ArrayBuffer.isView(data)) {
            console.error('无效的视频数据:', data);
            return;
        }

        // 确保数据是ArrayBuffer
        const buffer = data instanceof ArrayBuffer ? data : data.buffer;

        if (buffer.byteLength < 8) {
            console.error('数据太小，无法包含位置信息:', buffer.byteLength);
            return;
        }

        this.receivedBytes += buffer.byteLength;
        this.chunkCount++;

        if (this.chunkCount % 5 === 0) {
            this.updateStatus(`已接收: ${this.formatBytes(this.receivedBytes)}, 数据块: ${this.chunkCount}`);
        }

        if (!this.sourceBuffer || this.sourceBuffer.updating) {
            // 如果sourceBuffer忙，将数据加入队列
            if (!this.dataQueue) {
                this.dataQueue = [];
            }
            this.dataQueue.push(data);
            return;
        }

        try {
            // 服务器现在发送的是原始视频文件数据
            // 前8字节是位置信息，后面是视频数据
            const dataView = new DataView(buffer);
            const position = dataView.getBigUint64(0, true); // 小端序

            const rawVideoData = buffer.slice(8);

            if (rawVideoData.byteLength === 0) {
                console.warn('视频数据长度为0，跳过');
                return;
            }

            // 直接使用原始视频数据
            const videoData = rawVideoData;
            if (!videoData || videoData.byteLength === 0) {
                return;
            }

            // 检查第一个数据块
            if (this.chunkCount === 1) {
                const isMP4 = this.isLikelyMP4Data(videoData);
                this.updateStatus(`第一个数据块: MP4=${isMP4}`);

                if (isMP4) {
                    // 输出前32字节的十六进制用于调试
                    const hexDump = Array.from(new Uint8Array(videoData.slice(0, 32)))
                        .map(b => b.toString(16).padStart(2, '0'))
                        .join(' ');
                    console.log('第一个数据块前32字节:', hexDump);
                } else {
                    console.warn('第一个数据块可能不是有效的MP4数据');
                }
            }

            // 记录调试信息
            if (this.chunkCount % 20 === 0) {
                console.log(`数据块 ${this.chunkCount}: 位置=${position}, 大小=${videoData.byteLength}字节`);
            }

            // 检查SourceBuffer状态
            if (!this.sourceBuffer) {
                console.error('SourceBuffer未初始化');
                this.dataQueue.push(data);
                return;
            }

            if (this.sourceBuffer.updating) {
                // 如果正在更新，将数据加入队列
                if (!this.dataQueue) {
                    this.dataQueue = [];
                }
                this.dataQueue.push(data);
                return;
            }

            // 追加数据到sourceBuffer
            try {
                this.sourceBuffer.appendBuffer(videoData);
            } catch (appendError) {
                console.error('追加数据到SourceBuffer失败:', appendError);

                // 检查错误类型
                if (appendError.name === 'QuotaExceededError') {
                    this.updateStatus('缓冲区已满，尝试清理...');
                    // 尝试移除一些旧数据
                    if (this.sourceBuffer.buffered.length > 0) {
                        try {
                            const removeEnd = this.sourceBuffer.buffered.end(0);
                            this.sourceBuffer.remove(0, removeEnd / 2);
                            this.updateStatus(`已清理缓冲区前半部分`);
                        } catch (removeError) {
                            console.error('清理缓冲区失败:', removeError);
                        }
                    }
                }

                // 将数据加入队列等待重试
                if (!this.dataQueue) {
                    this.dataQueue = [];
                }
                this.dataQueue.push(data);
            }

            // 处理队列中的数据
            this.processDataQueue();

        } catch (error) {
            console.error('处理视频数据失败:', error);

            // 记录详细的错误信息
            this.updateStatus(`处理数据失败: ${error.message || error}`);

            // 如果出错，尝试重新创建sourceBuffer
            setTimeout(() => {
                this.recreateSourceBuffer();
            }, 100);
        }
    }

    getVideoUrl() {
        console.log("getVideoUrl")
        return new Promise((resolve, reject) => {
            this.mediaSource = new MediaSource();

            this.mediaSource.onsourceopen = () => {
                this.updateStatus('MediaSource已打开，创建SourceBuffer...');

                try {
                    // 尝试不同的MIME类型
                    const mimeTypes = [
                        'video/mp4; codecs="avc1.42E01E, mp4a.40.2"',
                        'video/mp4; codecs="avc1.42E01E"',
                        'video/mp4; codecs="avc1.4d401e"',
                        'video/mp4; codecs="avc1.4d401f"',
                        'video/mp4; codecs="avc1.640028"',
                        'video/mp4',
                        'video/webm; codecs="vp8, vorbis"',
                        'video/webm; codecs="vp9, opus"',
                        'video/webm'
                    ];

                    // 记录浏览器支持的MIME类型
                    console.log('检查MIME类型支持:');
                    const supportedTypes = [];
                    for (const mimeType of mimeTypes) {
                        const isSupported = MediaSource.isTypeSupported(mimeType);
                        console.log(`  ${mimeType}: ${isSupported ? '支持' : '不支持'}`);
                        if (isSupported) {
                            supportedTypes.push(mimeType);
                        }
                    }

                    if (supportedTypes.length === 0) {
                        throw new Error('浏览器不支持任何视频格式');
                    }

                    // 使用第一个支持的MIME类型
                    const supportedType = supportedTypes[0];
                    supportedType = mimeType;




                    if (!supportedType) {
                        throw new Error('浏览器不支持任何视频格式');
                    }

                    this.updateStatus(`使用MIME类型: ${supportedType}`);
                    this.sourceBuffer = this.mediaSource.addSourceBuffer(supportedType);

                    // 对于流式传输，使用 'segments' 模式
                    this.sourceBuffer.mode = 'segments';

                    // 设置适当的缓冲区大小
                    this.sourceBuffer.appendWindowStart = 0;
                    this.sourceBuffer.appendWindowEnd = Infinity;
                    this.sourceBuffer.timestampOffset = 0;

                    this.sourceBuffer.onupdateend = () => {
                        this.updateStatus('SourceBuffer更新完成');
                        // 检查缓冲区状态
                        if (this.sourceBuffer.buffered.length > 0) {
                            const start = this.sourceBuffer.buffered.start(0);
                            const end = this.sourceBuffer.buffered.end(this.sourceBuffer.buffered.length - 1);
                            this.updateStatus(`缓冲区范围: ${start.toFixed(2)}-${end.toFixed(2)}秒`);
                        }
                    };

                    this.sourceBuffer.onerror = (event) => {
                        console.error('=== SourceBuffer错误详情 ===');
                        console.error('错误事件:', event);
                        console.error('事件类型:', event.type);
                        console.error('时间戳:', event.timeStamp);

                        // 检查SourceBuffer状态
                        const sb = event.target || this.sourceBuffer;
                        if (sb) {
                            console.error('SourceBuffer状态:', {
                                updating: sb.updating,
                                buffered: sb.buffered.length,
                                mode: sb.mode,
                                timestampOffset: sb.timestampOffset,
                                appendWindowStart: sb.appendWindowStart,
                                appendWindowEnd: sb.appendWindowEnd
                            });

                            // 输出缓冲区范围
                            if (sb.buffered.length > 0) {
                                for (let i = 0; i < sb.buffered.length; i++) {
                                    console.error(`缓冲区 ${i}: ${sb.buffered.start(i).toFixed(2)}-${sb.buffered.end(i).toFixed(2)}秒`);
                                }
                            }
                        }

                        // 检查MediaSource状态
                        if (this.mediaSource) {
                            console.error('MediaSource状态:', {
                                readyState: this.mediaSource.readyState,
                                duration: this.mediaSource.duration
                            });
                        }

                        // 尝试获取详细的错误信息
                        let errorDetails = '未知错误';
                        let errorCode = '';

                        if (sb && sb.error) {
                            errorDetails = sb.error.message || String(sb.error);
                            errorCode = sb.error.code || '';
                        } else if (event.error) {
                            errorDetails = event.error.message || String(event.error);
                            errorCode = event.error.code || '';
                        } else if (event.target && event.target.error) {
                            errorDetails = event.target.error.message || String(event.target.error);
                            errorCode = event.target.error.code || '';
                        }

                        const errorMessage = `SourceBuffer错误${errorCode ? ' (代码: ' + errorCode + ')' : ''}: ${errorDetails}`;
                        console.error('错误信息:', errorMessage);

                        this.showError(errorMessage);

                        // 记录当前接收的数据统计
                        console.error('数据统计:', {
                            receivedBytes: this.receivedBytes,
                            chunkCount: this.chunkCount,
                            dataQueueLength: this.dataQueue ? this.dataQueue.length : 0
                        });

                        // 尝试重新创建SourceBuffer，但先等待一小段时间
                        setTimeout(() => {
                            this.updateStatus('尝试重新创建SourceBuffer...');
                            this.recreateSourceBuffer();
                        }, 500);
                    };

                    this.updateStatus('MediaSource初始化完成');

                } catch (error) {
                    reject(error);
                }
            };

            this.mediaSource.onsourceended = () => {
                this.updateStatus('MediaSource已结束');
            };

            this.mediaSource.onsourceclose = () => {
                this.updateStatus('MediaSource已关闭');
            };

            resolve(URL.createObjectURL(this.mediaSource))
        });
    }

    pause() {
        this.videoElement.pause();
        this.isPlaying = false;
        this.updateStatus('视频已暂停');
    }

    seekTo(time) {
        if (this.videoElement.duration) {
            time = Math.max(0, Math.min(time, this.videoElement.duration));
            this.videoElement.currentTime = time;
            this.updateStatus(`跳转到: ${time.toFixed(2)}秒`);
        }
    }

    updateStatus(message) {
        const timestamp = new Date().toLocaleTimeString();
        console.log("[" + timestamp + "]" + message);
    }

    getBufferedRanges() {
        const ranges = [];
        for (let i = 0; i < this.videoElement.buffered.length; i++) {
            const start = this.videoElement.buffered.start(i);
            const end = this.videoElement.buffered.end(i);
            ranges.push(`${start.toFixed(1)}-${end.toFixed(1)}`);
        }
        return ranges.length > 0 ? ranges.join(', ') : '无';
    }

    showError(message) {
        this.updateStatus(`错误: ${message}`);
    }

    enableControls() {
        document.querySelectorAll('.control-btn').forEach(btn => {
            btn.disabled = false;
        });
    }

    formatTime(seconds) {
        if (!seconds || isNaN(seconds)) return '00:00';
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);

        if (hours > 0) {
            return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    formatBytes(bytes) {
        if (!bytes || bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // 检查数据是否是有效的MP4数据
    isLikelyMP4Data(data) {
        if (data.byteLength < 8) return false;

        const view = new DataView(data);

        // 检查前几个字节是否有MP4盒子签名
        // MP4盒子通常以4字节大小和4字节类型开始
        for (let i = 0; i < Math.min(data.byteLength - 8, 100); i += 4) {
            const boxSize = view.getUint32(i);
            const boxType = view.getUint32(i + 4);

            // 转换为ASCII字符
            const typeStr = String.fromCharCode(
                (boxType >> 24) & 0xFF,
                (boxType >> 16) & 0xFF,
                (boxType >> 8) & 0xFF,
                boxType & 0xFF
            );

            // 常见的MP4盒子类型
            const mp4Boxes = ['ftyp', 'moov', 'mdat', 'moof', 'mfra', 'free', 'skip'];
            if (mp4Boxes.includes(typeStr)) {
                return true;
            }
        }

        return false;
    }

    // 重置视频播放器状态
    resetVideoPlayer() {
        this.updateStatus('重置视频播放器...');

        if (this.sourceBuffer) {
            try {
                if (this.mediaSource && this.mediaSource.readyState === 'open') {
                    this.mediaSource.removeSourceBuffer(this.sourceBuffer);
                }
            } catch (e) {
                console.error('移除SourceBuffer失败:', e);
            }
            this.sourceBuffer = null;
        }

        this.dataQueue = [];
        this.receivedBytes = 0;
        this.chunkCount = 0;
        this.isInitialized = false;

        this.updateStatus('视频播放器已重置');
    }
}