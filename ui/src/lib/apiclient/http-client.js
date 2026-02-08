
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

    async getFileContent(filePath, mimeType, stream) {
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

    async getImageRepo(offset, count) {
        console.log(`HTTP getImageRepo: offset=${offset}, count=${count}`);

        try {
            const response = await fetch(`${this.baseURL}/files/image-repo`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ offset, count })
            });

            if (!response.ok) {
                throw new Error(`Failed to get image repo: ${response.statusText}`);
            }

            const result = await response.json();

            // 确保返回正确的格式
            return {
                total: result.total || 0,
                items: result.items || []
            };
        } catch (error) {
            console.error('getImageRepo error:', error);
            // 返回空结果而不是抛出错误
            return {
                total: 0,
                items: []
            };
        }
    }

    async getConnectionStatus() {
        try {
            // 发送一个简单的健康检查请求
            const response = await fetch(`${this.baseURL}/health`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (response.ok) {
                return "connected";
            } else {
                return "disconnected";
            }
        } catch (error) {
            console.error('Health check failed:', error);
            return "disconnected";
        }
    }
}
