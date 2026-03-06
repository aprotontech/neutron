

export class Config {
    static getMaxPreviewFileSize() {
        return 5 * 1024 * 1024
    }

    static getBrowserMaxDownloadFileSize() {
        return 5 * 1024 * 1024
    }

    static getNativeMaxDownloadFileSize() {
        return 500 * 1024 * 1024
    }

    static getNativeSplitPartitionDownloadSize() {
        return 3 * 1024 * 1024
    }

    static getNativeDownloadPartitionSize() {
        // 2MB
        return 2 * 1024 * 1024
    }

    static getMaxRetryDownloadPartitionCount() {
        return 5
    }

    static getThumbnailRequestMaxConcurrency() {
        return 10
    }

    static getFileRequestMaxConcurrency() {
        return 5
    }
}