/**
 * Cache Manager for Capacitor Environment
 * Provides local file caching for thumbnails and other resources
 */

import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Base64Encoder } from './helpers.js';
import SQLiteManager from './sqlite.js';

export default class ThumbnailManager {
    static instance = null;

    constructor() {
        this.sqliteManager = SQLiteManager.getInstance();
        this.cacheDir = 'caches';
        this.maxCacheSize = 50 * 1024 * 1024; // 50MB max cache size
        this.cacheExpiry = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

        this.initPromise = this.initCache();
    }

    static getInstance() {
        if (!ThumbnailManager.instance) {
            ThumbnailManager.instance = new ThumbnailManager();
        }
        return ThumbnailManager.instance;
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
                const result = await Filesystem.stat({
                    path: this.cacheDir,
                    directory: Directory.Data,
                });
                if (!result) {
                    console.log('ThumbnailManager: Cache directory already exists or error:', err.message);
                }
            }

            console.log('ThumbnailManager: Cache initialized successfully');
        } catch (error) {
            console.error('ThumbnailManager: Failed to initialize cache:', error);
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

            // console.log(`ThumbnailManager: Cache record saved to database: ${cacheKey}`);
            return true;
        } catch (error) {
            console.error('ThumbnailManager: Error saving cache record:', error);
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
            console.error('ThumbnailManager: Error getting cache record:', error);
            return null;
        }
    }

    /**
     * Batch get cache records from database
     * @private
     */
    async batchGetCacheRecords(cacheKeys) {
        try {
            const db = await this._getDatabase();
            if (!db || !cacheKeys || cacheKeys.length === 0) {
                return new Map();
            }

            // 构建 IN 查询，但需要注意 SQLite 的 IN 子句参数限制
            // 为了安全，我们使用多个 OR 条件
            const placeholders = cacheKeys.map(() => '?').join(',');
            const query = `SELECT * FROM cache_files WHERE cachekey IN (${placeholders})`;

            const result = await db.query(query, cacheKeys);

            // 将结果转换为 Map，键为 cachekey
            const resultMap = new Map();
            if (result.values && result.values.length > 0) {
                for (const record of result.values) {
                    resultMap.set(record.cachekey, record);
                }
            }

            return resultMap;
        } catch (error) {
            console.error('ThumbnailManager: Error batch getting cache records:', error);
            return new Map();
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

            console.log(`ThumbnailManager: Cache record removed from database: ${cacheKey}`);
            return true;
        } catch (error) {
            console.error('ThumbnailManager: Error removing cache record:', error);
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
            console.error('ThumbnailManager: Error getting cache size:', error);
            return 0;
        }
    }

    async getCacheUri(cacheKey) {
        try {
            const cache = await this.getCacheMetadata(cacheKey)
            if (cache !== null) {
                if (cache.uri) {
                    return cache.uri
                }

                if (cache.data) {
                    cache.uri = URL.createObjectURL(cache.data)
                    return cache.uri
                }

                if (cache.metadata !== null && cache.metadata.cachefile) {
                    const result = await Filesystem.stat({
                        path: cache.metadata.cachefile,
                        directory: Directory.Data
                    })
                    if (result) {
                        cache.uri = Capacitor.convertFileSrc(result.uri)
                        return cache.uri
                    }
                }
            }
        } catch (error) {
            console.error('ThumbnailManager: Error getting cache:', error);
        }

        return null;
    }

    async getCacheMetadata(cacheKey) {
        try {
            // 首先检查内存缓存
            // 内存缓存已迁移到 MemoryCache 类中

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
                    mimeType: cacheRecord.mimetype,
                    cachefile: cacheRecord.cachefile,
                };

                //console.log("cache metadata", JSON.stringify(metadata))

                return {
                    metadata: metadata,
                    data: null,
                    uri: null,
                };
            } catch (err) {
                return null;
            }
        } catch (error) {
            console.error('ThumbnailManager: Error getting cache:', error);
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

            // 内存缓存已迁移到 MemoryCache 类中

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
                const base64Data = await Base64Encoder.encodeBlob(data);
                await Filesystem.writeFile({
                    path: cachePath,
                    data: base64Data,
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
            console.error('ThumbnailManager: Error saving cache:', error);
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

            // 内存缓存已迁移到 MemoryCache 类中

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
            console.error('ThumbnailManager: Error removing cache:', error);
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
                console.log('ThumbnailManager: Cache size exceeds limit, deleting entire cache');
                await this.deleteEntireCache();
            }
        } catch (error) {
            console.error('ThumbnailManager: Error cleaning up cache:', error);
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
                    console.log('ThumbnailManager: All cache records deleted from database');
                } catch (err) {
                    console.error('ThumbnailManager: Error deleting cache records from database:', err);
                }
            }

            // In native environment, delete entire cache directory
            try {
                await Filesystem.rmdir({
                    path: this.cacheDir,
                    directory: Directory.Data,
                    recursive: true
                });
                console.log('ThumbnailManager: Entire cache directory deleted');
            } catch (err) {
                // Directory might not exist
                console.log('ThumbnailManager: Cache directory might not exist:', err.message);
            }

            // 内存缓存已迁移到 MemoryCache 类中

            // Recreate cache directory structure
            await this.initCache();

            return true;
        } catch (error) {
            console.error('ThumbnailManager: Error deleting entire cache:', error);
            return false;
        }
    }

    // 内存缓存功能已迁移到 MemoryCache 类中

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
