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

const RepoFileType = {
    IMAGE: 1,
    VIDEO: 2,
    LIVE: 3
};

// 排序方式常量
const SortOrder = {
    ETIME: 'etime',  // 按照图片拍摄时间排序
    MTIME: 'mtime'   // 按照文件修改时间排序
};

/**
 * 历史记录项类
 * @typedef {Object} HistoryItem
 * @property {string} id - 项目唯一标识
 * @property {string} path - 文件路径
 * @property {number} history_type - 操作类型 (1:创建, 2:删除, 3:修改)
 * @property {number} file_type - 文件类型 (1:图片, 2:视频, 3:LIVE)
 * @property {number} etime - 图片拍摄时间 (Unix 时间戳，毫秒)
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

        this.remoteTotalCount = 0;
        this.localStorageRemoteTotalCountKey = 'image_repo_remote_total_count';

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

        // 最后更新时间戳（毫秒级）
        /** @type {number|null} 最后更新时间戳 */
        this.lastUpdateTimestamp = 0;

        // 初始化排序比较函数
        this.sortFunctions = {
            [SortOrder.ETIME]: (a, b) => b.etime - a.etime, // 按拍摄时间倒序（最新的在前）
            [SortOrder.MTIME]: (a, b) => a.id - b.id
        };
    }

    /**
     * 添加历史记录项到数组中
     * @param {HistoryItem[]|neutron.ImageRepoHistoryItem[]} items - 要添加的历史记录项数组（可以是普通对象或protobuf对象）
     * @returns {Promise<void>}
     */
    async updateHistory(remoteTotalCount, items) {
        if (!Array.isArray(items)) {
            throw new Error('items 必须是一个数组');
        }

        // 清除缓存，因为数据即将更新
        this._clearCache();
        this.remoteTotalCount = remoteTotalCount;

        // 处理每个项目
        for (const item of items) {
            // 处理protobuf对象：转换为普通对象
            const normalizedItem = this._normalizeHistoryItem(item);

            // 验证项目
            this._validateHistoryItem(normalizedItem, items.indexOf(item));

            // 更新 lastID
            if (this.lastID === null || this._compareIDs(normalizedItem.id, this.lastID) > 0) {
                this.lastID = normalizedItem.id;
            }

            // 处理 DELETE 类型
            if (normalizedItem.history_type === HistoryItemType.DELETE) {
                // 使用 Map 的 delete 方法，O(1) 时间复杂度
                this.historyMap.delete(normalizedItem.file_path);
                // 不添加 DELETE 记录到 historyMap
                continue;
            }

            // 对于非 DELETE 类型，直接设置到 Map 中
            // Map 会自动处理 key 的唯一性，相同 path 会覆盖旧值
            this.historyMap.set(normalizedItem.file_path, normalizedItem);
        }

        this._clearCache();

        // 同步更新到数据库
        await this._syncToDatabase(items.map(item => this._normalizeHistoryItem(item)));
        localStorage.setItem(this.localStorageRemoteTotalCountKey, this.remoteTotalCount.toString());

        // 更新最后更新时间戳
        this.lastUpdateTimestamp = Date.now();
    }

    /**
     * 获取历史记录列表
     * @param {string} order - 排序方式：'etime' 或 'mtime'
     * @param {number} offset - 起始偏移量
     * @param {number} count - 返回数量
     * @returns {Promise<HistoryItem[]>}
     */
    async getList(order = SortOrder.ETIME, offset = 0, count = 20) {
        // 参数验证
        if (![SortOrder.ETIME, SortOrder.MTIME].includes(order)) {
            throw new Error(`order 参数必须是 '${SortOrder.ETIME}' 或 '${SortOrder.MTIME}'`);
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

    async getImageGroup(type = 'year', order = 'mtime') {
        // 如果没有数据，返回空数组
        if (this.historyMap.size === 0) {
            return [];
        }

        // 获取排序函数
        const sortFn = this.sortFunctions[order];
        if (!sortFn) {
            throw new Error(`不支持的排序方式: ${order}`);
        }

        // 从 Map 获取所有值并排序
        const sortedItems = Array.from(this.historyMap.values()).sort(sortFn);

        // 根据类型进行分组
        const groups = new Map();

        sortedItems.forEach((item, index) => {
            // 使用拍摄时间（etime）进行分组，如果没有则使用修改时间（mtime）
            const timestamp = item.etime || item.mtime;
            if (!timestamp) return;

            const date = new Date(timestamp * 1000);

            let groupKey;
            if (type === 'year') {
                // 按年分组：YYYY
                groupKey = date.getFullYear().toString();
            } else if (type === 'month') {
                // 按月分组：YYYY-MM
                const year = date.getFullYear();
                const month = (date.getMonth() + 1).toString().padStart(2, '0');
                groupKey = `${year}-${month}`;
            } else {
                throw new Error(`不支持的group类型: ${type}。必须是 'year' 或 'month'`);
            }

            // 如果该分组还不存在，创建分组
            if (!groups.has(groupKey)) {
                groups.set(groupKey, {
                    time: groupKey,
                    file_path: item.file_path, // 使用该分组的第一张图片作为封面
                    offset: index, // 记录该分组第一张图片在全局列表中的位置
                    count: 1,
                });
            } else {
                groups.get(groupKey).count += 1
            }
        });

        // 将Map转换为数组并返回
        return Array.from(groups.values());
    }

    getLocalTotalCount() {
        return this.historyMap.size;
    }

    getRemoteTotalCount() {
        return this.remoteTotalCount;
    }

    getLastID() {
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

        // 同步清空数据库
        await this.clearDatabase();
    }

    /**
     * 验证历史记录项
     * @private
     * @param {HistoryItem} item - 要验证的项目
     * @param {number} index - 项目在数组中的索引
     */
    _validateHistoryItem(item, index) {
        const requiredFields = ['id', 'file_path', 'history_type', 'etime', 'mtime'];

        // 检查必需字段
        requiredFields.forEach(field => {
            if (item[field] === undefined || item[field] === null) {
                throw new Error(`第 ${index} 个项目缺少必需字段: ${field}`);
            }
        });

        // 验证类型
        if (![HistoryItemType.CREATE, HistoryItemType.DELETE, HistoryItemType.MODIFY].includes(item.history_type)) {
            throw new Error(`第 ${index} 个项目的 history_type 字段无效: ${item.history_type}。必须是 1, 2, 或 3`);
        }

        // 验证时间戳
        if (typeof item.etime !== 'number' || item.etime < 0) {
            throw new Error(`第 ${index} 个项目的 etime 必须是有效的 Unix 时间戳（毫秒）`);
        }

        if (typeof item.mtime !== 'number' || item.mtime < 0) {
            throw new Error(`第 ${index} 个项目的 mtime 必须是有效的 Unix 时间戳（毫秒）`);
        }

        // 验证路径
        if (typeof item.file_path !== 'string' || item.file_path.trim() === '') {
            throw new Error(`第 ${index} 个项目的 file_path 必须是有效的非空字符串`);
        }

        // 验证 ID
        if (typeof item.id !== 'number' || item.id < 0) {
            throw new Error(`第 ${index} 个项目的 id 必须是有效的正整数`);
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
        if (id1 > id2) return 1;
        if (id1 < id2) return -1;
        return 0;
    }

    /**
     * 标准化历史记录项，处理protobuf对象和普通对象的兼容性
     * @private
     * @param {Object|neutron.ImageRepoHistoryItem} item - 原始项目
     * @returns {HistoryItem} 标准化后的项目
     */
    _normalizeHistoryItem(item) {
        // 如果是protobuf对象，转换为普通对象
        if (item && typeof item === 'object' && item.constructor && item.constructor.name === 'ImageRepoHistoryItem') {
            return {
                id: item.id,
                // 优先使用file_path，如果没有则使用path
                file_path: item.file_path || item.path || '',
                history_type: item.historyType || HistoryItemType.CREATE,
                file_type: item.fileType || RepoFileType.IMAGE,
                size: item.size || 0,
                etime: item.etime || 0,
                mtime: item.mtime || 0
            };
        }

        // 如果是普通对象，确保有必要的字段
        return {
            id: item.id,
            file_path: item.file_path || item.path || '',
            history_type: item.historyType || HistoryItemType.CREATE,
            file_type: item.fileType || RepoFileType.IMAGE,
            size: item.size || 0,
            etime: item.etime || 0,
            mtime: item.mtime || 0
        };
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
            if (stats[item.history_type] !== undefined) {
                stats[item.history_type]++;
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

        let earliestEtime = Infinity;
        let latestEtime = -Infinity;
        let earliestMtime = Infinity;
        let latestMtime = -Infinity;

        // 遍历 Map 的值
        for (const item of this.historyMap.values()) {
            earliestEtime = Math.min(earliestEtime, item.etime);
            latestEtime = Math.max(latestEtime, item.etime);
            earliestMtime = Math.min(earliestMtime, item.mtime);
            latestMtime = Math.max(latestMtime, item.mtime);
        }

        return {
            etime: { earliest: earliestEtime, latest: latestEtime },
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

            // 分离 DELETE 和 INSERT/UPDATE 操作
            const deleteItems = [];
            const upsertItems = [];

            for (const item of items) {
                if (item.history_type === HistoryItemType.DELETE) {
                    deleteItems.push(item.file_path);
                } else {
                    upsertItems.push(item);
                }
            }

            // 批量执行 DELETE 操作
            if (deleteItems.length > 0) {
                await this._batchDeleteFromDatabase(db, deleteItems);
            }

            // 批量执行 INSERT/UPDATE 操作
            if (upsertItems.length > 0) {
                await this._batchUpsertToDatabase(db, upsertItems);
            }

            console.log(`[ImageRepo] Successfully synced ${items.length} items to database (${deleteItems.length} deletes, ${upsertItems.length} upserts)`);
        } catch (error) {
            console.error('[ImageRepo] Error syncing to database:', error);
            // 不抛出错误，避免影响主流程
        }
    }

    /**
     * 批量删除数据库记录
     * @private
     * @param {Object} db - 数据库连接
     * @param {string[]} filePaths - 要删除的文件路径数组
     * @returns {Promise<void>}
     */
    async _batchDeleteFromDatabase(db, filePaths) {
        if (!filePaths || filePaths.length === 0) {
            return;
        }

        try {
            // 使用 IN 子句批量删除
            const placeholders = filePaths.map(() => '?').join(',');
            const sql = `DELETE FROM ${this.CACHED_IMAGE_REPO_TABLE} WHERE file_path IN (${placeholders})`;

            await db.run(sql, filePaths);
            console.log(`[ImageRepo] Batch deleted ${filePaths.length} records from database`);
        } catch (error) {
            console.error('[ImageRepo] Error batch deleting from database:', error);
            throw error;
        }
    }

    /**
     * 批量插入或更新数据库记录
     * @private
     * @param {Object} db - 数据库连接
     * @param {HistoryItem[]} items - 要插入或更新的项目数组
     * @returns {Promise<void>}
     */
    async _batchUpsertToDatabase(db, items) {
        if (!items || items.length === 0) {
            return;
        }

        try {
            // 为了性能，将批量操作分成较小的批次（避免 SQL 语句过长）
            const BATCH_SIZE = 50; // 每批处理50条记录

            for (let i = 0; i < items.length; i += BATCH_SIZE) {
                const batch = items.slice(i, i + BATCH_SIZE);
                await this._executeBatchUpsert(db, batch);
            }

            console.log(`[ImageRepo] Batch upserted ${items.length} records to database in ${Math.ceil(items.length / BATCH_SIZE)} batches`);
        } catch (error) {
            console.error('[ImageRepo] Error batch upserting to database:', error);
            throw error;
        }
    }

    /**
     * 执行单批插入或更新操作
     * @private
     * @param {Object} db - 数据库连接
     * @param {HistoryItem[]} batch - 单批项目数组
     * @returns {Promise<void>}
     */
    async _executeBatchUpsert(db, batch) {
        if (!batch || batch.length === 0) {
            return;
        }

        try {
            // 构建批量插入的 SQL 语句
            // SQLite 支持多值插入语法：VALUES (?,?,?), (?,?,?), ...
            const placeholders = batch.map(() => '(?, ?, ?, ?, ?, ?)').join(', ');
            const sql = `INSERT OR REPLACE INTO ${this.CACHED_IMAGE_REPO_TABLE} 
                         (id, file_path, file_type, mtime, etime, size) 
                         VALUES ${placeholders}`;

            // 构建参数数组
            const params = [];
            for (const item of batch) {
                params.push(
                    item.id,
                    item.file_path || item.path || '',
                    item.file_type || RepoFileType.IMAGE,
                    item.mtime || 0,
                    item.etime || 0,
                    0 // size 暂时设为0，后续可以根据需要调整
                );
            }

            await db.run(sql, params);
        } catch (error) {
            console.error('[ImageRepo] Error executing batch upsert:', error);
            throw error;
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
                `SELECT * FROM ${this.CACHED_IMAGE_REPO_TABLE} ORDER BY etime DESC`
            );

            if (result.values && result.values.length > 0) {
                // 将数据库记录转换为 HistoryItem 格式
                const items = result.values.map(row => ({
                    id: row.id, // 使用数据库的id作为历史记录id
                    file_path: row.file_path,
                    history_type: HistoryItemType.CREATE, // 数据库中的记录都视为创建类型
                    file_type: row.file_type,
                    etime: row.etime || 0,
                    mtime: row.mtime || 0
                }));

                // 添加到内存中
                for (const item of items) {
                    this.historyMap.set(item.file_path, item);

                    // 更新 lastID
                    if (this.lastID === null || this._compareIDs(item.id, this.lastID) > 0) {
                        this.lastID = item.id;
                    }
                }

                console.log(`[ImageRepo] Initialized ${items.length} items from database`);
            } else {
                console.log('[ImageRepo] No data found in database');
            }

            if (localStorage.getItem(this.localStorageRemoteTotalCountKey)) {
                this.remoteTotalCount = parseInt(localStorage.getItem(this.localStorageRemoteTotalCountKey))
                console.log('this.remoteTotalCount', this.remoteTotalCount)
            }

            return this.historyMap.size;
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

            await db.run(`DELETE FROM ${this.CACHED_IMAGE_REPO_TABLE}`);
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
