<template>
  <div
    class="media-viewer"
    :class="{ active: isOpen }"
    @touchstart="mediaTouchStart"
    @touchmove="mediaTouchMove"
    @touchend="mediaTouchEnd"
    @click="handleBackgroundClick"
  >
    <!-- 第一部分：顶部工具栏 -->
    <div class="media-topbar" v-if="currentFile">
      <button class="media-back" @click.stop="close">←</button>
      <div class="media-title">{{ formattedMediaTime }}</div>
      <div class="dropdown media-dropdown" @click.stop>
        <button class="menu-btn" @click.stop="toggleViewerMenu">⋮</button>
        <div class="menu" v-if="viewerMenuOpen">
          <button class="menu-item" @click="downloadCurrentFile">下载</button>
          <button class="menu-item disabled">删除</button>
          <button class="menu-item" @click="openDetailsModal">详细信息</button>
        </div>
      </div>
    </div>

    <!-- 第二部分：进度条 -->
    <div class="media-progress-container" v-if="downloadProgressVisible && downloadProgress && !downloadProgress.isCached">
      <div class="media-progress-bar">
        <div class="media-progress-fill" :style="{ width: downloadProgress.progress + '%' }"></div>
      </div>
    </div>

    <!-- 第三部分：预览区域 -->
    <div
      class="media-preview-container"
      :style="{
        transform: `translate3d(${slideX}px, ${slideOffset}px, 0)`,
        opacity: slideOpacity
      }"
    >
      <div v-if="isMediaLoading" class="media-loading">
        <div class="media-spinner"></div>
        <div class="media-loading-text">
          <div v-if="downloadProgress && downloadProgress.totalSize">
            <div class="media-loading-progress">
              加载中: {{ downloadProgress.progress.toFixed(0) }}%
            </div>
            <div class="media-loading-size">
              {{ formatSize(downloadProgress.downloadedSize || 0) }} / {{ formatSize(downloadProgress.totalSize || 0) }}
            </div>
          </div>
          <div v-else>
            加载中...
          </div>
        </div>
      </div>

      <div class="media-preview-content">
        <img
          v-if="currentFile?.type === '图片' && !isMediaLoading"
          :src="currentMediaUrl"
          :alt="currentFile?.name"
          @click.stop
        />

        <video
          v-else-if="currentFile?.type === '视频' && !isMediaLoading"
          :src="currentMediaUrl"
          controls
          autoplay
          @click.stop
        ></video>

        <audio
          v-else-if="currentFile?.type === '音频' && !isMediaLoading"
          :src="currentMediaUrl"
          controls
          autoplay
          @click.stop
        ></audio>

        <div
          v-else-if="currentFile?.type === '文本' && !isMediaLoading"
          class="text-viewer"
          @click.stop
        >
          <pre v-if="isCodeFile && highlightedCode" class="code-content" v-html="highlightedCode"></pre>
          <pre v-else class="plain-text-content">{{ currentTextContent }}</pre>
        </div>
      </div>
    </div>

    <!-- 第四部分：缩略图区域 -->
    <div class="media-thumbnails" v-if="thumbList.length > 0 && isOpen">
      <div class="thumb-list" ref="thumbsContainer">
        <div
          v-for="(it, idx) in thumbList"
          :key="(it.path || it.filepath) + '-' + (it.offset ?? idx)"
          :class="['thumb-item', { active: (it.offset ?? idx) === currentOffset }]"
          @click.stop="jumpToOffset(it.offset ?? startOffset + idx)"
        >
          <img v-if="it.thumbnailUrl" :src="it.thumbnailUrl" :alt="it.name" />
          <div v-else class="thumb-placeholder">
            <span class="thumb-icon">{{ thumbIcon(it.type) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 第五部分：底部工具按钮区域 -->
    <div class="media-toolbar" v-if="isOpen">
      <div class="toolbar-buttons">
        <button class="toolbar-btn disabled" title="分享">
          <span class="toolbar-icon">↗️</span>
        </button>
        <button class="toolbar-btn disabled" title="收藏">
          <span class="toolbar-icon">⭐</span>
        </button>
        <button class="toolbar-btn" @click="openDetailsModal" title="详细信息">
          <span class="toolbar-icon">ℹ️</span>
        </button>
        <button class="toolbar-btn disabled" title="删除">
          <span class="toolbar-icon">🗑️</span>
        </button>
      </div>
    </div>

    <!-- 详细进度信息 -->
    <div class="download-progress-details" v-if="downloadProgressVisible && downloadProgress && !downloadProgress.isCached">
      <div class="download-progress-info">
        <span class="download-progress-text">
          {{ downloadProgress.isCached ? '使用缓存' : (downloadProgress.isCompleted ? '下载完' : '下载中') }}:
          {{ downloadProgress.progress.toFixed(0) }}%
          <span v-if="downloadProgress.isPartitioned">
            (分区 {{ downloadProgress.partitions || 0 }})
          </span>
        </span>
        <span class="download-progress-size">
          {{ formatSize(downloadProgress.downloadedSize || 0) }} / {{ formatSize(downloadProgress.totalSize || 0) }}
        </span>
      </div>
    </div>

    <!-- details modal -->
    <div class="details-modal" v-if="showDetailsModal">
      <div class="details-backdrop" @click="closeDetailsModal"></div>
      <div class="details-panel">
        <div class="details-header">
          <h3>详细信息</h3>
          <button class="details-close-btn" @click="closeDetailsModal">完成</button>
        </div>
        <div class="details-body">
          <div v-if="fileInfoLoading" class="details-loading">
            <div class="loading-spinner"></div>
            <span>加载中...</span>
          </div>
          <div v-else-if="!fileInfo" class="details-empty">
            <div class="empty-icon">ℹ️</div>
            <p>无可用信息</p>
          </div>
          <div v-else class="details-content">
            <div class="details-section">
              <div class="section-content">
                <div class="time-display">{{ formatDateTime(getCaptureTime(fileInfo) || currentFile?.mtime) }}</div>
              </div>
            </div>
            <div class="details-section">
              <div class="section-content">
                <div class="filename-display">{{ currentFile?.name || '未知文件' }}</div>
              </div>
            </div>
            <div class="details-section">
              <div class="section-content exif-info">
                <div class="exif-row header-row">
                  <div class="exif-item">
                    <div class="exif-label">拍摄设备</div>
                    <div class="exif-value">{{ getExifModel(fileInfo) || '未知设备' }}</div>
                  </div>
                  <div class="exif-item">
                    <div class="exif-label">文件格式</div>
                    <div class="exif-value">{{ getImageFormat(fileInfo) }}</div>
                  </div>
                </div>
                <div class="exif-row">
                  <div class="exif-item">
                    <div class="exif-label">文件尺寸</div>
                    <div class="exif-value">{{ formatImageDimensions(fileInfo) }}</div>
                  </div>
                  <div class="exif-item">
                    <div class="exif-label">文件大小</div>
                    <div class="exif-value">{{ formatFileSize(fileInfo?.size) }}</div>
                  </div>
                </div>
                
                <!-- 图片文件的EXIF信息 -->
                <template v-if="currentFile?.type === '图片'">
                  <div class="exif-row">
                    <div class="exif-item">
                      <div class="exif-label">焦距</div>
                      <div class="exif-value">{{ formatFocalLength(getExifFocalLength(fileInfo)) }}</div>
                    </div>
                    <div class="exif-item">
                      <div class="exif-label">光圈</div>
                      <div class="exif-value">{{ formatAperture(getExifFNumber(fileInfo)) }}</div>
                    </div>
                  </div>
                  <div class="exif-row">
                    <div class="exif-item">
                      <div class="exif-label">ISO</div>
                      <div class="exif-value">{{ getExifISO(fileInfo) || '--' }}</div>
                    </div>
                    <div class="exif-item">
                      <div class="exif-label">快门</div>
                      <div class="exif-value">{{ formatShutterSpeed(getExifExposureTime(fileInfo)) }}</div>
                    </div>
                  </div>
                </template>
                
                <!-- 视频文件的EXIF信息 -->
                <template v-else-if="currentFile?.type === '视频'">
                  <div class="exif-row">
                    <div class="exif-item">
                      <div class="exif-label">帧率</div>
                      <div class="exif-value">{{ formatFrameRate(getVideoFrameRate(fileInfo)) }}</div>
                    </div>
                    <div class="exif-item">
                      <div class="exif-label">时长</div>
                      <div class="exif-value">{{ ExifFormatter.getDurationFromExif(fileInfo?.exifData) || '--' }}</div>
                    </div>
                  </div>
                </template>
              </div>
            </div>
            <div class="details-section" v-if="showLocationSection">
              <div class="section-content location-info">
                <div class="location-address">
                  <span class="address-label">位置：</span>
                  <span class="address-value">{{ locationAddress || '获取地址中...' }}</span>
                </div>
                <div ref="mapContainer" class="location-map"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onUnmounted } from 'vue'
import { FileSizeFormatter, DateFormatter } from './lib/helpers.js'
import { ExifFormatter } from './lib/exif.js'
import { PreviewDataManager } from './lib/preview.js'
import AMapLoader from '@amap/amap-jsapi-loader'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  totalCount: { type: Number, required: true },
  initialOffset: { type: Number, default: 0 },
  initialItems: {
    type: Array,
    default: () => []
  },
  // 模板中 :file-api 会被 Vue 规范为 fileApi（camelCase）
  fileApi: { type: Object, required: true },
  fetchNearby: {
    type: Function,
    required: true
  },
  /** 可选：文本/代码高亮，(content, filename) => htmlString，用于 Files 等 */
  highlightCode: { type: Function, default: null },
  /** 可选：判断是否为代码文件，用于决定是否用 highlightCode 渲染 */
  isCode: { type: Function, default: null }
})

