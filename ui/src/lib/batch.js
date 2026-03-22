


import { Hash } from './helpers.js';

export default class BatchFileApi {
    constructor(fileAPI) {
        this.fileAPI = fileAPI
    }


    async getFilesUrl(filePathList, asyncFetchRemote = false) {
        // 结果数组，与输入顺序一致
        const results = new Array(filePathList.length);

        // 第一步：分离 raw 类型和其他类型的文件
        const rawFilePaths = [];
        const rawFileIndices = [];
        const thumbnailCacheKeys = [];
        const thumbnailKeyToResultIndex = new Map(); // 缓存键 -> {resultIndex, type}

        for (let i = 0; i < filePathList.length; i++) {
            const item = filePathList[i];
            // 假设每个元素是对象，包含 filePath, locals, remote
            // 为了兼容性，如果 item 是字符串，则当作 filePath
            let filePath, locals, remote;

            if (typeof item === 'string') {
                filePath = item;
                locals = ['raw', '400', '200'];
                remote = '200';
            } else {
                filePath = item.filePath || item.path || item;
                locals = item.locals || ['raw', '400', '200'];
                remote = item.remote || '200';
            }

            // 检查是否有 raw 类型
            const hasRawType = locals.includes('raw');
            if (hasRawType) {
                rawFilePaths.push(filePath);
                rawFileIndices.push(i);
            }

            // 为每个非 raw 的本地缓存类型生成缓存键
            for (const cacheType of locals) {
                if (cacheType !== 'raw') {
                    const cacheKey = this._generateCacheKey(filePath, cacheType);
                    thumbnailCacheKeys.push(cacheKey);
                    thumbnailKeyToResultIndex.set(cacheKey, {
                        resultIndex: i,
                        type: cacheType,
                        filePath: filePath,
                        remoteType: remote
                    });
                }
            }

            // 初始化结果对象
            results[i] = {
                filePath: filePath,
                url: null,
                cacheType: null,
                fromCache: false,
                error: null,
                fetchPromise: null // 异步获取的Promise，当asyncFetchRemote为true且需要远程获取时使用
            };
        }

        // 第二步：批量查询 raw 文件（从 LocalFileManager）
        let rawFileResults = new Map();
        if (rawFilePaths.length > 0 && this.fileAPI.localFileManager) {
            console.log(`BatchFileApi: Batch querying ${rawFilePaths.length} raw files from LocalFileManager`);
            rawFileResults = await this.fileAPI.localFileManager.batchGetLocalFiles(rawFilePaths);

            // 处理 raw 文件结果
            for (let j = 0; j < rawFileIndices.length; j++) {
                const resultIndex = rawFileIndices[j];
                const filePath = rawFilePaths[j];
                const rawResult = rawFileResults.get(filePath);

                if (rawResult && rawResult.localUrl) {
                    results[resultIndex].url = rawResult.localUrl;
                    results[resultIndex].cacheType = 'raw';
                    results[resultIndex].fromCache = true;
                    console.log(`BatchFileApi: Found raw file in LocalFileManager for ${filePath}`);
                }
            }
        }

        // 第三步：批量查询缩略图缓存（从 ThumbnailManager
        const thumbnailCacheResults = await this.batchQueryCache(thumbnailCacheKeys);

        // 第四步：处理缩略图缓存结果，按照 locals 顺序选择第一个可用的缓存
        const needRemoteFiles = [];
        const remoteFileIndices = [];

        for (let i = 0; i < filePathList.length; i++) {
            const item = filePathList[i];
            // 假设每个元素是对象，包含 filePath, locals, remote
            // 为了兼容性，如果 item 是字符串，则当作 filePath
            let filePath, locals, remote;

            if (typeof item === 'string') {
                filePath = item;
                locals = ['raw', '400', '200'];
                remote = '400';
            } else {
                filePath = item.filePath || item.path || item;
                locals = item.locals || ['raw', '400', '200'];
                remote = item.remote || '400';
            }

            // 如果已经找到 raw 文件，跳过
            if (results[i].url && results[i].cacheType === 'raw') {
                continue;
            }

            let foundCache = false;

            // 按照 locals 顺序查找缓存（跳过 raw，因为已经处理过了）
            for (const cacheType of locals) {
                if (cacheType === 'raw') continue; // 跳过 raw，已经处理

                const cacheKey = this._generateCacheKey(filePath, cacheType);
                const cacheResult = thumbnailCacheResults.get(cacheKey);

                if (cacheResult && cacheResult.uri) {
                    // 找到缓存
                    results[i].url = cacheResult.uri;
                    results[i].cacheType = cacheType;
                    results[i].fromCache = true;
                    foundCache = true;
                    console.log(`BatchFileApi: Found cache for ${filePath}, type: ${cacheType}`);
                    break;
                }
            }

            // 如果没有找到缓存，添加到远程获取列表
            if (!foundCache) {
                needRemoteFiles.push({
                    filePath: filePath,
                    remoteType: remote
                });
                remoteFileIndices.push(i);
            }
        }

        // 第四步：批量远程获取未找到缓存的文件
        if (needRemoteFiles.length > 0) {
            console.log(`BatchFileApi: Need to fetch ${needRemoteFiles.length} files remotely, asyncFetchRemote: ${asyncFetchRemote}`);

            if (asyncFetchRemote) {
                // 异步模式：为每个需要远程获取的文件创建Promise
                for (let j = 0; j < needRemoteFiles.length; j++) {
                    const resultIndex = remoteFileIndices[j];
                    const fileInfo = needRemoteFiles[j];

                    // 创建异步获取的Promise
                    results[resultIndex].fetchPromise = this._fetchSingleRemote(fileInfo);
                    // url保持为null，等待用户调用fetchPromise
                    console.log(`BatchFileApi: Created async fetch promise for ${fileInfo.filePath}`);
                }
            } else {
                // 同步模式：等待所有远程获取完成
                const remoteResults = await this._batchFetchRemote(needRemoteFiles);

                // 处理远程获取结果
                for (let j = 0; j < remoteResults.length; j++) {
                    const resultIndex = remoteFileIndices[j];
                    const remoteResult = remoteResults[j];

                    if (remoteResult.url) {
                        results[resultIndex].url = remoteResult.url;
                        results[resultIndex].cacheType = remoteResult.cacheType;
                        results[resultIndex].fromCache = false;
                        //console.log(`BatchFileApi: Fetched remotely for ${needRemoteFiles[j].filePath}, type: ${remoteResult.cacheType}`);
                    } else {
                        results[resultIndex].error = remoteResult.error || 'Failed to fetch file';
                        console.error(`BatchFileApi: Failed to fetch ${needRemoteFiles[j].filePath}: ${results[resultIndex].error}`);
                    }
                }
            }
        }

        return results;
    }

