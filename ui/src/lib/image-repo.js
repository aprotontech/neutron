/**
 * ImageRepo 类 - 用于管理远程获取的图片历史记录
 * 管理 historyItem 数组，支持添加和查询操作
 */

import { Capacitor } from '@capacitor/core';
import { getSQLiteManager } from './sqlite.js';

// 历史记录项类型常量
const HistoryItemType = {
    CREATE: 1,   // 创建
    DELETE: 2,   // 删除
    MODIFY: 3    // 修改
};

// 排序方式常量
const SortOrder = {
    CTIME: 'ctime',  // 按照图片拍摄时间排序
    MTIME: 'mtime'   // 按照文件修改时间排序
};

/**
 * 历史记录项类
 * @typedef {Object} HistoryItem
 * @property {string} id - 项目唯一标识
 * @property {string} path - 文件路径
 * @property {number} type - 操作类型 (1:创建, 2:删除, 3:修改)
 * @property {number} ctime - 图片拍摄时间 (Unix 时间戳，毫秒)
 * @property {number} mtime - 文件修改时间 (Unix 时间戳，毫秒)
 */

class ImageRepo {
    /**
     * 构造函数
     */
    constructor() {
        /** @type {Map<string, HistoryItem>} 以 path 为 key 的 Map，确保路径唯一性 */
        this.historyMap = new Map();
        /** @type {string|null} 当前最大的 ID */
        this.lastID = null;
        
        // 平台检测
        this.isNative = Capacitor.isNativePlatform();
        
        // SQLite 数据库管理器（仅在原生平台使用）
        this.sqliteManager = this.isNative ? getSQLiteManager() : null;
        this.CACHED_IMAGE_REPO_TABLE = 'cached_image_repo';
        
        // 缓存机制
        /** @type {HistoryItem[]|null} 缓存排序后的列表 */
        this._sortedCache = null;
        /** @type {string|null} 当前缓存的排序方式 */
        this._cachedOrder = null;
        
        // 初始化排序比较函数
        this.sortFunctions = {
            [SortOrder.CTIME]: (a, b) => b.ctime - a.ctime, // 降序：最新的在前
            [SortOrder.MTIME]: (a, b) => b.mtime - a.mtime  // 降序：最新的在前
        };
    }

    /**
     * 添加历史记录项到数组中
     * @param {HistoryItem[]} items - 要添加的历史记录项数组
     * @returns {Promise<void>}
     */
    async appendHistory(items) {
        if (!Array.isArray(items)) {
            throw new Error('items 必须是一个数组');
        }

        // 验证每个项目
        items.forEach((item, index) => {
            this._validateHistoryItem(item, index);
        });

        // 清除缓存，因为数据即将更新
        this._clearCache();

        // 处理每个项目
        for (const item of items) {
            // 更新 lastID
            if (this.lastID === null || this._compareIDs(item.id, this.lastID) > 0) {
                this.lastID = item.id;
            }

            // 处理 DELETE 类型
            if (item.type === HistoryItemType.DELETE) {
                // 使用 Map 的 delete 方法，O(1) 时间复杂度
                this.historyMap.delete(item.path);
                // 不添加 DELETE 记录到 historyMap
                continue;
            }

            // 对于非 DELETE 类型，直接设置到 Map 中
            // Map 会自动处理 key 的唯一性，相同 path 会覆盖旧值
            this.historyMap.set(item.path, item);
        }
        
        this._clearCache();
        
        // 同步更新到数据库
        await this._syncToDatabase(items);
    }

    /**
     * 获取历史记录列表
     * @param {string} order - 排序方式：'ctime' 或 'mtime'
     * @param {number} offset - 起始偏移量
     * @param {number} count - 返回数量
     * @returns {Promise<HistoryItem[]>}
     */
    async getList(order = SortOrder.CTIME, offset = 0, count = 20) {
        // 参数验证
        if (![SortOrder.CTIME, SortOrder.MTIME].includes(order)) {
            throw new Error(`order 参数必须是 '${SortOrder.CTIME}' 或 '${SortOrder.MTIME}'`);
        }

        if (typeof offset !== 'number' || offset < 0) {
            throw new Error('offset 必须是一个非负整数');
        }

        if (typeof count !== 'number' || count <= 0) {
            throw new Error('count 必须是一个正整数');
        }

        // 如果没有数据，返回空数组
        if (this.historyMap.size === 0) {
            return [];
        }

        // 检查缓存
        let sortedItems = this._sortedCache;
        
        // 如果缓存不存在或排序方式发生变化，重新生成缓存
        if (!sortedItems || this._cachedOrder !== order) {
            // 获取排序函数
            const sortFn = this.sortFunctions[order];
            if (!sortFn) {
                throw new Error(`不支持的排序方式: ${order}`);
            }

            // 从 Map 获取所有值并排序
            sortedItems = Array.from(this.historyMap.values()).sort(sortFn);
            
            // 更新缓存
            this._sortedCache = sortedItems;
            this._cachedOrder = order;
        }

        // 计算分页
        const startIndex = Math.min(offset, sortedItems.length);
        const endIndex = Math.min(startIndex + count, sortedItems.length);
        
        // 返回分页结果
        return sortedItems.slice(startIndex, endIndex);
    }