const emit = defineEmits(['update:modelValue', 'show-toast'])

const isOpen = computed(() => props.modelValue)

// 创建PreviewDataManager实例
const previewDataManager = new PreviewDataManager()

// 初始化数据管理器
function initDataManager() {
  previewDataManager.init(
    props.fileApi,
    props.fetchNearby,
    props.totalCount
  )
}




const thumbsContainer = ref(null)
const currentOffset = ref(0)
const currentMediaUrl = ref('')
const isMediaLoading = ref(false)
const viewerMenuOpen = ref(false)
const showDetailsModal = ref(false)
const fileInfo = ref(null)
const fileInfoLoading = ref(false)
const slideX = ref(0)
const slideOffset = ref(0)
const slideOpacity = ref(1)
const touchStartY = ref(0)
const touchStartX = ref(0)
const itemTouchStartX = ref(0)
const itemTouchStartY = ref(0)
const lastTouchDx = ref(0)
const downloadProgress = ref(null)
const downloadProgressVisible = ref(false)
const currentTextContent = ref('')
const highlightedCode = ref('')
const mapInstance = ref(null)
const AMapGlobal = ref(null)
const locationAddress = ref('')
const mapObserver = ref(null)
// 用于取消当前下载的函数引用
const cancelCurrentDownload = ref(null)

