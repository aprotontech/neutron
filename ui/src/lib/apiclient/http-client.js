
import BaseClient from './base-client.js';

// For future HTTP implementation
export default class HttpClient extends BaseClient {
    constructor(baseURL = '/api') {
        super();
        this.baseURL = baseURL;
    }

    async listFiles(path) {
        const response = await fetch(`${this.baseURL}/files/list`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ path })
        });

        if (!response.ok) {
            throw new Error(`Failed to list files: ${response.statusText}`);
        }

        return response.json();
    }

    async getFileContent(filePath, stream) {
        const response = await fetch(`${this.baseURL}/files/content`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ path: filePath })
        });

        if (!response.ok) {
            throw new Error(`Failed to get file: ${response.statusText}`);
        }

        return response.blob();
    }

    async getFileThumbnail(filePath, maxSize) {
        const response = await fetch(`${this.baseURL}/files/thumbnail`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ path: filePath, maxSize })
        });

        if (!response.ok) {
            throw new Error(`Failed to get thumbnail: ${response.statusText}`);
        }

        return response.blob();
    }

    async getFileUrl(filePath) {
        return `${this.baseURL}/files/content?path=${encodeURIComponent(filePath)}`;
    }

    async getFileInfo(filePath) {
        const response = await fetch(`${this.baseURL}/files/info`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ path: filePath })
        });

        if (!response.ok) {
            throw new Error(`Failed to get file info: ${response.statusText}`);
        }

        return response.json();
    }
}