    /**
     * 获取历史记录总数
     * @returns {Promise<number>}
     */
    async getTotalCount() {
        return this.historyMap.size;
    }

    /**
     * 获取当前最大的 ID
     * @returns {Promise<string|null>}
     */
    async getLastID() {
        return this.lastID;
    }

    /**
     * 清空所有历史记录
     * @returns {Promise<void>}
     */
    async clear() {
        this.historyMap.clear();
        this.lastID = null;
        this._clearCache();
    }

    /**
     * 验证历史记录项
     * @private
     * @param {HistoryItem} item - 要验证的项目
     * @param {number} index - 项目在数组中的索引
     */
    _validateHistoryItem(item, index) {
        const requiredFields = ['id', 'path', 'type', 'ctime', 'mtime'];
        
        // 检查必需字段
        requiredFields.forEach(field => {
            if (item[field] === undefined || item[field] === null) {
                throw new Error(`第 ${index} 个项目缺少必需字段: ${field}`);
            }
        });

        // 验证类型
        if (![HistoryItemType.CREATE, HistoryItemType.DELETE, HistoryItemType.MODIFY].includes(item.type)) {
            throw new Error(`第 ${index} 个项目的 type 字段无效: ${item.type}。必须是 1, 2, 或 3`);
        }

        // 验证时间戳
        if (typeof item.ctime !== 'number' || item.ctime < 0) {
            throw new Error(`第 ${index} 个项目的 ctime 必须是有效的 Unix 时间戳（毫秒）`);
        }

        if (typeof item.mtime !== 'number' || item.mtime < 0) {
            throw new Error(`第 ${index} 个项目的 mtime 必须是有效的 Unix 时间戳（毫秒）`);
        }

        // 验证路径
        if (typeof item.path !== 'string' || item.path.trim() === '') {
            throw new Error(`第 ${index} 个项目的 path 必须是有效的非空字符串`);
        }

        // 验证 ID
        if (typeof item.id !== 'string' || item.id.trim() === '') {
            throw new Error(`第 ${index} 个项目的 id 必须是有效的非空字符串`);
        }
    }

    /**
     * 清除缓存
     * @private
     */
    _clearCache() {
        this._sortedCache = null;
        this._cachedOrder = null;
    }

    /**
     * 比较两个 ID 字符串
     * @private
     * @param {string} id1 - 第一个 ID
     * @param {string} id2 - 第二个 ID
     * @returns {number} 比较结果：1 表示 id1 > id2，-1 表示 id1 < id2，0 表示相等
     */
    _compareIDs(id1, id2) {
        // 尝试将 ID 解析为数字进行比较
        const num1 = Number(id1);
        const num2 = Number(id2);
        
        if (!isNaN(num1) && !isNaN(num2)) {
            // 如果都是有效数字，按数字比较
            if (num1 > num2) return 1;
            if (num1 < num2) return -1;
            return 0;
        }
        
        // 否则按字符串比较
        if (id1 > id2) return 1;
        if (id1 < id2) return -1;
        return 0;
    }

    /**
     * 获取按类型统计的数量
     * @returns {Promise<Object>}
     */
    async getStatsByType() {
        const stats = {
            [HistoryItemType.CREATE]: 0,
            [HistoryItemType.DELETE]: 0,
            [HistoryItemType.MODIFY]: 0
        };

        // 遍历 Map 的值
        for (const item of this.historyMap.values()) {
            if (stats[item.type] !== undefined) {
                stats[item.type]++;
            }
        }

        return stats;
    }