const THUMB_RANGE = 15
const mapContainer = ref(null)

const showLocationSection = computed(() => {
  return hasLocation(fileInfo.value)
})

function formatSize(b) {
  return FileSizeFormatter.format(b)
}

const currentFile = computed(() => {
  return previewDataManager.getFileData(currentOffset.value)
})

const thumbList = computed(() => {
  const start = Math.max(0, currentOffset.value - THUMB_RANGE)
  const end = Math.min(props.totalCount - 1, currentOffset.value + THUMB_RANGE)
  const list = []
  for (let o = start; o <= end; o++) {
    const item = previewDataManager.getFileData(o)
    if (item) list.push({ ...item, offset: o })
  }
  return list
})

const startOffset = computed(() => Math.max(0, currentOffset.value - THUMB_RANGE))

function thumbIcon(type) {
  if (type === '视频') return '🎬'
  if (type === '音频') return '🎵'
  if (type === '文本') return '📄'
  return '🖼️'
}

const isCodeFile = computed(() => {
  const name = currentFile.value?.name
  return name && typeof props.isCode === 'function' && props.isCode(name)
})

const formattedMediaTime = computed(() => {
  const info = fileInfo.value || {}
  const maybe = info.mtime || info.lastModified || info.DateTimeOriginal || info.date || info.created_at
  if (maybe) {
    try {
      return DateFormatter.format(maybe)
    } catch (e) {
      return String(maybe)
    }
  }
  return currentFile.value?.name || ''
})

// getExifValue函数已迁移到ExifFormatter类中
// 使用 ExifFormatter.getExifValue(exifData, key) 或 new ExifFormatter(exifData).getValue(key)

function formatDateTime(dateStr) {
  if (dateStr === undefined || dateStr === null) return '未知时间'
  try {
    let date
    if (typeof dateStr === 'number') {
      // 服务端 mtime 为 Unix 秒，JS Date 需要毫秒
      const ms = dateStr < 1e12 ? dateStr * 1000 : dateStr
      date = new Date(ms)
    } else if (typeof dateStr === 'string') {
      // EXIF 日期格式 "YYYY:MM:DD HH:mm:ss" 需转为 "YYYY-MM-DD HH:mm:ss" 才能被正确解析
      const normalized = dateStr.replace(/^(\d{4}):(\d{2}):(\d{2})/, '$1-$2-$3')
      date = new Date(normalized)
    } else {
      date = new Date(dateStr)
    }
    if (Number.isNaN(date.getTime())) return String(dateStr)
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  } catch (e) {
    return String(dateStr)
  }
}

function getCaptureTime(fileInfoObj) {
  if (!fileInfoObj) return null
  if (fileInfoObj.exifData) {
    const formatter = new ExifFormatter(fileInfoObj.exifData)
    return formatter.getCaptureTime()
  }
  return fileInfoObj.mtime || fileInfoObj.lastModified
}

function getExifModel(fileInfoObj) {
  if (!fileInfoObj) return null
  if (fileInfoObj.exifData) {
    const formatter = new ExifFormatter(fileInfoObj.exifData)
    return formatter.getModel()
  }
  return fileInfoObj.Model || fileInfoObj.Make
}

function getExifFocalLength(fileInfoObj) {
  if (!fileInfoObj) return null
  if (fileInfoObj.exifData) {
    const formatter = new ExifFormatter(fileInfoObj.exifData)
    return formatter.getFocalLength()
  }
  return fileInfoObj.FocalLength
}

function getExifFNumber(fileInfoObj) {
  if (!fileInfoObj) return null
  if (fileInfoObj.exifData) {
    const formatter = new ExifFormatter(fileInfoObj.exifData)
    return formatter.getFNumber()
  }
  return fileInfoObj.FNumber
}

function getExifISO(fileInfoObj) {
  if (!fileInfoObj) return null
  if (fileInfoObj.exifData) {
    const formatter = new ExifFormatter(fileInfoObj.exifData)
    return formatter.getISO()
  }
  return fileInfoObj.ISO || fileInfoObj.ISOSpeedRatings
}

function getExifExposureTime(fileInfoObj) {
  if (!fileInfoObj) return null
  if (fileInfoObj.exifData) {
    const formatter = new ExifFormatter(fileInfoObj.exifData)
    return formatter.getExposureTime()
  }
  return fileInfoObj.ExposureTime
}

function getVideoFrameRate(fileInfoObj) {
  if (!fileInfoObj) return null
  if (fileInfoObj.exifData) {
    const formatter = new ExifFormatter(fileInfoObj.exifData)
    return formatter.getVideoFrameRate()
  }
  return fileInfoObj.VideoFrameRate || fileInfoObj.FrameRate;
}

function getImageFormat(fileInfoObj) {
  if (!fileInfoObj) return '未知格式'
  if (fileInfoObj.exifData) {
    const formatter = new ExifFormatter(fileInfoObj.exifData)
    const t = formatter.getImageFormat()
    if (t && t != '未知格式') {
      return t
    }
  }
  if (fileInfoObj.MIMEType) return fileInfoObj.MIMEType.split('/')[1]?.toUpperCase() || '未知格式'
  if (currentFile.value?.name) {
    const ext = currentFile.value.name.split('.').pop()?.toLowerCase()
    if (ext === 'jpg' || ext === 'jpeg') return 'JPEG'
    if (ext === 'png') return 'PNG'
    if (ext === 'gif') return 'GIF'
    if (ext === 'heic') return 'HEIC'
    if (ext === 'webp') return 'WebP'
  }

  return '未知格式'
}

