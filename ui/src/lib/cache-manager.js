/**
 * Cache Manager for Capacitor Environment
 * Provides local file caching for thumbnails and other resources
 */

import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import md5 from 'md5';

export default class CacheManager {
    static instance = null;

    constructor() {
        this.cacheDir = 'cache';
        this.maxCacheSize = 50 * 1024 * 1024; // 50MB max cache size
        this.cacheExpiry = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
        this.memoryCache = new Map(); // 内存缓存，提高性能
        this.memoryCacheLimit = 100; // 内存缓存最大条目数
        this.initPromise = this.initCache();
    }

    static getInstance() {
        if (!CacheManager.instance) {
            CacheManager.instance = new CacheManager();
        }
        return CacheManager.instance;
    }

    /**
     * Initialize cache directory structure
     */
    async initCache() {
        try {
            // Check if running in Capacitor environment
            if (!Capacitor.isNativePlatform()) {
                console.log('CacheManager: Running in web environment, using browser cache');
                return;
            }

            // Create cache directory if it doesn't exist
            try {
                await Filesystem.mkdir({
                    path: this.cacheDir,
                    directory: Directory.Data,
                    recursive: true
                });
            } catch (err) {
                // Directory might already exist
                console.log('CacheManager: Cache directory already exists or error:', err.message);
            }

            // Create metadata subdirectory
            try {
                await Filesystem.mkdir({
                    path: `${this.cacheDir}/metadata`,
                    directory: Directory.Data,
                    recursive: true
                });
            } catch (err) {
                console.log('CacheManager: Metadata directory already exists or error:', err.message);
            }

            console.log('CacheManager: Cache initialized successfully');
        } catch (error) {
            console.error('CacheManager: Failed to initialize cache:', error);
        }
    }

    /**
     * Generate cache key for a file using MD5 hash
     * @param {string} filePath - File path
     * @param {string} cacheType - Cache type (e.g., 'thumbnail', 'content')
     * @param {any} params - Additional parameters for cache key
     * @returns {string} Cache key
     */
    generateCacheKey(filePath, cacheType, params = {}) {
        const keyData = {
            filePath,
            cacheType,
            ...params
        };
        const jsonString = JSON.stringify(keyData);
        return md5(jsonString);
    }

    /**
     * Get cache file path
     * @param {string} cacheKey - Cache key
     * @param {string} cacheType - Cache type
     * @returns {string} Cache file path
     */
    getCacheFilePath(cacheKey, cacheType) {
        return `${this.cacheDir}/${cacheType}/${cacheKey}.dat`;
    }

    /**
     * Get cache metadata file path
     * @param {string} cacheKey - Cache key
     * @returns {string} Metadata file path
     */
    getMetadataFilePath(cacheKey) {
        return `${this.cacheDir}/metadata/${cacheKey}.meta`;
    }

    /**
     * Check if cache exists and is valid
     * @param {string} cacheKey - Cache key
     * @returns {Promise<boolean>} True if cache exists and is valid
     */
    async hasValidCache(cacheKey) {
        try {
            // 首先检查内存缓存
            const memoryCacheData = this._getFromMemoryCache(cacheKey);
            if (memoryCacheData !== null) {
                return true;
            }

            if (!Capacitor.isNativePlatform()) {
                // In web environment, check localStorage
                const cacheData = localStorage.getItem(`cache_${cacheKey}`);
                if (!cacheData) return false;

                const { data, timestamp } = JSON.parse(cacheData);
                const age = Date.now() - timestamp;
                return age < this.cacheExpiry;
            }

            // In native environment, check filesystem
            const metadataPath = this.getMetadataFilePath(cacheKey);

            try {
                const metadataContent = await Filesystem.readFile({
                    path: metadataPath,
                    directory: Directory.Data
                });

                const metadata = JSON.parse(metadataContent.data);
                const age = Date.now() - metadata.timestamp;

                // Check if cache is expired
                if (age >= this.cacheExpiry) {
                    await this.removeCache(cacheKey);
                    return false;
                }

                // Check if cache file exists
                const cachePath = this.getCacheFilePath(cacheKey, metadata.cacheType);
                const stat = await Filesystem.stat({
                    path: cachePath,
                    directory: Directory.Data
                });

                return stat && stat.size > 0;
            } catch (err) {
                return false;
            }
        } catch (error) {
            console.error('CacheManager: Error checking cache:', error);
            return false;
        }
    }

