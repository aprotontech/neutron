
import TransferClient from './transfer.js';
import { FileTypeDetector } from './helpers.js';
import CacheManager from './cache-manager.js';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';

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
        this.cacheManager = CacheManager.getInstance();
        // Ensure cache is ready
        this.cacheManager.ready();
    }

    /**
     * Generic cache wrapper function
     * @param {string} cacheType - Cache type (e.g., 'thumbnail', 'content')
     * @param {string} cacheKey - Cache key
     * @param {Function} requestFn - Function to execute if cache miss
     * @returns {Promise<any>} Cached or fresh data
     */
    async cacheFile(cacheType, cacheKey, requestFn) {
        try {
            // Check if we have valid cache
            const hasCache = await this.cacheManager.hasValidCache(cacheKey);

            if (hasCache) {
                console.log(`Cache hit for ${cacheType}: ${cacheKey}`);
                const cacheData = await this.cacheManager.getCache(cacheKey);

                if (cacheData && cacheData.data) {
                    // Convert base64 back to blob if needed
                    if (cacheType === 'thumbnail' || cacheType === 'content') {
                        const mimeType = cacheData.metadata.mimeType || 'image/jpeg';
                        return this.cacheManager.base64ToBlob(cacheData.data, mimeType);
                    }
                    return cacheData.data;
                }
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
     * Generate cache key for thumbnail
     * @param {string} filePath - File path
     * @param {number} maxSize - Max thumbnail size
     * @returns {string} Cache key
     */
    generateThumbnailCacheKey(filePath, maxSize) {
        return this.cacheManager.generateCacheKey(filePath, 'thumbnail', { maxSize });
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
     * Get file content via streaming
     * @param {string} filePath - Full file path
     * @param {boolean} stream - Whether to stream the file
     * @param {string} mimeType - MIME type of the file (optional)
     * @returns {Promise<Blob>} - File content
     */
    async getFileContent(filePath, stream, mimeType = null) {
        if (mimeType === null) {
            mimeType = FileTypeDetector.getMIMEType(filePath);
        }

        console.log(`请求文件内容: ${filePath}, MIME类型: ${mimeType}, 流模式: ${stream}`);

        try {
            const result = await TransferClient.get().getFileContent(filePath, mimeType, stream);

            console.log(`文件内容获取结果:`, {
                type: typeof result,
                constructor: result?.constructor?.name,
                isBlob: BlobAvailable && result instanceof Blob,
                size: result?.size,
                result: result
            });

            if (!result) {
                throw new Error('服务器返回空结果');
            }

            // 验证返回的对象是否是有效的Blob或类似Blob的对象
            const isValidBlob = this.validateBlobObject(result);
            if (!isValidBlob) {
                console.error('服务器返回的不是有效的Blob对象:', result);

                // 检查是否是ReadableStream
                if (result && result.constructor && result.constructor.name === 'ReadableStream') {
                    console.log('检测到ReadableStream，正在转换为Blob...');
                    try {
                        // 将ReadableStream转换为Blob
                        const blob = await this.readableStreamToBlob(result, mimeType);
                        console.log('ReadableStream转换为Blob成功:', {
                            size: blob.size,
                            type: blob.type
                        });
                        return blob;
                    } catch (streamError) {
                        console.error('ReadableStream转换失败:', streamError);
                        throw new Error('流式数据转换失败: ' + streamError.message);
                    }
                }

                // 尝试将结果转换为Blob（如果可能）
                if (typeof result === 'string') {
                    console.log('尝试将字符串转换为Blob...');
                    return new Blob([result], { type: mimeType });
                } else if (result && typeof result === 'object') {
                    // 如果是对象，尝试转换为JSON字符串再转为Blob
                    try {
                        const jsonStr = JSON.stringify(result);
                        console.log('服务器返回的是JSON对象，可能是错误信息:', jsonStr.substring(0, 200));
                        throw new Error(`服务器返回错误: ${jsonStr}`);
                    } catch (jsonError) {
                        throw new Error('服务器返回的数据格式不正确');
                    }
                } else {
                    throw new Error('服务器返回的数据格式不正确');
                }
            }

            return result;
        } catch (error) {
            console.error(`获取文件内容失败: ${filePath}`, error);

            // 提供更具体的错误信息
            if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
                throw new Error('网络连接失败，请检查网络连接');
            } else if (error.message.includes('404')) {
                throw new Error(`文件不存在: ${filePath}`);
            } else if (error.message.includes('403')) {
                throw new Error(`没有权限访问文件: ${filePath}`);
            } else if (error.message.includes('500')) {
                throw new Error('服务器内部错误，请稍后重试');
            }

            throw new Error(`下载文件失败: ${error.message}`);
        }
    }

    /**
     * Validate if an object is a valid Blob or Blob-like object
     * @param {any} obj - Object to validate
     * @returns {boolean} - True if valid blob
     */
    validateBlobObject(obj) {
        if (!obj) return false;

        // 记录对象类型信息用于调试
        console.log('验证对象类型:', {
            type: typeof obj,
            constructor: obj?.constructor?.name,
            isBlob: BlobAvailable && obj instanceof Blob,
            isReadableStream: obj?.constructor?.name === 'ReadableStream',
            obj: obj
        });

        // 如果是标准的Blob对象
        if (BlobAvailable && obj instanceof Blob) {
            return true;
        }

        // 检查是否是类似Blob的对象
        if (typeof obj === 'object' && obj !== null) {
            const hasSize = typeof obj.size === 'number' && obj.size >= 0;
            const hasType = typeof obj.type === 'string';
            const hasSlice = typeof obj.slice === 'function';
            const hasArrayBuffer = typeof obj.arrayBuffer === 'function';
            const hasText = typeof obj.text === 'function';

            // 至少需要size和type属性，以及一个读取方法
            if (hasSize && hasType && (hasSlice || hasArrayBuffer || hasText)) {
                return true;
            }

            // 检查是否是ReadableStream
            if (obj.constructor && obj.constructor.name === 'ReadableStream') {
                console.log('检测到ReadableStream对象，需要转换为Blob');
                return false; // ReadableStream不是Blob，需要转换
            }
        }

        return false;
    }

    /**
     * Convert ReadableStream to Blob
     * @param {ReadableStream} stream - ReadableStream to convert
     * @param {string} mimeType - MIME type for the resulting Blob
     * @returns {Promise<Blob>} - Converted Blob
     */
    async readableStreamToBlob(stream, mimeType = 'application/octet-stream') {
        console.log('开始将ReadableStream转换为Blob...');

        // 方法1: 使用Response对象（如果可用）
        if (typeof Response !== 'undefined') {
            try {
                const response = new Response(stream);
                const blob = await response.blob();
                console.log('使用Response转换成功，Blob大小:', blob.size);
                return blob;
            } catch (responseError) {
                console.warn('Response转换失败，尝试手动转换:', responseError);
            }
        }

        // 方法2: 手动读取ReadableStream
        const reader = stream.getReader();
        const chunks = [];
        let totalSize = 0;

        try {
            while (true) {
                const { done, value } = await reader.read();

                if (done) {
                    console.log('ReadableStream读取完成，总大小:', totalSize);
                    break;
                }

                if (value) {
                    chunks.push(value);
                    totalSize += value.length || value.byteLength || 0;
                    console.log(`读取数据块: ${value.length || value.byteLength || 0} 字节，累计: ${totalSize} 字节`);
                }
            }

            // 创建Blob
            const blob = new Blob(chunks, { type: mimeType });
            console.log('Blob创建成功:', {
                size: blob.size,
                type: blob.type,
                expectedSize: totalSize
            });

            return blob;
        } catch (error) {
            console.error('ReadableStream读取失败:', error);
            throw error;
        } finally {
            reader.releaseLock();
        }
    }

    /**
     * Ensure download directory exists
     * @returns {Promise<void>}
     */
    async ensureDownloadDirectory() {
        try {
            console.log('检查下载目录是否存在...');

            // 尝试创建目录
            await Filesystem.mkdir({
                path: 'Downloads',
                directory: Directory.ExternalStorage,
                recursive: true
            });

            console.log('下载目录已确保存在');
        } catch (error) {
            // 如果目录已存在，会抛出错误，这是正常的
            if (error.message.includes('Directory exists')) {
                console.log('下载目录已存在');
            } else {
                console.warn('创建下载目录失败，尝试使用Documents目录:', error.message);

                // 尝试使用Documents目录作为备选
                try {
                    await Filesystem.mkdir({
                        path: 'Documents',
                        directory: Directory.Documents,
                        recursive: true
                    });
                    console.log('Documents目录已确保存在');
                } catch (docError) {
                    console.error('所有目录创建尝试都失败:', docError);
                    // 继续尝试写入，可能目录已经存在
                }
            }
        }
    }

    /**
     * Save file to downloads directory with fallback options
     * @param {string} fileName - File name
     * @param {string} base64Data - Base64 encoded file data
     * @returns {Promise<any>} - Filesystem write result
     */
    async saveFileToDownloads(fileName, base64Data) {
        const saveOptions = [
            {
                path: `Downloads/${fileName}`,
                directory: Directory.ExternalStorage,
                recursive: true
            },
            {
                path: `Documents/${fileName}`,
                directory: Directory.Documents,
                recursive: true
            },
            {
                path: fileName,
                directory: Directory.Data,
                recursive: true
            }
        ];

        let lastError = null;

        for (const options of saveOptions) {
            try {
                console.log(`尝试保存文件到: ${options.path} (${options.directory})`);
                const result = await Filesystem.writeFile({
                    path: options.path,
                    data: base64Data,
                    directory: options.directory,
                    recursive: options.recursive
                });

                console.log(`文件保存成功: ${result.uri}`);
                return result;
            } catch (error) {
                console.warn(`保存到 ${options.path} 失败:`, error.message);
                lastError = error;

                // 如果是目录问题，尝试先创建目录
                if (error.message.includes('Missing parent directory')) {
                    try {
                        // 提取目录路径
                        const dirPath = options.path.substring(0, options.path.lastIndexOf('/'));
                        if (dirPath) {
                            console.log(`尝试创建目录: ${dirPath}`);
                            await Filesystem.mkdir({
                                path: dirPath,
                                directory: options.directory,
                                recursive: true
                            });

                            // 重试写入文件
                            const retryResult = await Filesystem.writeFile({
                                path: options.path,
                                data: base64Data,
                                directory: options.directory,
                                recursive: false // 目录已创建，不需要递归
                            });

                            console.log(`重试保存成功: ${retryResult.uri}`);
                            return retryResult;
                        }
                    } catch (mkdirError) {
                        console.warn(`创建目录 ${dirPath} 失败:`, mkdirError.message);
                    }
                }
            }
        }

        // 所有尝试都失败
        throw new Error(`无法保存文件，所有保存位置都失败。最后错误: ${lastError?.message || '未知错误'}`);
    }

    /**
     * Get file thumbnail with caching
     * @param {string} filePath - Full file path
     * @param {number} maxSize - Max thumbnail size
     * @returns {Promise<Blob>} - Thumbnail image
     */
    async getFileThumbnail(filePath, maxSize = 200) {
        const cacheKey = this.generateThumbnailCacheKey(filePath, maxSize);

        return await this.cacheFile('thumbnail', cacheKey, async () => {
            return TransferClient.get().getFileThumbnail(filePath, maxSize);
        });
    }

    /**
     * Get file URL for direct access
     * @param {string} filePath - Full file path
     * @returns {string} - File URL
     */
    getFileUrl(filePath) {
        const mimeType = FileTypeDetector.getMIMEType(filePath)
        return TransferClient.get().getFileUrl(filePath, mimeType);
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
    async downloadFile(filePath, fileInfo = null) {
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
            if (isNative && fileSize > 50 * 1024 * 1024) {
                throw new Error(`文件太大（${(fileSize / 1024 / 1024).toFixed(1)}MB），移动设备模式限制为50MB以下`);
            }

            if (isNative) {
                // Native mode: download with streaming and save to filesystem
                return await this.downloadFileNative(filePath, fileName, fileSize);
            } else {
                // Browser mode: trigger browser download
                return await this.downloadFileBrowser(filePath, fileName);
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
    }

    /**
     * Download file in native mode (Capacitor)
     * @param {string} filePath - Full file path
     * @param {string} fileName - File name
     * @param {number} fileSize - File size in bytes
     * @returns {Promise<boolean>} - Download success status
     */
    async downloadFileNative(filePath, fileName, fileSize) {
        try {
            console.log(`Downloading file in native mode: ${fileName} (${fileSize} bytes)`);

            // 检查文件大小限制（移动设备内存限制）
            const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
            if (fileSize > MAX_FILE_SIZE) {
                throw new Error(`文件太大（超过${MAX_FILE_SIZE / 1024 / 1024}MB），移动设备模式不支持下载超大文件`);
            }

            // Get file content WITHOUT streaming for native mode
            // Streaming returns ReadableStream, but we need Blob for Filesystem API
            const mimeType = FileTypeDetector.getMIMEType(filePath);
            const blob = await this.getFileContent(filePath, false, mimeType);

            // 详细记录blob对象信息
            console.log('Blob对象详情（原生模式）:', {
                type: typeof blob,
                constructor: blob?.constructor?.name,
                isBlob: BlobAvailable && blob instanceof Blob,
                size: blob?.size,
                type: blob?.type,
                hasSlice: typeof blob?.slice === 'function',
                blob: blob
            });

            // 验证blob大小
            if (blob && blob.size > MAX_FILE_SIZE) {
                throw new Error(`下载的文件太大（${blob.size}字节），超过移动设备限制`);
            }

            console.log(`Converting blob to base64: ${blob.size} bytes`);

            // Convert blob to base64 for Filesystem API
            const base64Data = await this.blobToBase64(blob);

            console.log(`Base64 conversion complete, saving file...`);

            // 确保目录存在
            await this.ensureDownloadDirectory();

            // 保存文件到下载目录
            const result = await this.saveFileToDownloads(fileName, base64Data);

            console.log(`File saved to: ${result.uri}`);
            return true;
        } catch (error) {
            console.error('Native download failed:', error);

            // 提供更友好的错误信息
            if (error.message.includes('FileReader') || error.message.includes('readAsDataURL')) {
                throw new Error('文件读取失败，可能是文件太大或设备内存不足');
            } else if (error.message.includes('Missing parent directory')) {
                throw new Error('无法创建下载目录，请检查存储权限或尝试使用浏览器模式下载');
            }
            throw error;
        }
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
            const blob = await this.getFileContent(filePath, false, mimeType);

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
     * Convert blob to base64
     * @param {Blob} blob - File blob
     * @returns {Promise<string>} - Base64 string
     */
    async blobToBase64(blob) {
        console.log(`开始转换Blob为Base64: size=${blob?.size}, type=${blob?.type}`);

        // 检查blob是否有效（更宽松的检查）
        if (!blob) {
            console.error('Blob对象为空');
            throw new Error('Blob对象为空');
        }

        // 详细记录blob信息
        console.log('Blob详细信息:', {
            type: typeof blob,
            constructor: blob?.constructor?.name,
            isBlob: BlobAvailable && blob instanceof Blob,
            size: blob?.size,
            mimeType: blob?.type,
            hasSlice: typeof blob?.slice === 'function',
            hasArrayBuffer: typeof blob?.arrayBuffer === 'function',
            hasText: typeof blob?.text === 'function'
        });

        // 检查是否是Blob或类似Blob的对象
        const isBlobLike = this.validateBlobObject(blob);

        if (!isBlobLike) {
            console.error('Invalid blob object:', blob);

            // 如果是ReadableStream，提供更具体的错误信息
            if (blob && blob.constructor && blob.constructor.name === 'ReadableStream') {
                throw new Error('服务器返回了流式数据，但需要Blob对象。请尝试使用浏览器模式下载。');
            }

            console.warn('Blob大小为0，可能是空文件或服务器错误');
        }

        // 对于小文件（< 10MB），使用FileReader
        if (blob.size <= 10 * 1024 * 1024) {
            console.log(`使用FileReader转换小文件: ${blob.size} 字节`);
            return new Promise((resolve, reject) => {
                const reader = new FileReader();

                // 设置超时
                const timeout = setTimeout(() => {
                    console.error('FileReader超时');
                    reader.abort();
                    reject(new Error('FileReader timeout (30秒)'));
                }, 30000); // 30秒超时

                reader.onloadend = () => {
                    clearTimeout(timeout);
                    console.log('FileReader onloadend触发');

                    if (reader.error) {
                        console.error('FileReader错误:', reader.error);
                        reject(reader.error);
                        return;
                    }

                    if (!reader.result) {
                        console.error('FileReader返回空结果');
                        reject(new Error('FileReader返回空结果'));
                        return;
                    }

                    // Remove data URL prefix
                    const base64 = reader.result.split(',')[1];
                    if (!base64) {
                        console.error('无法从Data URL提取Base64:', reader.result.substring(0, 100));
                        reject(new Error('Base64转换失败'));
                        return;
                    }

                    console.log(`Base64转换成功，长度: ${base64.length}`);
                    resolve(base64);
                };

                reader.onerror = (error) => {
                    clearTimeout(timeout);
                    console.error('FileReader onerror触发:', error);
                    reject(error);
                };

                reader.onabort = () => {
                    clearTimeout(timeout);
                    console.error('FileReader被中止');
                    reject(new Error('FileReader被中止'));
                };

                try {
                    console.log('开始调用readAsDataURL...');
                    reader.readAsDataURL(blob);
                } catch (error) {
                    clearTimeout(timeout);
                    console.error('调用readAsDataURL失败:', error);
                    reject(error);
                }
            });
        } else {
            // 对于大文件，使用分块读取
            console.log(`使用分块读取转换大文件: ${blob.size} 字节`);
            return await this.blobToBase64Chunked(blob);
        }
    }

    /**
     * Convert large blob to base64 using chunked reading
     * @param {Blob} blob - File blob
     * @returns {Promise<string>} - Base64 string
     */
    async blobToBase64Chunked(blob) {
        const chunkSize = 5 * 1024 * 1024; // 5MB chunks
        const totalChunks = Math.ceil(blob.size / chunkSize);

        console.log(`Converting large blob to base64: ${blob.size} bytes, ${totalChunks} chunks`);

        const base64Chunks = [];

        for (let i = 0; i < totalChunks; i++) {
            const start = i * chunkSize;
            const end = Math.min(start + chunkSize, blob.size);
            const chunk = blob.slice(start, end);

            const chunkBase64 = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    if (reader.error) {
                        reject(reader.error);
                        return;
                    }
                    // Remove data URL prefix
                    const base64 = reader.result.split(',')[1];
                    resolve(base64);
                };
                reader.onerror = reject;
                reader.readAsDataURL(chunk);
            });

            base64Chunks.push(chunkBase64);

            // 进度报告
            console.log(`Converted chunk ${i + 1}/${totalChunks}`);
        }

        // 合并所有chunk
        return base64Chunks.join('');
    }

    /**
     * Get cache statistics
     * @returns {Promise<Object>} Cache statistics
     */
    async getCacheStats() {
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
     * Clear memory cache
     */
    clearMemoryCache() {
        this.cacheManager.clearMemoryCache();
    }
}
