
export default class BaseClient {

    async listFiles(path) {
        throw new Error('Not implemented');
    }

    async getFileContent(filePath) {
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
}
