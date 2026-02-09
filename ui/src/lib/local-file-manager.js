import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { v4 as uuidv4 } from 'uuid';
import SparkMD5 from 'spark-md5';
import SQLiteManager from './sqlite.js';

/**
 * Local File Manager for Capacitor Native Mode
 * Manages downloaded files with SQLite database
 */
export default class LocalFileManager {
    constructor() {
        this.sqliteManager = SQLiteManager.getInstance();
        this.tableName = 'downloaded_files';
        this.downloadDir = null; // 下载目录
        this.cacheingDir = null; // Cache目录
    }

    /**
     * Ensure database is initialized
     * @private
     */
    async _ensureDatabase() {
        const db = await this.sqliteManager.getDatabase();
        if (!db) {
            throw new Error('Failed to initialize database');
        }
        return db
    }

    /**
     * Write file with progress tracking
     * @param {string} filePath - Remote file path
     * @returns {Promise<Object>} - Write progress object
     */
    async writeFile(filePath, fileInfo, fileContentStream) {
        try {
            await this._ensureDatabase();


            if (!fileInfo) {
                throw new Error(`Invalidate file Information`);
            }

            // Check file size limit (mobile device memory limit)
            const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
            if (fileInfo.size > MAX_FILE_SIZE) {
                throw new Error(`文件太大（超过${MAX_FILE_SIZE / 1024 / 1024}MB），移动设备模式不支持下载超大文件`);
            }

            // Start write
            console.log(`[LocalFileManager] Starting write: ${filePath}, size: ${fileInfo.size} bytes, mime: ${fileInfo.mimeType || 'unknown'}`);

            // Create progress tracker
            const progressTracker = {
                progress: 0,
                completed: false,
                fileInfo: fileInfo,
                localUrl: null,
                error: null
            };

            // Actual download logic - write to cache directory
            const cacheResult = await this._writeFileWithProgress(filePath, fileInfo, fileContentStream, progressTracker);
            console.log("download temp result: ", JSON.stringify(cacheResult))

            // Move file from cache to downloads directory
            if (progressTracker.completed && cacheResult.cacheUri) {
                console.log(`[LocalFileManager] Moving file from cache to downloads directory: ${filePath}`);
                const fileResult = await this._moveFileToDownloads(filePath, fileInfo, cacheResult);

                progressTracker.localUrl = fileResult.uri;
                console.log(`[LocalFileManager] File moved to downloads directory: ${fileResult.uri}`);

                // Save file info to database with final downloads path
                console.log(`[LocalFileManager] Saving file record to database: ${filePath}`);
                await this._saveFileRecord(filePath, fileInfo, fileResult);

                // Clean up cache file (renamed, so no need to delete)
                console.log(`[LocalFileManager] File renamed, no cache cleanup needed`);
            } else {
                throw new Error("Download failed")
            }

            console.log(`[LocalFileManager] Write operation completed for: ${filePath}`);
            return progressTracker;
        } catch (error) {
            console.error('[LocalFileManager] Write operation failed:', error);
            return {
                progress: 0,
                completed: false,
                error: error.message,
                fileInfo: null,
                localUrl: null
            };
        }
    }