    /**
     * Get cache data
     * @param {string} cacheKey - Cache key
     * @returns {Promise<{data: any, metadata: any}>} Cache data and metadata
     */
    async getCache(cacheKey) {
        try {
            // 首先检查内存缓存
            const memoryCacheData = this._getFromMemoryCache(cacheKey);
            if (memoryCacheData !== null) {
                // 从内存缓存中获取元数据
                const cached = this.memoryCache.get(cacheKey);
                return {
                    data: memoryCacheData,
                    metadata: cached.metadata
                };
            }

            if (!Capacitor.isNativePlatform()) {
                // In web environment, get from localStorage
                const cacheData = localStorage.getItem(`cache_${cacheKey}`);
                if (!cacheData) return null;

                const parsed = JSON.parse(cacheData);
                const result = {
                    data: parsed.data,
                    metadata: {
                        cacheType: parsed.cacheType,
                        timestamp: parsed.timestamp,
                        size: parsed.size
                    }
                };

                // 保存到内存缓存
                this._saveToMemoryCache(cacheKey, parsed.data, result.metadata);

                return result;
            }

            // In native environment, get from filesystem
            const metadataPath = this.getMetadataFilePath(cacheKey);

            try {
                const metadataContent = await Filesystem.readFile({
                    path: metadataPath,
                    directory: Directory.Data
                });

                const metadata = JSON.parse(metadataContent.data);
                const cachePath = this.getCacheFilePath(cacheKey, metadata.cacheType);

                const cacheContent = await Filesystem.readFile({
                    path: cachePath,
                    directory: Directory.Data
                });

                const result = {
                    data: cacheContent.data,
                    metadata
                };

                // 保存到内存缓存
                this._saveToMemoryCache(cacheKey, cacheContent.data, metadata);

                return result;
            } catch (err) {
                return null;
            }
        } catch (error) {
            console.error('CacheManager: Error getting cache:', error);
            return null;
        }
    }

    /**
     * Save data to cache
     * @param {string} cacheKey - Cache key
     * @param {string} cacheType - Cache type
     * @param {any} data - Data to cache
     * @param {object} extraMetadata - Additional metadata
     * @returns {Promise<boolean>} True if saved successfully
     */
    async saveCache(cacheKey, cacheType, data, extraMetadata = {}) {
        try {
            const metadata = {
                cacheType,
                timestamp: Date.now(),
                size: data instanceof Blob ? data.size : data.length,
                ...extraMetadata
            };

            // 保存到内存缓存
            let dataForMemoryCache = data;
            if (data instanceof Blob) {
                // 对于Blob，我们保存base64到内存缓存
                dataForMemoryCache = await this.blobToBase64(data);
            }
            this._saveToMemoryCache(cacheKey, dataForMemoryCache, metadata);

            if (!Capacitor.isNativePlatform()) {
                // In web environment, save to localStorage
                const cacheData = {
                    data: data instanceof Blob ? dataForMemoryCache : data,
                    cacheType,
                    timestamp: metadata.timestamp,
                    size: metadata.size
                };

                localStorage.setItem(`cache_${cacheKey}`, JSON.stringify(cacheData));
                return true;
            }

            // In native environment, save to filesystem
            const metadataPath = this.getMetadataFilePath(cacheKey);
            const cachePath = this.getCacheFilePath(cacheKey, cacheType);

            // Ensure cacheType directory exists
            try {
                await Filesystem.mkdir({
                    path: `${this.cacheDir}/${cacheType}`,
                    directory: Directory.Data,
                    recursive: true
                });
            } catch (err) {
                // Directory might already exist
            }

            // Save metadata
            await Filesystem.writeFile({
                path: metadataPath,
                data: JSON.stringify(metadata),
                directory: Directory.Data,
                encoding: 'utf8'
            });

            // Save cache data
            if (data instanceof Blob) {
                await Filesystem.writeFile({
                    path: cachePath,
                    data: dataForMemoryCache,
                    directory: Directory.Data,
                    encoding: 'base64'
                });
            } else {
                await Filesystem.writeFile({
                    path: cachePath,
                    data: data,
                    directory: Directory.Data,
                    encoding: 'utf8'
                });
            }

            // Clean up old cache if needed
            await this.cleanupCache();

            return true;
        } catch (error) {
            console.error('CacheManager: Error saving cache:', error);
            return false;
        }
    }

