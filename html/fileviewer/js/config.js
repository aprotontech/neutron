/**
 * 高级配置示例
 * 用于自定义应用的行为和功能
 */

// 应用配置
const APP_CONFIG = {
    // API传输配置
    api: {
        transport: 'webrtc',  // 'webrtc' 或 'http'
        baseURL: '',          // HTTP模式下的基础URL
        timeout: 30000,       // API超时时间（毫秒）
    },

    // WebRTC配置
    webrtc: {
        iceServers: [
            { urls: ['stun:stun.l.google.com:19302'] },
            { urls: ['stun:stun1.l.google.com:19302'] },
            { urls: ['stun:stun2.l.google.com:19302'] },
            { urls: ['stun:stun3.l.google.com:19302'] },
        ],
        chunkSize: 65536,      // 文件分块大小（字节）
        maxConcurrentTransfers: 4,
        enableDebug: false,
    },

    // 信令服务器配置
    signaling: {
        url: 'ws://localhost:8080/signal',
        reconnectAttempts: 5,
        reconnectInterval: 3000,
    },

    // UI配置
    ui: {
        defaultViewMode: 'list',  // 'list' 或 'thumbnail'
        itemsPerPage: 50,
        thumbnailSize: 150,
        animationsEnabled: true,
        theme: 'light',  // 'light' 或 'dark'
    },

    // 文件操作配置
    files: {
        maxFileSize: 2 * 1024 * 1024 * 1024,  // 2GB
        allowedExtensions: ['*'],  // '*'表示允许所有
        thumbnailExtensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
        previewExtensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.mp4', '.webm'],
    },

    // 缓存配置
    cache: {
        enabled: true,
        fileListTTL: 5 * 60 * 1000,      // 5分钟
        thumbnailTTL: 60 * 60 * 1000,    // 1小时
        maxCacheSize: 100,                // 最大缓存项数
    },

    // 日志配置
    logging: {
        enabled: true,
        level: 'info',  // 'debug', 'info', 'warn', 'error'
        storeLogs: false,
        maxLogSize: 1000,
    },

    // 性能配置
    performance: {
        lazyLoadImages: true,
        virtualScrolling: true,
        debounceDelay: 300,
        throttleDelay: 500,
    },

    // 国际化配置
    i18n: {
        locale: 'zh-CN',
        fallbackLocale: 'en-US',
    },
};

// 日志工具
class Logger {
    constructor(config = {}) {
        this.config = {
            enabled: true,
            level: 'info',
            storeLogs: false,
            maxLogSize: 1000,
            ...config
        };

        this.logs = [];
        this.levels = {
            'debug': 0,
            'info': 1,
            'warn': 2,
            'error': 3
        };
    }

    getLevel(level) {
        return this.levels[level] || 1;
    }

    shouldLog(level) {
        return this.config.enabled &&
            this.getLevel(level) >= this.getLevel(this.config.level);
    }

    log(level, message, data) {
        if (!this.shouldLog(level)) return;

        const timestamp = new Date().toISOString();
        const logEntry = {
            timestamp,
            level,
            message,
            data
        };

        const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
        const output = data ? `${prefix} ${message}` : `${prefix} ${message}`;

        switch (level) {
            case 'debug':
                console.debug(output, data);
                break;
            case 'info':
                console.info(output, data);
                break;
            case 'warn':
                console.warn(output, data);
                break;
            case 'error':
                console.error(output, data);
                break;
        }

        if (this.config.storeLogs) {
            this.logs.push(logEntry);
            if (this.logs.length > this.config.maxLogSize) {
                this.logs.shift();
            }
        }
    }

    debug(message, data) { this.log('debug', message, data); }
    info(message, data) { this.log('info', message, data); }
    warn(message, data) { this.log('warn', message, data); }
    error(message, data) { this.log('error', message, data); }

    getLogs() {
        return this.logs;
    }

    clearLogs() {
        this.logs = [];
    }

