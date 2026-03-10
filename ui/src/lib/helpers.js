// Minimal helper exports converted from original helpers.js

import { v4 as uuidv4 } from 'uuid';
import md5 from 'md5';
import { Capacitor } from '@capacitor/core';


export class FileTypeDetector {
    static MIME_TYPES = {
        'image/jpeg': ['.jpg', '.jpeg'],
        'image/png': ['.png'],
        'image/gif': ['.gif'],
        'image/bmp': ['.bmp'],
        'image/webp': ['.webp'],
        'image/svg+xml': ['.svg'],
        'image/heic': ['.heic', '.heif'],

        'video/mp4': ['.mp4', '.m4v'],
        'video/webm': ['.webm'],
        'video/quicktime': ['.mov'],
        'video/x-msvideo': ['.avi'],
        'video/x-matroska': ['.mkv'],
        'video/x-flv': ['.flv'],
        'video/x-ms-wmv': ['.wmv'],
        'video/mpeg': ['.mpg', '.mpeg'],

        'audio/mpeg': ['.mp3', '.mpeg'],
        'audio/wav': ['.wav'],
        'audio/ogg': ['.ogg'],
        'audio/aac': ['.aac'],
        'audio/flac': ['.flac'],
        'audio/x-m4a': ['.m4a'],

        'text/plain': ['.txt', '.text', '.log', '.md', '.markdown'],
        'text/html': ['.html', '.htm'],
        'text/css': ['.css'],
        'text/javascript': ['.js', '.jsx', '.mjs'],
        'application/javascript': ['.js', '.jsx', '.mjs'],
        'text/typescript': ['.ts', '.tsx'],
        'application/x-python': ['.py'],
        'application/x-java': ['.java'],
        'text/x-c': ['.c', '.h'],
        'text/x-c++': ['.cpp', '.cc', '.cxx', '.hpp', '.hh', '.hxx'],
        'text/x-csharp': ['.cs'],
        'text/x-php': ['.php'],
        'text/x-ruby': ['.rb'],
        'text/x-go': ['.go'],
        'text/x-rust': ['.rs'],
        'text/x-swift': ['.swift'],
        'text/x-kotlin': ['.kt', '.kts'],
        'application/json': ['.json'],
        'application/xml': ['.xml'],
        'text/x-yaml': ['.yaml', '.yml'],
        'text/x-toml': ['.toml'],
        'text/x-ini': ['.ini'],
        'text/x-shellscript': ['.sh', '.bash', '.zsh'],
        'text/x-powershell': ['.ps1'],
        'text/x-batch': ['.bat', '.cmd'],
        'text/x-lua': ['.lua'],
        'text/x-perl': ['.pl', '.pm'],
        'text/x-sql': ['.sql']
    };

    static _ext(name) {
        return name.toLowerCase().substring(name.lastIndexOf('.'));
    }

    static getMIMEType(filename) {
        const ext = this._ext(filename);
        for (const [mime, exts] of Object.entries(this.MIME_TYPES)) {
            if (exts.includes(ext)) return mime
        }
        return 'application/octet-stream'
    }

    static isImage(filename) {
        const ext = this._ext(filename);
        for (const [mime, exts] of Object.entries(this.MIME_TYPES)) {
            if (mime.startsWith('image/') && exts.includes(ext)) return true;
        }
        return false;
    }

    static isVideo(filename) {
        const ext = this._ext(filename);
        for (const [mime, exts] of Object.entries(this.MIME_TYPES)) {
            if (mime.startsWith('video/') && exts.includes(ext)) return true;
        }
        return false;
    }

    static isAudio(filename) {
        const ext = this._ext(filename);
        for (const [mime, exts] of Object.entries(this.MIME_TYPES)) {
            if (mime.startsWith('audio/') && exts.includes(ext)) return true;
        }
        return false;
    }

    static isText(filename) {
        const ext = this._ext(filename);
        for (const [mime, exts] of Object.entries(this.MIME_TYPES)) {
            if (mime.startsWith('text/') && exts.includes(ext)) return true;
        }
        return false;
    }

