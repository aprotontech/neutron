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
                // Ensure auth token exists (stored by login page)
                const token = localStorage.getItem('token');
                if (!token) {
                    // No token -> redirect to login
                    window.location.href = '/login.html';
                    return;
                }

                // Initialize File API with WebRTC transport and token
                this.fileAPI = new FileAPI('webrtc', token);

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

            // Attempt to fetch real thumbnails concurrently from the backend via FileAPI.
            // Replace placeholder thumbnails with real ones when available.
            try {
                const tasks = imageFiles.map(file => (async () => {
                    try {
                        const blob = await this.fileAPI.getFileThumbnail(file.path, 200);
                        if (blob) {
                            // Revoke previous object URL if any
                            if (file._thumbUrl) {
                                try { URL.revokeObjectURL(file._thumbUrl); } catch (e) { }
                            }
                            const url = URL.createObjectURL(blob);
                            file._thumbUrl = url;
                            file.thumbnailData = url;
                        }
                    } catch (err) {
                        console.error('Failed to fetch remote thumbnail:', file.name, err);
                    }
                })());

                // Kick off background fetches and do not block returning from loadThumbnails
                Promise.allSettled(tasks).then((results) => {
                    // background completion - no action required, errors already logged per-task
                }).catch((e) => {
                    console.error('Background thumbnail fetch error:', e);
                });
            } catch (err) {
                console.error('Error fetching thumbnails concurrently:', err);
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
            console.log('openFile', file)
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
            console.log('openMediaViewer', file)
            this.currentMediaFile = file;

            if (this.isImage(file)) {
                console.log('Viewing image:', file.name);
                this.isViewingImage = true;
                this.isViewingVideo = false;
                // Use thumbnail as preview, in production would stream via WebRTC
                this.currentMediaUrl = await this.fileAPI.getFileUrl(file.path);
            } else if (this.isVideo(file)) {
                this.isViewingImage = false;
                this.isViewingVideo = true;
                // Stream video via WebRTC in production
                this.currentMediaUrl = await this.fileAPI.getFileUrl(file.path);
            }
            console.log('Image URL:', this.currentMediaUrl);

            // Show viewer
            const viewer = document.getElementById('media-viewer');
            if (viewer) {
                viewer.classList.add('active');
            }

            // Debug: verify image/video actually loads (helps diagnose blob URL issues)
            if (this.isViewingImage && this.currentMediaUrl) {
                const img = new Image();
                img.onload = () => console.log('Media loaded (img):', img.naturalWidth, img.naturalHeight);
                img.onerror = (e) => console.error('Media failed to load (img):', e);
                img.src = this.currentMediaUrl;
            }

            if (this.isViewingVideo && this.currentMediaUrl) {
                // ensure video element reloads when URL changes
                setTimeout(() => {
                    const vid = document.querySelector('#media-viewer video');
                    if (vid) {
                        vid.load();
                        vid.onloadeddata = () => console.log('Media loaded (video)');
                        vid.onerror = (e) => console.error('Media failed to load (video):', e);
                    }
                }, 50);
            }

            // DOM diagnostics: check which element is present and mark it visibly
            setTimeout(() => {
                const imgEl = document.querySelector('#media-viewer img');
                const vidEl = document.querySelector('#media-viewer video');
                console.log('DOM elements in viewer:', { img: !!imgEl, video: !!vidEl });
                if (imgEl) {
                    imgEl.style.outline = '4px solid lime';
                    imgEl.style.zIndex = 1002;
                    console.log('img computed styles:', window.getComputedStyle(imgEl));
                }
                if (vidEl) {
                    vidEl.style.outline = '4px solid orange';
                    vidEl.style.zIndex = 1002;
                    console.log('video computed styles:', window.getComputedStyle(vidEl));
                }
                // Ensure only the active media element is visible to avoid overlays
                if (imgEl && this.isViewingImage) {
                    imgEl.style.display = 'block';
                    imgEl.style.objectFit = 'contain';
                    if (vidEl) {
                        try {
                            vidEl.pause();
                            vidEl.removeAttribute('src');
                            vidEl.src = '';
                            vidEl.load();
                        } catch (e) {
                            console.warn('Failed to clear video element:', e);
                        }
                        vidEl.style.display = 'none';
                    }
                }
                if (vidEl && this.isViewingVideo) {
                    vidEl.style.display = 'block';
                    vidEl.style.objectFit = 'contain';
                    if (imgEl) {
                        imgEl.style.display = 'none';
                        try { imgEl.removeAttribute('src'); } catch (e) { }
                    }
                }
            }, 100);
        },

        /**
         * Close media viewer
         */
        closeMediaViewer() {
            console.log('closeMediaViewer')
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
