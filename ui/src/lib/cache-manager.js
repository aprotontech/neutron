/**
 * Cache Manager for Capacitor Environment
 * Provides local file caching for thumbnails and other resources
 */

import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import md5 from 'md5';
import SQLiteManager from './sqlite.js';

export default class CacheManager {
    static instance = null;

    constructor() {
        this.sqliteManager = SQLiteManager.getInstance();
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

            console.log('CacheManager: Cache initialized successfully');
        } catch (error) {
            console.error('CacheManager: Failed to initialize cache:', error);
        }
    }

    /**
     * Get database connection
     * @private
     */
    async _getDatabase() {
        return await this.sqliteManager.getDatabase();
    }

    /**
     * Save cache record to database
     * @private
     */
    async _saveCacheRecord(cacheKey, filePath, cacheType, cacheFile, mimeType, fileSize) {
        try {
            const db = await this._getDatabase();
            if (!db) return false;

            const now = Date.now();
            await db.run(`
                INSERT OR REPLACE INTO cache_files 
                (cachekey, filepath, cachetype, cachefile, mimetype, filesize, updated_at)
                VALUES(?, ?, ?, ?, ?, ?, ?)
            `, [cacheKey, filePath, cacheType, cacheFile, mimeType, fileSize, now]);

            console.log(`CacheManager: Cache record saved to database: ${cacheKey}`);
            return true;
        } catch (error) {
            console.error('CacheManager: Error saving cache record:', error);
            return false;
        }
    }

    /**
     * Get cache record from database
     * @private
     */
    async _getCacheRecord(cacheKey) {
        try {
            const db = await this._getDatabase();
            if (!db) return null;

            // 从数据库查询缓存记录
            // 使用cachekey字段进行精确匹配
            const result = await db.query(
                `SELECT * FROM cache_files WHERE cachekey = ?`,
                [cacheKey]
            );

            return result.values && result.values.length > 0 ? result.values[0] : null;
        } catch (error) {
            console.error('CacheManager: Error getting cache record:', error);
            return null;
        }
    }

    /**
     * Remove cache record from database
     * @private
     */
    async _removeCacheRecord(cacheKey) {
        try {
            const db = await this._getDatabase();
            if (!db) return false;

            await db.run(
                `DELETE FROM cache_files WHERE cachekey = ?`,
                [cacheKey]
            );

            console.log(`CacheManager: Cache record removed from database: ${cacheKey}`);
            return true;
        } catch (error) {
            console.error('CacheManager: Error removing cache record:', error);
            return false;
        }
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
     * 获取当前缓存总大小
     * @returns {Promise<number>} 缓存总大小（字节）
     */
    async getCacheSize() {
        try {
            // 从SQLite数据库获取缓存总大小
            const db = await this._getDatabase();
            if (!db) return 0;

            const result = await db.query('SELECT SUM(filesize) as total_size FROM cache_files');
            return result.values?.[0]?.total_size || 0;
        } catch (error) {
            console.error('CacheManager: Error getting cache size:', error);
            return 0;
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

            // In native environment, get from database and filesystem
            try {
                const cacheRecord = await this._getCacheRecord(cacheKey);
                if (!cacheRecord) {
                    return null;
                }

                const metadata = {
                    cacheType: cacheRecord.cachetype,
                    timestamp: cacheRecord.updated_at,
                    size: cacheRecord.filesize,
                    filePath: cacheRecord.filepath,
                    mimeType: cacheRecord.mimetype
                };

                console.log("cache metadata", metadata)

                const cachePath = cacheRecord.cachefile;
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

            // 检查是否已存在相同缓存键的条目
            let oldSize = 0;

            // Native环境：检查文件系统
            try {
                const existingMetadata = await this.getCache(cacheKey);
                if (existingMetadata) {
                    oldSize = existingMetadata.metadata.size || 0;
                }
            } catch (err) {
                // 忽略错误
            }


            // 计算大小变化
            const sizeDelta = metadata.size - oldSize;

            // 保存到内存缓存
            let dataForMemoryCache = data;
            if (data instanceof Blob) {
                // 对于Blob，我们保存base64到内存缓存
                dataForMemoryCache = await this.blobToBase64(data);
            }
            this._saveToMemoryCache(cacheKey, dataForMemoryCache, metadata);


            // In native environment, save to filesystem
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

            // Save cache data
            if (data instanceof Blob) {
                await Filesystem.writeFile({
                    path: cachePath,
                    data: dataForMemoryCache,
                    directory: Directory.Data,
                    encoding: Encoding.Base64,
                });
            } else {
                await Filesystem.writeFile({
                    path: cachePath,
                    data: data,
                    directory: Directory.Data,
                    encoding: Encoding.UTF8,
                });
            }

            // 保存缓存记录到数据库
            // 从extraMetadata中提取filePath，如果没有则使用cacheKey作为filepath
            const filePath = extraMetadata.filePath || cacheKey;
            const mimeType = extraMetadata.mimeType || 'application/octet-stream';
            await this._saveCacheRecord(cacheKey, filePath, cacheType, cachePath, mimeType, metadata.size);


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
            // 获取要删除的缓存大小
            let removedSize = 0;

            try {
                const metadata = await this.getCache(cacheKey);
                if (metadata) {
                    removedSize = metadata.metadata.size || 0;
                }
            } catch (err) {
                // 缓存可能不存在
            }

            // 从内存缓存中移除
            this.memoryCache.delete(cacheKey);

            // In native environment, remove from filesystem
            try {
                // 从数据库获取缓存记录以获取cachefile路径
                const cacheRecord = await this._getCacheRecord(cacheKey);
                if (cacheRecord) {
                    await Filesystem.deleteFile({
                        path: cacheRecord.cachefile,
                        directory: Directory.Data
                    });
                }
            } catch (err) {
                // Cache file might not exist
            }

            // 从数据库中删除缓存记录
            await this._removeCacheRecord(cacheKey);

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
            // In native environment, check total cache size
            const totalSize = await this.getCacheSize();

            // If total size exceeds limit, delete entire cache directory and clear database
            if (totalSize > this.maxCacheSize) {
                console.log('CacheManager: Cache size exceeds limit, deleting entire cache');
                await this.deleteEntireCache();
            }
        } catch (error) {
            console.error('CacheManager: Error cleaning up cache:', error);
        }
    }

    /**
     * Delete entire cache directory and recreate it
     * @returns {Promise<boolean>} True if successful
     */
    async deleteEntireCache() {
        try {
            // 从数据库中删除所有缓存记录
            const db = await this._getDatabase();
            if (db) {
                try {
                    await db.run(`DELETE FROM cache_files`);
                    console.log('CacheManager: All cache records deleted from database');
                } catch (err) {
                    console.error('CacheManager: Error deleting cache records from database:', err);
                }
            }

            // In native environment, delete entire cache directory
            try {
                await Filesystem.rmdir({
                    path: this.cacheDir,
                    directory: Directory.Data,
                    recursive: true
                });
                console.log('CacheManager: Entire cache directory deleted');
            } catch (err) {
                // Directory might not exist
                console.log('CacheManager: Cache directory might not exist:', err.message);
            }

            // Clear memory cache
            this.memoryCache.clear();

            // Recreate cache directory structure
            await this.initCache();

            return true;
        } catch (error) {
            console.error('CacheManager: Error deleting entire cache:', error);
            return false;
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
     * Wait for cache initialization
     */
    async ready() {
        await this.initPromise;
    }

    /**
     * Clear all cache (both filesystem and memory)
     * @returns {Promise<boolean>} True if successful
     */
    async clearAllCache() {
        await this.deleteEntireCache();
    }
}
