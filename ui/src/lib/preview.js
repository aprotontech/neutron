/**
 * 预览数据管理器
 * 用于管理预览窗口所需的文件数据
 */

import platform from 'platform';
import { Hash } from './helpers.js'

export class PreviewDataManager {
    constructor() {
        // 使用Map存储文件数据，key为offset，value为文件信息
        this.fileDataMap = new Map()
        // 存储文件总数
        this.totalCount = 0
        // 存储文件API实例
        this.fileAPI = null
        // 存储数据加载回调函数
        this.dataLoader = null
        this.heicCacheKey = 'preview_heic_conversions'
    }

    /**
     * 初始化管理器
     * @param {Object} fileAPI - 文件API实例
     * @param {Function} dataLoader - 数据加载回调函数 (offset, count) => Promise<Array>
     * @param {number} totalCount - 文件总数
     */
    init(fileAPI, dataLoader, totalCount = 0) {
        this.fileAPI = fileAPI
        this.dataLoader = dataLoader
        this.totalCount = totalCount
        this.fileDataMap.clear()
    }

    /**
     * 设置文件总数
     * @param {number} totalCount - 文件总数
     */
    setTotalCount(totalCount) {
        this.totalCount = totalCount
    }

    /**
     * 获取文件总数
     * @returns {number} 文件总数
     */
    getTotalCount() {
        return this.totalCount
    }

    /**
     * 获取指定offset的文件数据
     * @param {number} offset - 文件偏移量
     * @returns {Object|null} 文件数据，如果不存在则返回null
     */
    getFileData(offset) {
        return this.fileDataMap.get(offset) || null
    }

    /**
     * 设置指定offset的文件数据
     * @param {number} offset - 文件偏移量
     * @param {Object} data - 文件数据
     */
    setFileData(offset, data) {
        this.fileDataMap.set(offset, data)
    }

    /**
     * 批量设置文件数据
     * @param {number} startOffset - 起始偏移量
     * @param {Array} dataArray - 文件数据数组
     */
    setFileDataBatch(startOffset, dataArray) {
        dataArray.forEach((data, index) => {
            const offset = startOffset + index
            this.fileDataMap.set(offset, data)
        })
    }

    /**
     * 删除指定offset的文件数据
     * @param {number} offset - 文件偏移量
     */
    deleteFileData(offset) {
        this.fileDataMap.delete(offset)
    }

    /**
     * 清空所有文件数据
     */
    clear() {
        this.fileDataMap.clear()
    }

    /**
     * 获取指定范围内的文件数据
     * 如果数据不存在，会调用dataLoader加载数据
     * @param {number} centerOffset - 中心偏移量
     * @param {number} range - 前后范围
     * @returns {Promise<Array>} 文件数据数组
     */
    async getFileDataRange(centerOffset, range = 5) {
        const startOffset = Math.max(0, centerOffset - range)
        const endOffset = Math.min(this.totalCount - 1, centerOffset + range)

        // 检查哪些数据已经存在
        const missingOffsets = []
        const result = []

        for (let offset = startOffset; offset <= endOffset; offset++) {
            const data = this.fileDataMap.get(offset)
            if (data) {
                result.push({ offset, data })
            } else {
                missingOffsets.push(offset)
            }
        }

        // 如果有缺失的数据，调用dataLoader加载
        if (missingOffsets.length > 0 && this.dataLoader) {
            try {
                // 将缺失的offset分组加载（避免一次性加载太多）
                const chunkSize = 10
                for (let i = 0; i < missingOffsets.length; i += chunkSize) {
                    const chunk = missingOffsets.slice(i, i + chunkSize)
                    const loadedData = await this.dataLoader(chunk[0], chunk.length)

                    // 将加载的数据存储到map中
                    loadedData.forEach((data, index) => {
                        const offset = chunk[0] + index
                        this.fileDataMap.set(offset, data)

                        // 添加到结果中
                        const existingIndex = result.findIndex(item => item.offset === offset)
                        if (existingIndex === -1) {
                            result.push({ offset, data })
                        }
                    })
                }
            } catch (error) {
                console.error('Failed to load preview data:', error)
            }
        }

        // 按offset排序
        result.sort((a, b) => a.offset - b.offset)

        return result.map(item => item.data)
    }

