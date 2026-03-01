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
                    <div class="exif-label">图片格式</div>
                    <div class="exif-value">{{ getImageFormat(fileInfo) }}</div>
                  </div>
                </div>
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
                    <div class="exif-label">图片尺寸</div>
                    <div class="exif-value">{{ formatImageDimensions(fileInfo) }}</div>
                  </div>
                  <div class="exif-item">
                    <div class="exif-label">文件大小</div>
                    <div class="exif-value">{{ formatFileSize(fileInfo?.size) }}</div>
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
              </div>
            </div>
            <div class="details-section" v-if="hasLocation(fileInfo)">
              <div class="section-content location-info">
                <div class="location-coordinates">
                  <span class="coord-label">坐标：</span>
                  <span class="coord-value">{{ formatCoordinates(fileInfo) }}</span>
                </div>
                <div class="location-map" ref="mapContainer">
                  <div class="map-placeholder">
                    <div class="map-icon">🗺️</div>
                    <p>地图加载中...</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { FileSizeFormatter, DateFormatter } from './lib/helpers.js'
import { createPreviewMap } from './lib/preview.js'

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

const emit = defineEmits(['update:modelValue'])

const isOpen = computed(() => props.modelValue)

const previewMap = createPreviewMap()
const mapVersion = ref(0)

function mapSet(offset, item) {
  previewMap.set(offset, item)
  mapVersion.value++
}

