export class MemoryCache {
    constructor() {
        this.caches = new Map(); // type -> { cache: Map, maxCount, defaultTimeout }
    }

    /**
     * 注册一个缓存类型
     * @param {string} type - 缓存类型（如 'thumbnail', 'content'）
     * @param {number} maxCount - 最大缓存条目数
     * @param {number} defaultTimeout - 默认超时时间（毫秒）
     */
    regist(type, maxCount, defaultTimeout, cleanFn = null) {
        this.caches.set(type, {
            cache: new Map(), // key -> { value, timestamp, expiry, cleanFn }
            maxCount: maxCount || 100,
            defaultTimeout: defaultTimeout || 7 * 24 * 60 * 60 * 1000, // 默认7天
            defaultCleanFn: cleanFn,
        });
    }

    /**
     * 获取缓存值，如果不存在则执行请求函数
     * @param {string} type - 缓存类型
     * @param {string} key - 缓存键
     * @param {Function} requestFn - 请求函数，返回 Promise
     * @param {number|null} timeout - 超时时间（毫秒），null 使用默认值
     * @param {Function|null} cleanFn - 清理函数，在删除缓存时调用
     * @returns {Promise<any>} - 缓存值或请求结果
     */
    async get(type, key, requestFn, timeout = null, cleanFn = null) {
        const cacheConfig = this.caches.get(type);
        if (!cacheConfig) {
            console.warn(`MemoryCache: Cache type "${type}" not registered`);
            return requestFn ? await requestFn() : null;
        }

        const cache = cacheConfig.cache;
        const cached = cache.get(key);

        // 检查缓存是否存在且未过期
        if (cached) {
            const now = Date.now();
            if (now < cached.expiry) {
                // 缓存有效
                return cached.value;
            } else {
                // 缓存已过期，调用清理函数
                if (cached.cleanFn) {
                    try {
                        cached.cleanFn(cached.value);
                    } catch (e) {
                        console.warn(`MemoryCache: Error calling cleanFn for ${type}:${key}:`, e);
                    }
                }
                cache.delete(key);
            }
        }

        // 缓存未命中，执行请求函数
        if (requestFn) {
            const freshData = await requestFn();
            if (freshData !== undefined && freshData !== null) {
                // 清理旧缓存如果超过限制
                if (cache.size >= cacheConfig.maxCount) {
                    this._cleanupOldest(type);
                }

                // 保存到缓存，使用传入的 cleanFn 或默认的 cleanFn
                const expiry = Date.now() + (timeout || cacheConfig.defaultTimeout);
                cache.set(key, {
                    value: freshData,
                    timestamp: Date.now(),
                    expiry: expiry,
                    cleanFn: cleanFn || cacheConfig.defaultCleanFn
                });
            }
            return freshData;
        }

        return null;
    }

    async set(type, key, timeout = null, cleanFn = null) {
        return await this.get(type, key, null, timeout, cleanFn)
    }

    /**
     * 获取缓存值（不执行请求函数）
     * @param {string} type - 缓存类型
     * @param {string} key - 缓存键
     * @returns {any|null} - 缓存值或 null
     */
    getValue(type, key) {
        const cacheConfig = this.caches.get(type);
        if (!cacheConfig) {
            return null;
        }

        const cache = cacheConfig.cache;
        const cached = cache.get(key);

        if (cached) {
            const now = Date.now();
            if (now < cached.expiry) {
                return cached.value;
            } else {
                // 缓存已过期，调用清理函数
                if (cached.cleanFn) {
                    try {
                        cached.cleanFn(cached.value);
                    } catch (e) {
                        console.warn(`MemoryCache: Error calling cleanFn for ${type}:${key}:`, e);
                    }
                }
                cache.delete(key);
            }
        }

        return null;
    }

    /**
     * 删除缓存
     * @param {string} type - 缓存类型
     * @param {string} key - 缓存键
     * @returns {boolean} - 是否删除成功
     */
    delete(type, key) {
        const cacheConfig = this.caches.get(type);
        if (!cacheConfig) {
            return false;
        }

        const cache = cacheConfig.cache;
        const cached = cache.get(key);
        if (cached) {
            // 调用清理函数
            if (cached.cleanFn) {
                try {
                    cached.cleanFn(cached.value);
                } catch (e) {
                    console.warn(`MemoryCache: Error calling cleanFn for ${type}:${key}:`, e);
                }
            }
            cache.delete(key);
            return true;
        }

        return false;
    }

    /**
     * 清理指定类型的所有缓存
     * @param {string} type - 缓存类型
     */
    clear(type) {
        const cacheConfig = this.caches.get(type);
        if (!cacheConfig) {
            return;
        }

        const cache = cacheConfig.cache;
        for (const [key, cached] of cache.entries()) {
            // 调用清理函数
            if (cached.cleanFn) {
                try {
                    cached.cleanFn(cached.value);
                } catch (e) {
                    console.warn(`MemoryCache: Error calling cleanFn for ${type}:${key}:`, e);
                }
            }
        }
        cache.clear();
    }

    /**
     * 清理所有缓存
     */
    clearAll() {
        for (const [type, cacheConfig] of this.caches.entries()) {
            const cache = cacheConfig.cache;
            for (const [key, cached] of cache.entries()) {
                // 调用清理函数
                if (cached.cleanFn) {
                    try {
                        cached.cleanFn(cached.value);
                    } catch (e) {
                        console.warn(`MemoryCache: Error calling cleanFn for ${type}:${key}:`, e);
                    }
                }
            }
            cache.clear();
        }
    }

    /**
     * 获取缓存统计信息
     * @param {string} type - 缓存类型
     * @returns {Object|null} - 统计信息
     */
    getStats(type) {
        const cacheConfig = this.caches.get(type);
        if (!cacheConfig) {
            return null;
        }

        const cache = cacheConfig.cache;
        return {
            type: type,
            size: cache.size,
            maxCount: cacheConfig.maxCount,
            defaultTimeout: cacheConfig.defaultTimeout
        };
    }

    /**
     * 清理最旧的缓存条目
     * @private
     */
    _cleanupOldest(type) {
        const cacheConfig = this.caches.get(type);
        if (!cacheConfig) {
            return;
        }

        const cache = cacheConfig.cache;
        let oldestKey = null;
        let oldestTime = Infinity;

        for (const [key, cached] of cache.entries()) {
            if (cached.timestamp < oldestTime) {
                oldestTime = cached.timestamp;
                oldestKey = key;
            }
        }

        if (oldestKey) {
            const oldestCached = cache.get(oldestKey);
            // 调用清理函数
            if (oldestCached.cleanFn) {
                try {
                    oldestCached.cleanFn(oldestCached.value);
                } catch (e) {
                    console.warn(`MemoryCache: Error calling cleanFn for ${type}:${oldestKey}:`, e);
                }
            }
            cache.delete(oldestKey);
        }
    }
}