    downloadLogs() {
        const content = JSON.stringify(this.logs, null, 2);
        const blob = new Blob([content], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `logs-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }
}

// 应用实例创建工厂
class FileViewer {
    static create(options = {}) {
        const config = { ...APP_CONFIG, ...options };
        return new FileViewerApp(config);
    }
}

class FileViewerApp {
    constructor(config) {
        this.config = config;
        this.logger = new Logger(config.logging);
        this.fileAPI = null;
        this.cache = new Map();
        this.vm = null;

        this.logger.info('Application initialized with config', config);
    }

    async init() {
        try {
            // 初始化API
            this.fileAPI = new FileAPI(this.config.api.transport);

            if (this.fileAPI.client instanceof HttpClient) {
                this.fileAPI.client.baseURL = this.config.api.baseURL;
            }

            this.logger.info('FileAPI initialized');

            // 返回应用实例
            return this;
        } catch (error) {
            this.logger.error('Initialization failed', error);
            throw error;
        }
    }

    // 设置Vue应用实例
    setVueInstance(vm) {
        this.vm = vm;
        this.logger.info('Vue instance attached');
    }

    // 获取缓存的文件列表
    getCachedFiles(path) {
        const cacheKey = `files:${path}`;
        const cached = this.cache.get(cacheKey);

        if (cached && Date.now() - cached.timestamp < this.config.cache.fileListTTL) {
            this.logger.debug('Cache hit for files', { path });
            return cached.data;
        }

        return null;
    }

    // 设置缓存的文件列表
    setCachedFiles(path, files) {
        const cacheKey = `files:${path}`;
        this.cache.set(cacheKey, {
            data: files,
            timestamp: Date.now()
        });

        if (this.cache.size > this.config.cache.maxCacheSize) {
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }

        this.logger.debug('Cache set for files', { path });
    }

    // 获取缓存的缩微图
    getCachedThumbnail(path) {
        const cacheKey = `thumb:${path}`;
        const cached = this.cache.get(cacheKey);

        if (cached && Date.now() - cached.timestamp < this.config.cache.thumbnailTTL) {
            return cached.data;
        }

        return null;
    }

    // 设置缓存的缩微图
    setCachedThumbnail(path, data) {
        const cacheKey = `thumb:${path}`;
        this.cache.set(cacheKey, {
            data,
            timestamp: Date.now()
        });

        if (this.cache.size > this.config.cache.maxCacheSize) {
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }
    }

    // 清空缓存
    clearCache() {
        this.cache.clear();
        this.logger.info('Cache cleared');
    }

    // 获取应用配置
    getConfig() {
        return { ...this.config };
    }

    // 更新应用配置
    updateConfig(options) {
        Object.assign(this.config, options);
        this.logger.info('Configuration updated', options);
    }

    // 获取日志
    getLogs() {
        return this.logger.getLogs();
    }

    // 下载日志
    downloadLogs() {
        this.logger.downloadLogs();
    }

    // 获取应用统计信息
    getStats() {
        return {
            cacheSize: this.cache.size,
            logsCount: this.logger.logs.length,
            config: this.getConfig(),
            memory: performance.memory ? {
                usedJSHeapSize: performance.memory.usedJSHeapSize,
                totalJSHeapSize: performance.memory.totalJSHeapSize,
                jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
            } : null
        };
    }
}

// 使用示例
/*
// 1. 基本使用
const app = await FileViewer.create({
    api: { transport: 'webrtc' }
}).init();

// 2. 自定义配置
const app = await FileViewer.create({
    api: { transport: 'http', baseURL: '/api' },
    ui: { defaultViewMode: 'thumbnail' },
    webrtc: { enableDebug: true }
}).init();

// 3. 访问日志和统计
console.log(app.getStats());
app.downloadLogs();

// 4. 与Vue集成
const vm = createApp({...}).mount('#app');
app.setVueInstance(vm);

// 5. 清空缓存
app.clearCache();
*/