function formatFocalLength(fl) {
  if (!fl) return '--'
  if (typeof fl === 'string') return fl.includes('mm') ? fl : `${fl}mm`
  if (typeof fl === 'number') return `${fl}mm`
  return '--'
}

function formatAperture(fNumber) {
  if (!fNumber) return '--'
  if (typeof fNumber === 'string') return fNumber.startsWith('f/') ? fNumber : `f/${fNumber}`
  if (typeof fNumber === 'number') return `f/${fNumber}`
  return '--'
}

function formatImageDimensions(fileInfoObj) {
  if (!fileInfoObj) return '--'
  let width, height
  if (fileInfoObj.exifData) {
    const formatter = new ExifFormatter(fileInfoObj.exifData)
    const dimensions = formatter.getImageDimensions()
    width = dimensions.width
    height = dimensions.height
  }
  if (!width) width = fileInfoObj.ImageWidth || fileInfoObj.PixelXDimension
  if (!height) height = fileInfoObj.ImageHeight || fileInfoObj.PixelYDimension
  if (width && height) return `${width} × ${height}`
  return '--'
}

function formatFileSize(size) {
  if (!size) return '--'
  return FileSizeFormatter.format(size)
}

function formatShutterSpeed(et) {
  if (!et) return '--'
  if (typeof et === 'string') return et
  if (typeof et === 'number') return et >= 1 ? `${et}s` : `1/${Math.round(1 / et)}s`
  return '--'
}

function formatFrameRate(frameRate) {
  if (!frameRate) return '--'
  if (typeof frameRate === 'number') {
    // 如果是整数，显示为整数
    if (frameRate % 1 === 0) {
      return `${frameRate} fps`;
    } else {
      // 保留一位小数
      return `${frameRate.toFixed(1)} fps`;
    }
  }
  if (typeof frameRate === 'string') {
    // 如果已经是带单位的字符串，直接返回
    if (frameRate.toLowerCase().includes('fps') || frameRate.toLowerCase().includes('hz')) {
      return frameRate;
    }
    // 尝试解析为数字
    const num = parseFloat(frameRate);
    if (!isNaN(num)) {
      if (num % 1 === 0) {
        return `${num} fps`;
      } else {
        return `${num.toFixed(1)} fps`;
      }
    }
  }
  return frameRate;
}

function hasLocation(fileInfoObj) {
  if (!fileInfoObj) return false
  if (fileInfoObj.exifData) {
    const formatter = new ExifFormatter(fileInfoObj.exifData)
    return formatter.hasLocation()
  }
  return !!(fileInfoObj.GPSLatitude || fileInfoObj.gpsLatitude || fileInfoObj.GPSLongitude || fileInfoObj.gpsLongitude)
}

function close() {
  // 关闭预览时，停止当前文件的下载
  cancelCurrentDownloadIfNeeded();
  emit('update:modelValue', false)
}

async function downloadCurrentFile() {
  viewerMenuOpen.value = false
  
  const file = currentFile.value
  if (!file) return
  
  const path = file.path || file.filepath
  if (!path) return
  
  try {
    // 显示开始下载提示
    emit('show-toast', `开始下载文件: ${file.name}`, 'info')
    
    // 调用fileApi的downloadFile方法
    const success = await props.fileApi.downloadFile(path, fileInfo.value)
    
    if (success) {
      console.log('文件下载成功:', file.name)
      emit('show-toast', `文件下载成功: ${file.name}`, 'success')
    } else {
      console.error('文件下载失败:', file.name)
      emit('show-toast', '文件下载失败', 'error')
    }
  } catch (error) {
    console.error('下载文件时出错:', error)
    emit('show-toast', `下载失败: ${error.message}`, 'error')
  }
}

function toggleViewerMenu() {
  viewerMenuOpen.value = !viewerMenuOpen.value
}

async function openDetailsModal() {
  viewerMenuOpen.value = false
  showDetailsModal.value = true
  const file = currentFile.value
  if (file) {
    const path = file.path || file.filepath
    if (path) {
      fileInfoLoading.value = true
      try {
        let info = await props.fileApi.getFileInfo(path)
        // Native 缓存返回 exif，详情页统一使用 exifData
        if (info && !info.exifData && info.exif) info = { ...info, exifData: info.exif }
        fileInfo.value = info
      } catch (e) {
        fileInfo.value = null
      } finally {
        fileInfoLoading.value = false
      }
    }
  }
}

function closeDetailsModal() {
  showDetailsModal.value = false
  // 关闭时销毁地图
  if (mapInstance.value) {
    mapInstance.value.destroy()
    mapInstance.value = null
  }
}

/**
 * 取消当前正在进行的下载
 */
function cancelCurrentDownloadIfNeeded() {
  if (cancelCurrentDownload.value && typeof cancelCurrentDownload.value === 'function') {
    console.log('[Preview] Cancelling current download');
    cancelCurrentDownload.value();
    cancelCurrentDownload.value = null;
  }
}

/**
 * 设置当前下载的取消函数
 */
function setCurrentDownloadCanceller(canceller) {
  cancelCurrentDownload.value = canceller;
}

/**
 * 清除当前下载的取消函数
 */
function clearCurrentDownloadCanceller() {
  cancelCurrentDownload.value = null;
}

