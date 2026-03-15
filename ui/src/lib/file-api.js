
import TransferClient from './transfer.js';
import { FileTypeDetector, Hash } from './helpers.js';
import ThumbnailManager from './thumbnail-manager.js';
import { MemoryCache } from './memory-cache.js';
import { Capacitor } from '@capacitor/core';
import { getLocalFileManager } from './local-file-manager.js';
import { Config } from './config.js';
import CachedFileInformation from './file-info.js';
import ImageRepo from './image-repo.js';

// 全局Blob检查
const BlobAvailable = typeof Blob !== 'undefined';

// Minimal FileAPI that tries HTTP endpoint then falls back to mock data
export default class FileAPI {

    constructor() {
        TransferClient.init('webrtc')
        // Check if running in Capacitor environment
        this.cacheManager = null
        this.localFileManager = null
        if (Capacitor.isNativePlatform()) {
            this.cacheManager = ThumbnailManager.getInstance();
            this.localFileManager = getLocalFileManager();

            // Ensure cache is ready
            this.cacheManager.ready();
            // cached file info helper
            this._cachedFileInfo = new CachedFileInformation();
        }

        // Initialize memory cache
        this.memoryCache = new MemoryCache();
        // Register cache types
        // thumbnail 类型：默认清理函数用于清理 ObjectURL
        this.memoryCache.regist('thumbnail', 100, 7 * 24 * 60 * 60 * 1000, (cachedValue) => {
            if (cachedValue && cachedValue.objectUrl) {
                try {
                    URL.revokeObjectURL(cachedValue.objectUrl);
                } catch (e) {
                    // 忽略错误
                }
            }
        }); // 7 days
        this.memoryCache.regist('fileinfo', 500, 24 * 60 * 60 * 1000); // 24 hour

        // Image repository for managing image history
        this.imageRepo = new ImageRepo();
        // Store the init promise to ensure initialization completes
        this._imageRepoInitPromise = this.imageRepo.init();

        // Concurrent request cache for deduplication
        this._pendingRequests = new Map(); // key -> Promise
        // Request queues for concurrency limiting: requestType -> { count, queue }
        this._requestQueues = new Map();

        // Background sync state management
        this._backgroundSyncInProgress = false;
        this._backgroundSyncPromise = null;
        this._backgroundSyncRetryCount = 0;
        this._maxBackgroundSyncRetries = 3;

        // Sync status monitoring
        this._syncStatusCallback = null;
    }

    /**
     * 从ImageRepoHistoryItem构造FileInformation并缓存
     * @private
     */
    async _cacheFileInfoFromImageItem(imageItem) {
        if (!imageItem || !imageItem.path) {
            console.warn('Invalid image item for caching:', imageItem);
            return;
        }

        const filePath = imageItem.path;
        const cacheKey = Hash.md5sum('fileinfo', filePath);

        // 构造FileInformation对象
        const fileInfo = {
            name: filePath.split('/').pop(),
            is_dir: false,
            size: imageItem.size || 0,
            mtime: imageItem.mtime || 0,
            mime_type: FileTypeDetector.getMIMEType(filePath),
            exif_data: imageItem.exif_data || {}
        };

        console.log(`Caching file info for ${filePath}: size=${fileInfo.size}, mtime=${fileInfo.mtime}`);

        // 更新内存缓存
        this.memoryCache.set('fileinfo', cacheKey, fileInfo, 24 * 60 * 60 * 1000);

        // 如果是native模式，同时更新到SQLite
        if (Capacitor.isNativePlatform() && this._cachedFileInfo) {
            try {
                await this._cachedFileInfo.saveFileInfo(filePath, fileInfo);
                console.log(`File info saved to SQLite for: ${filePath}`);
            } catch (error) {
                console.warn(`Failed to save file info to SQLite for ${filePath}:`, error);
            }
        }

        return fileInfo;
    }

