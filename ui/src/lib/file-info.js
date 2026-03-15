import SQLiteManager from './sqlite.js';

export default class CachedFileInformation {
    constructor() {
        this.sqlite = SQLiteManager.getInstance();
    }

    /**
     * Save file info into cached_file_infos table
     * @param {string} filePath
     * @param {Object} fileInfo
     */
    async saveFileInfo(filePath, fileInfo) {
        try {
            const db = await this.sqlite.getDatabase();
            if (!db) {
                return false;
            }

            const tables = this.sqlite.getTables();

            const is_dir = fileInfo.isDir ? 1 : 0;
            const size = typeof fileInfo.size === 'number' ? fileInfo.size : null;
            const mtime = fileInfo.mtime || null;
            const mime_type = fileInfo.mimeType || fileInfo.mime_type || null;
            // Server sends exifData; support both for compatibility
            const exifObj = fileInfo.exifData || fileInfo.exif;
            const exif = exifObj ? JSON.stringify(exifObj) : null;

            // Replace existing record for this file_path
            await db.run(`DELETE FROM ${tables.CACHED_FILE_INFOS} WHERE file_path = ?`, [filePath]);
            await db.run(
                `INSERT INTO ${tables.CACHED_FILE_INFOS} (file_path, is_dir, size, mtime, mime_type, exif) VALUES (?,?,?,?,?,?)`,
                [filePath, is_dir, size, mtime, mime_type, exif]
            );

            return true;
        } catch (error) {
            console.error('[CachedFileInformation] saveFileInfo error:', error);
            return false;
        }
    }

    /**
     * 批量保存文件信息到数据库
     * @param {Array<{filePath: string, fileInfo: Object}>} items - 文件信息数组
     * @returns {Promise<boolean>} - 是否成功
     */
    async batchSaveFileInfo(items) {
        if (!items || items.length === 0) {
            return true;
        }

        try {
            const db = await this.sqlite.getDatabase();
            if (!db) {
                return false;
            }

            const tables = this.sqlite.getTables();
            const BATCH_SIZE = 50; // 每批处理50条记录

            // 分批次处理
            for (let i = 0; i < items.length; i += BATCH_SIZE) {
                const batch = items.slice(i, i + BATCH_SIZE);
                await this._executeBatchSave(db, tables.CACHED_FILE_INFOS, batch);
            }

            console.log(`[CachedFileInformation] Batch saved ${items.length} file info records to database in ${Math.ceil(items.length / BATCH_SIZE)} batches`);
            return true;
        } catch (error) {
            console.error('[CachedFileInformation] batchSaveFileInfo error:', error);
            return false;
        }
    }

    /**
     * 执行单批保存操作
     * @private
     * @param {Object} db - 数据库连接
     * @param {string} tableName - 表名
     * @param {Array<{filePath: string, fileInfo: Object}>} batch - 单批数据
     * @returns {Promise<void>}
     */
    async _executeBatchSave(db, tableName, batch) {
        if (!batch || batch.length === 0) {
            return;
        }

        try {
            // 构建批量删除的 SQL 语句（使用 IN 子句）
            const deleteFilePaths = batch.map(item => item.filePath);
            const deletePlaceholders = deleteFilePaths.map(() => '?').join(',');
            const deleteSql = `DELETE FROM ${tableName} WHERE file_path IN (${deletePlaceholders})`;

            // 执行批量删除
            await db.run(deleteSql, deleteFilePaths);

            // 构建批量插入的 SQL 语句
            const insertPlaceholders = batch.map(() => '(?, ?, ?, ?, ?, ?)').join(', ');
            const insertSql = `INSERT INTO ${tableName} (file_path, is_dir, size, mtime, mime_type, exif) VALUES ${insertPlaceholders}`;

            // 构建参数数组
            const params = [];
            for (const item of batch) {
                const fileInfo = item.fileInfo;
                const is_dir = fileInfo.isDir ? 1 : 0;
                const size = typeof fileInfo.size === 'number' ? fileInfo.size : null;
                const mtime = fileInfo.mtime || null;
                const mime_type = fileInfo.mimeType || fileInfo.mime_type || null;
                const exifObj = fileInfo.exifData || fileInfo.exif;
                const exif = exifObj ? JSON.stringify(exifObj) : null;

                params.push(
                    item.filePath,
                    is_dir,
                    size,
                    mtime,
                    mime_type,
                    exif
                );
            }

            // 执行批量插入
            await db.run(insertSql, params);

            console.log(`[CachedFileInformation] Executed batch save for ${batch.length} records`);
        } catch (error) {
            console.error('[CachedFileInformation] _executeBatchSave error:', error);
            throw error;
        }
    }

    /**
     * Get cached file info from sqlite. Returns null when not found.
     * @param {string} filePath
     * @returns {Object|null}
     */
    async getFileInfo(filePath) {
        try {
            const db = await this.sqlite.getDatabase();
            if (!db) {
                return null;
            }

            const tables = this.sqlite.getTables();
            const result = await this.sqlite.query(`SELECT * FROM ${tables.CACHED_FILE_INFOS} WHERE file_path = ? LIMIT 1`, [filePath]);

            if (!result || !result.values || result.values.length === 0) {
                return null;
            }

            const row = result.values[0];

            let exif = null;
            try {
                exif = row.exif ? JSON.parse(row.exif) : null;
            } catch (e) {
                exif = null;
            }

            // Preview.vue expects exifData (same shape as server FileInformation)
            return {
                name: filePath.split('/').pop(),
                isDir: !!row.is_dir,
                size: row.size,
                mtime: row.mtime,
                mimeType: row.mime_type,
                exifData: exif,
                exif: exif
            };
        } catch (error) {
            console.error('[CachedFileInformation] getFileInfo error:', error);
            return null;
        }
    }
}