async function ensureItemsAround(offset) {
  try {
    // 使用previewDataManager获取数据范围，它会自动加载缺失的数据
    const items = await previewDataManager.getFileDataRange(offset, THUMB_RANGE)
    
    // 确保所有项目都有缩略图
    items.forEach((item, i) => {
      const o = offset - THUMB_RANGE + i
      if (o >= 0 && o < props.totalCount && item) {
        loadThumbnailForOffset(o)
      }
    })
  } catch (e) {
    console.error('Preview ensureItemsAround error', e)
  }
}

/**
 * 预加载相邻文件的数据
 * @param {number} currentOffset - 当前偏移量
 * @param {number} prefetchRange - 预加载范围
 */
async function prefetchNearbyFiles(currentOffset, prefetchRange = 3) {
  try {
    const start = Math.max(0, currentOffset - prefetchRange)
    const end = Math.min(props.totalCount - 1, currentOffset + prefetchRange)
    const count = end - start + 1
    
    if (count > 0) {
      // 使用previewDataManager预加载数据
      await previewDataManager.prefetchFileData(start, count)
      
      // 预加载缩略图
      for (let offset = start; offset <= end; offset++) {
        if (offset !== currentOffset) {
          loadThumbnailForOffset(offset)
        }
      }
    }
  } catch (error) {
    console.error('Failed to prefetch nearby files:', error)
  }
}

function normalizeItem(item) {
  const path = item.path ?? item.filepath
  return {
    path,
    filepath: path,
    name: item.name ?? ((path || '').split('/').pop() || '未命名'),
    type: item.type ?? '图片',
    thumbnailUrl: item.thumbnailUrl ?? null
  }
}

/** 当项为图片/视频且无缩略图时，用 previewDataManager 加载缩略图并更新数据 */
function loadThumbnailForOffset(offset) {
  const item = previewDataManager.getFileData(offset)
  if (!item || item.thumbnailUrl) return
  if (item.type !== '图片' && item.type !== '视频') return
  const path = item.path || item.filepath
  if (!path) return
  
  previewDataManager.getThumbnailUrl(path).then((url) => {
    if (url) {
      previewDataManager.setFileData(offset, { ...item, thumbnailUrl: url })
    }
  }).catch(() => {})
}

async function loadMediaAtOffset(offset) {
  // 加载新文件前，取消之前的下载
  cancelCurrentDownloadIfNeeded();
  
  await ensureItemsAround(offset)
  const file = previewDataManager.getFileData(offset)
  if (!file) return
  const path = file.path || file.filepath
  if (!path) return

  currentOffset.value = offset
  currentMediaUrl.value = ''
  currentTextContent.value = ''
  highlightedCode.value = ''
  isMediaLoading.value = true
  fileInfo.value = null
  downloadProgress.value = null
  downloadProgressVisible.value = false
  
  // 清除之前的取消函数
  clearCurrentDownloadCanceller();

  try {
    fileInfoLoading.value = true
    try {
      let info = await props.fileApi.getFileInfo(path)
      if (info && !info.exifData && info.exif) info = { ...info, exifData: info.exif }
      fileInfo.value = info
    } catch (e) {
      fileInfo.value = null
    } finally {
      fileInfoLoading.value = false
    }

    // 创建下载取消标志
    let downloadCancelled = false;
    
    const progressCallback = (progressData) => {
      downloadProgress.value = progressData
      downloadProgressVisible.value = true
      if (progressData.isCompleted) {
        setTimeout(() => {
          downloadProgressVisible.value = false
        }, 500)
        // 下载完成后清除取消函数
        clearCurrentDownloadCanceller();
      }
      
      // 如果下载已被取消，抛出DOWNLOAD_CANCELLED异常
      if (downloadCancelled) {
        console.log('[Preview] Download cancelled via progress callback');
        throw new Error('DOWNLOAD_CANCELLED');
      }
    }
    
    // 设置取消函数
    setCurrentDownloadCanceller(() => {
      console.log('[Preview] Download cancellation requested');
      downloadCancelled = true;
      downloadProgressVisible.value = false;
      downloadProgress.value = null;
    });

    if (file.type === '文本') {
      const url = await previewDataManager.getFileUrl(path, progressCallback)
      const response = await fetch(url)
      if (response.ok) {
        const text = await response.text()
        if (text.length > 100000) {
          currentTextContent.value = text.substring(0, 100000) + '\n\n... (文件过大，已截断显示前100KB内容)'
        } else {
          currentTextContent.value = text
        }
        if (typeof props.highlightCode === 'function' && typeof props.isCode === 'function' && props.isCode(file.name)) {
          try {
            highlightedCode.value = props.highlightCode(text, file.name) || text
          } catch (e) {
            highlightedCode.value = ''
          }
        }
      } else {
        currentTextContent.value = '无法加载文件内容'
      }
      isMediaLoading.value = false
    } else {
      const url = await previewDataManager.getFileUrl(path, progressCallback)
      currentMediaUrl.value = url

      if (file.type === '图片') {
        const img = new Image()
        img.onload = () => { isMediaLoading.value = false }
        img.onerror = () => { isMediaLoading.value = false }
        img.src = url
      } else if (file.type === '音频' || file.type === '视频') {
        isMediaLoading.value = false
      } else {
        isMediaLoading.value = false
      }
    }

    await nextTick()
    centerThumbOnOffset(offset)
    
    // 异步预加载相邻文件，不阻塞当前文件显示
    setTimeout(() => {
      prefetchNearbyFiles(offset, 2)
    }, 100)
    
  } catch (e) {
    console.error('loadMediaAtOffset error', e)
    isMediaLoading.value = false
  }
}