    /**
     * Get singleton instance of FileAPI
     * @returns {FileAPI} Singleton instance
     */
    static getInstance() {
        if (!FileAPI.instance) {
            FileAPI.instance = new FileAPI();
        }
        return FileAPI.instance;
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
     * @param {string} cacheType - Cache type (e.g., 'thumbnail')
     * @param {string} cacheKey - Cache key
     * @param {Function} requestFn - Function to execute if cache miss
     * @returns {Promise<any>} Cached or fresh data
     */
    async cacheThumbnailUrl(cacheType, cacheKey, requestFn) {
        // 使用新的 MemoryCache get 方法，不传入 cleanFn，使用默认的清理函数
        const cachedResult = await this.memoryCache.get(
            cacheType,
            cacheKey,
            async () => {
                // 缓存未命中，执行请求
                console.log(`Cache miss for ${cacheType}: ${cacheKey}, fetching...`);

                if (!this.cacheManager) {
                    // 如果没有缓存管理器，直接执行请求
                    const data = await requestFn();
                    if (data) {
                        const objectUrl = URL.createObjectURL(data);
                        return {
                            data: data,
                            objectUrl: objectUrl
                        };
                    }
                    return null;
                }

                try {
                    // Check if we have valid cache in filesystem
                    const cacheLocalUri = await this.cacheManager.getCacheUri(cacheKey);

                    if (cacheLocalUri) {
                        console.log(`Filesystem cache hit for ${cacheType}: ${cacheKey}`);
                        return {
                            data: null, // 文件系统缓存，不需要 Blob 数据
                            objectUrl: cacheLocalUri,
                            fromFilesystem: true
                        };
                    }

                    // 从网络获取数据
                    const freshData = await requestFn();

                    if (freshData) {
                        const extraMetadata = {
                            mimeType: freshData.type || 'image/jpeg'
                        };

                        // 保存到文件系统缓存
                        await this.cacheManager.saveCache(cacheKey, cacheType, freshData, extraMetadata);

                        // 创建 ObjectURL
                        const objectUrl = URL.createObjectURL(freshData);
                        console.log(`Saved to cache: ${cacheType}: ${cacheKey}`);

                        return {
                            data: freshData,
                            objectUrl: objectUrl
                        };
                    }

                    return null;
                } catch (error) {
                    console.error(`Cache error for ${cacheType}: ${cacheKey}:`, error);
                    // Fallback to direct request
                    try {
                        const data = await requestFn();
                        if (data) {
                            const objectUrl = URL.createObjectURL(data);
                            return {
                                data: data,
                                objectUrl: objectUrl
                            };
                        }
                    } catch (fallbackError) {
                        console.error(`Fallback request error for ${cacheType}: ${cacheKey}:`, fallbackError);
                    }
                    return null;
                }
            },
            null, // 使用默认超时时间
            null  // 不传入 cleanFn，使用默认的清理函数
        );

        // 返回 ObjectURL
        return cachedResult ? cachedResult.objectUrl : null;
    }

    async cacheFileContent(filePath, fileInfo, progressCallback = null) {
        const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

        const localFile = await this.localFileManager.getLocalFile(filePath);
        if (localFile && localFile.localUrl) {
            console.log(`Using local file URL for ${filePath}: ${localFile.localUrl}`);
            // 如果文件已缓存，立即调用进度回调（100%）
            if (progressCallback) {
                try {
                    progressCallback({
                        filePath: filePath,
                        progress: 100,
                        totalSize: localFile.fileInfo?.size || 0,
                        downloadedSize: localFile.fileInfo?.size || 0,
                        isCompleted: true,
                        localUrl: localFile.localUrl,
                        isCached: true
                    });
                } catch (e) {
                    console.warn('Progress callback error for cached file:', e);
                }
            }
            return localFile;
        }

        if (!fileInfo) {
            fileInfo = await this.getFileInfo(filePath);
            console.log("file info", JSON.stringify(fileInfo))
        }

        const mimeType = FileTypeDetector.getMIMEType(filePath);
        const totalFileSize = fileInfo.size;
        const originalFileSize = fileInfo.size; // 保存原始文件大小

        // 整体进度跟踪器
        const overallProgress = {
            totalSize: totalFileSize,
            downloadedSize: 0,
            partitionsProgress: {},
            callback: progressCallback
        };

        // 整体进度更新函数
        const updateOverallProgress = (partitionIndex, partitionProgress, partitionSize) => {
            if (!overallProgress.callback) return;

            // 更新该分区的进度
            overallProgress.partitionsProgress[partitionIndex] = {
                progress: partitionProgress,
                size: partitionSize
            };

            // 计算整体进度
            let totalDownloaded = 0;
            Object.values(overallProgress.partitionsProgress).forEach(p => {
                totalDownloaded += (p.size * p.progress) / 100;
            });

            const overallProgressPercent = Math.min(100, (totalDownloaded * 100) / overallProgress.totalSize);
            overallProgress.downloadedSize = totalDownloaded;

            // 检查是否所有分区都已完成（进度为100%）
            const allPartitionsComplete = Object.values(overallProgress.partitionsProgress).every(p => p.progress === 100);
            const isCompleted = allPartitionsComplete && overallProgressPercent === 100;

            try {
                overallProgress.callback({
                    filePath: filePath,
                    progress: overallProgressPercent,
                    totalSize: overallProgress.totalSize,
                    downloadedSize: overallProgress.downloadedSize,
                    isPartitioned: fileInfo.size > Config.getNativeSplitPartitionDownloadSize(),
                    isCompleted: isCompleted,
                    partitions: Object.keys(overallProgress.partitionsProgress).length
                });
            } catch (e) {
                console.warn('Overall progress callback error:', e);
                // 如果回调抛出DOWNLOAD_CANCELLED异常，则传播该异常
                if (e.message === 'DOWNLOAD_CANCELLED') {
                    console.log(`[FileAPI] Download cancelled by progress callback for partition ${partitionIndex}`);
                    throw e;
                }
            }
            return false;
        };

        console.log("not found local cache file, start to download file: ", filePath)

        let result = null
        if (fileInfo.size > Config.getNativeSplitPartitionDownloadSize()) {
            const num_partitions = Math.ceil(fileInfo.size / Config.getNativeDownloadPartitionSize())

            // 初始化所有分区的进度为0
            for (let i = 0; i < num_partitions; i++) {
                overallProgress.partitionsProgress[i] = {
                    progress: 0,
                    size: Math.min(Config.getNativeDownloadPartitionSize(), totalFileSize - i * Config.getNativeDownloadPartitionSize())
                };
            }

            for (let i = 0; i < num_partitions; i++) {
                const localCachedResult = await this.localFileManager.getLocalFile(filePath, i, num_partitions);
                if (localCachedResult) {
                    // 如果分区已缓存，更新进度为100%
                    updateOverallProgress(i, 100, overallProgress.partitionsProgress[i].size);
                    continue
                }

                const partitionSize = Math.min(Config.getNativeDownloadPartitionSize(), totalFileSize - i * Config.getNativeDownloadPartitionSize())

                let downloadPartitionResult = null
                for (let j = 0; j < Config.getMaxRetryDownloadPartitionCount(); j++) {
                    try {
                        const stream = await TransferClient.get().getFileContent(filePath, mimeType, true,
                            i * Config.getNativeDownloadPartitionSize(),
                            partitionSize
                        );

                        fileInfo.size = partitionSize

                        // 创建分区进度回调
                        const partitionProgressCallback = (progressData) => {
                            // updateOverallProgress会传播DOWNLOAD_CANCELLED异常
                            updateOverallProgress(i, progressData.progress, partitionSize);
                        };

                        downloadPartitionResult = await this.localFileManager.writeFile(filePath, fileInfo, stream, i, num_partitions, partitionProgressCallback);
                        if (downloadPartitionResult && downloadPartitionResult.localUrl) {
                            break
                        }
                    } catch (e) {
                        console.log(`download ${filePath} parition ${i}/${num_partitions} retry ${i}/${Config.getMaxRetryDownloadPartitionCount()} failed.`, e)
                        // 如果是下载取消错误，重新抛出
                        if (e.message === 'DOWNLOAD_CANCELLED') {
                            throw e;
                        }
                    }
                    await sleep(1000 * (j + 1));
                }
                if (downloadPartitionResult && !downloadPartitionResult.error) {
                    console.log(`finished partition ${i}/${num_partitions}`)
                } else {
                    console.log(`download ${filePath} partition ${i}/${num_partitions} failed`)
                    throw new Error("download partition failed")
                }
            }

            // 所有分片下载完成后，发送100%进度回调
            if (overallProgress.callback) {
                try {
                    overallProgress.callback({
                        filePath: filePath,
                        progress: 100,
                        totalSize: overallProgress.totalSize,
                        downloadedSize: overallProgress.totalSize,
                        isPartitioned: true,
                        isCompleted: true,
                        partitions: num_partitions,
                        message: '所有分片下载完成，正在合并文件...'
                    });
                } catch (e) {
                    console.warn('All partitions completed progress callback error:', e);
                    // 如果回调抛出DOWNLOAD_CANCELLED异常，则传播该异常
                    if (e.message === 'DOWNLOAD_CANCELLED') {
                        console.log(`[FileAPI] Download cancelled before merging files`);
                        throw e;
                    }
                }
            }

            result = await this.localFileManager.mergeFiles(filePath, fileInfo);

            // mergeFiles完成后，更新进度显示
            if (result && result.localUrl && overallProgress.callback) {
                try {
                    overallProgress.callback({
                        filePath: filePath,
                        progress: 100,
                        totalSize: overallProgress.totalSize,
                        downloadedSize: overallProgress.totalSize,
                        isPartitioned: true,
                        isCompleted: true,
                        partitions: num_partitions,
                        localUrl: result.localUrl,
                        message: '文件合并完成，准备播放'
                    });
                } catch (e) {
                    console.warn('Merge completed progress callback error:', e);
                }
            }
        } else {
            // Fallback to re-download URL
            const stream = await TransferClient.get().getFileContent(filePath, mimeType, true);

            // 创建整体进度回调
            const singleFileProgressCallback = (progressData) => {
                if (overallProgress.callback) {
                    try {
                        overallProgress.callback({
                            filePath: filePath,
                            progress: progressData.progress,
                            totalSize: originalFileSize,
                            downloadedSize: progressData.downloadedSize || 0,
                            isPartitioned: false,
                            isCompleted: progressData.isCompleted || false,
                            localUrl: progressData.localUrl
                        });
                    } catch (e) {
                        console.warn('Single file progress callback error:', e);
                        // 如果回调抛出DOWNLOAD_CANCELLED异常，则传播该异常
                        if (e.message === 'DOWNLOAD_CANCELLED') {
                            console.log(`[FileAPI] Download cancelled by progress callback for single file`);
                            throw e;
                        }
                    }
                }
            };

            result = await this.localFileManager.writeFile(filePath, fileInfo, stream, 0, 1, singleFileProgressCallback);
        }

        if (result && result.localUrl) {
            console.log("result URL: ", result.localUrl)

            // 确保最终发送100%进度回调
            if (overallProgress.callback) {
                try {
                    overallProgress.callback({
                        filePath: filePath,
                        progress: 100,
                        totalSize: originalFileSize,
                        downloadedSize: originalFileSize,
                        isPartitioned: fileInfo.size > Config.getNativeSplitPartitionDownloadSize(),
                        isCompleted: true,
                        localUrl: result.localUrl,
                        message: '文件准备就绪'
                    });
                } catch (e) {
                    console.warn('Final progress callback error:', e);
                }
            }

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
    async getFileUrl(filePath, fileInfo = null, progressCallback = null) {
        const dedupKey = Hash.md5sum('getFileUrl', filePath);

        return await this._executeWithDeduplication(dedupKey, async () => {
            // Check if in native mode and file already exists locally
            const isNative = Capacitor.isNativePlatform();
            const mimeType = FileTypeDetector.getMIMEType(filePath);
            if (isNative && this.localFileManager) {
                const result = await this.cacheFileContent(filePath, fileInfo, progressCallback)

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
        const cacheKey = Hash.md5sum('fileinfo', filePath);

        // 使用新的 MemoryCache get 方法，文件信息不需要清理函数
        return await this.memoryCache.get(
            'fileinfo',
            cacheKey,
            async () => {
                console.log(`File info cache miss for: ${filePath}`);

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
                console.log("fileinfo: ", JSON.stringify(fresh));

                try {
                    if (fresh) {
                        await this._cachedFileInfo.saveFileInfo(filePath, fresh);
                    }
                } catch (e) {
                    console.warn('CachedFileInformation.saveFileInfo failed:', e);
                }
                return fresh;
            },
            5 * 60 * 1000, // 5分钟超时
            null // 文件信息不需要清理函数
        );
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
     * @param {string} order - Sort order: 'etime' or 'mtime' (default: 'mtime')
     * @returns {Promise<Object>} - Object with total count and items array
     */
    async getImageRepo(offset, count, order = 'mtime') {
        console.log(`Requesting image repo: offset = ${offset}, count = ${count}, order = ${order}`);

        // Ensure ImageRepo is fully initialized before accessing its methods
        if (this._imageRepoInitPromise) {
            await this._imageRepoInitPromise;
            this._imageRepoInitPromise = null; // Clear the promise after first use
        }

        const isImageRepoSyncFinished = this.imageRepo.getLocalTotalCount() > 0 && this.imageRepo.getRemoteTotalCount() &&
            this.imageRepo.getLocalTotalCount() >= this.imageRepo.getRemoteTotalCount();

        if (Capacitor.isNativePlatform() && isImageRepoSyncFinished) {
            const items = await this.imageRepo.getList(order, offset, count);
            const totalCount = this.imageRepo.getRemoteTotalCount();

            console.log(`Native mode: retrieved ${items.length} items from local cache (total: ${totalCount})`);

            // 缓存每个item的fileinfo
            for (const item of items) {
                try {
                    await this._cacheFileInfoFromImageItem(item);
                } catch (error) {
                    console.warn(`Failed to cache file info for ${item.path} from local cache:`, error);
                }
            }

            // 启动后台同步以继续同步剩余数据（非阻塞）
            // this._startBackgroundSync();

            return {
                success: true,
                items,
                total: totalCount,
                offset,
                count: items.length,
                order,
            };

        } else {
            if (Capacitor.isNativePlatform()) {
                this._startBackgroundSync();
            }
            return await this._getImageRepoFromTransferClient(offset, count, order, 'xxx');
        }
    }

    async getImageGroup(type = 'year', order = 'mtime') {
        // 仅在native平台使用本地数据
        if (!Capacitor.isNativePlatform()) {
            console.warn('getImageGroup 仅在原生平台支持');
            return [];
        }

        // 确保ImageRepo已初始化
        if (this._imageRepoInitPromise) {
            await this._imageRepoInitPromise;
            this._imageRepoInitPromise = null;
        }

        // 检查History是否已同步完成
        const isImageRepoSyncFinished = this.imageRepo.getLocalTotalCount() > 0 &&
            this.imageRepo.getRemoteTotalCount() &&
            this.imageRepo.getLocalTotalCount() >= this.imageRepo.getRemoteTotalCount();

        if (!isImageRepoSyncFinished) {
            console.log('ImageRepo历史记录尚未同步完成，无法获取分组数据');
            return [];
        }

        try {
            // 调用ImageRepo的getImageGroup方法
            const groups = await this.imageRepo.getImageGroup(type, order);
            groups.map((group) => {
                group.imgUrl = ''
            })

            return groups;
        } catch (error) {
            console.error('获取图片分组失败:', error);
            return [];
        }
    }

    async getImageSyncStatus(callback) {
        // 只在native环境生效
        if (!Capacitor.isNativePlatform()) {
            return {
                isNative: false,
                isSyncing: false,
                isSyncFinished: false,
                localCount: 0,
                remoteCount: 0,
                progress: 0,
                error: null
            };
        }

        try {
            // 确保ImageRepo已初始化
            if (this._imageRepoInitPromise) {
                await this._imageRepoInitPromise;
                this._imageRepoInitPromise = null;
            }

            // 获取本地和远程计数
            const localCount = this.imageRepo.getLocalTotalCount();
            const remoteCount = this.imageRepo.getRemoteTotalCount();

            // 计算同步进度
            let progress = 0;
            let isSyncFinished = false;

            if (remoteCount > 0) {
                progress = Math.min(100, Math.round((localCount / remoteCount) * 100));
                isSyncFinished = localCount > 0 && remoteCount > 0 && localCount >= remoteCount;
            }

            // 检查是否正在同步
            const isSyncing = this._backgroundSyncInProgress ||
                (localCount > 0 && remoteCount > 0 && localCount < remoteCount);

            const status = {
                isNative: true,
                isSyncing,
                isSyncFinished,
                localCount,
                remoteCount,
                progress,
                error: null,
            };

            // 如果有回调函数，存储回调以便在同步过程中调用
            if (callback && typeof callback === 'function') {
                // 存储回调函数，供syncImageRepoHistory调用
                this._syncStatusCallback = callback;
            }

            return status;

        } catch (error) {
            console.error('Error getting image sync status:', error);
            return {
                isNative: true,
                isSyncing: false,
                isSyncFinished: false,
                localCount: 0,
                remoteCount: 0,
                progress: 0,
                error: error.message
            };
        }
    }

    /**
     * 通用的从TransferClient获取图片仓库数据的方法
     * @private
     */
    async _getImageRepoFromTransferClient(offset, count, order,) {
        try {
            // 调用TransferClient获取数据
            const response = await TransferClient.get().getImageRepoPage(offset, count, order);

            // 处理protobuf响应
            const items = response.items || [];
            const totalCount = response.total || 0;

            console.log(`retrieved ${items.length} items from TransferClient (total: ${totalCount})`);

            // 处理每个item，缓存fileinfo
            for (const item of items) {
                item.file_path = item.path;
                
                // 缓存fileinfo到内存和SQLite
                try {
                    await this._cacheFileInfoFromImageItem(item);
                } catch (error) {
                    console.warn(`Failed to cache file info for ${item.path}:`, error);
                }
            }

            return {
                success: true,
                items,
                total: totalCount,
                offset,
                count: items.length,
                order,
            };
        } catch (error) {
            console.error(`Failed to get image repo from TransferClient:`, error);

            // 返回空结果
            return {
                success: false,
                items: [],
                total: 0,
                offset,
                count: 0,
                order,
                error: error.message
            };
        }
    }

    /**
     * 启动后台同步（避免重复执行）
     * @private
     */
    async _startBackgroundSync() {
        // 如果已经在同步中，直接返回现有的promise
        if (this._backgroundSyncInProgress) {
            console.log('Background sync already in progress, waiting for existing sync...');
            return this._backgroundSyncPromise;
        }

        console.log('Starting background sync for image repository...');
        this._backgroundSyncInProgress = true;
        this._backgroundSyncRetryCount = 0;

        // 创建后台同步的promise
        this._backgroundSyncPromise = (async () => {
            let lastError = null;

            // 重试循环
            while (this._backgroundSyncRetryCount <= this._maxBackgroundSyncRetries) {
                try {
                    console.log(`Background sync attempt ${this._backgroundSyncRetryCount + 1}/${this._maxBackgroundSyncRetries + 1}`);

                    // 使用expectedCount = -1表示同步所有数据
                    const syncResult = await this.syncImageRepoHistory(-1);

                    if (syncResult.success) {
                        console.log(`Background sync completed successfully. Total synced: ${syncResult.totalSynced} items`);
                        this._backgroundSyncRetryCount = 0; // 重置重试计数
                        return syncResult;
                    } else {
                        console.error(`Background sync failed: ${syncResult.error}`);
                        lastError = new Error(`Sync failed: ${syncResult.error}`);
                    }
                } catch (error) {
                    console.error(`Background sync error (attempt ${this._backgroundSyncRetryCount + 1}):`, error);
                    lastError = error;
                }

                // 如果还有重试机会，等待一段时间后重试
                if (this._backgroundSyncRetryCount < this._maxBackgroundSyncRetries) {
                    this._backgroundSyncRetryCount++;
                    const retryDelay = Math.min(1000 * Math.pow(2, this._backgroundSyncRetryCount), 10000); // 指数退避，最大10秒
                    console.log(`Retrying background sync in ${retryDelay}ms...`);
                    await new Promise(resolve => setTimeout(resolve, retryDelay));
                } else {
                    break;
                }
            }

            // 所有重试都失败
            console.error(`Background sync failed after ${this._maxBackgroundSyncRetries + 1} attempts. Last error:`, lastError);
            throw lastError || new Error('Background sync failed');

        })().finally(() => {
            // 重置同步状态
            this._backgroundSyncInProgress = false;
            this._backgroundSyncPromise = null;
            this._backgroundSyncRetryCount = 0;
        });

        // 不等待同步完成，立即返回
        return this._backgroundSyncPromise;
    }

    async syncImageRepoHistory(expectedCount = -1) {
        try {
            console.log(`Starting image repository history sync... expectedCount=${expectedCount}`);

            this._callbackCurrentSyncStatus();

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

                    // 缓存每个item的fileinfo
                    for (const item of items) {
                        try {
                            await this._cacheFileInfoFromImageItem(item);
                        } catch (error) {
                            console.warn(`Failed to cache file info for ${item.path} during sync:`, error);
                        }
                    }

                    this._callbackCurrentSyncStatus();

                    // 如果返回的数量小于请求的数量，说明没有更多数据了
                    if (this.imageRepo.getLastID() >= response.maxId) {
                        hasMoreData = false;
                        console.log('Reached end of data (less than batch size)');
                    }

                    // 可选：添加小的延迟以避免请求过于频繁
                    if (hasMoreData) {
                        if (expectedCount > 0 && initialCount + totalSynced >= expectedCount) {
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

            this._callbackCurrentSyncStatus();

            return {
                success: true,
                totalSynced,
                totalCount,
                stats,
                timeRange
            };

        } catch (error) {
            console.error('Failed to sync image repository history:', error);

            this._callbackCurrentSyncStatus(error.message);
            return {
                success: false,
                error: error.message,
                totalSynced: 0
            };
        }
    }

    _callbackCurrentSyncStatus(error_message = null) {
        if (this._syncStatusCallback) {
            try {
                setTimeout(async () => {
                    const curStatus = await this.getImageSyncStatus();
                    curStatus.error = error_message;
                    this._syncStatusCallback(curStatus);
                }, 1);
            } catch (error) {
                console.warn('Error calling sync status callback', error);
            }
        }
    }

    async getCacheSize() {
        let totalSize = 0;

        // 估算内存缓存大小（粗略估算）
        if (this.memoryCache) {
            // 这里我们只能粗略估算，因为 JavaScript 对象的大小很难精确计算
            // 假设每个缓存条目平均占用 10KB
            let memoryCacheEntries = 0;
            // 获取所有缓存类型的统计信息
            const cacheTypes = ['thumbnail', 'fileinfo'];
            for (const type of cacheTypes) {
                const stats = this.memoryCache.getStats(type);
                if (stats) {
                    memoryCacheEntries += stats.size;
                }
            }
            // 粗略估算：每个条目 10KB
            totalSize += memoryCacheEntries * 10 * 1024;
        }

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
        // 清理内存缓存
        if (this.memoryCache) {
            this.memoryCache.clearAll();
        }

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
