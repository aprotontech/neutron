

/**
 * EXIF数据格式化器
 * 用于从EXIF数据中提取和格式化各种信息
 */
export class ExifFormatter {
    /**
     * 构造函数
     * @param {Object} exifData - EXIF数据对象
     */
    constructor(exifData) {
        this.exifData = exifData || {};
    }

    /**
     * 从EXIF数据对象中获取值
     * @param {Object} exifData - EXIF数据对象
     * @param {string} key - 字段键名
     * @returns {*} 字段值
     */
    static getExifValue(exifData, key) {
        if (!exifData || !exifData[key]) return null;
        const valueObj = exifData[key];
        if (valueObj.numberValue !== undefined && valueObj.numberValue !== null) return valueObj.numberValue;
        if (valueObj.stringValue !== undefined && valueObj.stringValue !== null) {
            const str = valueObj.stringValue;
            return str.replace(/^["']|["']$/g, '');
        }
        return null;
    }

    /**
     * 获取EXIF值（实例方法）
     * @param {string} key - 字段键名
     * @returns {*} 字段值
     */
    getValue(key) {
        return ExifFormatter.getExifValue(this.exifData, key);
    }

    /**
     * 获取拍摄时间
     * @returns {string|null} 拍摄时间
     */
    getCaptureTime() {
        if (!this.exifData) return null;

        const dateTimeOriginal = this.getValue('DateTimeOriginal');
        const createDate = this.getValue('CreateDate');
        const modifyDate = this.getValue('ModifyDate');
        const parsedDateTime = this.getValue('ParsedDateTime');

        return parsedDateTime || dateTimeOriginal || createDate || modifyDate;
    }

    /**
     * 获取相机型号
     * @returns {string|null} 相机型号
     */
    getModel() {
        if (!this.exifData) return null;
        return this.getValue('Model') || this.getValue('Make');
    }

    /**
     * 获取焦距
     * @returns {string|number|null} 焦距
     */
    getFocalLength() {
        if (!this.exifData) return null;
        return this.getValue('FocalLength');
    }

    /**
     * 获取光圈值
     * @returns {string|number|null} 光圈值
     */
    getFNumber() {
        if (!this.exifData) return null;
        return this.getValue('FNumber');
    }

    /**
     * 获取ISO感光度
     * @returns {string|number|null} ISO感光度
     */
    getISO() {
        if (!this.exifData) return null;
        return this.getValue('ISOSpeedRatings') || this.getValue('ISO');
    }

    /**
     * 获取曝光时间
     * @returns {string|number|null} 曝光时间
     */
    getExposureTime() {
        if (!this.exifData) return null;
        return this.getValue('ExposureTime');
    }

    /**
     * 获取视频帧率
     * @returns {string|number|null} 视频帧率
     */
    getVideoFrameRate() {
        if (!this.exifData) return null;

        // 尝试从不同的字段获取帧率
        const frameRateKeys = ['VideoFrameRate', 'FrameRate', 'AvgFrameRate', 'VideoFrameRate#'];
        for (const key of frameRateKeys) {
            const value = this.getValue(key);
            if (value !== null && value !== undefined) {
                return value;
            }
        }
        return null;
    }

    /**
     * 获取图像格式
     * @returns {string} 图像格式
     */
    getImageFormat() {
        if (!this.exifData) return '未知格式';

        const mimeType = this.getValue('MIMEType');
        if (mimeType) return mimeType.split('/')[1]?.toUpperCase() || '未知格式';
        return '未知格式';
    }

    /**
     * 获取图像尺寸
     * @returns {Object} 包含width和height的对象
     */
    getImageDimensions() {
        if (!this.exifData) return { width: null, height: null };

        const width = this.getValue('ImageWidth') || this.getValue('PixelXDimension');
        const height = this.getValue('ImageHeight') || this.getValue('PixelYDimension');

        return { width, height };
    }

    /**
     * 检查是否有GPS位置信息
     * @returns {boolean} 是否有GPS位置信息
     */
    hasLocation() {
        if (!this.exifData) return false;

        const lat = this.getValue('GPSLatitude');
        const lon = this.getValue('GPSLongitude');
        return !!(lat && lon);
    }

    /**
     * 获取GPS经纬度
     * @returns {Object|null} 包含latitude和longitude的对象，或null
     */
    getGPSLatitudeLongitude() {
        if (!this.exifData) return null;

        const lat = this.getValue('GPSLatitude');
        const lon = this.getValue('GPSLongitude');

        if (!lat || !lon) return null;

        if (typeof lat == 'number' && typeof lon == 'number') {
            return {
                latitude: lat,
                longitude: lon
            };
        }

        // 解析GPS坐标字符串
        const parsedLat = ExifFormatter.parseGPSString(lat);
        const parsedLon = ExifFormatter.parseGPSString(lon);

        if (parsedLat !== null && parsedLon !== null) {
            return {
                latitude: parsedLat,
                longitude: parsedLon
            };
        }

        return null;
    }

    /**
     * 获取视频时长
     * @returns {string} 格式化后的视频时长
     */
    getDuration() {
        if (!this.exifData) return '';

        // 尝试从不同的字段获取时长
        const durationKeys = ['Duration', 'MediaDuration', 'TrackDuration', 'VideoDuration', 'Duration#'];
        for (const key of durationKeys) {
            const exifValue = this.getValue(key);
            if (exifValue !== null && exifValue !== undefined) {
                return ExifFormatter.formatDuration(exifValue);
            }
        }
        return '';
    }

    /**
     * 解析带单位的时长字符串
     * @param {string} durationStr - 带单位的时长字符串，如 "29.17 s", "1.5 min", "2 hours"
     * @returns {number} 时长（秒）
     */
    static parseDurationWithUnit(durationStr) {
        if (!durationStr || typeof durationStr !== 'string') return 0;

        const str = durationStr.trim().toLowerCase();

        // 首先检查是否是时间格式（HH:MM:SS 或 MM:SS）
        const timeMatch = str.match(/^(\d+):(\d+)(?::(\d+(?:\.\d+)?))?$/);
        if (timeMatch) {
            if (timeMatch[3] !== undefined) {
                // HH:MM:SS 格式
                return parseInt(timeMatch[1]) * 3600 +
                    parseInt(timeMatch[2]) * 60 +
                    parseFloat(timeMatch[3]);
            } else {
                // MM:SS 格式
                return parseInt(timeMatch[1]) * 60 + parseFloat(timeMatch[2]);
            }
        }

        // 解析数字和单位，如 "29.17 s", "1.5 min"
        const match = str.match(/^([\d.]+)\s*([a-z]+)?$/);
        if (!match) return 0;

        const value = parseFloat(match[1]);
        const unit = match[2] || 's';

        switch (unit) {
            case 'ms':
            case 'millisecond':
            case 'milliseconds':
                return value / 1000;
            case 's':
            case 'sec':
            case 'second':
            case 'seconds':
                return value;
            case 'min':
            case 'minute':
            case 'minutes':
                return value * 60;
            case 'h':
            case 'hour':
            case 'hours':
                return value * 3600;
            default:
                // 未知单位，假设为秒
                return value;
        }
    }

    /**
     * 格式化视频时长
     * @param {number|string|Object} duration - 时长输入，可以是：
     *   - 数字（秒）
     *   - 字符串（如 "29.17 s", "1.5 min", "01:23"）
     *   - EXIF数据对象（自动从中提取时长）
     * @returns {string} 格式化后的时长，如 "01:23" 或 "01:23:45"
     */
    static formatDuration(duration) {
        if (!duration && duration !== 0) return '';

        let seconds = 0;

        // 处理不同类型的duration输入
        if (typeof duration === 'number') {
            seconds = duration;
        } else if (typeof duration === 'string') {
            const str = duration.trim();

            // 使用parseDurationWithUnit解析各种格式
            seconds = this.parseDurationWithUnit(str);

            // 如果解析失败，尝试直接解析为数字
            if (seconds === 0) {
                seconds = parseFloat(str);
                if (isNaN(seconds)) return '';
            }
        } else if (typeof duration === 'object' && duration !== null) {
            // 处理EXIF数据对象
            const formatter = new ExifFormatter(duration);
            return formatter.getDuration();
        } else {
            return '';
        }

        // 格式化显示
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);

        const pad = (num) => num.toString().padStart(2, '0');

        if (hours > 0) {
            return `${pad(hours)}:${pad(minutes)}:${pad(secs)}`;
        } else {
            return `${pad(minutes)}:${pad(secs)}`;
        }
    }

    /**
     * 从EXIF数据中获取视频时长（兼容性方法）
     * @param {Object} exifData - EXIF数据对象
     * @returns {string} 格式化后的视频时长
     */
    static getDurationFromExif(exifData) {
        const formatter = new ExifFormatter(exifData);
        return formatter.getDuration();
    }

    /**
     * 解析GPS坐标字符串（如 "30 deg 14' 57.48\" N"）为十进制坐标
     * @param {string} gpsStr - GPS坐标字符串
     * @returns {number|null} 十进制坐标
     */
    static parseGPSString(gpsStr) {
        if (!gpsStr || typeof gpsStr !== 'string') return null;

        const str = gpsStr.trim();

        // 如果已经是数字，直接返回
        const num = parseFloat(str);
        if (!isNaN(num) && str.match(/^-?\d+(\.\d+)?$/)) {
            return num;
        }

        // 尝试解析格式：30 deg 14' 57.48" N
        const pattern = /^(\d+)\s*deg\s*(\d+)'\s*([\d.]+)"\s*([NSEW])$/i;
        const match = str.match(pattern);

        if (match) {
            const degrees = parseFloat(match[1]);
            const minutes = parseFloat(match[2]);
            const seconds = parseFloat(match[3]);
            const direction = match[4].toUpperCase();

            // 计算十进制坐标
            let decimal = degrees + (minutes / 60) + (seconds / 3600);

            // 根据方向调整正负
            if (direction === 'S' || direction === 'W') {
                decimal = -decimal;
            }

            return decimal;
        }

        // 尝试其他格式
        const altPattern = /^([\d.]+)\s*([NSEW])$/i;
        const altMatch = str.match(altPattern);

        if (altMatch) {
            let decimal = parseFloat(altMatch[1]);
            const direction = altMatch[2].toUpperCase();

            if (direction === 'S' || direction === 'W') {
                decimal = -decimal;
            }

            return decimal;
        }

        return null;
    }

    /**
     * 获取所有EXIF信息
     * @returns {Object} 包含所有EXIF信息的对象
     */
    getAllInfo() {
        if (!this.exifData) return {};

        return {
            captureTime: this.getCaptureTime(),
            model: this.getModel(),
            focalLength: this.getFocalLength(),
            fNumber: this.getFNumber(),
            iso: this.getISO(),
            exposureTime: this.getExposureTime(),
            videoFrameRate: this.getVideoFrameRate(),
            imageFormat: this.getImageFormat(),
            dimensions: this.getImageDimensions(),
            hasLocation: this.hasLocation(),
            gps: this.getGPSLatitudeLongitude(),
            duration: this.getDuration()
        };
    }
}