    /**
     * Write file with actual progress tracking
     * @private
     */
    async _writeFileWithProgress(filePath, fileInfo, fileContentStream, progressTracker) {
        try {
            console.log('[LocalFileManager] Saving file to cache directory:', filePath);
            const cacheFileName = uuidv4();
            let cacheDir = null;
            let directoryError = null;

            // 尝试获取缓存目录
            for (let i = 0; i < 2; i++) {
                try {
                    cacheDir = await this._ensureCachingDirectory(i > 0);
                    directoryError = null;
                    break;
                } catch (error) {
                    directoryError = error;
                    console.warn(`[LocalFileManager] Failed to get caching directory (attempt ${i + 1}):`, error.message);
                }
            }

            if (!cacheDir) {
                throw directoryError || new Error('Failed to get caching directory');
            }

            console.log(`[LocalFileManager] Using cache directory: ${cacheDir.directory}, path: ${cacheDir.path}`);

            let totalSize = 0;

            const reader = fileContentStream.getReader();
            let chunkCount = 0;
            const spark = new SparkMD5.ArrayBuffer(); // 使用spark-md5进行增量MD5计算
            let cacheFilePath = null; // 缓存文件路径，用于清理

            while (true) {
                const { done, value } = await reader.read();

                if (done) {
                    console.log(`[LocalFileManager] File download completed: ${filePath}, total size: ${totalSize} bytes, chunks: ${chunkCount}`);
                    break;
                }

                if (value) {
                    chunkCount++;
                    const isFirstChunk = totalSize === 0;
                    const chunkSize = value.length || value.byteLength || 0;
                    totalSize += chunkSize;

                    console.log(`[LocalFileManager] Chunk ${chunkCount}: ${chunkSize} bytes, accumulated: ${totalSize} bytes`);

                    // 更新MD5计算
                    if (value instanceof ArrayBuffer) {
                        spark.append(value);
                    } else if (ArrayBuffer.isView(value)) {
                        spark.append(value.buffer);
                    } else {
                        // 对于其他类型的数据，转换为ArrayBuffer
                        const encoder = new TextEncoder();
                        const buffer = encoder.encode(String(value)).buffer;
                        spark.append(buffer);
                    }

                    // 将数据块转换为base64
                    const blob = new Blob([value]);
                    const base64Data = await new Promise((resolve, reject) => {
                        const fileReader = new FileReader();
                        fileReader.onloadend = () => {
                            const result = fileReader.result;
                            resolve(result.split(',')[1]);
                        };
                        fileReader.onerror = reject;
                        fileReader.readAsDataURL(blob);
                    });

                    // 写入缓存目录
                    await Filesystem.writeFile({
                        path: cacheDir.path + "/" + cacheFileName,
                        directory: cacheDir.directory,
                        recursive: true,
                        data: base64Data,
                        encoding: Encoding.Base64,
                        append: !isFirstChunk, // 第一个分块创建新文件，后续分块追加
                    });

                    // 保存缓存文件路径，用于后续清理
                    if (isFirstChunk) {
                        cacheFilePath = cacheDir.path + "/" + cacheFileName;
                    }

                    // 更新进度
                    const progress = Math.min(99, (totalSize * 100) / fileInfo.size);
                    progressTracker.progress = progress;
                    progressTracker.completed = totalSize === fileInfo.size;
                    progressTracker.localUrl = cacheFilePath;

                    console.log(`[LocalFileManager] Progress: ${progress.toFixed(2)}%`);
                }
            }

            if (totalSize != fileInfo.size) {
                console.warn(`[LocalFileManager] Received file size ${totalSize} bytes exceeds expected ${fileInfo.size} bytes`);
                throw new Error('Download file failed,  because invalidate file size')
            }

            if (!cacheFilePath) {
                throw new Error('Failed to save file to cache directory');
            }

            // 检查文件大小是否匹配
            if (totalSize !== fileInfo.size) {
                console.error(`[LocalFileManager] File size mismatch! Expected: ${fileInfo.size} bytes, Received: ${totalSize} bytes`);
                await this._cleanupCacheFile(cacheDir, cacheFileName);
                throw new Error(`文件大小不匹配：期望 ${fileInfo.size} 字节，实际接收 ${totalSize} 字节`);
            }

            // 计算最终MD5哈希值
            let finalMd5 = null;
            try {
                // 使用spark-md5获取最终MD5哈希
                finalMd5 = spark.end();
                console.log(`[LocalFileManager] File MD5 hash: ${finalMd5}`);
            } catch (md5Error) {
                console.error('[LocalFileManager] Failed to calculate MD5:', md5Error);
                // 不抛出错误，继续执行，finalMd5保持为null
            }

            // 如果fileInfo中有md5参数，进行校验
            if (fileInfo.md5 && finalMd5) {
                if (fileInfo.md5 !== finalMd5) {
                    console.error(`[LocalFileManager] MD5 mismatch! Expected: ${fileInfo.md5}, Calculated: ${finalMd5}`);
                    await this._cleanupCacheFile(cacheDir, cacheFileName);
                    throw new Error(`文件MD5校验失败：期望 ${fileInfo.md5}，实际计算 ${finalMd5}`);
                } else {
                    console.log(`[LocalFileManager] MD5校验通过`);
                }
            }

            console.log(`[LocalFileManager] File saved to cache successfully: ${cacheFilePath}`);

            // 返回缓存文件信息
            return {
                cacheUri: Capacitor.convertFileSrc(cacheFilePath),
                cacheFileName: cacheFileName,
                cacheDir: cacheDir,
                fileSize: totalSize,
                md5: finalMd5
            };
        } catch (error) {
            console.error('[LocalFileManager] Write to cache failed:', error);
            progressTracker.error = error.message;
            throw error;
        }
    }

