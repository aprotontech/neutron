
export default class BaseClient {

    async getConnectionStatus() {
        throw new Error('Not implemented');
    }

    async listFiles(path) {
        throw new Error('Not implemented');
    }

    async getFileContent(filePath, mimeType, stream = false, offset = 0, size = null, timeoutMs = -1, idleTimeout = 10000) {
        throw new Error('Not implemented');
    }

    async getFileThumbnail(filePath, maxSize) {
        throw new Error('Not implemented');
    }

    async getFileUrl(filePath, fileType) {
        throw new Error('Not implemented');
    }

    async getFileInfo(filePath) {
        throw new Error('Not implemented');
    }

    async getImageRepo(offset, count) {
        throw new Error('Not implemented');
    }
}
