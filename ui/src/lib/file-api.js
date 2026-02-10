
import TransferClient from './transfer.js';
import { FileTypeDetector, Hash } from './helpers.js';
import CacheManager from './cache-manager.js';
import { Capacitor } from '@capacitor/core';
import { getLocalFileManager } from './local-file-manager.js';

// 全局Blob检查
const BlobAvailable = typeof Blob !== 'undefined';

// Minimal FileAPI that tries HTTP endpoint then falls back to mock data
export default class FileAPI {
    // File Info:
    // name
    // isDir
    // size
    // modTime
    // thumbUrl
    // path
    // mimeType

    constructor() {
        // Check if running in Capacitor environment
        this.cacheManager = null
        this.localFileManager = null
        if (Capacitor.isNativePlatform()) {
            this.cacheManager = CacheManager.getInstance();
            this.localFileManager = getLocalFileManager();

            // Ensure cache is ready
            this.cacheManager.ready();
        }

        // Concurrent request cache for deduplication
        this._pendingRequests = new Map(); // key -> Promise
    }

    /**
     * Execute a request with deduplication
     * @private
     */
    async _executeWithDeduplication(key, requestFn) {
        // Check if there's already a pending request for this key
        if (this._pendingRequests.has(key)) {
            console.log(`Request ${key} already in progress, waiting...`);
            return await this._pendingRequests.get(key);
        }

        // Create a new promise for this request
        const promise = (async () => {
            try {
                const result = await requestFn();
                return result;
            } finally {
                // Clean up the pending request
                this._pendingRequests.delete(key);
            }
        })();

        // Store the promise in the cache
        this._pendingRequests.set(key, promise);

        return await promise;
    }

    /**
     * Generic cache wrapper function
     * @param {string} cacheType - Cache type (e.g., 'thumbnail', 'content')
     * @param {string} cacheKey - Cache key
     * @param {Function} requestFn - Function to execute if cache miss
     * @returns {Promise<any>} Cached or fresh data
     */
    async cacheFile(cacheType, cacheKey, requestFn) {
        if (!this.cacheManager) {
            return await requestFn()
        }
        try {
            // Check if we have valid cache
            const cacheData = await this.cacheManager.getCache(cacheKey);

            if (cacheData && cacheData.data) {
                console.log(`Cache hit for ${cacheType}: ${cacheKey}`);

                // Convert base64 back to blob if needed
                if (cacheType === 'thumbnail') {
                    const mimeType = cacheData.metadata.mimeType || 'image/jpeg';
                    return this.cacheManager.base64ToBlob(cacheData.data, mimeType);
                }
                return cacheData.data;

            }

            // Cache miss, execute request function
            console.log(`Cache miss for ${cacheType}: ${cacheKey}, fetching...`);
            const freshData = await requestFn();

            // Save to cache
            if (freshData) {
                const extraMetadata = {
                    mimeType: freshData.type || 'image/jpeg'
                };

                await this.cacheManager.saveCache(cacheKey, cacheType, freshData, extraMetadata);
                console.log(`Saved to cache: ${cacheType}: ${cacheKey}`);
            }

            return freshData;
        } catch (error) {
            console.error(`Cache error for ${cacheType}: ${cacheKey}:`, error);
            // Fallback to direct request
            return await requestFn();
        }
    }

    /**
     * List files in a directory
     * @param {string} path - Directory path
     * @returns {Promise<Array>} - Array of file objects
     */
    async listFiles(path = '/') {
        return TransferClient.get().listFiles(path);
    }


    /**
     * Get file thumbnail with caching
     * @param {string} filePath - Full file path
     * @param {number} maxSize - Max thumbnail size
     * @returns {Promise<Blob>} - Thumbnail image
     */
    async getFileThumbnailUrl(filePath, maxSize = 200) {
        const hashKey = Hash.md5sum(filePath, 'thumbnail', maxSize);

        return await this._executeWithDeduplication(hashKey, async () => {
            const blob = await this.cacheFile('thumbnail', hashKey, async () => {
                return TransferClient.get().getFileThumbnail(filePath, maxSize);
            });

            if (blob) {
                return URL.createObjectURL(blob)
            }
        });
    }

    /**
     * Get file URL for direct access
     * @param {string} filePath - Full file path
     * @returns {Promise<string>} - File URL
     */
    async getFileUrl(filePath) {
        const dedupKey = Hash.md5sum('getFileUrl', filePath);

        return await this._executeWithDeduplication(dedupKey, async () => {
            // Check if in native mode and file already exists locally
            const isNative = Capacitor.isNativePlatform();
            if (isNative && this.localFileManager) {
                const localFile = await this.localFileManager.getLocalFile(filePath);
                if (localFile && localFile.localUrl) {
                    console.log(`Using local file URL for ${filePath}: ${localFile.localUrl}`);
                    return localFile.localUrl;
                }
            }

            // Fallback to remote URL
            const mimeType = FileTypeDetector.getMIMEType(filePath);



            return TransferClient.get().getFileUrl(filePath, mimeType);
        });
    }

    /**
     * Get file info
     * @param {string} filePath - Full file path
     * @returns {Promise<Object>} - File info object
     */
    async getFileInfo(filePath) {
        return TransferClient.get().getFileInfo(filePath);
    }

