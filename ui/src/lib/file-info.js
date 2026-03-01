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