    /**
     * Clean up cache file when download fails
     * @private
     */
    async _cleanupCacheFile(cacheDir, cacheFileName) {
        try {
            console.log(`[LocalFileManager] Cleaning up cache file: ${cacheFileName}`);

            if (!cacheDir || !cacheFileName) {
                console.warn('[LocalFileManager] Invalid cache directory or filename');
                return;
            }

            const cachePath = cacheDir.path + "/" + cacheFileName;

            try {
                await Filesystem.deleteFile({
                    path: cachePath,
                    directory: cacheDir.directory
                });
                console.log(`[LocalFileManager] Cache file cleaned up successfully: ${cachePath}`);
            } catch (deleteError) {
                console.warn(`[LocalFileManager] Failed to delete cache file ${cachePath}:`, deleteError.message);
                // 继续执行，不抛出错误
            }
        } catch (error) {
            console.error('[LocalFileManager] Error during cache cleanup:', error);
            // 不抛出错误，避免掩盖原始错误
        }
    }

    /**
     * Move file from cache to downloads directory
     * @private
     */
    async _moveFileToDownloads(filePath, fileInfo, cacheResult) {
        try {
            console.log(`[LocalFileManager] Moving file to downloads: ${filePath}`);

            // Get downloads directory
            const downloadDir = await this._ensureDownloadDirectory(false);
            if (!downloadDir) {
                throw new Error('Failed to get downloads directory');
            }

            // Generate final filename
            const finalFilename = this._generateDownloadFilename(fileInfo.name);
            const cachePath = cacheResult.cacheDir.path + "/" + cacheResult.cacheFileName;
            const finalPath = downloadDir.path + "/" + finalFilename;

            console.log(`[LocalFileManager] Renaming from cache: ${cachePath} to downloads: ${finalPath}`);

            // Use Filesystem.rename to move the file
            await Filesystem.rename({
                from: cachePath,
                to: finalPath,
                toDirectory: downloadDir.directory,
                directory: cacheResult.cacheDir.directory
            });

            const result = await Filesystem.stat({
                path: finalPath,
                directory: downloadDir.directory,
            })

            console.log(`[LocalFileManager] File renamed successfully to: ${result.uri}`);

            // Return object with all file information
            return {
                uri: result.uri,
                directory: downloadDir.directory,
                path: finalPath,
                filename: finalFilename
            };

        } catch (error) {
            console.error('[LocalFileManager] Failed to rename file:', error);
            throw error;
        }
    }

    /**
     * Generate safe filename for downloads
     * @private
     */
    _generateDownloadFilename(originalName) {
        // Remove unsafe characters and add timestamp
        const safeName = originalName.replace(/[^a-zA-Z0-9._-]/g, '_');
        const timestamp = Date.now();
        return `${timestamp}_${safeName}`;
    }


    /**
     * Ensure caching directory exists
     * @private
     */
    async _ensureCachingDirectory(recheck) {
        if (!recheck && this.cacheingDir != null) {
            return this.cacheingDir;
        }

        const needCleanup = !recheck && this.cacheingDir === null

        const result = await this._ensureDirectoryExists("/.caching");
        if (result != null) {
            this.cacheingDir = result;
            console.log(`[LocalFileManager] Caching directory set: ${result.directory}, path: ${result.path}`);

            if (needCleanup) {
                await this._cleanCachingDirectory();
            }

            return this.cacheingDir;
        }

        throw new Error("No writable directory found for caching files");
    }

    /**
     * Clean all files in caching directory
     * @private
     */
    async _cleanCachingDirectory() {
        try {
            console.log(`[LocalFileManager] Cleaning caching directory: ${this.cacheingDir.directory}, path: ${this.cacheingDir.path}`);

            await Filesystem.rmdir({
                path: this.cacheingDir.path,
                directory: this.cacheingDir.directory
            });

            console.log(`[LocalFileManager] Caching directory cleaned successfully`);
        } catch (error) {
            console.error(`[LocalFileManager] Failed to clean caching directory:`, error);
        }
    }