function jumpToOffset(offset) {
  if (offset < 0 || offset >= props.totalCount) return
  loadMediaAtOffset(offset)
}

function centerThumbOnOffset(offset) {
  const cont = thumbsContainer.value
  if (!cont) return
  const items = cont.querySelectorAll('.thumb-item')
  const localIdx = thumbList.value.findIndex((it) => (it.offset ?? startOffset.value + 0) === offset)
  const item = items[localIdx]
  if (!item) return
  const contW = cont.clientWidth
  const itemW = item.clientWidth
  const left = item.offsetLeft + itemW / 2 - contW / 2
  cont.scrollTo({ left: Math.max(0, left - 10), behavior: 'smooth' })
}

function mediaTouchStart(e) {
  if (!isOpen.value) return
  const t = e.touches[0]
  touchStartY.value = t.clientY
  touchStartX.value = t.clientX
  itemTouchStartX.value = t.clientX
  itemTouchStartY.value = t.clientY
  lastTouchDx.value = 0
}

function mediaTouchMove(e) {
  if (!isOpen.value) return
  const t = e.touches[0]
  const dy = t.clientY - touchStartY.value
  const rawDx = t.clientX - itemTouchStartX.value
  if (Math.abs(dy) > Math.abs(rawDx)) {
    e.preventDefault()
    slideOffset.value = dy
    const ratio = Math.min(Math.abs(dy) / 300, 1)
    slideOpacity.value = 1 - ratio * 0.6
  } else {
    e.preventDefault()
    slideX.value = rawDx
    lastTouchDx.value = rawDx
  }
}

function mediaTouchEnd() {
  if (!isOpen.value) return
  if (Math.abs(lastTouchDx.value) > 80) {
    if (lastTouchDx.value < 0) {
      const next = Math.min(props.totalCount - 1, currentOffset.value + 1)
      if (next !== currentOffset.value) jumpToOffset(next)
    } else {
      const prev = Math.max(0, currentOffset.value - 1)
      if (prev !== currentOffset.value) jumpToOffset(prev)
    }
  }
  if (Math.abs(slideOffset.value) > 120) {
    // 上滑取消预览时，停止当前文件的下载
    cancelCurrentDownloadIfNeeded();
    close()
  } else {
    slideOffset.value = 0
    slideOpacity.value = 1
  }
  slideX.value = 0
  lastTouchDx.value = 0
}

function handleBackgroundClick() {}

watch(
  () => props.modelValue,
  async (visible) => {
    console.log('props.modelValue', props.modelValue, visible)
    if (visible) {
      // 初始化数据管理器
      initDataManager()
      
      // 加载初始数据
      const items = props.initialItems || []
      items.forEach((item, i) => {
        const offset = item.offset ?? props.initialOffset - Math.floor(items.length / 2) + i
        if (offset >= 0 && offset < props.totalCount) {
          previewDataManager.setFileData(offset, normalizeItem(item))
        }
      })
      
      currentOffset.value = props.initialOffset
      slideOffset.value = 0
      slideOpacity.value = 1
      slideX.value = 0
      await loadMediaAtOffset(props.initialOffset)
      // 为附近项补全缩略图（Files 列表视图下 thumbUrl 常为空）
      const start = Math.max(0, props.initialOffset - THUMB_RANGE)
      const end = Math.min(props.totalCount - 1, props.initialOffset + THUMB_RANGE)
      for (let o = start; o <= end; o++) {
        loadThumbnailForOffset(o)
      }
    } else {
      // 关闭预览时，停止当前文件的下载
      cancelCurrentDownloadIfNeeded();
      previewDataManager.clear()
      currentMediaUrl.value = ''
      currentTextContent.value = ''
      highlightedCode.value = ''
      fileInfo.value = null
      downloadProgress.value = null
      downloadProgressVisible.value = false
      
      // 关闭预览时销毁地图实例
      if (mapInstance.value) {
        mapInstance.value.destroy()
        mapInstance.value = null
      }
    }
  }
)

// 监听详细信息模态框的显示状态，加载地图
watch(
  () => showDetailsModal.value,
  async (visible) => {
    console.log('showDetailsModal', showDetailsModal.value, visible)
    if (visible && hasLocation(fileInfo.value)) {
      const refresh = mapInstance.value != null
      if (!mapInstance.value) {
        locationAddress.value = ''
        // 等待DOM完全渲染
        await nextTick()
        // 再次检查地图容器是否存在
        if (!mapContainer.value) {
          console.warn('地图容器未找到，等待DOM渲染')
          // 延迟重试
          setTimeout(async () => {
            await initMap()
            if (mapInstance.value) {
              await updateMap(refresh)
            }
          }, 50)
          return
        }
        await initMap()
      }
      await updateMap(refresh)
    } else if (visible && !hasLocation(fileInfo.value)) {
      // GPS信息不存在，清空地址信息
      locationAddress.value = ''
    }
  }
)

// 高德地图初始化函数
async function initMap() {
  try {
    // 确保地图容器存在
    const container = mapContainer.value
    if (!container) {
      console.warn('地图容器未找到，无法初始化地图')
      return
    }

    // 检查容器是否可见
    if (container.offsetParent === null) {
      console.warn('地图容器不可见，等待DOM渲染')
      return
    }

    window._AMapSecurityConfig = {
      securityJsCode: import.meta.env.VITE_AMAP_SECURITY_CODE || ''
    }

    const AMap = await AMapLoader.load({
      key: import.meta.env.VITE_AMAP_KEY || '',
      version: '2.0',
      plugins: ['AMap.Geocoder']
    })

    // 获取坐标
    const [lat, lng] = getLatitudeLongitude(fileInfo.value)

    console.log('initMap', lat, lng)

    if (!lat || !lng) {
      console.warn('没有有效的GPS坐标')
      return
    }

    // 创建地图实例
    mapInstance.value = new AMap.Map(container, {
      zoom: 15,
      center: [lng, lat]
    })
    
    // 保存AMap引用供后续使用
    AMapGlobal.value = AMap
    
    console.log('地图初始化成功')
  } catch (error) {
    console.error('初始化地图失败:', error)
    locationAddress.value = '获取地址失败'
  }
}