    /**
     * Remove cache
     * @param {string} cacheKey - Cache key
     * @returns {Promise<boolean>} True if removed successfully
     */
    async removeCache(cacheKey) {
        try {
            // 从内存缓存中移除
            this._removeFromMemoryCache(cacheKey);

            if (!Capacitor.isNativePlatform()) {
                // In web environment, remove from localStorage
                localStorage.removeItem(`cache_${cacheKey}`);
                return true;
            }

            // In native environment, remove from filesystem
            try {
                const metadata = await this.getCache(cacheKey);
                if (metadata) {
                    const cachePath = this.getCacheFilePath(cacheKey, metadata.metadata.cacheType);
                    await Filesystem.deleteFile({
                        path: cachePath,
                        directory: Directory.Data
                    });
                }
            } catch (err) {
                // Cache file might not exist
            }

            try {
                const metadataPath = this.getMetadataFilePath(cacheKey);
                await Filesystem.deleteFile({
                    path: metadataPath,
                    directory: Directory.Data
                });
            } catch (err) {
                // Metadata file might not exist
            }

            return true;
        } catch (error) {
            console.error('CacheManager: Error removing cache:', error);
            return false;
        }
    }

    /**
     * Clean up old cache to stay within size limit
     */
    async cleanupCache() {
        try {
            if (!Capacitor.isNativePlatform()) {
                // In web environment, clean localStorage
                this.cleanupLocalStorage();
                return;
            }

            // In native environment, clean filesystem cache
            const cacheEntries = await this.getCacheEntries();

            // Sort by timestamp (oldest first)
            cacheEntries.sort((a, b) => a.metadata.timestamp - b.metadata.timestamp);

            let totalSize = cacheEntries.reduce((sum, entry) => sum + entry.metadata.size, 0);

            // Remove oldest entries until we're under the limit
            while (totalSize > this.maxCacheSize && cacheEntries.length > 0) {
                const oldest = cacheEntries.shift();
                await this.removeCache(oldest.cacheKey);
                totalSize -= oldest.metadata.size;
            }
        } catch (error) {
            console.error('CacheManager: Error cleaning up cache:', error);
        }
    }

