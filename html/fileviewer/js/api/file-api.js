/**
 * File API Abstract Layer
 * Supports multiple transport protocols (WebRTC, HTTP, etc.)
 */

class FileAPI {
    constructor(transport = 'webrtc') {
        this.transport = transport;
        this.baseURL = '';
        this.initTransport();
    }

    initTransport() {
        switch (this.transport) {
            case 'webrtc':
                this.client = new WebRTCClient();
                break;
            case 'http':
                this.client = new HttpClient();
                break;
            default:
                throw new Error(`Unsupported transport: ${this.transport}`);
        }
    }

    /**
     * List files in a directory
     * @param {string} path - Directory path
     * @returns {Promise<Array>} - Array of file objects
     */
    async listFiles(path = '/') {
        return this.client.listFiles(path);
    }

    /**
     * Get file content via streaming
     * @param {string} filePath - Full file path
     * @returns {Promise<Blob>} - File content
     */
    async getFileContent(filePath) {
        return this.client.getFileContent(filePath);
    }

    /**
     * Get file thumbnail
     * @param {string} filePath - Full file path
     * @param {number} maxSize - Max thumbnail size
     * @returns {Promise<Blob>} - Thumbnail image
     */
    async getFileThumbnail(filePath, maxSize = 200) {
        return this.client.getFileThumbnail(filePath, maxSize);
    }

    /**
     * Get file URL for direct access
     * @param {string} filePath - Full file path
     * @returns {string} - File URL
     */
    getFileUrl(filePath) {
        return this.client.getFileUrl(filePath);
    }

    /**
     * Get file info
     * @param {string} filePath - Full file path
     * @returns {Promise<Object>} - File info object
     */
    async getFileInfo(filePath) {
        return this.client.getFileInfo(filePath);
    }
}

class BaseClient {
    async listFiles(path) {
        throw new Error('Not implemented');
    }

    async getFileContent(filePath) {
        throw new Error('Not implemented');
    }

    async getFileThumbnail(filePath, maxSize) {
        throw new Error('Not implemented');
    }

    getFileUrl(filePath) {
        throw new Error('Not implemented');
    }

    async getFileInfo(filePath) {
        throw new Error('Not implemented');
    }
}
