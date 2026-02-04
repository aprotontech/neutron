
import TransferClient from './transfer.js';
import { FileTypeDetector } from './helpers.js';

// Minimal FileAPI that tries HTTP endpoint then falls back to mock data
export default class FileAPI {


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
     * Get file thumbnail
     * @param {string} filePath - Full file path
     * @param {number} maxSize - Max thumbnail size
     * @returns {Promise<Blob>} - Thumbnail image
     */
    async getFileThumbnail(filePath, maxSize = 200) {
        return TransferClient.get().getFileThumbnail(filePath, maxSize);
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
}
