
import TransferClient from './transfer.js';
import { FileTypeDetector, Hash } from './helpers.js';
import CacheManager from './thumbnail-manager.js';
import { Capacitor } from '@capacitor/core';
import { getLocalFileManager } from './local-file-manager.js';
import { Config } from './config.js';
import CachedFileInformation from './file-info.js';
import ImageRepo from './image-repo.js';

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
            // cached file info helper
            this._cachedFileInfo = new CachedFileInformation();
        }

        // Image repository for managing image history
        this.imageRepo = new ImageRepo();

        // Concurrent request cache for deduplication
        this._pendingRequests = new Map(); // key -> Promise
        // Request queues for concurrency limiting: requestType -> { count, queue }
        this._requestQueues = new Map();
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
     * Queue requests by type to limit concurrency.
     * @param {string} requestType
     * @param {number} maxConcurrency
     * @param {Function} requestFn - async function returning the request result
     */
    async _queueRequest(requestType, maxConcurrency, requestFn) {
        if (!this._requestQueues.has(requestType)) {
            this._requestQueues.set(requestType, { count: 0, queue: [] });
        }

        const entry = this._requestQueues.get(requestType);

        return new Promise((resolve, reject) => {
            const run = async () => {
                entry.count += 1;
                try {
                    const r = await requestFn();
                    resolve(r);
                } catch (err) {
                    reject(err);
                } finally {
                    entry.count -= 1;
                    // start next queued request if any
                    const next = entry.queue.shift();
                    if (next) {
                        // schedule next tick to avoid deep recursion
                        setTimeout(next, 0);
                    }
                    // cleanup empty queue entries to avoid unbounded Map growth
                    if (entry.count === 0 && entry.queue.length === 0) {
                        this._requestQueues.delete(requestType);
                    }
                }
            };

            if (entry.count < maxConcurrency) {
                run();
            } else {
                entry.queue.push(run);
            }
        });
    }

    /**
     * Generic cache wrapper function
     * @param {string} cacheType - Cache type (e.g., 'thumbnail', 'content')
     * @param {string} cacheKey - Cache key
     * @param {Function} requestFn - Function to execute if cache miss
     * @returns {Promise<any>} Cached or fresh data
     */
    async cacheThumbnailUrl(cacheType, cacheKey, requestFn) {
        if (!this.cacheManager) {
            console.log("try to get thumbnail of ", cacheKey)
            const data = await requestFn();
            if (data) {
                return URL.createObjectURL(data)
            }
            return null
        }
        try {
            // Check if we have valid cache
            const cacheLocalUri = await this.cacheManager.getCacheUri(cacheKey);

            if (cacheLocalUri) {
                console.log(`Cache hit for ${cacheType}: ${cacheKey}`);

                return cacheLocalUri;
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
                return URL.createObjectURL(freshData)
            }

            return null;
        } catch (error) {
            console.error(`Cache error for ${cacheType}: ${cacheKey}:`, error);
            // Fallback to direct request
            return await requestFn();
        }
    }

    async cacheFileContent(filePath, fileInfo) {
        const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

        const localFile = await this.localFileManager.getLocalFile(filePath);
        if (localFile && localFile.localUrl) {
            console.log(`Using local file URL for ${filePath}: ${localFile.localUrl}`);
            return localFile;
        }

        if (!fileInfo) {
            fileInfo = await this.getFileInfo(filePath);
            console.log("file info", JSON.stringify(fileInfo))
        }

        const mimeType = FileTypeDetector.getMIMEType(filePath);
        const totalFileSize = fileInfo.size;

        let result = null
        if (fileInfo.size > Config.getNativeSplitPartitionDownloadSize()) {
            const num_partitions = Math.ceil(fileInfo.size / Config.getNativeDownloadPartitionSize())
            for (let i = 0; i < num_partitions; i++) {
                const localCachedResult = await this.localFileManager.getLocalFile(filePath, i, num_partitions);
                if (localCachedResult) {
                    continue
                }

                const partitionSize = Math.min(Config.getNativeDownloadPartitionSize(), totalFileSize - i * Config.getNativeDownloadPartitionSize())

                let downloadPartitionResult = null
                for (let j = 0; j < Config.getMaxRetryDownloadPartitionCount(); j++) {
                    const stream = await TransferClient.get().getFileContent(filePath, mimeType, true,
                        i * Config.getNativeDownloadPartitionSize(),
                        partitionSize
                    );

                    fileInfo.size = partitionSize

                    downloadPartitionResult = await this.localFileManager.writeFile(filePath, fileInfo, stream, i, num_partitions);
                    if (downloadPartitionResult && downloadPartitionResult.localUrl) {
                        break
                    }
                    await sleep(1000 * (j + 1));
                }
                if (downloadPartitionResult) {
                    console.log(`finished partition ${i}`)
                } else {
                    throw new Error("download chunk failed")
                }

            }

            result = this.localFileManager.mergeFiles(filePath, fileInfo)
        } else {
            // Fallback to re-download URL
            const stream = await TransferClient.get().getFileContent(filePath, mimeType, true);

            result = await this.localFileManager.writeFile(filePath, fileInfo, stream, 0, 1);
        }

        if (result && result.localUrl) {
            console.log("result URL: ", result.localUrl)
            return result
        }

        return result
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
            return await this.cacheThumbnailUrl('thumbnail', hashKey, async () => {
                return await this._queueRequest('getFileThumbnail', Config.getThumbnailRequestMaxConcurrency(), async () => {
                    return TransferClient.get().getFileThumbnail(filePath, maxSize);
                });
            });
        });
    }

    /**
     * Get file URL for direct access
     * @param {string} filePath - Full file path
     * @returns {Promise<string>} - File URL
     */
    async getFileUrl(filePath, fileInfo = null) {
        const dedupKey = Hash.md5sum('getFileUrl', filePath);

        return await this._executeWithDeduplication(dedupKey, async () => {
            // Check if in native mode and file already exists locally
            const isNative = Capacitor.isNativePlatform();
            const mimeType = FileTypeDetector.getMIMEType(filePath);
            if (isNative && this.localFileManager) {
                const result = await this.cacheFileContent(filePath, fileInfo)

                if (result && result.localUrl) {
                    console.log("result URL: ", result.localUrl)
                    return result.localUrl
                }
            } else {
                return await this._queueRequest('getFileUrl', Config.getFileRequestMaxConcurrency(), async () => {
                    const blob = await await TransferClient.get().getFileContent(filePath, mimeType, false);
                    console.log(blob)

                    return URL.createObjectURL(blob);
                });
            }
        });
    }

    async getFileLocalCachedUrl(filePath) {
        if (!this.localFileManager) {
            return null;
        }
        const localFile = await this.localFileManager.getLocalFile(filePath);
        if (localFile && localFile.localUrl) {
            console.log(`Using local file URL for ${filePath}: ${localFile.localUrl}`);
            return localFile.localUrl;
        }

        return null
    }

    /**
     * Get file info
     * @param {string} filePath - Full file path
     * @returns {Promise<Object>} - File info object
     */
    async getFileInfo(filePath) {
        if (!this._cachedFileInfo) {
            return await TransferClient.get().getFileInfo(filePath);
        }

        // Try to read from local sqlite cache first
        try {
            const cached = await this._cachedFileInfo.getFileInfo(filePath);
            if (cached) {
                return cached;
            }
        } catch (e) {
            // ignore cache errors and fall back to network
            console.warn('CachedFileInformation.getFileInfo failed:', e);
        }

        // Fallback to network and cache the result when possible
        const fresh = await TransferClient.get().getFileInfo(filePath);
        console.log("fileinfo: ", JSON.stringify(fresh))
        try {
            if (fresh) {
                await this._cachedFileInfo.saveFileInfo(filePath, fresh);
            }
        } catch (e) {
            console.warn('CachedFileInformation.saveFileInfo failed:', e);
        }
        return fresh;
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
                if (!isNative) {
                    if (fileSize > Config.getBrowserMaxDownloadFileSize()) {
                        const fsize = FileSizeFormatter.format(Config.getBrowserMaxDownloadFileSize())
                        throw new Error(`文件太大（超过${fsize}），浏览器模式不支持下载大文件，请使用移动设备应用下载`);
                    }
                    // Browser mode: trigger browser download
                    return await this.downloadFileBrowser(filePath, fileName);
                }

                // 移动设备文件大小限制提示
                if (isNative && fileSize > Config.getNativeMaxDownloadFileSize()) {
                    const fsize = FileSizeFormatter.format(fileSize)
                    const lsize = FileSizeFormatter.format(Config.getNativeMaxDownloadFileSize())
                    throw new Error(`文件太大（${fsize}），移动设备模式限制为${lsize}以下`);
                }

                console.log(`Downloading file in native mode: ${fileName}(${fileSize} bytes)`);

                const cacheFileResult = await this.cacheFileContent(filePath, fileInfo);

                if (!cacheFileResult) {
                    throw new Error(cacheFileResult.error || '下载失败');
                }

                const result = await this.localFileManager.copyToDownloadFolder(filePath)

                if (result.uri) {
                    return true;
                } else {

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
     * Get image repository with pagination
     * @param {number} offset - Starting offset
     * @param {number} count - Number of items to retrieve
     * @param {string} order - Sort order: 'etime' or 'mtime' (default: 'etime')
     * @returns {Promise<Object>} - Object with total count and items array
     */
    async getImageRepo(offset, count, order = 'etime') {
        console.log(`Requesting image repo: offset = ${offset}, count = ${count}, order = ${order}`);

        const currentTotalCount = this.imageRepo.getLocalTotalCount();
        const requiredCount = offset + count;
        console.log(`Cache check: currentTotalCount=${currentTotalCount}, requiredCount=${requiredCount}`);

        if (currentTotalCount < requiredCount) {
            const dedupKey = Hash.md5sum('getImageRepo', offset, count, order);
            await this._executeWithDeduplication(dedupKey, async () => {
                try {
                    if (currentTotalCount == 0 && this.imageRepo.lastID === null) {
                        await this.imageRepo.init()
                    }

                    if (this.imageRepo.getLocalTotalCount() >= requiredCount) {
                        console.log('Cache was filled by another request, no need to sync');
                        return;
                    }

                    // 缓存不足，需要同步数据
                    console.log(`Cache insufficient, syncing data...`);

                    // 同步数据，传入期望的数量
                    const syncResult = await this.syncImageRepoHistory(requiredCount);

                    if (!syncResult.success) {
                        throw new Error(`Failed to sync image repo: ${syncResult.error}`);
                    }
                } catch (error) {
                    console.error('Error getting image repo:', error);
                }
            });
        }

        const items = await this.imageRepo.getList(order, offset, count);
        const totalCount = this.imageRepo.getRemoteTotalCount();

        console.log(`Retrieved ${items.length} items from image repo cache (total: ${totalCount})`);

        return {
            success: true,
            items,
            total: totalCount,
            offset,
            count: items.length,
            order,
        };
    }

    async syncImageRepoHistory(expectedCount = -1) {
        try {
            console.log(`Starting image repository history sync... expectedCount=${expectedCount}`);

            let version = "";

            const batchSize = 100; // 每次读取的数量
            let totalSynced = 0;
            let hasMoreData = true;
            const initialCount = this.imageRepo.getLocalTotalCount();

            if (false) { // TODO: check version
                // 清空现有的历史记录
                //await this.imageRepo.clear();
                console.log('Cleared existing image repository history');
            }


            // 循环读取数据直到全部完成
            while (hasMoreData) {
                let lastID = this.imageRepo.getLastID() === null ? -1 : this.imageRepo.getLastID();
                console.log(`Fetching image repo history: version=${version}, lastID=${lastID}, count=${batchSize}`);

                try {
                    // 调用 TransferClient 获取数据（现在返回protobuf对象）
                    const response = await TransferClient.get().getImageRepoHistory(version, lastID, batchSize);

                    if (!response) {
                        console.error('Invalid response from getImageRepoHistory:', response);
                        break;
                    }

                    // response是protobuf对象，直接使用其属性
                    const items = response.items || [];
                    console.log(`Received ${items.length} items from server, maxId: ${response.maxId}, remoteTotalCount: ${response.total}`);

                    if (items.length === 0) {
                        // 没有更多数据了
                        hasMoreData = false;
                        console.log('No more data to sync');
                        break;
                    }

                    // 将数据保存到 ImageRepo
                    await this.imageRepo.updateHistory(response.total, items);
                    totalSynced += items.length;

                    // 如果返回的数量小于请求的数量，说明没有更多数据了
                    if (this.imageRepo.getLastID() >= response.maxId) {
                        hasMoreData = false;
                        console.log('Reached end of data (less than batch size)');
                    }

                    // 可选：添加小的延迟以避免请求过于频繁
                    if (hasMoreData) {
                        if (!Capacitor.isNativePlatform() && expectedCount > 0 && initialCount + totalSynced < expectedCount) {
                            hasMoreData = false
                        } else {
                            await new Promise(resolve => setTimeout(resolve, 100));
                        }
                    }
                } catch (error) {
                    console.error('Error fetching image repo history:', error);
                    throw error;
                }
            }

            console.log(`Image repository history sync completed. Total synced: ${totalSynced} items`);

            // 获取同步后的统计信息
            const totalCount = this.imageRepo.getRemoteTotalCount();
            const stats = await this.imageRepo.getStatsByType();
            const timeRange = await this.imageRepo.getTimeRange();

            return {
                success: true,
                totalSynced,
                totalCount,
                stats,
                timeRange
            };

        } catch (error) {
            console.error('Failed to sync image repository history:', error);
            return {
                success: false,
                error: error.message,
                totalSynced: 0
            };
        }
    }

    async getCacheSize() {
        let totalSize = 0;
        if (this.cacheManager) {
            totalSize += await this.cacheManager.getCacheSize();
        }

        if (this.localFileManager) {
            const storageUsage = await this.localFileManager.getStorageUsage();
            if (storageUsage && typeof storageUsage.used === 'number') {
                totalSize += storageUsage.used;
            }
        }

        return totalSize;
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

        if (this.localFileManager) {
            this.localFileManager.clearAllFiles()
        }

        if (this.imageRepo) {
            this.imageRepo.clear()
        }

    }
}