function mapClear() {
  previewMap.clear()
  mapVersion.value++
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

const THUMB_RANGE = 15

function formatSize(b) {
  return FileSizeFormatter.format(b)
}

const currentFile = computed(() => {
  mapVersion.value
  return previewMap.get(props.totalCount, currentOffset.value)
})

const thumbList = computed(() => {
  mapVersion.value
  const start = Math.max(0, currentOffset.value - THUMB_RANGE)
  const end = Math.min(props.totalCount - 1, currentOffset.value + THUMB_RANGE)
  const list = []
  for (let o = start; o <= end; o++) {
    const item = previewMap.get(props.totalCount, o)
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

function getExifValue(exifData, key) {
  if (!exifData || !exifData[key]) return null
  const valueObj = exifData[key]
  if (valueObj.numberValue !== undefined && valueObj.numberValue !== null) return valueObj.numberValue
  if (valueObj.stringValue !== undefined && valueObj.stringValue !== null) {
    const str = valueObj.stringValue
    return str.replace(/^["']|["']$/g, '')
  }
  return null
}

function formatDateTime(dateStr) {
  if (!dateStr) return '未知时间'
  try {
    const date = new Date(dateStr)
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  } catch (e) {
    return dateStr
  }
}

function getCaptureTime(fileInfoObj) {
  if (!fileInfoObj) return null
  if (fileInfoObj.exifData) {
    const dateTimeOriginal = getExifValue(fileInfoObj.exifData, 'DateTimeOriginal')
    const createDate = getExifValue(fileInfoObj.exifData, 'CreateDate')
    const modifyDate = getExifValue(fileInfoObj.exifData, 'ModifyDate')
    const parsedDateTime = getExifValue(fileInfoObj.exifData, 'ParsedDateTime')
    return parsedDateTime || dateTimeOriginal || createDate || modifyDate
  }
  return fileInfoObj.mtime || fileInfoObj.modTime || fileInfoObj.lastModified
}

function getExifModel(fileInfoObj) {
  if (!fileInfoObj) return null
  if (fileInfoObj.exifData) {
    return getExifValue(fileInfoObj.exifData, 'Model') || getExifValue(fileInfoObj.exifData, 'Make')
  }
  return fileInfoObj.Model || fileInfoObj.Make
}

function getExifFocalLength(fileInfoObj) {
  if (!fileInfoObj) return null
  if (fileInfoObj.exifData) return getExifValue(fileInfoObj.exifData, 'FocalLength')
  return fileInfoObj.FocalLength
}

function getExifFNumber(fileInfoObj) {
  if (!fileInfoObj) return null
  if (fileInfoObj.exifData) return getExifValue(fileInfoObj.exifData, 'FNumber')
  return fileInfoObj.FNumber
}

function getExifISO(fileInfoObj) {
  if (!fileInfoObj) return null
  if (fileInfoObj.exifData) {
    return getExifValue(fileInfoObj.exifData, 'ISOSpeedRatings') || getExifValue(fileInfoObj.exifData, 'ISO')
  }
  return fileInfoObj.ISO || fileInfoObj.ISOSpeedRatings
}

function getExifExposureTime(fileInfoObj) {
  if (!fileInfoObj) return null
  if (fileInfoObj.exifData) return getExifValue(fileInfoObj.exifData, 'ExposureTime')
  return fileInfoObj.ExposureTime
}

function getImageFormat(fileInfoObj) {
  if (!fileInfoObj) return '未知格式'
  if (fileInfoObj.exifData) {
    const mimeType = getExifValue(fileInfoObj.exifData, 'MIMEType')
    if (mimeType) return mimeType.split('/')[1]?.toUpperCase() || '未知格式'
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
    width = getExifValue(fileInfoObj.exifData, 'ImageWidth') || getExifValue(fileInfoObj.exifData, 'PixelXDimension')
    height = getExifValue(fileInfoObj.exifData, 'ImageHeight') || getExifValue(fileInfoObj.exifData, 'PixelYDimension')
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

function hasLocation(fileInfoObj) {
  if (!fileInfoObj) return false
  if (fileInfoObj.exifData) {
    const lat = getExifValue(fileInfoObj.exifData, 'GPSLatitude')
    const lon = getExifValue(fileInfoObj.exifData, 'GPSLongitude')
    if (lat && lon) return true
  }
  return !!(fileInfoObj.GPSLatitude || fileInfoObj.gpsLatitude || fileInfoObj.GPSLongitude || fileInfoObj.gpsLongitude)
}

function formatCoordinates(fileInfoObj) {
  if (!fileInfoObj) return '未知位置'
  let lat = fileInfoObj.GPSLatitude || fileInfoObj.gpsLatitude
  let lon = fileInfoObj.GPSLongitude || fileInfoObj.gpsLongitude
  if (fileInfoObj.exifData) {
    lat = lat || getExifValue(fileInfoObj.exifData, 'GPSLatitude')
    lon = lon || getExifValue(fileInfoObj.exifData, 'GPSLongitude')
  }
  if (lat && lon) return `${lat}, ${lon}`
  return '未知位置'
}

function close() {
  emit('update:modelValue', false)
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
        fileInfo.value = await props.fileApi.getFileInfo(path)
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
}

async function ensureItemsAround(offset) {
  const start = Math.max(0, offset - THUMB_RANGE)
  const count = Math.min(props.totalCount - start, THUMB_RANGE * 2 + 1)
  if (count <= 0) return
  const existing = previewMap.hasRange(start, count)
  if (existing.every(Boolean)) return
  try {
    const items = await props.fetchNearby(start, count)
    if (Array.isArray(items)) {
      items.forEach((item, i) => {
        const o = start + i
        if (o < props.totalCount) {
          mapSet(o, normalizeItem(item))
        }
      })
      for (let o = start; o < start + (items?.length ?? 0); o++) {
        loadThumbnailForOffset(o)
      }
    }
  } catch (e) {
    console.error('Preview fetchNearby error', e)
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

/** 当项为图片/视频且无缩略图时，用 fileApi 加载缩略图并更新 map（供 Files 列表视图等未预加载 thumb 的场景） */
function loadThumbnailForOffset(offset) {
  const item = previewMap.get(props.totalCount, offset)
  if (!item || item.thumbnailUrl) return
  if (item.type !== '图片' && item.type !== '视频') return
  const path = item.path || item.filepath
  if (!path) return
  props.fileApi.getFileThumbnailUrl(path).then((url) => {
    if (url) {
      mapSet(offset, { ...item, thumbnailUrl: url })
    }
  }).catch(() => {})
}

async function loadMediaAtOffset(offset) {
  await ensureItemsAround(offset)
  const file = previewMap.get(props.totalCount, offset)
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

  try {
    fileInfoLoading.value = true
    try {
      fileInfo.value = await props.fileApi.getFileInfo(path)
    } catch (e) {
      fileInfo.value = null
    } finally {
      fileInfoLoading.value = false
    }

    const progressCallback = (progressData) => {
      downloadProgress.value = progressData
      downloadProgressVisible.value = true
      if (progressData.isCompleted) {
        setTimeout(() => {
          downloadProgressVisible.value = false
        }, 500)
      }
    }

    if (file.type === '文本') {
      const url = await props.fileApi.getFileUrl(path, null, progressCallback)
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
      const url = await props.fileApi.getFileUrl(path, null, progressCallback)
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
    if (visible) {
      mapClear()
      const items = props.initialItems || []
      items.forEach((item, i) => {
        const offset = item.offset ?? props.initialOffset - Math.floor(items.length / 2) + i
        if (offset >= 0 && offset < props.totalCount) {
          mapSet(offset, normalizeItem(item))
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
    }
  }
)
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

.location-coordinates {
  font-size: 10px;
  color: #000;
}

.location-map {
  height: 180px;
  background: #f8f8f8;
  border-radius: 12px;
  overflow: hidden;
}

.map-placeholder {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #8e8e93;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #007AFF;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
}
</style>