    /**
     * Download file to device
     * @param {string} filePath - Full file path
     * @param {Object} fileInfo - File info object (optional)
     * @returns {Promise<boolean>} - Download success status
     */
    async downloadFile(filePath, fileInfo = null, overwrite = false) {
        const dedupKey = Hash.md5sum('downloadFile', filePath);
        return await this._executeWithDeduplication(dedupKey, async () => {

            try {
                // Get file info if not provided
                if (!fileInfo) {
                    fileInfo = await this.getFileInfo(filePath);
                }

                const fileSize = fileInfo.size || 0;
                const fileName = fileInfo.name || filePath.split('/').pop();

                // Check if in browser mode and file is too large (>5MB)
                const isNative = Capacitor.isNativePlatform();
                if (!isNative && fileSize > 5 * 1024 * 1024) {
                    throw new Error('文件太大（超过5MB），浏览器模式不支持下载大文件，请使用移动设备应用下载');
                }

                // 移动设备文件大小限制提示
                if (isNative && fileSize > 500 * 1024 * 1024) {
                    throw new Error(`文件太大（${(fileSize / 1024 / 1024).toFixed(1)}MB），移动设备模式限制为500MB以下`);
                }

                if (!isNative) {
                    // Browser mode: trigger browser download
                    return await this.downloadFileBrowser(filePath, fileName);
                }


                console.log(`Downloading file in native mode: ${fileName} (${fileSize} bytes)`);

                if (!overwrite) {
                    const localFile = await this.localFileManager.getLocalFile(filePath)
                    if (localFile != null) {
                        return true
                    }
                }

                // Get file content WITHOUT streaming for native mode
                const mimeType = FileTypeDetector.getMIMEType(filePath);
                const stream = await TransferClient.get().getFileContent(filePath, mimeType, true);

                const result = await this.localFileManager.writeFile(filePath, fileInfo, stream)

                if (result.completed) {
                    return true;
                } else {
                    throw new Error(result.error || '下载失败');
                }
            } catch (error) {
                console.error('Download failed:', error);

                // 提供更友好的错误信息和解决方案
                let userMessage = error.message;

                if (error.message.includes('Missing parent directory')) {
                    userMessage = '无法创建下载目录。请检查：\n' +
                        '1. 确保应用有存储权限\n' +
                        '2. 尝试重启应用\n' +
                        '3. 或使用浏览器模式下载';
                } else if (error.message.includes('permission') || error.message.includes('Permission')) {
                    userMessage = '存储权限被拒绝。请：\n' +
                        '1. 在系统设置中授予应用存储权限\n' +
                        '2. 或使用浏览器模式下载';
                } else if (error.message.includes('FileReader') || error.message.includes('readAsDataURL')) {
                    userMessage = '文件读取失败。可能原因：\n' +
                        '1. 文件太大，设备内存不足\n' +
                        '2. 尝试下载较小的文件\n' +
                        '3. 或使用浏览器模式下载';
                }

                // 创建增强的错误对象
                const enhancedError = new Error(userMessage);
                enhancedError.originalError = error;
                enhancedError.isPermissionError = error.message.includes('permission') || error.message.includes('Permission');
                enhancedError.isDirectoryError = error.message.includes('Missing parent directory');

                throw enhancedError;
            }
        })
    }

    /**
     * Download file in browser mode
     * @param {string} filePath - Full file path
     * @param {string} fileName - File name
     * @returns {Promise<boolean>} - Download success status
     */
    async downloadFileBrowser(filePath, fileName) {
        try {
            console.log(`Downloading file in browser mode: ${fileName}`);

            // Get file content without streaming for browser
            const mimeType = FileTypeDetector.getMIMEType(filePath);
            const blob = await TransferClient.get().getFileContent(filePath, mimeType, false);

            // 详细记录blob对象信息
            console.log('Blob对象详情（浏览器模式）:', {
                type: typeof blob,
                constructor: blob?.constructor?.name,
                isBlob: BlobAvailable && blob instanceof Blob,
                size: blob?.size,
                type: blob?.type,
                hasSlice: typeof blob?.slice === 'function',
                blob: blob
            });

            // Create download link
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();

            // Cleanup
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            console.log('Browser download triggered');
            return true;
        } catch (error) {
            console.error('Browser download failed:', error);
            throw error;
        }
    }

    /**
     * Get cache statistics
     * @returns {Promise<Object>} Cache statistics
     */
    async getCacheStats() {
        if (!this.cacheManager) {
            return null
        }
        try {
            const entries = await this.cacheManager.getCacheEntries();
            const memoryStats = this.cacheManager.getMemoryCacheStats();

            return {
                totalEntries: entries.length,
                memoryCache: memoryStats,
                maxCacheSize: this.cacheManager.maxCacheSize,
                cacheExpiry: this.cacheManager.cacheExpiry
            };
        } catch (error) {
            console.error('Error getting cache stats:', error);
            return null;
        }
    }

    /**
     * Get image repository with pagination
     * @param {number} offset - Starting offset
     * @param {number} count - Number of items to retrieve
     * @returns {Promise<Object>} - Object with total count and items array
     */
    async getImageRepo(offset, count) {
        console.log(`Requesting image repo: offset=${offset}, count=${count}`);
        const dedupKey = Hash.md5sum('getImageRepo', offset, count);

        return await this._executeWithDeduplication(dedupKey, async () => {
            return TransferClient.get().getImageRepo(offset, count);
        });
    }

    /**
     * Delete a downloaded file
     * @param {string} filePath - Remote file path
     * @returns {Promise<boolean>} - Success status
     */
    async deleteLocalFile(filePath) {
        try {
            if (!this.localFileManager) {
                return false;
            }

            return await this.localFileManager.deleteLocalFile(filePath);
        } catch (error) {
            console.error('Failed to delete local file:', error);
            return false;
        }
    }

    async cleanAllCaches() {
        if (this.cacheManager) {
            this.cacheManager.deleteEntireCache()
        }

    }
}
