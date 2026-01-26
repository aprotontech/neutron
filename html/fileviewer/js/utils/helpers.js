/**
 * 工具函数和辅助类
 */

/**
 * 文件类型检测工具
 */
class FileTypeDetector {
    static MIME_TYPES = {
        // 图片
        'image/jpeg': ['.jpg', '.jpeg'],
        'image/png': ['.png'],
        'image/gif': ['.gif'],
        'image/bmp': ['.bmp'],
        'image/webp': ['.webp'],
        'image/svg+xml': ['.svg'],

        // 视频
        'video/mp4': ['.mp4'],
        'video/webm': ['.webm'],
        'video/mpeg': ['.mpeg', '.mpg'],
        'video/quicktime': ['.mov'],
        'video/x-msvideo': ['.avi'],
        'video/x-matroska': ['.mkv'],
        'video/x-flv': ['.flv'],

        // 音频
        'audio/mpeg': ['.mp3'],
        'audio/wav': ['.wav'],
        'audio/flac': ['.flac'],
        'audio/aac': ['.aac'],

        // 文档
        'application/pdf': ['.pdf'],
        'application/msword': ['.doc'],
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
        'text/plain': ['.txt'],
        'text/markdown': ['.md'],

        // 代码
        'text/javascript': ['.js'],
        'text/x-python': ['.py'],
        'text/x-java': ['.java'],
        'text/x-cplusplus': ['.cpp', '.cc'],
        'text/x-c': ['.c'],
        'text/html': ['.html'],
        'text/css': ['.css'],
        'text/x-go': ['.go'],

        // 压缩包
        'application/zip': ['.zip'],
        'application/x-rar-compressed': ['.rar'],
        'application/x-7z-compressed': ['.7z'],
        'application/x-tar': ['.tar'],
        'application/gzip': ['.gz'],
    };

    static isImage(filename) {
        const ext = filename.toLowerCase().substring(filename.lastIndexOf('.'));
        for (const [mime, exts] of Object.entries(this.MIME_TYPES)) {
            if (mime.startsWith('image/') && exts.includes(ext)) {
                return true;
            }
        }
        return false;
    }

    static isVideo(filename) {
        const ext = filename.toLowerCase().substring(filename.lastIndexOf('.'));
        for (const [mime, exts] of Object.entries(this.MIME_TYPES)) {
            if (mime.startsWith('video/') && exts.includes(ext)) {
                return true;
            }
        }
        return false;
    }

    static isAudio(filename) {
        const ext = filename.toLowerCase().substring(filename.lastIndexOf('.'));
        for (const [mime, exts] of Object.entries(this.MIME_TYPES)) {
            if (mime.startsWith('audio/') && exts.includes(ext)) {
                return true;
            }
        }
        return false;
    }

    static getMimeType(filename) {
        const ext = filename.toLowerCase().substring(filename.lastIndexOf('.'));
        for (const [mime, exts] of Object.entries(this.MIME_TYPES)) {
            if (exts.includes(ext)) {
                return mime;
            }
        }
        return 'application/octet-stream';
    }

    static getFileCategory(filename) {
        if (this.isImage(filename)) return 'image';
        if (this.isVideo(filename)) return 'video';
        if (this.isAudio(filename)) return 'audio';

        const ext = filename.toLowerCase().substring(filename.lastIndexOf('.'));
        if (['.pdf', '.doc', '.docx', '.txt', '.md'].includes(ext)) return 'document';
        if (['.zip', '.rar', '.7z', '.tar', '.gz'].includes(ext)) return 'archive';
        if (['.js', '.py', '.java', '.cpp', '.c', '.html', '.css', '.go'].includes(ext)) return 'code';

        return 'file';
    }
}

/**
 * 文件大小格式化
 */
class FileSizeFormatter {
    static format(bytes, decimals = 2) {
        if (bytes === 0) return '0 B';

        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];

        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }

    static parseSize(size) {
        const units = {
            'B': 1,
            'KB': 1024,
            'MB': 1024 * 1024,
            'GB': 1024 * 1024 * 1024,
            'TB': 1024 * 1024 * 1024 * 1024
        };

        const match = size.match(/^([\d.]+)\s*([A-Z]+)$/i);
        if (!match) return 0;

        const value = parseFloat(match[1]);
        const unit = match[2].toUpperCase();

        return value * (units[unit] || 1);
    }
}

/**
 * 日期格式化
 */
class DateFormatter {
    static format(date, format = 'YYYY-MM-DD HH:mm:ss') {
        if (!date) return '-';

        const d = new Date(date);

        const pad = (n) => String(n).padStart(2, '0');
        const replacements = {
            'YYYY': d.getFullYear(),
            'MM': pad(d.getMonth() + 1),
            'DD': pad(d.getDate()),
            'HH': pad(d.getHours()),
            'mm': pad(d.getMinutes()),
            'ss': pad(d.getSeconds())
        };

        let result = format;
        for (const [key, value] of Object.entries(replacements)) {
            result = result.replace(key, value);
        }

        return result;
    }