// 更新地图函数（当切换到下一张有GPS信息的图片时调用）
async function updateMap(refresh) {
  try {
    if (!mapInstance.value || !fileInfo.value || !AMapGlobal.value) return
    
    const [lat, lng] = getLatitudeLongitude(fileInfo.value)

    console.log('updateMap', lat, lng)
    
    if (!lat || !lng) {
      locationAddress.value = ''
      return
    }

    mapInstance.value.setCenter([lng, lat])

    mapInstance.value.clearMap()
    
    const marker = new AMapGlobal.value.Marker({
      position: [lng, lat],
      title: '拍摄位置'
    })
    mapInstance.value.add(marker)
    
    const geocoder = new AMapGlobal.value.Geocoder({
      city: '全国'
    })
    
    geocoder.getAddress([lng, lat], (status, result) => {
      if (status === 'complete' && result.info === 'OK' && result.regeocode) {
        locationAddress.value = result.regeocode.formattedAddress || '未知位置'
      } else {
        locationAddress.value = '无法获取地址信息'
      }
    })

    if (refresh) {
      setTimeout(() => {
        console.log('resize')
        if (mapInstance.value) {
          mapInstance.value.resize()
        }
      }, 100)
    }
    
  } catch (error) {
    console.error('更新地图失败:', error)
    locationAddress.value = '获取地址失败'
  }
}

// parseGPSString函数已迁移到ExifFormatter类中
// 使用 ExifFormatter.parseGPSString(gpsStr)

// 获取纬度
function getLatitudeLongitude(fileInfoObj) {
  if (!fileInfoObj) return null
  
  let lat = fileInfoObj.GPSLatitude || fileInfoObj.gpsLatitude
  let lon = fileInfoObj.GPSLongitude || fileInfoObj.gpsLongitude
  
  if (fileInfoObj.exifData) {
    const formatter = new ExifFormatter(fileInfoObj.exifData)
    const gps = formatter.getGPSLatitudeLongitude()
    if (gps) {
      lat = lat || gps.latitude
      lon = lon || gps.longitude
    }
  }
  
  // 尝试解析字符串格式的坐标
  if (typeof lat === 'string') {
    const parsedLat = ExifFormatter.parseGPSString(lat)
    if (parsedLat !== null) {
      lat = parsedLat
    }
  }
  
  if (typeof lon === 'string') {
    const parsedLon = ExifFormatter.parseGPSString(lon)
    if (parsedLon !== null) {
      lon = parsedLon
    }
  }
  
  return [lat, lon]
}

// 清理地图容器观察器
function cleanupMapContainerObserver() {
  if (mapObserver.value) {
    mapObserver.value.disconnect()
    mapObserver.value = null
    console.log('已清理地图容器观察器')
  }
}

// 组件卸载时销毁地图和观察器
onUnmounted(() => {
  if (mapInstance.value) {
    mapInstance.value.destroy()
    mapInstance.value = null
  }
  AMapGlobal.value = null
  cleanupMapContainerObserver()
})
</script>

<style scoped>
.media-viewer {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.95);
  z-index: 2000;
  box-sizing: border-box;
  overflow: hidden;
}