    /**
     * Get all cache entries
     * @returns {Promise<Array>} Array of cache entries
     */
    async getCacheEntries() {
        try {
            if (!Capacitor.isNativePlatform()) {
                // In web environment, get from localStorage
                const entries = [];
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if (key.startsWith('cache_')) {
                        try {
                            const data = JSON.parse(localStorage.getItem(key));
                            entries.push({
                                cacheKey: key.replace('cache_', ''),
                                metadata: {
                                    cacheType: data.cacheType,
                                    timestamp: data.timestamp,
                                    size: data.size
                                }
                            });
                        } catch (err) {
                            // Skip invalid entries
                        }
                    }
                }
                return entries;
            }

            // In native environment, get from filesystem
            const entries = [];

            try {
                const result = await Filesystem.readdir({
                    path: `${this.cacheDir}/metadata`,
                    directory: Directory.Data
                });

                for (const file of result.files) {
                    if (file.endsWith('.meta')) {
                        const cacheKey = file.replace('.meta', '');
                        try {
                            const metadataContent = await Filesystem.readFile({
                                path: `${this.cacheDir}/metadata/${file}`,
                                directory: Directory.Data
                            });

                            const metadata = JSON.parse(metadataContent.data);
                            entries.push({
                                cacheKey,
                                metadata
                            });
                        } catch (err) {
                            // Skip invalid metadata files
                        }
                    }
                }
            } catch (err) {
                // Directory might not exist yet
            }

            return entries;
        } catch (error) {
            console.error('CacheManager: Error getting cache entries:', error);
            return [];
        }
    }

    /**
     * Clean up localStorage cache
     */
    cleanupLocalStorage() {
        try {
            const now = Date.now();
            const keysToRemove = [];

            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key.startsWith('cache_')) {
                    try {
                        const data = JSON.parse(localStorage.getItem(key));
                        const age = now - data.timestamp;

                        if (age >= this.cacheExpiry) {
                            keysToRemove.push(key);
                        }
                    } catch (err) {
                        // Remove invalid entries
                        keysToRemove.push(key);
                    }
                }
            }

            keysToRemove.forEach(key => localStorage.removeItem(key));
        } catch (error) {
            console.error('CacheManager: Error cleaning up localStorage:', error);
        }
    }

    /**
     * Convert blob to base64
     * @param {Blob} blob - Blob to convert
     * @returns {Promise<string>} Base64 string
     */
    async blobToBase64(blob) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64data = reader.result.split(',')[1];
                resolve(base64data);
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    }

    /**
     * Convert base64 to blob
     * @param {string} base64 - Base64 string
     * @param {string} mimeType - MIME type
     * @returns {Blob} Blob object
     */
    base64ToBlob(base64, mimeType) {
        const byteCharacters = atob(base64);
        const byteNumbers = new Array(byteCharacters.length);

        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }

        const byteArray = new Uint8Array(byteNumbers);
        return new Blob([byteArray], { type: mimeType });
    }

    /**
     * Get from memory cache
     * @private
     */
    _getFromMemoryCache(cacheKey) {
        const cached = this.memoryCache.get(cacheKey);
        if (cached) {
            const age = Date.now() - cached.timestamp;
            if (age < this.cacheExpiry) {
                return cached.data;
            } else {
                // 内存缓存已过期
                this.memoryCache.delete(cacheKey);
            }
        }
        return null;
    }

    /**
     * Save to memory cache
     * @private
     */
    _saveToMemoryCache(cacheKey, data, metadata) {
        // 清理旧的内存缓存如果超过限制
        if (this.memoryCache.size >= this.memoryCacheLimit) {
            // 删除最旧的条目
            let oldestKey = null;
            let oldestTime = Date.now();

            for (const [key, value] of this.memoryCache.entries()) {
                if (value.timestamp < oldestTime) {
                    oldestTime = value.timestamp;
                    oldestKey = key;
                }
            }

            if (oldestKey) {
                this.memoryCache.delete(oldestKey);
            }
        }

        this.memoryCache.set(cacheKey, {
            data,
            timestamp: Date.now(),
            metadata
        });
    }

    /**
     * Remove from memory cache
     * @private
     */
    _removeFromMemoryCache(cacheKey) {
        this.memoryCache.delete(cacheKey);
    }

    /**
     * Clear memory cache
     */
    clearMemoryCache() {
        this.memoryCache.clear();
    }

    /**
     * Get memory cache stats
     */
    getMemoryCacheStats() {
        return {
            size: this.memoryCache.size,
            limit: this.memoryCacheLimit,
            entries: Array.from(this.memoryCache.keys())
        };
    }

    /**
     * Wait for cache initialization
     */
    async ready() {
        await this.initPromise;
    }
}