    static isCode(filename) {
        const ext = this._ext(filename);
        const codeExtensions = [
            '.js', '.jsx', '.mjs', '.ts', '.tsx', '.py', '.java', '.c', '.h',
            '.cpp', '.cc', '.cxx', '.hpp', '.hh', '.hxx', '.cs', '.php', '.rb',
            '.go', '.rs', '.swift', '.kt', '.kts', '.lua', '.pl', '.pm', '.sql',
            '.sh', '.bash', '.zsh', '.ps1', '.bat', '.cmd'
        ];
        return codeExtensions.includes(ext);
    }
}

export class FileSizeFormatter {
    static format(bytes, decimals = 2) {
        if (!bytes && bytes !== 0) return '-';
        if (bytes === 0) return '0 B';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        let i = 0;
        while (bytes >= k && i < sizes.length - 1) {
            bytes = bytes / k;
            i++;
        }
        return bytes.toFixed(dm) + ' ' + sizes[i];
    }
}

export class DateFormatter {
    static format(date) {
        if (!date) return '-';
        if (date < 10000000000) {
            date = date * 1000;
        }
        const d = new Date(date);
        const pad = (n) => String(n).padStart(2, '0');
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
    }
}

export class VideoDurationFormatter {
    /**
     * 解析带单位的时长字符串
     * @param {string} durationStr - 带单位的时长字符串，如 "29.17 s", "1.5 min", "2 hours"
     * @returns {number} 时长（秒）
     */
    static parseDurationWithUnit(durationStr) {
        if (!durationStr || typeof durationStr !== 'string') return 0;

        const str = durationStr.trim().toLowerCase();

        // 首先检查是否是时间格式（HH:MM:SS 或 MM:SS）
        const timeMatch = str.match(/^(\d+):(\d+)(?::(\d+(?:\.\d+)?))?$/);
        if (timeMatch) {
            if (timeMatch[3] !== undefined) {
                // HH:MM:SS 格式
                return parseInt(timeMatch[1]) * 3600 +
                    parseInt(timeMatch[2]) * 60 +
                    parseFloat(timeMatch[3]);
            } else {
                // MM:SS 格式
                return parseInt(timeMatch[1]) * 60 + parseFloat(timeMatch[2]);
            }
        }

        // 解析数字和单位，如 "29.17 s", "1.5 min"
        const match = str.match(/^([\d.]+)\s*([a-z]+)?$/);
        if (!match) return 0;

        const value = parseFloat(match[1]);
        const unit = match[2] || 's';

        switch (unit) {
            case 'ms':
            case 'millisecond':
            case 'milliseconds':
                return value / 1000;
            case 's':
            case 'sec':
            case 'second':
            case 'seconds':
                return value;
            case 'min':
            case 'minute':
            case 'minutes':
                return value * 60;
            case 'h':
            case 'hour':
            case 'hours':
                return value * 3600;
            default:
                // 未知单位，假设为秒
                return value;
        }
    }

    /**
     * 格式化视频时长
     * @param {number|string|Object} duration - 时长输入，可以是：
     *   - 数字（秒）
     *   - 字符串（如 "29.17 s", "1.5 min", "01:23"）
     *   - EXIF数据对象（自动从中提取时长）
     * @returns {string} 格式化后的时长，如 "01:23" 或 "01:23:45"
     */
    static format(duration) {
        if (!duration && duration !== 0) return '';

        let seconds = 0;

        // 处理不同类型的duration输入
        if (typeof duration === 'number') {
            seconds = duration;
        } else if (typeof duration === 'string') {
            const str = duration.trim();

            // 使用parseDurationWithUnit解析各种格式
            seconds = this.parseDurationWithUnit(str);

            // 如果解析失败，尝试直接解析为数字
            if (seconds === 0) {
                seconds = parseFloat(str);
                if (isNaN(seconds)) return '';
            }
        } else if (typeof duration === 'object' && duration !== null) {
            // 处理EXIF数据对象
            // 尝试从不同的字段获取时长
            const durationKeys = ['Duration', 'MediaDuration', 'TrackDuration', 'VideoDuration', 'Duration#'];
            for (const key of durationKeys) {
                const exifValue = this._getExifValue(duration, key);
                if (exifValue !== null && exifValue !== undefined) {
                    // 递归调用format处理提取出的值
                    return this.format(exifValue);
                }
            }
            return '';
        } else {
            return '';
        }

        // 格式化显示
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);

        const pad = (num) => num.toString().padStart(2, '0');