.media-viewer.active {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.media-topbar {
  position: absolute;
  top: env(safe-area-inset-top, 0);
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 6px;
  z-index: 1102;
  color: white;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 0.5px solid rgba(255, 255, 255, 0.1);
  height: 88px;
  box-sizing: border-box;
}

.media-back {
  background: transparent;
  border: none;
  color: white;
  font-size: 17px;
  font-weight: 400;
  padding: 8px 4px;
  min-width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  opacity: 0.9;
}

.media-title {
  text-align: center;
  flex: 1;
  font-size: 16px;
  font-weight: 500;
  opacity: 0.95;
  padding: 0 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.media-dropdown {
  min-width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dropdown {
  position: relative;
}

.menu-btn {
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 18px;
  font-size: 18px;
}

.menu {
  position: absolute;
  right: 0;
  top: 100%;
  margin-top: 8px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.12);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-width: 180px;
  z-index: 1200;
}

.menu-item {
  padding: 12px 14px;
  text-align: left;
  background: transparent;
  border: none;
  font-size: 14px;
  cursor: pointer;
}

.menu-item.disabled {
  color: #999;
  cursor: default;
  pointer-events: none;
}

.media-progress-container {
  position: absolute;
  top: calc(env(safe-area-inset-top, 0) + 88px);
  left: 0;
  right: 0;
  z-index: 1103;
  padding: 0 12px;
  box-sizing: border-box;
}

.media-progress-bar {
  height: 3px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 1.5px;
  overflow: hidden;
}

.media-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #007AFF 0%, #34C759 100%);
  border-radius: 1.5px;
  transition: width 0.3s ease;
}

.media-preview-container {
  position: absolute;
  top: calc(env(safe-area-inset-top, 0) + 88px);
  left: 0;
  right: 0;
  bottom: calc(56px + 70px + env(safe-area-inset-bottom, 0));
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.media-preview-content {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: -10px;
}

.media-preview-content img,
.media-preview-content video,
.media-preview-content audio {
  display: block;
  width: 100%;
  height: auto;
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.media-preview-content .text-viewer {
  width: 100%;
  max-width: 90%;
  max-height: 100%;
  overflow: auto;
  background: rgba(30, 30, 30, 0.9);
  border-radius: 8px;
  padding: 20px;
  margin: 0 auto;
}

.media-preview-content .text-viewer pre {
  margin: 0;
  padding: 0;
  color: #c9d1d9;
  font-size: 13px;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-all;
}

.media-preview-content .text-viewer .code-content {
  background: transparent !important;
}

.media-thumbnails {
  position: absolute;
  bottom: calc(70px + env(safe-area-inset-bottom, 0));
  left: 0;
  right: 0;
  height: 56px;
  display: flex;
  justify-content: center;
  z-index: 1101;
  pointer-events: auto;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-top: 0.5px solid rgba(255, 255, 255, 0.1);
  padding-top: 8px;
  box-sizing: border-box;
}

.thumb-list {
  display: flex;
  gap: 4px;
  overflow-x: auto;
  padding: 0 12px;
  scrollbar-width: none;
  align-items: center;
}

.thumb-list::-webkit-scrollbar {
  display: none;
}

.thumb-item {
  width: 32px;
  height: 32px;
  border-radius: 2px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid transparent;
  flex: 0 0 auto;
  cursor: pointer;
  transition: all 0.2s ease;
  opacity: 0.7;
}

.thumb-item.active {
  border-color: #007AFF;
  opacity: 1;
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(0, 122, 255, 0.3);
}

.thumb-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.thumb-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
}

.thumb-icon {
  font-size: 16px;
  opacity: 0.7;
}

.media-toolbar {
  position: absolute;
  bottom: env(safe-area-inset-bottom, 0);
  left: 0;
  right: 0;
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1102;
  pointer-events: auto;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-top: 0.5px solid rgba(255, 255, 255, 0.1);
  box-sizing: border-box;
}

.toolbar-buttons {
  display: flex;
  width: 100%;
  max-width: 500px;
  justify-content: space-around;
  align-items: center;
  padding: 0 20px;
}

.toolbar-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  color: white;
  cursor: pointer;
  padding: 8px 12px;
  min-width: 60px;
  transition: all 0.2s ease;
  opacity: 0.8;
}

.toolbar-btn.disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.toolbar-icon {
  font-size: 20px;
  margin-bottom: 4px;
}

.download-progress-details {
  position: absolute;
  bottom: 60px;
  left: 50%;
  transform: translateX(-50%);
  width: 80%;
  max-width: 400px;
  background: rgba(0, 0, 0, 0.8);
  border-radius: 12px;
  padding: 12px 16px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  z-index: 1002;
}

.download-progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.9);
}

.download-progress-text {
  font-weight: 500;
}

.download-progress-size {
  color: rgba(255, 255, 255, 0.7);
  font-family: monospace;
}

.media-loading {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  color: white;
  z-index: 1100;
}

.media-spinner {
  width: 36px;
  height: 36px;
  border: 3px solid rgba(255, 255, 255, 0.2);
  border-top: 3px solid #007AFF;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 12px;
}

.media-loading-text {
  font-size: 15px;
  font-weight: 400;
  opacity: 0.8;
}

.media-loading-progress {
  font-size: 15px;
  font-weight: 500;
  margin-bottom: 4px;
  color: #007AFF;
}

.media-loading-size {
  font-size: 13px;
  font-weight: 400;
  opacity: 0.7;
  font-family: monospace;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.details-modal {
  position: fixed;
  inset: 0;
  z-index: 2001;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.details-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
}

.details-panel {
  position: relative;
  background: white;
  width: 100%;
  max-width: 600px;
  max-height: 85vh;
  overflow: hidden;
  border-radius: 20px 20px 0 0;
  z-index: 2002;
  box-shadow: 0 -10px 40px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
}

.details-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
  background: white;
  position: sticky;
  top: 0;
  z-index: 10;
}

.details-header h3 {
  font-size: 17px;
  font-weight: 600;
  color: #000;
  margin: 0;
}

.details-close-btn {
  background: none;
  border: none;
  color: #007AFF;
  font-size: 17px;
  font-weight: 500;
  padding: 8px 12px;
  cursor: pointer;
}

.details-body {
  flex: 1;
  overflow-y: auto;
  padding: 0;
}

.details-loading,
.details-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
}

.details-content {
  padding: 0;
}

.details-section {
  padding: 20px;
  border-bottom: 1px solid #f0f0f0;
}

.section-content {
  font-size: 12px;
  color: #000;
  flex: 1;
}

.time-display,
.filename-display {
  font-size: 12px;
  font-weight: 400;
  color: #000;
}

.exif-info {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.exif-row {
  display: flex;
  justify-content: space-between;
  gap: 20px;
}

.exif-item {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 10px;
}

.exif-label {
  font-size: 12px;
  color: #8e8e93;
  flex-shrink: 0;
}

.exif-value {
  font-size: 10px;
  color: #000;
  font-weight: 400;
  word-break: break-word;
  flex: 1;
}

.location-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.location-address {
  font-size: 10px;
  color: #000;
  line-height: 1.4;
}

.location-map {
  height: 180px;
  background: #f8f8f8;
  border-radius: 12px;
  overflow: hidden;
}
</style>
