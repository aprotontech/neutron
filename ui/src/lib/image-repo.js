/**
 * ImageRepo 类 - 用于管理远程获取的图片历史记录
 * 管理 historyItem 数组，支持添加和查询操作
 */

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
        /** @type {HistoryItem[]} */
        this.historyItems = [];
        
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

        // 添加到数组
        this.historyItems.push(...items);
        
        // 可选：去重（根据 id）
        this._deduplicateItems();
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
        if (this.historyItems.length === 0) {
            return [];
        }

        // 获取排序函数
        const sortFn = this.sortFunctions[order];
        if (!sortFn) {
            throw new Error(`不支持的排序方式: ${order}`);
        }

        // 创建副本并排序
        const sortedItems = [...this.historyItems].sort(sortFn);
        
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
        return this.historyItems.length;
    }

    /**
     * 清空所有历史记录
     * @returns {Promise<void>}
     */
    async clear() {
        this.historyItems = [];
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
     * 去重历史记录项（根据 id）
     * @private
     */
    _deduplicateItems() {
        const seen = new Set();
        this.historyItems = this.historyItems.filter(item => {
            if (seen.has(item.id)) {
                return false;
            }
            seen.add(item.id);
            return true;
        });
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

        this.historyItems.forEach(item => {
            if (stats[item.type] !== undefined) {
                stats[item.type]++;
            }
        });

        return stats;
    }

    /**
     * 获取最早和最晚的时间范围
     * @returns {Promise<Object>}
     */
    async getTimeRange() {
        if (this.historyItems.length === 0) {
            return { earliest: null, latest: null };
        }

        let earliestCtime = Infinity;
        let latestCtime = -Infinity;
        let earliestMtime = Infinity;
        let latestMtime = -Infinity;

        this.historyItems.forEach(item => {
            earliestCtime = Math.min(earliestCtime, item.ctime);
            latestCtime = Math.max(latestCtime, item.ctime);
            earliestMtime = Math.min(earliestMtime, item.mtime);
            latestMtime = Math.max(latestMtime, item.mtime);
        });

        return {
            ctime: { earliest: earliestCtime, latest: latestCtime },
            mtime: { earliest: earliestMtime, latest: latestMtime }
        };
    }
}

// 导出类和相关常量
export { ImageRepo, HistoryItemType, SortOrder };
export default ImageRepo;
