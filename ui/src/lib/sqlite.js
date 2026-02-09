/**
 * Unified SQLite Database Manager for Neutron
 * Manages all database operations including downloaded files and cache files
 */

import { Capacitor } from '@capacitor/core';
import { CapacitorSQLite, SQLiteConnection } from '@capacitor-community/sqlite';

export default class SQLiteManager {
    static instance = null;

    constructor() {
        this.dbName = 'neutron.db';
        this.db = null;
        this.initPromise = null;

        // Table names
        this.TABLES = {
            DOWNLOADED_FILES: 'downloaded_files',
            CACHE_FILES: 'cache_files'
        };
    }

    static getInstance() {
        if (!SQLiteManager.instance) {
            SQLiteManager.instance = new SQLiteManager();
        }
        return SQLiteManager.instance;
    }

    /**
     * Initialize SQLite database
     * @private
     */
    async _initDatabase() {
        if (this.initPromise) {
            return this.initPromise;
        }

        this.initPromise = (async () => {
            try {
                // Check if SQLite is available
                if (!Capacitor.isNativePlatform()) {
                    console.warn('[SQLiteManager] SQLite is only available in native mode');
                    return false;
                }

                // Create connection
                const sqlite = new SQLiteConnection(CapacitorSQLite);

                // Check if connection is available
                const ret = await sqlite.checkConnectionsConsistency();
                const isConn = (await sqlite.isConnection(this.dbName, false)).result;

                if (!isConn) {
                    // Create new connection
                    this.db = await sqlite.createConnection(
                        this.dbName,
                        false,
                        'no-encryption',
                        1,
                        false
                    );
                } else {
                    this.db = await sqlite.retrieveConnection(this.dbName, false);
                }

                // Open database
                await this.db.open();

                // Create downloaded_files table if not exists
                await this.db.execute(`
                    CREATE TABLE IF NOT EXISTS ${this.TABLES.DOWNLOADED_FILES} (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        file_path TEXT UNIQUE NOT NULL,
                        file_name TEXT NOT NULL,
                        local_path TEXT NOT NULL,
                        local_directory TEXT,
                        local_uri TEXT,
                        file_size INTEGER NOT NULL,
                        mime_type TEXT,
                        downloaded_at INTEGER NOT NULL,
                        last_accessed INTEGER NOT NULL,
                        is_valid INTEGER DEFAULT 1
                    )
                `);

                // Create cache_files table if not exists
                await this.db.execute(`
                    CREATE TABLE IF NOT EXISTS ${this.TABLES.CACHE_FILES} (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        cachekey TEXT NOT NULL,
                        filepath TEXT NOT NULL,
                        cachetype TEXT NOT NULL,
                        cachefile TEXT NOT NULL,
                        mimetype TEXT,
                        filesize INTEGER NOT NULL,
                        updated_at INTEGER NOT NULL,
                        UNIQUE(cachekey)
                    )
                `);

                // Create indexes for downloaded_files
                await this.db.execute(`CREATE INDEX IF NOT EXISTS idx_downloaded_file_path ON ${this.TABLES.DOWNLOADED_FILES}(file_path)`);
                await this.db.execute(`CREATE INDEX IF NOT EXISTS idx_downloaded_local_path ON ${this.TABLES.DOWNLOADED_FILES}(local_path)`);

                // Create indexes for cache_files
                await this.db.execute(`CREATE INDEX IF NOT EXISTS idx_cache_cachekey ON ${this.TABLES.CACHE_FILES}(cachekey)`);
                await this.db.execute(`CREATE INDEX IF NOT EXISTS idx_cache_filepath ON ${this.TABLES.CACHE_FILES}(filepath)`);
                await this.db.execute(`CREATE INDEX IF NOT EXISTS idx_cache_cachetype ON ${this.TABLES.CACHE_FILES}(cachetype)`);
                await this.db.execute(`CREATE INDEX IF NOT EXISTS idx_cache_updated ON ${this.TABLES.CACHE_FILES}(updated_at)`);

                console.log('[SQLiteManager] Database initialized successfully with all tables');
                return true;
            } catch (error) {
                console.error('[SQLiteManager] Failed to initialize database:', error);
                this.db = null;
                return false;
            }
        })();

        return this.initPromise;
    }

    /**
     * Ensure database is initialized
     * @private
     */
    async _ensureDatabase() {
        if (!this.db) {
            await this._initDatabase();
        }
        return this.db !== null;
    }

    /**
     * Get database connection
     * @returns {Promise<Object|null>} Database connection or null
     */
    async getDatabase() {
        const dbReady = await this._ensureDatabase();
        return dbReady ? this.db : null;
    }

    /**
     * Get table names
     * @returns {Object} Table names object
     */
    getTables() {
        return this.TABLES;
    }

    /**
     * Check if running in native mode
     * @returns {boolean} True if in native mode
     */
    isNativeMode() {
        return Capacitor.isNativePlatform();
    }

    /**
     * Execute SQL query
     * @param {string} sql - SQL query
     * @param {Array} values - Query parameters
     * @returns {Promise<Object>} Query result
     */
    async execute(sql, values = []) {
        try {
            const db = await this.getDatabase();
            if (!db) {
                throw new Error('Database not available');
            }
            return await db.execute(sql, values);
        } catch (error) {
            console.error('[SQLiteManager] Execute error:', error);
            throw error;
        }
    }

    /**
     * Query SQL
     * @param {string} sql - SQL query
     * @param {Array} values - Query parameters
     * @returns {Promise<Object>} Query result
     */
    async query(sql, values = []) {
        try {
            const db = await this.getDatabase();
            if (!db) {
                throw new Error('Database not available');
            }
            return await db.query(sql, values);
        } catch (error) {
            console.error('[SQLiteManager] Query error:', error);
            throw error;
        }
    }

    /**
     * Close database connection
     */
    async close() {
        try {
            if (this.db) {
                await this.db.close();
                this.db = null;
            }
            this.initPromise = null;
            console.log('[SQLiteManager] Database closed');
        } catch (error) {
            console.error('[SQLiteManager] Error closing database:', error);
        }
    }

    /**
     * Get total cache size from database
     * @returns {Promise<number>} Total cache size in bytes
     */
    async getTotalCacheSize() {
        try {
            const db = await this.getDatabase();
            if (!db) return 0;

            const result = await db.query(`SELECT SUM(filesize) as total_size FROM ${this.TABLES.CACHE_FILES}`);
            return result.values?.[0]?.total_size || 0;
        } catch (error) {
            console.error('[SQLiteManager] Error getting total cache size:', error);
            return 0;
        }
    }

    /**
     * Get total downloaded files size from database
     * @returns {Promise<number>} Total downloaded files size in bytes
     */
    async getTotalDownloadedSize() {
        try {
            const db = await this.getDatabase();
            if (!db) return 0;

            const result = await db.query(`SELECT SUM(file_size) as total_size FROM ${this.TABLES.DOWNLOADED_FILES} WHERE is_valid = 1`);
            return result.values?.[0]?.total_size || 0;
        } catch (error) {
            console.error('[SQLiteManager] Error getting total downloaded size:', error);
            return 0;
        }
    }
}

// Singleton instance getter
export function getSQLiteManager() {
    return SQLiteManager.getInstance();
}