    /**
     * Ensure download directory exists
     * @private
     */
    async _ensureDownloadDirectory(recheck) {
        if (!recheck && this.downloadDir != null) {
            return this.downloadDir;
        }

        const result = await this._ensureDirectoryExists("/downloads");
        if (result != null) {
            this.downloadDir = result;
            console.log(`[LocalFileManager] Download directory set: ${result.directory}, path: ${result.path}`);
            return this.downloadDir;
        }

        throw new Error("No writable directory found for downloads");
    }

    /**
     * Ensure directory exists
     * @private
     */
    async _ensureDirectoryExists(subFolder) {
        const testOptions = [
            {
                path: `neutron` + subFolder,
                directory: Directory.Documents,
                recursive: true
            },
            {
                path: `neutron` + subFolder,
                directory: Directory.ExternalStorage,
                recursive: true
            },
            {
                path: "downloads" + subFolder,
                directory: Directory.Data,
                recursive: true
            }
        ];

        for (const options of testOptions) {
            try {
                await Filesystem.mkdir(options);
                console.log(`[LocalFileManager] Directory created: ${options.directory}, path: ${options.path}`);
                return options;
            } catch (error) {
                if (error.message.includes('already exists')) {
                    console.log(`[LocalFileManager] Directory already exists: ${options.directory}, path: ${options.path}`);
                    return options;
                } else {
                    console.warn(`[LocalFileManager] Failed to create directory ${options.directory}/${options.path}:`, error.message);
                }
            }
        }

        console.error('[LocalFileManager] All directory creation attempts failed');
        return null;
    }

    /**
     * Save file record to database
     * @private
     */
    async _saveFileRecord(filePath, fileInfo, fileResult) {
        try {
            const db = await this._ensureDatabase();
            if (!db) return false;

            const now = Date.now();
            const localPath = fileResult.path
            const localDirectory = fileResult.directory ? String(fileResult.directory) : null;
            const localUri = fileResult.uri || null;

            await db.run(`
                INSERT OR REPLACE INTO ${this.tableName}
                            (file_path, file_name, local_path, local_directory, local_uri, file_size, mime_type, downloaded_at, last_accessed, is_valid)
                            VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
            `, [
                filePath,
                fileInfo.name,
                localPath,
                localDirectory,
                localUri,
                fileInfo.size,
                fileInfo.mimeType,
                now,
                now
            ]);

            console.log(`[LocalFileManager] File record saved to database: ${filePath}, local: ${localUrl}, directory: ${localDirectory}, uri: ${localUri}`);
            return true;
        } catch (error) {
            console.error('[LocalFileManager] Failed to save file record:', error);
            return false;
        }
    }

    /**
     * Get local URL for a file
     * @param {string} filePath - Remote file path
     * @returns {Promise<string|null>} - Local URL or null if not found
     */
    async getLocalFile(filePath) {
        try {
            // Query database
            const db = await this._ensureDatabase();

            const result = await db.query(
                `SELECT * FROM ${this.tableName} 
                 WHERE file_path = ? AND is_valid = 1 
                 ORDER BY downloaded_at DESC LIMIT 1`,
                [filePath]
            );

            console.log(`[LocalFileManager] Database query for file: ${filePath}, found ${result.values ? result.values.length : 0} records`);

            if (result.values && result.values.length > 0) {
                const record = result.values[0];
                console.log(`[LocalFileManager] Found file record: ${record.file_name}, local: ${record.local_path}`);

                // Check if file still exists in filesystem
                const fileUri = await this._checkFileExists(record.local_directory, record.local_path);

                if (fileUri) {
                    console.log(`[LocalFileManager] File exists in filesystem: ${record.local_path}`);
                    // Update last accessed time
                    const db = await this._ensureDatabase();

                    await db.run(
                        `UPDATE ${this.tableName} SET last_accessed = ? WHERE id = ? `,
                        [Date.now(), record.id]
                    );


                    return {
                        localUrl: fileUri,
                        fileInfo: {
                            name: record.file_name,
                            size: record.file_size,
                            mimeType: record.mime_type,
                            downloadedAt: record.downloaded_at,
                            lastAccessed: record.last_accessed
                        }
                    };
                } else {
                    // Mark as invalid since file doesn't exist
                    const db = await this._ensureDatabase();

                    await db.run(
                        `UPDATE ${this.tableName} SET is_valid = 0 WHERE id = ? `,
                        [record.id]
                    );

                }
            }

            return null;
        } catch (error) {
            console.error('Failed to get local file:', error);
            return null;
        }
    }