    /**
     * 获取指定文件附近的文件数据
     * @param {number} currentOffset - 当前文件偏移量
     * @param {number} count - 需要获取的文件数量
     * @returns {Promise<Array>} 文件数据数组
     */
    async getNearbyFiles(currentOffset, count = 10) {
        const halfCount = Math.floor(count / 2)
        const startOffset = Math.max(0, currentOffset - halfCount)
        const actualCount = Math.min(count, this.totalCount - startOffset)

        return this.getFileDataRange(currentOffset, halfCount)
    }

    /**
     * 预加载指定范围的文件数据
     * @param {number} startOffset - 起始偏移量
     * @param {number} count - 数量
     * @returns {Promise<void>}
     */
    async prefetchFileData(startOffset, count) {
        if (!this.dataLoader) return

        try {
            const data = await this.dataLoader(startOffset, count)
            this.setFileDataBatch(startOffset, data)
        } catch (error) {
            console.error('Failed to prefetch preview data:', error)
        }
    }

    /**
     * 获取文件的实际URL（支持进度回调）
     * @param {string} filePath - 文件路径
     * @param {Function} progressCallback - 进度回调函数
     * @returns {Promise<string>} 文件URL
     */
    async getFileUrl(filePath, progressCallback = null) {
        if (!this.fileAPI) {
            throw new Error('FileAPI not initialized')
        }

        const url = await this.fileAPI.getFileUrl(filePath, null, progressCallback)

        // 检查是否为HEIC文件，如果是则转换为JPG
        if (this.isHeicFile(filePath) && platform.os.family !== 'iOS') {
            try {
                console.log(`HEIC file detected: ${filePath}, converting to JPG...`)
                const jpgUrl = await this.convertHeicToJpg(filePath, url)
                return jpgUrl
            } catch (error) {
                console.warn(`Failed to convert HEIC to JPG for ${filePath}, falling back to original:`, error)
                // 转换失败，回退到原始文件
                return this.fileAPI.getFileUrl(filePath, null, progressCallback)
            }
        }

        return url
    }

    /**
     * 获取文件的缩略图URL
     * @param {string} filePath - 文件路径
     * @param {number} size - 缩略图大小
     * @returns {Promise<string>} 缩略图URL
     */
    async getThumbnailUrl(filePath, size = 200) {
        if (!this.fileAPI) {
            throw new Error('FileAPI not initialized')
        }

        return this.fileAPI.getFileThumbnailUrl(filePath, size)
    }

    /**
     * 获取文件信息
     * @param {string} filePath - 文件路径
     * @returns {Promise<Object>} 文件信息
     */
    async getFileInfo(filePath) {
        if (!this.fileAPI) {
            throw new Error('FileAPI not initialized')
        }

        return this.fileAPI.getFileInfo(filePath)
    }

    /**
     * 检查文件是否已缓存
     * @param {string} filePath - 文件路径
     * @returns {Promise<boolean>} 是否已缓存
     */
    async isFileCached(filePath) {
        if (!this.fileAPI) {
            throw new Error('FileAPI not initialized')
        }

        const cachedUrl = await this.fileAPI.getFileLocalCachedUrl(filePath)
        return !!cachedUrl
    }

    /**
     * 获取所有已存储的文件偏移量
     * @returns {Array<number>} 偏移量数组
     */
    getAllOffsets() {
        return Array.from(this.fileDataMap.keys()).sort((a, b) => a - b)
    }

    /**
     * 获取存储的文件数量
     * @returns {number} 文件数量
     */
    getStoredCount() {
        return this.fileDataMap.size
    }

    /**
     * 检查指定offset的文件数据是否存在
     * @param {number} offset - 文件偏移量
     * @returns {boolean} 是否存在
     */
    hasFileData(offset) {
        return this.fileDataMap.has(offset)
    }