        if (hours > 0) {
            return `${pad(hours)}:${pad(minutes)}:${pad(secs)}`;
        } else {
            return `${pad(minutes)}:${pad(secs)}`;
        }
    }

    /**
     * 从EXIF数据对象中获取值（内部辅助方法）
     * @param {Object} exifData - EXIF数据对象
     * @param {string} key - 字段键名
     * @returns {*} 字段值
     */
    static _getExifValue(exifData, key) {
        if (!exifData || !exifData[key]) return null;
        const valueObj = exifData[key];
        if (valueObj.numberValue !== undefined && valueObj.numberValue !== null) return valueObj.numberValue;
        if (valueObj.stringValue !== undefined && valueObj.stringValue !== null) {
            const str = valueObj.stringValue;
            return str.replace(/^["']|["']$/g, '');
        }
        return null;
    }

    /**
     * 从EXIF数据中获取视频时长（兼容性方法，推荐直接使用format函数）
     * @param {Object} exifData - EXIF数据对象
     * @returns {string} 格式化后的视频时长
     */
    static getDurationFromExif(exifData) {
        // 直接调用format函数处理EXIF数据
        return this.format(exifData);
    }
}

export class Base64Encoder {
    static async encodeBlob(blob) {
        const base64Data = await new Promise((resolve, reject) => {
            const fileReader = new FileReader();
            fileReader.onloadend = () => {
                const result = fileReader.result;
                resolve(result.split(',')[1]);
            };
            fileReader.onerror = reject;
            fileReader.readAsDataURL(blob);
        });
        return base64Data
    }
}

export class Hash {
    static md5sum(...params) {
        return md5(JSON.stringify(params))
    }
}

export class RuntimeVariables {

    static _instance = null

    constructor() {
        this.username = ""
        this.password = ""
        this.clientID = ""
        this.storageServerID = ""
        this.httpApiPrefix = ""
        this.websocketAddress = ""
        this.token = ""
        this._initBySelf()
    }

    static instance() {
        if (RuntimeVariables._instance == null) {
            RuntimeVariables._instance = new RuntimeVariables()
        }
        return RuntimeVariables._instance
    }

    static getHttpAPIPrefix() {
        return RuntimeVariables.instance().httpApiPrefix
    }

    static getWebsocketAddress() {
        return RuntimeVariables.instance().websocketAddress
    }

    static getToken() {
        return RuntimeVariables.instance().token
    }

    static getUserName() {
        return RuntimeVariables.instance().username
    }

    static getPassword() {
        return RuntimeVariables.instance().password
    }

    static getClientID() {
        return RuntimeVariables.instance().clientID
    }

    static getStorageServerID() {
        return RuntimeVariables.instance().storageServerID
    }


    static updateAfterLogin(username, storageServerID, token, password = "") {
        const myself = RuntimeVariables.instance()
        myself.username = username
        myself.storageServerID = storageServerID
        myself.token = token
        myself.password = password

        myself._saveData()
    }

    static cleanup() {
        RuntimeVariables.updateAfterLogin("", "", "", "")
    }

    _initBySelf() {
        this.username = localStorage.getItem('username') || ""
        this.password = localStorage.getItem('password') || ""
        this.storageServerID = localStorage.getItem('storageServerID') || ""
        this.token = localStorage.getItem('token') || ""

        this.clientID = localStorage.getItem('clientId') || uuidv4();

        if (Capacitor.isNativePlatform() && window.location.host === 'localhost') {
            this.httpApiPrefix = import.meta.env.VITE_NEUTRON_HTTP_API
            this.websocketAddress = import.meta.env.VITE_NEUTRON_WEBSOCKET_ADDR
        } else {
            const host = window.location.host
            const protocol = window.location.protocol
            let wsaddr = '';
            if (protocol === 'https:') {
                wsaddr = 'wss://' + host + '/ws';
            } else {
                wsaddr = 'ws://' + host + '/ws';
            }
            this.websocketAddress = wsaddr
        }
    }

    _saveData() {
        localStorage.setItem('username', this.username)
        localStorage.setItem('storageServerID', this.storageServerID)
        localStorage.setItem('token', this.token)
        localStorage.setItem('password', this.password)
        localStorage.setItem('clientId', this.clientID)
    }
}