    static relative(date) {
        if (!date) return '-';

        const d = new Date(date);
        const now = new Date();
        const seconds = Math.floor((now - d) / 1000);

        if (seconds < 60) return '刚刚';
        if (seconds < 3600) return `${Math.floor(seconds / 60)} 分钟前`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)} 小时前`;
        if (seconds < 604800) return `${Math.floor(seconds / 86400)} 天前`;

        return this.format(d, 'YYYY-MM-DD');
    }
}

/**
 * 路径工具
 */
class PathUtils {
    static join(...parts) {
        let result = parts.join('/');
        // 移除重复的斜杠
        result = result.replace(/\/+/g, '/');
        // 移除末尾斜杠（除非是根路径）
        if (result !== '/' && result.endsWith('/')) {
            result = result.slice(0, -1);
        }
        return result;
    }

    static dirname(path) {
        const index = path.lastIndexOf('/');
        if (index === 0) return '/';
        if (index === -1) return '';
        return path.substring(0, index);
    }

    static basename(path) {
        return path.substring(path.lastIndexOf('/') + 1);
    }

    static extname(path) {
        const basename = this.basename(path);
        const index = basename.lastIndexOf('.');
        if (index === -1 || index === 0) return '';
        return basename.substring(index);
    }

    static isAbsolute(path) {
        return path.startsWith('/');
    }

    static normalize(path) {
        // 移除 . 和 ..
        const parts = path.split('/');
        const result = [];

        for (const part of parts) {
            if (part === '' || part === '.') continue;
            if (part === '..') {
                result.pop();
            } else {
                result.push(part);
            }
        }

        const normalized = '/' + result.join('/');
        return normalized === '/' ? '/' : normalized;
    }

    static relative(from, to) {
        const fromParts = from.split('/').filter(p => p);
        const toParts = to.split('/').filter(p => p);

        let i = 0;
        while (i < fromParts.length && i < toParts.length && fromParts[i] === toParts[i]) {
            i++;
        }

        const ups = fromParts.length - i;
        const relative = [...Array(ups).fill('..'), ...toParts.slice(i)];

        return relative.length > 0 ? relative.join('/') : '.';
    }
}

/**
 * WebRTC信令客户端
 * 用于建立P2P连接
 */
class SignalingClient {
    constructor(signalingUrl) {
        this.signalingUrl = signalingUrl;
        this.ws = null;
        this.callbacks = {};
    }

    async connect() {
        return new Promise((resolve, reject) => {
            try {
                this.ws = new WebSocket(this.signalingUrl);

                this.ws.onopen = () => {
                    resolve();
                };

                this.ws.onmessage = (event) => {
                    try {
                        const message = JSON.parse(event.data);
                        const callback = this.callbacks[message.type];
                        if (callback) {
                            callback(message);
                        }
                    } catch (error) {
                        console.error('Signaling message error:', error);
                    }
                };

                this.ws.onerror = (error) => {
                    reject(error);
                };

                this.ws.onclose = () => {
                    console.log('Signaling connection closed');
                };
            } catch (error) {
                reject(error);
            }
        });
    }

    on(type, callback) {
        this.callbacks[type] = callback;
    }

    send(message) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(message));
        }
    }

    close() {
        this.ws?.close();
    }
}

/**
 * 缓存管理器
 */
class CacheManager {
    constructor(maxSize = 100, ttl = 3600000) {
        this.cache = new Map();
        this.maxSize = maxSize;
        this.ttl = ttl;
    }

    set(key, value, ttl = this.ttl) {
        if (this.cache.size >= this.maxSize) {
            // 移除最旧的项
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }

        this.cache.set(key, {
            value,
            timestamp: Date.now(),
            ttl
        });
    }

    get(key) {
        const item = this.cache.get(key);
        if (!item) return null;

        if (Date.now() - item.timestamp > item.ttl) {
            this.cache.delete(key);
            return null;
        }

        return item.value;
    }

    has(key) {
        return this.get(key) !== null;
    }

    delete(key) {
        this.cache.delete(key);
    }

    clear() {
        this.cache.clear();
    }

    cleanup() {
        const now = Date.now();
        for (const [key, item] of this.cache.entries()) {
            if (now - item.timestamp > item.ttl) {
                this.cache.delete(key);
            }
        }
    }
}

/**
 * 事件发射器
 */
class EventEmitter {
    constructor() {
        this.events = {};
    }

    on(event, handler) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(handler);
        return () => this.off(event, handler);
    }

    once(event, handler) {
        const wrapper = (...args) => {
            handler(...args);
            this.off(event, wrapper);
        };
        return this.on(event, wrapper);
    }

    off(event, handler) {
        if (!this.events[event]) return;
        this.events[event] = this.events[event].filter(h => h !== handler);
    }

    emit(event, ...args) {
        if (!this.events[event]) return;
        for (const handler of this.events[event]) {
            handler(...args);
        }
    }

    removeAllListeners(event) {
        if (event) {
            delete this.events[event];
        } else {
            this.events = {};
        }
    }
}