    /**
     * 根据文件路径查找偏移量
     * @param {string} filePath - 文件路径
     * @returns {number|null} 偏移量，如果找不到则返回null
     */
    findOffsetByPath(filePath) {
        for (const [offset, data] of this.fileDataMap.entries()) {
            if (data && data.path === filePath) {
                return offset
            }
        }
        return null
    }

    /**
     * 检查文件是否为HEIC格式
     * @param {string} filePath - 文件路径
     * @returns {boolean} 是否为HEIC文件
     */
    isHeicFile(filePath) {
        if (!filePath) return false

        const lowerPath = filePath.toLowerCase()
        return lowerPath.endsWith('.heic') ||
            lowerPath.endsWith('.heif') ||
            lowerPath.includes('.heic?') ||
            lowerPath.includes('.heif?')
    }


    /**
     * 将HEIC文件转换为JPG格式
     * @param {string} filePath - HEIC文件路径
     * @returns {Promise<string>} 转换后的JPG文件URL
     */
    async convertHeicToJpg(filePath, localFileUrl) {
        const cacheKey = 'heic_' + Hash.md5sum({ 'path': filePath, 'type': 'heic' })
        // 首先检查缓存
        if (Capacitor.isNativePlatform()) {
            const localPathUrl = localStorage.getItem(cacheKey)
            if (localPathUrl) {
                return localPathUrl;
            }
        }

        try {
            // 2. 使用fetch获取HEIC文件数据
            const response = await fetch(localFileUrl)
            if (!response.ok) {
                throw new Error(`Failed to fetch HEIC file: ${response.status}`)
            }

            const heicBlob = await response.blob()

            // 3. 动态导入heic2any库
            const heic2any = (await import('heic2any')).default

            // 4. 转换为JPG格式
            const jpgBlob = await heic2any({
                blob: heicBlob,
                toType: 'image/jpeg',
                quality: 0.9 // 90%质量
            })

            // 5. 创建Object URL
            let jpgUrl = null;
            if (Capacitor.isNativePlatform()) {
                // In native environment, save to filesystem
                const cachePath = `caches/heic/${cacheKey}.jpg`

                // Ensure cacheType directory exists
                try {
                    await Filesystem.mkdir({
                        path: `caches/heic`,
                        directory: Directory.Data,
                        recursive: true
                    });
                } catch (err) {
                    // Directory might already exist
                }

                // Save cache data
                const base64Data = await Base64Encoder.encodeBlob(jpgBlob);
                await Filesystem.writeFile({
                    path: cachePath,
                    data: base64Data,
                    directory: Directory.Data,
                    encoding: Encoding.Base64,
                });

                const result = await Filesystem.stat({
                    path: cachePath,
                    directory: Directory.Data,
                });

                jpgUrl = Capacitor.convertFileSrc(result.url)

                // 6. 缓存结果
                localStorage.setItem(cacheKey, jpgUrl)
            } else {
                jpgUrl = URL.createObjectURL(jpgBlob)
            }

            console.log(`HEIC to JPG conversion successful: ${filePath}`)
            return jpgUrl

        } catch (error) {
            console.error(`Failed to convert HEIC to JPG: ${filePath}`, error)
            throw error
        }
    }
}

/**
 * 创建一个用于 Preview 组件的简易 map（key=offset, value=item）。
 * 不依赖 Vue，由调用方通过 mapVersion 等触发响应式更新。
 * @returns {{ get(totalCount: number, offset: number): object|null, set(offset: number, item: object): void, hasRange(start: number, count: number): boolean[], clear(): void }}
 */
export function createPreviewMap() {
    const fileDataMap = new Map()

    return {
        get(totalCount, offset) {
            if (offset < 0 || offset >= totalCount) return null
            return fileDataMap.get(offset) ?? null
        },
        set(offset, item) {
            fileDataMap.set(offset, item)
        },
        hasRange(start, count) {
            const result = []
            for (let i = 0; i < count; i++) {
                result.push(fileDataMap.has(start + i))
            }
            return result
        },
        clear() {
            fileDataMap.clear()
        }
    }
}