    /**
     * 获取最早和最晚的时间范围
     * @returns {Promise<Object>}
     */
    async getTimeRange() {
        if (this.historyMap.size === 0) {
            return { earliest: null, latest: null };
        }

        let earliestCtime = Infinity;
        let latestCtime = -Infinity;
        let earliestMtime = Infinity;
        let latestMtime = -Infinity;

        // 遍历 Map 的值
        for (const item of this.historyMap.values()) {
            earliestCtime = Math.min(earliestCtime, item.ctime);
            latestCtime = Math.max(latestCtime, item.ctime);
            earliestMtime = Math.min(earliestMtime, item.mtime);
            latestMtime = Math.max(latestMtime, item.mtime);
        }

        return {
            ctime: { earliest: earliestCtime, latest: latestCtime },
            mtime: { earliest: earliestMtime, latest: latestMtime }
        };
    }

    /**
     * 同步数据到数据库
     * @private
     * @param {HistoryItem[]} items - 要同步的项目数组
     * @returns {Promise<void>}
     */
    async _syncToDatabase(items) {
        // 仅在原生平台执行数据库同步
        if (!this.isNative) {
            console.log('[ImageRepo] 非原生平台，跳过数据库同步');
            return;
        }
        
        try {
            const db = await this.sqliteManager.getDatabase();
            if (!db) {
                console.warn('[ImageRepo] SQLite database not available, skipping sync');
                return;
            }

            // 批量处理数据库操作
            for (const item of items) {
                if (item.type === HistoryItemType.DELETE) {
                    // 删除操作：从数据库删除对应的记录
                    await db.execute(
                        `DELETE FROM ${this.CACHED_IMAGE_REPO_TABLE} WHERE file_path = ?`,
                        [item.path]
                    );
                } else {
                    // 创建或修改操作：插入或更新记录
                    // 使用 INSERT OR REPLACE 来确保唯一性
                    await db.execute(
                        `INSERT OR REPLACE INTO ${this.CACHED_IMAGE_REPO_TABLE} 
                         (file_path, ftime, ctime, size) 
                         VALUES (?, ?, ?, ?)`,
                        [item.path, item.mtime, item.ctime, 0] // size 暂时设为0，后续可以根据需要调整
                    );
                }
            }
            
            console.log(`[ImageRepo] Successfully synced ${items.length} items to database`);
        } catch (error) {
            console.error('[ImageRepo] Error syncing to database:', error);
            // 不抛出错误，避免影响主流程
        }
    }

    /**
     * 从数据库初始化历史记录
     * @returns {Promise<void>}
     */
    async init() {
        // 仅在原生平台执行数据库初始化
        if (!this.isNative) {
            console.log('[ImageRepo] 非原生平台，跳过数据库初始化');
            return;
        }
        
        try {
            const db = await this.sqliteManager.getDatabase();
            if (!db) {
                console.warn('[ImageRepo] SQLite database not available, skipping initialization');
                return;
            }

            // 清空当前内存中的数据
            this.historyMap.clear();
            this.lastID = null;
            this._clearCache();

            // 从数据库读取所有记录
            const result = await db.query(
                `SELECT * FROM ${this.CACHED_IMAGE_REPO_TABLE} ORDER BY ctime DESC`
            );

            if (result.values && result.values.length > 0) {
                // 将数据库记录转换为 HistoryItem 格式
                const items = result.values.map(row => ({
                    id: String(row.id), // 使用数据库的id作为历史记录id
                    path: row.file_path,
                    type: HistoryItemType.CREATE, // 数据库中的记录都视为创建类型
                    ctime: row.ctime || 0,
                    mtime: row.ftime || 0
                }));

                // 添加到内存中
                for (const item of items) {
                    this.historyMap.set(item.path, item);
                    
                    // 更新 lastID
                    if (this.lastID === null || this._compareIDs(item.id, this.lastID) > 0) {
                        this.lastID = item.id;
                    }
                }

                console.log(`[ImageRepo] Initialized ${items.length} items from database`);
            } else {
                console.log('[ImageRepo] No data found in database');
            }
        } catch (error) {
            console.error('[ImageRepo] Error initializing from database:', error);
            throw error;
        }
    }

    /**
     * 清空数据库中的缓存数据
     * @returns {Promise<void>}
     */
    async clearDatabase() {
        // 仅在原生平台执行数据库清理
        if (!this.isNative) {
            console.log('[ImageRepo] 非原生平台，跳过数据库清理');
            return;
        }
        
        try {
            const db = await this.sqliteManager.getDatabase();
            if (!db) {
                console.warn('[ImageRepo] SQLite database not available');
                return;
            }

            await db.execute(`DELETE FROM ${this.CACHED_IMAGE_REPO_TABLE}`);
            console.log('[ImageRepo] Cleared database cache');
        } catch (error) {
            console.error('[ImageRepo] Error clearing database:', error);
            throw error;
        }
    }
}

// 导出类和相关常量
export { ImageRepo, HistoryItemType, SortOrder };
export default ImageRepo;
