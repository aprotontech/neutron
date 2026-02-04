
import TransferClient from './transfer.js';
import { FileTypeDetector } from './helpers.js';
import CacheManager from './cache-manager.js';

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
     * @returns {Promise<Blob>} - File content
     */
    async getFileContent(filePath, stream) {
        return TransferClient.get().getFileContent(filePath, stream);
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

    async downloadFile(filePath) {

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