    /**
     * Check if file exists in filesystem
     * @private
     */
    async _checkFileExists(local_directory, localPath) {
        console.log(`[LocalFileManager] Checking file existence: directory=${local_directory}, path=${localPath}`);

        try {
            const result = await Filesystem.stat({
                path: localPath,
                directory: local_directory,
            });

            if (result.type === 'file') {
                return result.uri;
            }
        } catch (error) {
            console.log(`[LocalFileManager] Stat ${localPath} failed: ${error.message}`);
        }

        return false;
    }

    /**
     * Prepare all possible Filesystem options for a given local path
     * This can be used for stat, deleteFile, and other Filesystem operations
     * @private
     */
    _prepareFilesystemOptions(localPath) {
        const optionsList = [];

        if (!localPath) {
            return optionsList;
        }

        // 选项1: 直接使用完整路径
        optionsList.push({ path: localPath });

        // 提取文件名逻辑（原 _extractFilename 函数）
        let extractedFilename = null;
        // 移除协议前缀（如 capacitor://, file://）
        const pathWithoutProtocol = localPath.replace(/^(capacitor|file):\/\//, '');
        // 提取文件名（最后一个斜杠后的部分）
        const filename = pathWithoutProtocol.split('/').pop();
        // 如果提取的文件名包含扩展名，使用它
        if (filename && filename.includes('.')) {
            extractedFilename = filename;
        } else {
            // 如果没有扩展名，尝试使用原始路径的最后一部分
            const originalFilename = localPath.split('/').pop();
            extractedFilename = originalFilename || null;
        }

        // 选项2: 在下载目录中操作
        if (this.downloadDir && extractedFilename) {
            optionsList.push({
                path: extractedFilename,
                directory: this.downloadDir.directory
            });
        }

        // 选项3: 在缓存目录中操作
        if (this.cacheingDir && extractedFilename) {
            optionsList.push({
                path: extractedFilename,
                directory: this.cacheingDir.directory
            });
        }

        // 解析路径逻辑（原 _parseLocalPath 函数）
        // 检查是否是完整的 Capacitor URI
        if (localPath.startsWith('capacitor://')) {
            // capacitor://path/to/file -> 移除协议，使用 Documents 目录
            const pathWithoutProtocol = localPath.replace('capacitor://', '');
            optionsList.push({
                path: pathWithoutProtocol,
                directory: Directory.Documents
            });
        }

        // 检查是否是完整的 file URI
        if (localPath.startsWith('file://')) {
            // file:///path/to/file -> 移除协议
            const pathWithoutProtocol = localPath.replace('file://', '');
            optionsList.push({
                path: pathWithoutProtocol,
                directory: Directory.ExternalStorage
            });
        }

        // 检查是否包含已知目录路径
        if (localPath.includes('/downloads/')) {
            const relativePath = localPath.split('/downloads/').pop();
            optionsList.push({
                path: relativePath,
                directory: Directory.Documents
            });
        }

        if (localPath.includes('/.caching/')) {
            const relativePath = localPath.split('/.caching/').pop();
            optionsList.push({
                path: relativePath,
                directory: Directory.Data
            });
        }

        return optionsList;
    }

    /**
     * Delete a file using multiple path options
     * @param {string} localPath - Local file path
     * @param {boolean} throwOnError - Whether to throw error if all options fail (default: true)
     * @returns {Promise<void>}
     * @private
     */
    async _deleteFileWithOptions(localPath, throwOnError = true) {
        // 准备所有要尝试的 Filesystem.deleteFile 参数
        const deleteOptionsList = this._prepareFilesystemOptions(localPath);

        // 按顺序尝试所有参数组合
        let deleteError = null;
        for (let i = 0; i < deleteOptionsList.length; i++) {
            const options = deleteOptionsList[i];
            try {
                console.log(`[LocalFileManager] Trying delete option ${i + 1}:`, options);
                await Filesystem.deleteFile(options);
                console.log(`[LocalFileManager] File deleted using option ${i + 1}`);
                deleteError = null;
                break;
            } catch (error) {
                console.log(`[LocalFileManager] Delete option ${i + 1} failed: ${error.message}`);
                deleteError = error;
            }
        }

        // 如果所有选项都失败，根据参数决定是否抛出错误
        if (deleteError && throwOnError) {
            throw new Error(`无法删除文件，请手动删除: ${localPath}`);
        }

        // 如果 throwOnError 为 false，即使失败也不抛出错误
        return;
    }



    /**
     * Get storage usage information
     * @returns {Promise<Object>} - Storage usage info
     */
    async getStorageUsage() {
        try {
            // Get total file size from database
            const db = await this._ensureDatabase();
            if (!db) {
                return {
                    total: 0,
                    used: 0,
                    free: 0,
                    files: []
                };
            }

            const result = await db.query(
                `SELECT SUM(file_size) as total_size, COUNT(*) as file_count 
                 FROM ${this.tableName} 
                 WHERE is_valid = 1`
            );

            const used = result.values && result.values.length > 0 ? result.values[0].total_size || 0 : 0;
            const fileCount = result.values && result.values.length > 0 ? result.values[0].file_count || 0 : 0;

            console.log(`[LocalFileManager] Storage usage: ${used} bytes used by ${fileCount} files`);

            // Get file list
            const filesResult = await db.query(
                `SELECT file_name, file_size, downloaded_at 
                 FROM ${this.tableName} 
                 WHERE is_valid = 1 
                 ORDER BY downloaded_at DESC`
            );

            const files = filesResult.values || [];

            // Get device storage info (simplified - you might need platform-specific APIs)
            // For now, we'll use a reasonable estimate
            const total = 10 * 1024 * 1024 * 1024; // 10GB estimate
            const free = total - used;

            return {
                total,
                used,
                free,
                fileCount,
                files
            };
        } catch (error) {
            console.error('Failed to get storage usage:', error);
            return {
                total: 0,
                used: 0,
                free: 0,
                fileCount: 0,
                files: []
            };
        }
    }

    /**
     * Delete a downloaded file
     * @param {string} filePath - Remote file path
     * @returns {Promise<boolean>} - Success status
     */
    async deleteLocalFile(filePath) {
        try {
            // Get file record
            const fileRecord = await this.getLocalFile(filePath);
            if (!fileRecord) {
                return false;
            }

            // Mark as invalid in database
            const db = await this._ensureDatabase();

            await db.run(
                `UPDATE ${this.tableName} SET is_valid = 0 WHERE file_path = ? `,
                [filePath]
            );

            // 使用通用的删除方法
            await this._deleteFileWithOptions(fileRecord.localUrl);

            console.log(`[LocalFileManager] File deleted: ${filePath}, local: ${fileRecord.localUrl}`);
            return true;
        } catch (error) {
            console.error('[LocalFileManager] Failed to delete file:', error);
            return false;
        }
    }

    /**
     * Clear all downloaded files
     * @returns {Promise<boolean>} - Success status
     */
    async clearAllFiles() {
        try {
            // Get all valid files
            const db = await this._ensureDatabase();
            if (!db) return false;

            // Mark all as invalid
            await db.run(`DELETE FROM ${this.tableName}`);

            await this._cleanCachingDirectory()

            return true;
        } catch (error) {
            console.error('[LocalFileManager] Failed to clear files:', error);
            return false;
        }
    }

    /**
     * Get all downloaded files
     * @returns {Promise<Array>} - List of downloaded files
     */
    async getAllFiles() {
        try {
            const db = await this._ensureDatabase();
            if (!db) return [];

            const result = await db.query(
                `SELECT * FROM ${this.tableName} 
                 WHERE is_valid = 1 
                 ORDER BY downloaded_at DESC`
            );

            const files = result.values || [];
            console.log(`[LocalFileManager] Retrieved ${files.length} files from database`);
            return files;
        } catch (error) {
            console.error('[LocalFileManager] Failed to get all files:', error);
            return [];
        }
    }
}

// Singleton instance
let instance = null;

/**
 * Get singleton instance of LocalFileManager
 * @returns {LocalFileManager}
 */
export function getLocalFileManager() {
    if (!instance) {
        instance = new LocalFileManager();
    }
    return instance;
}