    /**
     * 生成缓存键
     * @private
     */
    _generateCacheKey(filePath, cacheType) {
        if (cacheType === 'raw') {
            // 原始文件的缓存键
            return Hash.md5sum('file-content', filePath);
        } else {
            // 缩略图的缓存键，cacheType 应该是数字字符串如 '200', '400'
            const size = parseInt(cacheType, 10);
            if (isNaN(size)) {
                // 如果不是数字，使用原始缓存键
                return Hash.md5sum(filePath, 'thumbnail', cacheType);
            }
            return Hash.md5sum(filePath, 'thumbnail', size);
        }
    }

    /**
     * 批量查询缓存
     * @private
     */
    async batchQueryCache(cacheKeys) {
        const resultMap = new Map();

        // 如果没有缓存管理器，直接返回空结果
        if (!this.fileAPI.cacheManager) {
            console.log('BatchFileApi: No cache manager available, skipping cache query');
            return resultMap;
        }

        try {
            // 使用批量查询方法
            const cacheRecords = await this.fileAPI.cacheManager._batchGetCacheRecords(cacheKeys);

            // 将缓存记录转换为结果格式
            for (const [cacheKey, record] of cacheRecords) {
                if (record && record.uri) {
                    resultMap.set(cacheKey, {
                        uri: record.uri,
                        cacheKey: cacheKey,
                        record: record
                    });
                }
            }

            console.log(`BatchFileApi: Batch cache query completed, found ${resultMap.size} cached items`);
            return resultMap;
        } catch (error) {
            console.error('BatchFileApi: Error in batch cache query:', error);
            return resultMap;
        }
    }

    /**
     * 单个远程获取文件（用于异步模式）
     * @private
     */
    async _fetchSingleRemote(fileInfo) {
        try {
            const { filePath, remoteType } = fileInfo;

            if (remoteType === 'raw') {
                // 获取原始文件
                const url = await this.fileAPI.getFileUrl(filePath);
                return {
                    url: url,
                    cacheType: 'raw',
                    error: null
                };
            } else {
                // 获取缩略图
                const size = parseInt(remoteType, 10);
                if (isNaN(size)) {
                    throw new Error(`Invalid remote type: ${remoteType}`);
                }

                const thumbnailUrl = await this.fileAPI.getFileThumbnailUrl(filePath, size);
                return {
                    url: thumbnailUrl,
                    cacheType: remoteType,
                    error: null
                };
            }
        } catch (error) {
            console.error(`BatchFileApi: Error fetching remote file ${fileInfo.filePath}:`, error);
            return {
                url: null,
                cacheType: null,
                error: error.message
            };
        }
    }

    /**
     * 批量远程获取文件
     * @private
     */
    async _batchFetchRemote(files) {
        // 并行获取所有文件，复用 _fetchSingleRemote 函数
        const promises = files.map(file => this._fetchSingleRemote(file));

        // 等待所有请求完成
        return await Promise.all(promises);
    }

}