// Minimal helper exports converted from original helpers.js
export class FileTypeDetector {
    static MIME_TYPES = {
        'image/jpeg': ['.jpg', '.jpeg'],
        'image/png': ['.png'],
        'image/gif': ['.gif'],
        'image/bmp': ['.bmp'],
        'image/webp': ['.webp'],
        'image/svg+xml': ['.svg'],

        'video/mp4': ['.mp4'],
        'video/webm': ['.webm'],
        'video/quicktime': ['.mov'],
        'video/x-msvideo': ['.avi'],
        'video/x-matroska': ['.mkv'],
        'video/x-flv': ['.flv']
    };

    static _ext(name) {
        return name.toLowerCase().substring(name.lastIndexOf('.'));
    }

    static isImage(filename) {
        const ext = this._ext(filename);
        for (const [mime, exts] of Object.entries(this.MIME_TYPES)) {
            if (mime.startsWith('image/') && exts.includes(ext)) return true;
        }
        return false;
    }

    static isVideo(filename) {
        const ext = this._ext(filename);
        for (const [mime, exts] of Object.entries(this.MIME_TYPES)) {
            if (mime.startsWith('video/') && exts.includes(ext)) return true;
        }
        return false;
    }
}

export class FileSizeFormatter {
    static format(bytes, decimals = 2) {
        if (!bytes && bytes !== 0) return '-';
        if (bytes === 0) return '0 B';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        let i = 0;
        while (bytes >= k && i < sizes.length - 1) {
            bytes = bytes / k;
            i++;
        }
        return bytes.toFixed(dm) + ' ' + sizes[i];
    }
}

export class DateFormatter {
    static format(date) {
        if (!date) return '-';
        const d = new Date(date);
        const pad = (n) => String(n).padStart(2, '0');
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
    }
}
