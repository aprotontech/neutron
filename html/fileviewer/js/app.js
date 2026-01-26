/**
 * Vue Application - File Browser
 * Main application logic for file browsing with list and thumbnail views
 */

const { createApp } = Vue;

const app = createApp({
    data() {
        return {
            viewMode: 'list', // 'list' or 'thumbnail'
            files: [],
            currentPath: '/',
            currentPathArray: [],
            selectedFile: null,
            loading: false,
            error: '',
            fileAPI: null,
            isViewingImage: false,
            isViewingVideo: false,
            currentMediaFile: null,
            currentMediaUrl: '',
            fileCache: {}
        };
    },

    computed: {
    },

    methods: {
        /**
         * Initialize the application
         */
        async init() {
            try {
                // Initialize File API with WebRTC transport
                this.fileAPI = new FileAPI('webrtc');

                // Load initial files
                await this.loadFiles(this.currentPath);
            } catch (error) {
                this.error = `初始化失败: ${error.message}`;
                console.error('Initialization error:', error);
            }
        },

        /**
         * Load files for current path
         */
        async loadFiles(path) {
            this.loading = true;
            this.error = '';
            this.selectedFile = null;

            try {
                const fileList = await this.fileAPI.listFiles(path);

                // Process files and add thumbnails for images
                this.files = fileList.sort((a, b) => {
                    // Directories first
                    if (a.isDir !== b.isDir) {
                        return b.isDir - a.isDir;
                    }
                    // Then by name
                    return a.name.localeCompare(b.name);
                });

                // Load thumbnails for images
                await this.loadThumbnails();

                this.currentPath = path;
                this.updateBreadcrumb();
            } catch (error) {
                this.error = `加载文件列表失败: ${error.message}`;
                console.error('Load files error:', error);
                this.files = [];
            } finally {
                this.loading = false;
            }
        },

        /**
         * Load thumbnails for image files
         */
        async loadThumbnails() {
            const imageFiles = this.files.filter(f =>
                this.isImage(f) && !f.isDir
            );

            for (const file of imageFiles) {
                try {
                    // Generate thumbnail data URL
                    file.thumbnailData = await this.generateThumbnail(file);
                } catch (error) {
                    console.error('Failed to load thumbnail:', file.name, error);
                }
            }
        },

        /**
         * Generate thumbnail for image file
         */
        async generateThumbnail(file) {
            // For mock data, generate a colorful placeholder
            const canvas = document.createElement('canvas');
            canvas.width = 150;
            canvas.height = 130;

            const ctx = canvas.getContext('2d');

            // Generate random gradient
            const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
            const colors = [
                ['#FF6B6B', '#4ECDC4'],
                ['#45B7D1', '#FFA502'],
                ['#667EEA', '#764BA2'],
                ['#F093FB', '#F5576C'],
                ['#4158D0', '#C850C0']
            ];

            const [color1, color2] = colors[Math.floor(Math.random() * colors.length)];
            gradient.addColorStop(0, color1);
            gradient.addColorStop(1, color2);

            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Add text
            ctx.fillStyle = 'white';
            ctx.font = 'bold 14px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('🖼️', canvas.width / 2, canvas.height / 2 - 15);
            ctx.font = '12px Arial';
            ctx.fillText(file.name.substring(0, 10), canvas.width / 2, canvas.height / 2 + 20);

            return canvas.toDataURL('image/jpeg');
        },

        /**
         * Update breadcrumb path array
         */
        updateBreadcrumb() {
            if (this.currentPath === '/') {
                this.currentPathArray = [];
            } else {
                const parts = this.currentPath.split('/').filter(p => p);
                this.currentPathArray = parts;
            }
        },

        /**
         * Select a file
         */
        selectFile(file) {
            this.selectedFile = file;
        },

        /**
         * Open/navigate to a file or directory
         */
        async openFile(file) {
            if (file.isDir) {
                // Navigate to directory
                const newPath = file.path || (this.currentPath.endsWith('/')
                    ? this.currentPath + file.name
                    : this.currentPath + '/' + file.name);
                await this.loadFiles(newPath);
            } else {
                // Open media file
                if (this.isImage(file) || this.isVideo(file)) {
                    await this.openMediaViewer(file);
                }
            }
        },

        /**
         * Open media viewer for image or video
         */
        async openMediaViewer(file) {
            this.currentMediaFile = file;

            if (this.isImage(file)) {
                this.isViewingImage = true;
                this.isViewingVideo = false;
                // Use thumbnail as preview, in production would stream via WebRTC
                this.currentMediaUrl = file.thumbnailData || this.fileAPI.getFileUrl(file.path);
            } else if (this.isVideo(file)) {
                this.isViewingImage = false;
                this.isViewingVideo = true;
                // Stream video via WebRTC in production
                this.currentMediaUrl = this.fileAPI.getFileUrl(file.path);
            }

            // Show viewer
            const viewer = document.getElementById('media-viewer');
            if (viewer) {
                viewer.classList.add('active');
            }
        },

        /**
         * Close media viewer
         */
        closeMediaViewer() {
            this.isViewingImage = false;
            this.isViewingVideo = false;
            this.currentMediaFile = null;
            this.currentMediaUrl = '';

            const viewer = document.getElementById('media-viewer');
            if (viewer) {
                viewer.classList.remove('active');
            }
        },

        /**
         * Navigate to root directory
         */
        async goToRoot() {
            await this.loadFiles('/');
        },

        /**
         * Navigate to specific path from breadcrumb
         */
        async goToPath(index) {
            const parts = this.currentPathArray.slice(0, index + 1);
            const path = '/' + parts.join('/');
            await this.loadFiles(path);
        },

        /**
         * Check if file is an image
         */
        isImage(file) {
            if (file.isDir) return false;
            const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg'];
            const ext = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
            return imageExtensions.includes(ext) || file.type === 'image';
        },

        /**
         * Check if file is a video
         */
        isVideo(file) {
            if (file.isDir) return false;
            const videoExtensions = ['.mp4', '.webm', '.avi', '.mov', '.mkv', '.flv', '.m3u8'];
            const ext = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
            return videoExtensions.includes(ext) || file.type === 'video';
        },

        /**
         * Get icon for file type
         */
        getFileIcon(file) {
            if (file.isDir) {
                return '📁';
            }

            const ext = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));

            const iconMap = {
                // Images
                '.jpg': '🖼️',
                '.jpeg': '🖼️',
                '.png': '🖼️',
                '.gif': '🖼️',
                '.bmp': '🖼️',
                '.webp': '🖼️',
                '.svg': '🖼️',

                // Videos
                '.mp4': '🎬',
                '.webm': '🎬',
                '.avi': '🎬',
                '.mov': '🎬',
                '.mkv': '🎬',
                '.flv': '🎬',

                // Documents
                '.pdf': '📄',
                '.doc': '📝',
                '.docx': '📝',
                '.txt': '📋',
                '.md': '📋',

                // Archives
                '.zip': '📦',
                '.rar': '📦',
                '.7z': '📦',
                '.tar': '📦',
                '.gz': '📦',

                // Audio
                '.mp3': '🎵',
                '.wav': '🎵',
                '.flac': '🎵',
                '.aac': '🎵',

                // Code
                '.js': '⚙️',
                '.py': '⚙️',
                '.go': '⚙️',
                '.java': '⚙️',
                '.cpp': '⚙️',
                '.c': '⚙️',
                '.html': '⚙️',
                '.css': '⚙️',
            };

            return iconMap[ext] || '📄';
        },

        /**
         * Format file size
         */
        formatSize(bytes) {
            if (bytes === 0) return '-';

            const units = ['B', 'KB', 'MB', 'GB', 'TB'];
            let size = bytes;
            let unitIndex = 0;

            while (size >= 1024 && unitIndex < units.length - 1) {
                size /= 1024;
                unitIndex++;
            }

            return `${size.toFixed(2)} ${units[unitIndex]}`;
        },

        /**
         * Format modification date
         */
        formatDate(date) {
            if (!date) return '-';

            const d = new Date(date);
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            const hours = String(d.getHours()).padStart(2, '0');
            const minutes = String(d.getMinutes()).padStart(2, '0');

            return `${year}-${month}-${day} ${hours}:${minutes}`;
        }
    },

    mounted() {
        this.init();

        // Close media viewer on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' &&
                (this.isViewingImage || this.isViewingVideo)) {
                this.closeMediaViewer();
            }
        });
    }
});

app.mount('#app');
