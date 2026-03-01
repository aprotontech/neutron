<template>
  <div class="image-gallery" :class="{ 'android-native-app': isAndroidApp }">
    <!-- 顶部工具栏（移动设备显示） -->
    <div class="gallery-tools mobile-only" v-if="!isViewingMedia" @click.stop>
      <div class="dropdown">
        <button class="menu-btn" @click.stop="toggleMenu">⋮</button>
        <div class="menu" v-if="menuOpen">
          <button 
            class="menu-item" 
            :class="{ disabled: false }"
            @click="setSortOrder('mtime')"
          >
            <span class="menu-check" aria-hidden="true">{{ sortOrder === 'mtime' ? '✓' : '' }}</span>
            按最近添加排序
          </button>
          <button 
            class="menu-item" 
            :class="{ disabled: !allHistorySynced }"
            @click="setSortOrder('etime')"
          >
            <span class="menu-check" aria-hidden="true">{{ sortOrder === 'etime' ? '✓' : '' }}</span>
            按拍摄日期排序
          </button>
          <button class="menu-item" @click="setFilter('images')">
            <span class="menu-check" aria-hidden="true">{{ filterType === 'images' ? '✓' : '' }}</span>
            只显示图片
          </button>
          <button class="menu-item" @click="setFilter('videos')">
            <span class="menu-check" aria-hidden="true">{{ filterType === 'videos' ? '✓' : '' }}</span>
            只显示视频
          </button>
        </div>
      </div>
    </div>
    
    <!-- 图库内容 -->
    <div class="gallery-content" ref="scrollContainer">
      <!-- 图片网格 -->
          <div class="image-grid">
            <div 
              v-for="(image, index) in images" 
              :key="image.id" 
              class="image-grid-item"
              :ref="el => observeEl(el, index)"
              @click="handleImageClick(image)"
              v-show="matchesFilter(image)"
            >
          <div class="image-thumbnail">
            <img 
              v-if="image.thumbnailUrl" 
              :src="image.thumbnailUrl" 
              :alt="image.name"
              loading="lazy"
              decoding="async"
              fetchpriority="low"
              @load="image.loaded = true"
            />
            <div v-else class="image-placeholder">
              <span class="image-icon">{{ image.type === '视频' ? '🎬' : '🖼️' }}</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 加载更多指示器 -->
      <div v-if="loading" class="loading-more">
        <div class="loading-spinner"></div>
        <span>加载中...</span>
      </div>
      
      <div v-if="!hasMore && images.length > 0" class="no-more">
        没有更多图片了
      </div>

      <!-- spacer 用于根据 total 预填充滚动条 -->
      <div :style="{ height: spacerHeight + 'px' }"></div>
    </div>

    <!-- iOS风格媒体预览组件 -->
    <div 
      class="media-viewer" 
      :class="{ active: isViewingMedia }"
      @touchstart="mediaTouchStart"
      @touchmove="mediaTouchMove"
      @touchend="mediaTouchEnd"
      @click="handleBackgroundClick"
    >
      <!-- 第一部分：顶部工具栏 -->
      <div class="media-topbar" v-if="currentMediaFile">
        <button class="media-back" @click.stop="closeMediaViewer">←</button>
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
            v-if="currentMediaFile?.type === '图片' && !isMediaLoading" 
            :src="currentMediaUrl" 
            :alt="currentMediaFile?.name" 
            @click.stop
          />
          
          <video 
            v-else-if="currentMediaFile?.type === '视频' && !isMediaLoading" 
            :src="currentMediaUrl" 
            controls 
            autoplay
            @click.stop
          ></video>
        </div>
      </div>
      
      <!-- 第四部分：缩略图区域 -->
      <div class="media-thumbnails" v-if="imageFiles.length > 0 && isViewingMedia">
        <div class="thumb-list" ref="thumbsContainer">
          <div 
            v-for="(it, idx) in imageFiles" 
            :key="it.path + '-' + idx" 
            :class="['thumb-item', { active: idx === currentMediaIndex } ]"
            @click.stop="jumpToIndex(idx)"
          >
            <img v-if="it.thumbnailUrl" :src="it.thumbnailUrl" :alt="it.name" />
            <div v-else class="thumb-placeholder">
              <span class="thumb-icon">{{ it.type === '视频' ? '🎬' : '🖼️' }}</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 第五部分：底部工具按钮区域 -->
      <div class="media-toolbar" v-if="isViewingMedia">
        <div class="toolbar-buttons">
          <!-- 左侧：分享按钮（禁用） -->
          <button class="toolbar-btn disabled" title="分享">
            <span class="toolbar-icon">↗️</span>
          </button>
          
          <!-- 中间：收藏按钮（禁用） -->
          <button class="toolbar-btn disabled" title="收藏">
            <span class="toolbar-icon">⭐</span>
          </button>
          
          <!-- 中间：详情按钮 -->
          <button class="toolbar-btn" @click="openDetailsModal" title="详细信息">
            <span class="toolbar-icon">ℹ️</span>
          </button>
          
          <!-- 右侧：删除按钮（禁用） -->
          <button class="toolbar-btn disabled" title="删除">
            <span class="toolbar-icon">🗑️</span>
          </button>
        </div>
      </div>
      
      <!-- 详细进度信息（仅在需要时显示） -->
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
              <!-- 第一区块：拍摄时间 -->
              <div class="details-section">
                <div class="section-content">
                  <div class="time-display">{{ formatDateTime(getCaptureTime(fileInfo) || currentMediaFile?.mtime) }}</div>
                </div>
              </div>
              
              <!-- 第二区块：文件名 -->
              <div class="details-section">
                <div class="section-content">
                  <div class="filename-display">{{ currentMediaFile?.name || '未知文件' }}</div>
                </div>
              </div>
              
              <!-- 第三区块：Exif信息 -->
              <div class="details-section">
                <div class="section-content exif-info">
                  <!-- 第一行：拍摄设备和图片格式 -->
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
                  
                  <!-- 第二行：焦距和光圈 -->
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
                  
                  <!-- 第三行：图片尺寸和文件大小 -->
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
                  
                  <!-- 第四行：ISO、焦距、光圈、快门时间 -->
                  <div class="exif-row">
                    <div class="exif-item">
                      <div class="exif-label">ISO</div>
                      <div class="exif-value">{{ getExifISO(fileInfo) || '--' }}</div>
                    </div>
                    <div class="exif-item">
                      <div class="exif-label">焦距</div>
                      <div class="exif-value">{{ formatFocalLength(getExifFocalLength(fileInfo)) }}</div>
                    </div>
                    <div class="exif-item">
                      <div class="exif-label">光圈</div>
                      <div class="exif-value">{{ formatAperture(getExifFNumber(fileInfo)) }}</div>
                    </div>
                    <div class="exif-item">
                      <div class="exif-label">快门</div>
                      <div class="exif-value">{{ formatShutterSpeed(getExifExposureTime(fileInfo)) }}</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- 第四区块：拍摄位置 -->
              <div class="details-section" v-if="hasLocation(fileInfo)">
                <div class="section-content location-info">
                  <div class="location-coordinates">
                    <span class="coord-label">坐标：</span>
                    <span class="coord-value">{{ formatCoordinates(fileInfo) }}</span>
                  </div>
                  <div class="location-map" ref="mapContainer">
                    <!-- 高德地图将在这里显示 -->
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

    <!-- 空状态 -->
    <div v-if="!loading && images.length === 0" class="empty-state">
      <div class="empty-icon">🖼️</div>
      <h3>暂无图片</h3>
      <p>图库中还没有图片，请上传或同步图片</p>
      <button class="empty-action-btn" @click="refreshGallery">
        刷新图库
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, nextTick } from 'vue'
import { Capacitor } from '@capacitor/core'
import FileAPI from './lib/file-api.js'
import { FileTypeDetector, FileSizeFormatter, DateFormatter } from './lib/helpers.js'

// --- 简化后的实现，专注于：分页列表、IntersectionObserver 缩略图预加载、预览下滑关闭 ---

const isAndroidApp = ref(false)
const fileAPI = new FileAPI()

const scrollContainer = ref(null)
const images = ref([])
const totalImages = ref(0)
const loading = ref(false)
const hasMore = ref(true)
const currentOffset = ref(0)
const pageSize = 30

const intersectionObserver = ref(null)
const observedElements = new Map()

// menu / filter state (mobile)
const menuOpen = ref(false)
const filterType = ref('all') // 'all' | 'images' | 'videos'

// 排序状态
const sortOrder = ref('mtime') // 'mtime' | 'etime' - 默认按最近添加排序
const allHistorySynced = ref(false) // 是否所有历史记录已同步

function toggleMenu() { menuOpen.value = !menuOpen.value }
function setFilter(val) {
  if (filterType.value === val) filterType.value = 'all'
  else filterType.value = val
  menuOpen.value = false
}

// 设置排序方式
function setSortOrder(order) {
  if (order === 'etime' && !allHistorySynced.value) {
    // 如果按拍摄日期排序但历史记录未完全同步，不允许切换
    console.log('Cannot switch to etime sort: history not fully synced');
    return;
  }
  sortOrder.value = order;
  menuOpen.value = false;
  // 重新加载图片
  refreshGallery();
}

// 文件大小格式化函数
function formatSize(b) { return FileSizeFormatter.format(b) }

function matchesFilter(image) {
  if (!filterType.value || filterType.value === 'all') return true
  if (filterType.value === 'images') return image.type === '图片'
  if (filterType.value === 'videos') return image.type === '视频'
  return true
}

// Preview state
const isViewingMedia = ref(false)
const currentMediaFile = ref(null)
const currentMediaUrl = ref('')
const isMediaLoading = ref(false)
const imageFiles = ref([])
const currentMediaIndex = ref(-1)
const viewerMenuOpen = ref(false)
const showDetailsModal = ref(false)
const fileInfo = ref(null)
const fileInfoLoading = ref(false)
const slideX = ref(0)
const mediaWidth = ref('100%')
const thumbsContainer = ref(null)

// touch state for swipe-down-to-close
const touchStartY = ref(0)
const touchStartX = ref(0)
const slideOffset = ref(0)
const slideOpacity = ref(1)
const itemTouchStartX = ref(0)
const itemTouchStartY = ref(0)
const itemIsDragging = ref(false)
const lastTouchHandledAt = ref(0)
const lastTouchDx = ref(0)

// 下载进度相关
const downloadProgress = ref(null)
const downloadProgressTimer = ref(null)
const downloadProgressVisible = ref(false)

// layout estimation for scrollbar prefill
const itemHeight = 100 // 与样式中一致（调整为更紧凑的 iOS 风格）
const columns = ref(1)

const spacerHeight = computed(() => {
  const remaining = Math.max(0, (totalImages.value || 0) - images.value.length)
  const cols = Math.max(1, columns.value)
  const rows = Math.ceil(remaining / cols)
  return rows * itemHeight
})

function getFileType(filename) {
  if (FileTypeDetector.isImage(filename)) return '图片'
  if (FileTypeDetector.isVideo(filename)) return '视频'
  return '文件'
}

function updateColumns() {
  if (!scrollContainer.value) return
  const width = scrollContainer.value.clientWidth || window.innerWidth
  const colWidth = 120 // min item width from CSS
  columns.value = Math.max(1, Math.floor(width / colWidth))
}

function initObserver() {
  if (intersectionObserver.value) intersectionObserver.value.disconnect()

  intersectionObserver.value = new IntersectionObserver(handleIntersection, {
    root: scrollContainer.value,
    rootMargin: '200px',
    threshold: 0.1
  })
}

function handleIntersection(entries) {
  entries.forEach(entry => {
    const el = entry.target
    const idx = parseInt(el.dataset.index, 10)
    if (!Number.isFinite(idx)) return

    if (entry.isIntersecting) {
      // load thumbnail for visible items
      const img = images.value[idx]
      if (img && !img.thumbnailUrl && !img.loadingThumbnail) {
        loadThumbnail(img, idx)
      }

      // if last item visible, load next page
      if (idx === images.value.length - 1 && !loading.value && hasMore.value) {
        loadImages(currentOffset.value)
      }
    }
  })
}

function observeEl(el, idx) {
  if (!el) return
  el.dataset.index = String(idx)
  // always cache element; observer may be initialized later
  observedElements.set(idx, el)
  if (intersectionObserver.value) {
    intersectionObserver.value.observe(el)
  }
}

async function loadImages(offset = 0) {
  if (loading.value) return
  loading.value = true
  try {
    const res = await fileAPI.getImageRepo(offset, pageSize, sortOrder.value)
    if (!res) return

    const items = res.items || []
    const mapped = items.map((it, i) => {
      const path = typeof it === 'string' ? it : (it.file_path || it)
      const name = (path || '').split('/').pop() || '未命名'
      return {
        id: offset + i,
        path,
        name,
        type: getFileType(name),
        thumbnailUrl: null,
        loadingThumbnail: false
      }
    })

    if (offset === 0) images.value = mapped
    else images.value = images.value.concat(mapped)

    totalImages.value = res.total || totalImages.value || 0
    currentOffset.value = images.value.length
    hasMore.value = currentOffset.value < totalImages.value

    // 检查是否所有历史记录已同步
    allHistorySynced.value = fileAPI.isImageRepoSyncFinished();

    // ensure observer is ready after DOM updated
    await nextTick()
    if (!intersectionObserver.value) initObserver()
    // attach observer to rendered nodes
    attachObservers()
  } catch (e) {
    console.error('loadImages error', e)
  } finally {
    loading.value = false
  }
}

function attachObservers() {
  const container = scrollContainer.value
  if (!container || !intersectionObserver.value) return
  const nodes = container.querySelectorAll('.image-grid-item')
  nodes.forEach((n, i) => {
    n.dataset.index = String(i)
    intersectionObserver.value.observe(n)
    observedElements.set(i, n)
  })
}

async function loadThumbnail(item, idx) {
  if (!item || item.loadingThumbnail || item.thumbnailUrl) return
  images.value[idx].loadingThumbnail = true
  try {
    const url = await fileAPI.getFileThumbnailUrl(item.path, 200)
    if (url) images.value[idx].thumbnailUrl = url
  } catch (e) {
    // ignore thumbnail load failures
  } finally {
    images.value[idx].loadingThumbnail = false
  }
}

function handleImageClick(file) {
  // prevent duplicate click fired after touchend handled the tap
  const now = Date.now()
  if (lastTouchHandledAt.value && (now - lastTouchHandledAt.value) < 600) {
    // recent touch already handled the tap
    lastTouchHandledAt.value = 0
    return
  }
  openMediaViewer(file)
}

async function openMediaViewer(file) {
  currentMediaFile.value = file
  isViewingMedia.value = true
  imageFiles.value = images.value.filter(f => f.type === '图片' || f.type === '视频')
  currentMediaIndex.value = imageFiles.value.findIndex(f => f.path === file.path)
  try {
    isMediaLoading.value = await fileAPI.getFileLocalCachedUrl(file.path) ? false : true
    // fetch file info for metadata display
    try {
      fileInfoLoading.value = true
      fileInfo.value = await fileAPI.getFileInfo(file.path)
    } catch (e) {
      fileInfo.value = null
    } finally {
      fileInfoLoading.value = false
    }

    // 重置进度
    downloadProgress.value = null;
    downloadProgressVisible.value = false;
    
    // 创建进度回调函数
    const progressCallback = (progressData) => {
      downloadProgress.value = progressData;
      downloadProgressVisible.value = true;
      
      // 如果下载完成，3秒后隐藏进度条
      if (progressData.isCompleted) {
        if (downloadProgressTimer.value) {
          clearTimeout(downloadProgressTimer.value);
        }
        downloadProgressTimer.value = setTimeout(() => {
          downloadProgressVisible.value = false;
        }, 500);
      }
    };
    
    currentMediaUrl.value = await fileAPI.getFileUrl(file.path, null, progressCallback)
    if (file.type === '图片') {
      const img = new Image()
      img.onload = () => { isMediaLoading.value = false }
      img.onerror = () => { isMediaLoading.value = false }
      img.src = currentMediaUrl.value
    } else {
      isMediaLoading.value = false
    }
    // ensure thumbnails center on current
    await nextTick()
    centerThumbOnIndex(currentMediaIndex.value)
  } catch (e) {
    console.error('openMediaViewer error', e)
    isMediaLoading.value = false
  }
}

function toggleViewerMenu() { viewerMenuOpen.value = !viewerMenuOpen.value }

async function openDetailsModal() {
  viewerMenuOpen.value = false
  showDetailsModal.value = true
  if (currentMediaFile.value) {
    fileInfoLoading.value = true
    try {
      const fileinfo = await fileAPI.getFileInfo(currentMediaFile.value.path)
      console.log(fileinfo)
      if (fileinfo) {   
        fileInfo.value = fileinfo
      }
    } catch (e) {
      fileInfo.value = null
    } finally {
      fileInfoLoading.value = false
    }
  }
}

function closeDetailsModal() { showDetailsModal.value = false }

// 详情对话框辅助函数
// 从Value对象中提取值
function getExifValue(exifData, key) {
  if (!exifData || !exifData[key]) return null
  const valueObj = exifData[key]
  if (valueObj.numberValue !== undefined && valueObj.numberValue !== null) return valueObj.numberValue
  if (valueObj.stringValue !== undefined && valueObj.stringValue !== null) {
    // 去除字符串值的引号
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

// 从fileInfo中获取拍摄时间
function getCaptureTime(fileInfo) {
  if (!fileInfo) return null
  
  // 优先从exifData中获取
  if (fileInfo.exifData) {
    const dateTimeOriginal = getExifValue(fileInfo.exifData, 'DateTimeOriginal')
    const createDate = getExifValue(fileInfo.exifData, 'CreateDate')
    const modifyDate = getExifValue(fileInfo.exifData, 'ModifyDate')
    const parsedDateTime = getExifValue(fileInfo.exifData, 'ParsedDateTime')
    
    return parsedDateTime || dateTimeOriginal || createDate || modifyDate
  }
  
  // 回退到fileInfo的其他字段
  return fileInfo.mtime || fileInfo.modTime || fileInfo.lastModified
}

// 从fileInfo中获取EXIF值的辅助函数
function getExifModel(fileInfo) {
  if (!fileInfo) return null
  if (fileInfo.exifData) {
    return getExifValue(fileInfo.exifData, 'Model') || getExifValue(fileInfo.exifData, 'Make')
  }
  return fileInfo.Model || fileInfo.Make
}

function getExifFocalLength(fileInfo) {
  if (!fileInfo) return null
  if (fileInfo.exifData) {
    return getExifValue(fileInfo.exifData, 'FocalLength')
  }
  return fileInfo.FocalLength
}

function getExifFNumber(fileInfo) {
  if (!fileInfo) return null
  if (fileInfo.exifData) {
    return getExifValue(fileInfo.exifData, 'FNumber')
  }
  return fileInfo.FNumber
}

function getExifISO(fileInfo) {
  if (!fileInfo) return null
  if (fileInfo.exifData) {
    return getExifValue(fileInfo.exifData, 'ISOSpeedRatings') || getExifValue(fileInfo.exifData, 'ISO')
  }
  return fileInfo.ISO || fileInfo.ISOSpeedRatings
}

function getExifExposureTime(fileInfo) {
  if (!fileInfo) return null
  if (fileInfo.exifData) {
    return getExifValue(fileInfo.exifData, 'ExposureTime')
  }
  return fileInfo.ExposureTime
}

function getImageFormat(fileInfo) {
  if (!fileInfo) return '未知格式'
  
  // 从exifData中获取MIME类型
  if (fileInfo.exifData) {
    const mimeType = getExifValue(fileInfo.exifData, 'MIMEType')
    if (mimeType) {
      return mimeType.split('/')[1]?.toUpperCase() || '未知格式'
    }
  }
  
  // 从fileInfo直接获取
  if (fileInfo.MIMEType) {
    return fileInfo.MIMEType.split('/')[1]?.toUpperCase() || '未知格式'
  }
  
  // 从文件名推断
  if (currentMediaFile.value?.name) {
    const ext = currentMediaFile.value.name.split('.').pop()?.toLowerCase()
    if (ext === 'jpg' || ext === 'jpeg') return 'JPEG'
    if (ext === 'png') return 'PNG'
    if (ext === 'gif') return 'GIF'
    if (ext === 'heic') return 'HEIC'
    if (ext === 'webp') return 'WebP'
  }
  return '未知格式'
}

function formatFocalLength(focalLength) {
  if (!focalLength) return '--'
  if (typeof focalLength === 'string') {
    if (focalLength.includes('mm')) return focalLength
    return `${focalLength}mm`
  }
  if (typeof focalLength === 'number') {
    return `${focalLength}mm`
  }
  return '--'
}

function formatAperture(fNumber) {
  if (!fNumber) return '--'
  if (typeof fNumber === 'string') {
    if (fNumber.startsWith('f/')) return fNumber
    return `f/${fNumber}`
  }
  if (typeof fNumber === 'number') {
    return `f/${fNumber}`
  }
  return '--'
}

function formatImageDimensions(fileInfo) {
  if (!fileInfo) return '--'
  
  let width, height
  
  // 从exifData中获取
  if (fileInfo.exifData) {
    width = getExifValue(fileInfo.exifData, 'ImageWidth') || getExifValue(fileInfo.exifData, 'PixelXDimension')
    height = getExifValue(fileInfo.exifData, 'ImageHeight') || getExifValue(fileInfo.exifData, 'PixelYDimension')
  }
  
  // 从fileInfo直接获取
  if (!width) width = fileInfo.ImageWidth || fileInfo.PixelXDimension
  if (!height) height = fileInfo.ImageHeight || fileInfo.PixelYDimension
  
  if (width && height) {
    return `${width} × ${height}`
  }
  return '--'
}

function formatFileSize(size) {
  if (!size) return '--'
  return FileSizeFormatter.format(size)
}

function formatShutterSpeed(exposureTime) {
  if (!exposureTime) return '--'
  if (typeof exposureTime === 'string') {
    return exposureTime
  }
  if (typeof exposureTime === 'number') {
    if (exposureTime >= 1) {
      return `${exposureTime}s`
    } else {
      return `1/${Math.round(1/exposureTime)}s`
    }
  }
  return '--'
}

function hasLocation(fileInfo) {
  if (!fileInfo) return false
  
  // 从exifData中检查GPS信息
  if (fileInfo.exifData) {
    const lat = getExifValue(fileInfo.exifData, 'GPSLatitude')
    const lon = getExifValue(fileInfo.exifData, 'GPSLongitude')
    if (lat && lon) return true
  }
  
  // 从fileInfo直接检查
  return fileInfo && (fileInfo.GPSLatitude || fileInfo.gpsLatitude || fileInfo.GPSLongitude || fileInfo.gpsLongitude)
}

function formatCoordinates(fileInfo) {
  if (!fileInfo) return '未知位置'
  
  let lat, lon
  
  // 从exifData中获取
  if (fileInfo.exifData) {
    lat = getExifValue(fileInfo.exifData, 'GPSLatitude')
    lon = getExifValue(fileInfo.exifData, 'GPSLongitude')
  }
  
  // 从fileInfo直接获取
  if (!lat) lat = fileInfo.GPSLatitude || fileInfo.gpsLatitude
  if (!lon) lon = fileInfo.GPSLongitude || fileInfo.gpsLongitude
  
  if (lat && lon) {
  }
  return '未知位置'
}

function jumpToIndex(idx) {
  if (idx < 0 || idx >= imageFiles.value.length) return
  currentMediaIndex.value = idx
  const file = imageFiles.value[idx]
  openMediaViewer(file)
}

function centerThumbOnIndex(idx) {
  const cont = thumbsContainer.value
  if (!cont) return
  const items = cont.querySelectorAll('.thumb-item')
  const item = items[idx]
  if (!item) return
  const contW = cont.clientWidth
  const itemW = item.clientWidth
  const left = item.offsetLeft + itemW / 2 - contW / 2
  cont.scrollLeft = Math.max(0, left - 10)
  cont.scrollTo({ left, behavior: 'smooth' })
}

const formattedMediaTime = computed(() => {
  const info = fileInfo.value || {}
  const maybe = info.mtime || info.lastModified || info.DateTimeOriginal || info.date || info.created_at
  if (maybe) {
    
    try { return DateFormatter.format(maybe) } catch (e) { return String(maybe) }
  }
  return currentMediaFile.value?.name || ''
})

function closeMediaViewer() {
  isViewingMedia.value = false
  currentMediaFile.value = null
  currentMediaUrl.value = ''
  isMediaLoading.value = false
  currentMediaIndex.value = -1
  slideOffset.value = 0
  slideOpacity.value = 1
}

// touch handlers for swipe down to close
function mediaTouchStart(e) {
  if (!isViewingMedia.value) return
  const t = e.touches[0]
  touchStartY.value = t.clientY
  touchStartX.value = t.clientX
  itemTouchStartX.value = t.clientX
  itemTouchStartY.value = t.clientY
  lastTouchDx.value = 0
}

function mediaTouchMove(e) {
  if (!isViewingMedia.value) return
  const t = e.touches[0]
  const dy = t.clientY - touchStartY.value
  const dx = Math.abs(t.clientX - touchStartX.value)
  const rawDx = t.clientX - itemTouchStartX.value
  // if vertical movement larger -> vertical drag to close
  if (Math.abs(dy) > Math.abs(rawDx)) {
    e.preventDefault()
    slideOffset.value = dy
    const ratio = Math.min(Math.abs(dy) / 300, 1)
    slideOpacity.value = 1 - ratio * 0.6
  } else {
    // horizontal swipe to change media
    e.preventDefault()
    slideX.value = rawDx
    lastTouchDx.value = rawDx
  }
}

function mediaTouchEnd() {
  if (!isViewingMedia.value) return
  // horizontal swipe handling
  if (Math.abs(lastTouchDx.value) > 80) {
    if (lastTouchDx.value < 0) {
      // swipe left -> next
      const next = Math.min(imageFiles.value.length - 1, currentMediaIndex.value + 1)
      if (next !== currentMediaIndex.value) jumpToIndex(next)
    } else {
      // swipe right -> prev
      const prev = Math.max(0, currentMediaIndex.value - 1)
      if (prev !== currentMediaIndex.value) jumpToIndex(prev)
    }
  }

  // vertical swipe handling (close)
  if (Math.abs(slideOffset.value) > 120) {
    closeMediaViewer()
  } else {
    slideOffset.value = 0
    slideOpacity.value = 1
  }

  // reset horizontal slide animation
  slideX.value = 0
  lastTouchDx.value = 0
}

function handleBackgroundClick(e) {
  //if (e.target.classList && e.target.classList.contains('media-viewer')) closeMediaViewer()
}

function refreshGallery() {
  currentOffset.value = 0
  hasMore.value = true
  images.value = []
  allHistorySynced.value = false // 重置同步状态
  loadImages(0)
}

onMounted(() => {
  // close menu when clicking outside
  const onDocClick = () => { menuOpen.value = false }
  document.addEventListener('click', onDocClick)
  if (Capacitor.isNativePlatform && Capacitor.getPlatform && Capacitor.isNativePlatform()) {
    if (Capacitor.getPlatform() === 'android') {
      isAndroidApp.value = true
      // Android Native模式专用修复
      applyAndroidNativeFix()
    }
  }

  updateColumns()
  window.addEventListener('resize', updateColumns)

  // ensure template refs are populated before initializing observer
  nextTick(() => {
    initObserver()
    // if any elements were collected earlier, observe them now
    observedElements.forEach((el, idx) => {
      try {
        if (intersectionObserver.value && el) intersectionObserver.value.observe(el)
      } catch (e) {
        // ignore
      }
    })
    loadImages(0)
  })

  // cleanup doc click listener on unmount
  onUnmounted(() => {
    document.removeEventListener('click', onDocClick)
  })
})


// Android Native模式专用修复
function applyAndroidNativeFix() {
  // 确保滚动容器有正确的高度
  nextTick(() => {
    if (scrollContainer.value) {
      // 确保容器可以滚动
      scrollContainer.value.style.webkitOverflowScrolling = 'touch'
      scrollContainer.value.style.overflowY = 'auto'
      scrollContainer.value.style.overflowX = 'hidden'
      
      // 添加触摸事件监听器以确保滚动工作
      scrollContainer.value.addEventListener('touchstart', function(e) {
        // 允许默认的滚动行为
      }, { passive: true })
      
      scrollContainer.value.addEventListener('touchmove', function(e) {
        // 允许默认的滚动行为
      }, { passive: true })
      
      // 确保容器有正确的高度
      const galleryEl = document.querySelector('.image-gallery')
      if (galleryEl) {
        galleryEl.style.height = '100vh'
        galleryEl.style.display = 'flex'
        galleryEl.style.flexDirection = 'column'
      }
      
      // 强制重绘以确保样式生效
      scrollContainer.value.style.display = 'none'
      scrollContainer.value.offsetHeight // 触发重绘
      scrollContainer.value.style.display = ''
    }
    
    // 添加全局触摸事件监听器，确保滚动不被阻止
    document.addEventListener('touchmove', function(e) {
      // 允许所有触摸移动事件
    }, { passive: true })
  })
  
  // 简化点击事件处理
  const originalHandleImageClick = handleImageClick
  handleImageClick = function(file) {
    // 直接调用原始函数，不进行复杂的防抖检查
    lastTouchHandledAt.value = 0
    originalHandleImageClick.call(this, file)
  }
  
  // 确保body和html元素有正确的样式
  nextTick(() => {
    document.body.style.overflow = 'hidden'
    document.body.style.height = '100%'
    document.documentElement.style.overflow = 'hidden'
    document.documentElement.style.height = '100%'
  })
}


onUnmounted(() => {
  if (intersectionObserver.value) intersectionObserver.value.disconnect()
  window.removeEventListener('resize', updateColumns)
})
</script>

<style scoped>
.image-gallery {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #ffffff;
  /* 与Files.vue保持一致，确保Native模式下滚动正常 */
  /* 移除overflow: hidden，允许内部容器滚动 */
  position: relative;
  overscroll-behavior: contain;
  touch-action: pan-y;
  box-sizing: border-box;
  /* 确保在Android WebView中正确工作 */
  -webkit-overflow-scrolling: touch;
}

/* Native模式下特别优化 */
.image-gallery.android-native-app {
  /* App.vue 已处理状态栏安全区；移除根容器的额外 top padding
     以避免内容与状态栏之间出现多余间隔。 */
  padding-top: 0;
  height: 100%;
  -webkit-overflow-scrolling: touch;
  touch-action: pan-y;
}

/* 紫色状态栏已移至App.vue中统一管理 */

.gallery-tools {
  display: flex;
  gap: 10px;
  position: fixed;
  right: 12px;
  top: 66px;
  z-index: 1100;
}

/* Android原生应用中，三点按钮需要考虑状态栏安全区 */
.image-gallery.android-native-app .gallery-tools {
  top: calc(16px + var(--safe-area-inset-top, env(safe-area-inset-top, 0px)));
}

.tool-btn {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 6px;
}

.tool-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.tool-icon {
  font-size: 16px;
}

.tool-text {
  font-size: 14px;
}

/* mobile-only helper */
.mobile-only { display: none }

.dropdown { position: relative }
.menu-btn {
  background: rgba(0,0,0,0.6);
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
  box-shadow: 0 6px 18px rgba(0,0,0,0.12);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-width: 180px;
  z-index: 1200;
}

/* Native: ensure dropdown doesn't collide with safe-area on right edge */
.image-gallery.android-native-app .dropdown .menu {
  right: calc(env(safe-area-inset-right, 0px));
}
.menu-item {
  padding: 12px 14px;
  text-align: left;
  background: transparent;
  border: none;
  font-size: 14px;
  cursor: pointer;
}
.menu-item:hover { background: #f5f5f5 }
.menu-item.disabled { color: #999; cursor: default; pointer-events: none }

@media (max-width: 768px) {
  .mobile-only { display: block }
}

/* Native: reduce extra top gap between status bar and gallery content */
.image-gallery.android-native-app .gallery-content {
  /* 仅保留一个小的内边距，使内容与头部有视觉间隔，
     不再重复应用 safe-area-inset（由 App.vue 处理）。 */
  padding-top: 6px;
  padding-left: 12px;
  padding-right: 12px;
}

.menu-check { display: inline-block; width: 20px; margin-right: 6px; color: #667eea; font-weight: 600 }

.gallery-content {
  flex: 1;
  padding: 20px;
  position: relative; /* make dropdown absolute positioning relative to content */
  overflow-y: auto;
  -webkit-overflow-scrolling: touch; /* iOS 平滑滚动 */
  touch-action: pan-y; /* 允许垂直触摸滚动 */
  pointer-events: auto;
  overscroll-behavior: contain; /* 防止滚动链 */
  scroll-behavior: smooth; /* 平滑滚动 */
  /* 确保触摸事件不会被阻止 */
  -webkit-touch-callout: none; /* 禁用长按菜单 */
  /* 移除will-change和contain，它们在某些情况下可能降低性能 */
  /* Android WebView优化 */
  -webkit-tap-highlight-color: transparent;
  user-select: none;
  -webkit-user-drag: none;
  /* 确保滚动容器有正确的高度 */
  min-height: 0; /* 重要：允许flex容器内的滚动 */
}

/* 网格视图样式 - iOS风格 */
.image-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 4px; /* 稍微增大间隙以符合 iOS 风格 */
  /* 保留底部空间，避免被底部 Tab 遮挡（Tab 高度 65px） */
  padding-bottom: calc(65px + env(safe-area-inset-bottom, 0px));
}

.image-grid-item {
  background: transparent;
  border-radius: 4px;
  overflow: hidden;
  cursor: pointer;
  pointer-events: auto;
  touch-action: pan-y;
  /* 简化过渡效果，提高性能 */
  transition: opacity 0.2s;
  -webkit-tap-highlight-color: transparent;
  user-select: none; /* 防止文本选择干扰触摸 */
  -webkit-user-drag: none; /* 防止拖动干扰 */
  /* 移除transform和backface-visibility，简化渲染 */
}

.image-grid-item:hover,
.image-grid-item:active {
  opacity: 0.9;
  /* 移除transform缩放，提高性能 */
}

.image-thumbnail {
  position: relative;
  width: 100%;
  height: 100px; /* 调整为更紧凑的行高，匹配 itemHeight */
  /* 优化渲染性能 */
  contain: content;
  will-change: transform; /* 仅在有动画时使用，这里移除 */
}

/* ensure image thumbnails fill the container and keep aspect ratio */
.image-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  pointer-events: auto;
  touch-action: pan-y;
}

.image-placeholder {
  width: 100%;
  height: 100%;
  background: #f8f8f8;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.image-real {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.image-real img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  /* 移除过渡效果，提高性能 */
}

/* 移除图片缩放效果，提高性能 */

.image-icon {
  font-size: 32px;
  opacity: 0.5;
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid #f3f3f3;
  border-top: 2px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.image-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
  color: white;
  padding: 6px;
  opacity: 0;
  transition: opacity 0.2s;
}

.image-grid-item:hover .image-overlay {
  opacity: 1;
}

.image-name {
  display: block;
  font-size: 10px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.image-type {
  display: block;
  font-size: 9px;
  color: rgba(255, 255, 255, 0.8);
  margin-top: 2px;
}

.loading-more {
  text-align: center;
  padding: 20px;
  color: #666;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.no-more {
  text-align: center;
  padding: 20px;
  color: #999;
  font-size: 14px;
}

.action-btn {
  background: transparent;
  border: 1px solid #ddd;
  color: #666;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
}

.action-btn:hover {
  background: #f5f5f5;
  border-color: #667eea;
  color: #667eea;
}

.action-icon {
  font-size: 14px;
}

/* 媒体预览组件样式 */
.media-viewer {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.95);
  z-index: 2000; /* 提高z-index确保在底部Tab导航之上 */
  box-sizing: border-box;
  overflow: hidden;
}

.media-viewer.active {
  display: flex;
}



/* 第一部分：顶部工具栏 - iOS相册风格 */
.media-topbar {
  position: absolute;
  top: env(safe-area-inset-top, 0); /* 紧贴状态栏 */
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 6px; /* 左右内边距减少一半 */
  z-index: 1102;
  color: white;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 0.5px solid rgba(255, 255, 255, 0.1);
  height: 88px; /* 高度加高一倍 */
  box-sizing: border-box;
}
.media-back {
  background: transparent;
  border: none;
  color: white;
  font-size: 17px;
  font-weight: 400;
  padding: 8px 4px; /* 左右内边距减少一半 */
  min-width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  opacity: 0.9;
  transition: opacity 0.2s;
}
.media-back:hover {
  opacity: 1;
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
  letter-spacing: -0.3px;
}
.media-dropdown { 
  margin-left: 4px; /* 左边距减少一半 */
  min-width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 第二部分：进度条 - 贴近工具栏下侧的细条 */
.media-progress-container {
  position: absolute;
  top: calc(env(safe-area-inset-top, 0) + 88px); /* 紧贴工具栏下方，调整为新高度 */
  left: 0;
  right: 0;
  z-index: 1103; /* 提高z-index确保在工具栏之上 */
  padding: 0 12px;
  box-sizing: border-box;
}
.media-progress-bar {
  height: 3px; /* 增加高度使其更明显 */
  background: rgba(255, 255, 255, 0.2); /* 增加背景透明度 */
  border-radius: 1.5px;
  overflow: hidden;
}
.media-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #007AFF 0%, #34C759 100%);
  border-radius: 1.5px;
  transition: width 0.3s ease;
  box-shadow: 0 0 8px rgba(0, 122, 255, 0.5); /* 添加发光效果使其更明显 */
}

/* 第三部分：预览区域 */
.media-preview-container {
  position: absolute;
  top: calc(env(safe-area-inset-top, 0) + 88px); /* 从工具栏底部开始，调整为新高度 */
  left: 0;
  right: 0;
  bottom: calc(56px + 70px + env(safe-area-inset-bottom, 0)); /* 到缩略图区域顶部结束，56px是缩略图区域高度，70px是工具按钮区域高度 */
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
  margin-top: -10px; /* 根据iOS风格缩略图大小调整图片位置 */
}

.media-preview-content img,
.media-preview-content video {
  display: block;
  width: 100%;
  height: auto;
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  background: transparent;
  border-radius: 0;
}

/* 视频控件样式优化 */
.media-preview-content video::-webkit-media-controls-panel {
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

.media-preview-content video::-webkit-media-controls-play-button,
.media-preview-content video::-webkit-media-controls-volume-slider,
.media-preview-content video::-webkit-media-controls-mute-button {
  filter: brightness(1.2);
}

.media-preview-content video::-webkit-media-controls-current-time-display,
.media-preview-content video::-webkit-media-controls-time-remaining-display {
  color: white;
  font-weight: 500;
}



/* 第四部分：缩略图区域 */
.media-thumbnails {
  position: absolute;
  bottom: calc(70px + env(safe-area-inset-bottom, 0)); /* 位于工具按钮区域之上，70px是工具按钮区域高度 */
  left: 0;
  right: 0;
  height: 56px; /* iOS风格：缩略图区域高度减少 */
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
  gap: 4px; /* iOS风格：更紧密的缩略图间距 */
  overflow-x: auto;
  padding: 0 12px;
  scrollbar-width: none;
  align-items: center;
}
.thumb-list::-webkit-scrollbar { display: none }
.thumb-item {
  width: 32px; /* iOS风格：缩略图大小减少一半 */
  height: 32px; /* iOS风格：缩略图大小减少一半 */
  border-radius: 2px; /* 相应减少圆角 */
  overflow: hidden;
  background: rgba(255,255,255,0.05);
  border: 1px solid transparent; /* 缩略图变小，边框相应变细 */
  flex: 0 0 auto;
  cursor: pointer;
  transition: all 0.2s ease;
  opacity: 0.7;
}
.thumb-item:hover {
  opacity: 0.9;
  transform: scale(1.05);
}
.thumb-item img { 
  width: 100%; 
  height: 100%; 
  object-fit: cover; 
  display:block;
  pointer-events: none;
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
.thumb-item.active { 
  border-color: #007AFF;
  opacity: 1;
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(0, 122, 255, 0.3);
}

/* 第五部分：底部工具按钮区域 */
.media-toolbar {
  position: absolute;
  bottom: env(safe-area-inset-bottom, 0); /* 紧贴屏幕底部，覆盖底部Tab位置 */
  left: 0;
  right: 0;
  height: 70px; /* 与底部Tab相同高度 */
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

.toolbar-btn:hover {
  opacity: 1;
  transform: translateY(-2px);
}

.toolbar-btn.disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.toolbar-btn.disabled:hover {
  opacity: 0.4;
  transform: none;
}

.toolbar-icon {
  font-size: 20px;
  margin-bottom: 4px;
}

.toolbar-label {
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.3px;
}

/* details modal */
/* iOS风格详情对话框 */
.details-modal { 
  position: fixed; 
  inset: 0; 
  z-index: 2001; /* 高于预览窗口 */
  display: flex; 
  align-items: flex-end; /* 从底部弹出 */
  justify-content: center;
}

.details-backdrop { 
  position: absolute; 
  inset: 0; 
  background: rgba(0,0,0,0.4);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
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
  box-shadow: 0 -10px 40px rgba(0,0,0,0.15);
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

.details-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
}

.details-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #8e8e93;
}

.details-empty .empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.details-content {
  padding: 0;
}

/* 区块样式 */
.details-section {
  padding: 20px;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.details-section:last-child {
  border-bottom: none;
}

.section-title {
  font-size: 13px;
  font-weight: 500;
  color: #8e8e93;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  flex-shrink: 0;
  width: 80px;
}

.section-content {
  font-size: 12px;
  color: #000;
  flex: 1;
}

/* 第一区块：拍摄时间 */
.time-display {
  font-size: 12px;
  font-weight: 400;
  color: #000;
}

/* 第二区块：文件名 */
.filename-display {
  font-size: 12px;
  font-weight: 400;
  color: #000;
  word-break: break-all;
}

/* 第三区块：Exif信息 */
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

.exif-row.header-row {
  margin-bottom: 8px;
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

/* 第四区块：拍摄位置 */
.location-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.location-coordinates {
  font-size: 10px;
  color: #000;
  display: flex;
  align-items: center;
  gap: 8px;
}

.coord-label {
  color: #8e8e93;
  flex-shrink: 0;
}

.coord-value {
  font-family: monospace;
  font-weight: 500;
  flex: 1;
}

.location-map {
  height: 180px;
  background: #f8f8f8;
  border-radius: 12px;
  overflow: hidden;
  position: relative;
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

.map-icon {
  font-size: 48px;
  margin-bottom: 12px;
  opacity: 0.5;
}

.map-placeholder p {
  font-size: 15px;
  margin: 0;
}

/* 加载动画 */
.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #007AFF;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.media-viewer-close {
  position: absolute;
  top: 20px;
  right: 20px;
  color: white;
  font-size: 32px;
  cursor: pointer;
  background: rgba(0,0,0,0.5);
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1001;
}

.media-viewer-close:hover {
  background: rgba(0,0,0,0.8);
}

.media-viewer-nav {
  position: absolute;
  bottom: 20px;
  color: white;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  width: 100%;
}

/* Android 原生 App 模式下，预览层整体和关闭按钮避开状态栏 */
.android-native-app .media-viewer {
  top: 0;
  height: 100%;
  /* Native模式下确保触摸事件正常 */
  touch-action: pan-y;
}

/* Native模式下，媒体预览窗口的工具栏不再重复应用安全区域偏移 */
.android-native-app .media-viewer .media-topbar {
  top: env(safe-area-inset-top, 0); /* 应用安全区域偏移 */
}

/* Native模式下，进度条位置调整 */
.android-native-app .media-viewer .media-progress-container {
  top: 88px; /* 紧贴工具栏下方，工具栏高度为88px */
}

/* Native模式下，预览容器位置调整 */
.android-native-app .media-viewer .media-preview-container {
  top: 44px; /* 从工具栏底部开始，不再重复应用安全区域 */
  bottom: calc(56px + 70px + env(safe-area-inset-bottom, 0)); /* 56px是新的缩略图区域高度 */
}

/* Native模式下，预览内容位置调整 */
.android-native-app .media-viewer .media-preview-content {
  margin-top: 10px; /* 根据iOS风格缩略图大小调整图片位置 */
}

/* Native模式下，工具按钮区域位置调整 */
.android-native-app .media-viewer .media-toolbar {
  bottom: env(safe-area-inset-bottom, 0); /* 紧贴屏幕底部 */
}

.android-native-app .media-viewer-close {
  top: calc(20px + env(safe-area-inset-top, 0));
}

.nav-info {
  max-width: 60%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.nav-counter {
  background: rgba(255, 255, 255, 0.2);
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
}

/* 导航按钮样式 */
.nav-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.5);
  border: none;
  color: white;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  font-size: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s, background 0.3s;
  z-index: 1001;
}

.nav-btn:hover {
  background: rgba(0, 0, 0, 0.8);
}

.nav-btn.show-hover {
  opacity: 1;
}

.nav-prev {
  left: 20px;
}

.nav-next {
  right: 20px;
}

/* 移动端触摸提示 */
@media (max-width: 768px) {
  .nav-btn {
    opacity: 0.7;
  }
  
  .nav-btn:hover {
    opacity: 1;
  }
}

/* 媒体加载动画 - iOS风格 */
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
  white-space: nowrap;
  letter-spacing: -0.3px;
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
  letter-spacing: 0.5px;
}

/* 空状态样式 */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.1);
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 20px;
  opacity: 0.5;
}

.empty-state h3 {
  color: #333;
  margin-bottom: 10px;
  font-size: 20px;
}

.empty-state p {
  color: #666;
  margin-bottom: 30px;
  font-size: 14px;
}

.empty-action-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  color: white;
  padding: 12px 30px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
}

.empty-action-btn:hover {
  opacity: 0.9;
  transform: translateY(-2px);
}

/* 响应式设计 */
@media (max-width: 768px) {
  /* 紫色状态栏已移至App.vue中统一管理 */
  
  .gallery-content {
    padding: 8px;
    /* 移动设备上优化触摸滚动 */
    -webkit-overflow-scrolling: touch;
    touch-action: pan-y;
    overscroll-behavior: contain;
    /* 移动设备上进一步优化 */
    -webkit-tap-highlight-color: transparent;
  }
  
  .image-grid {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 2px;
  }
  
  .image-thumbnail {
    height: 100px;
  }
  
  .preview-content {
    margin: 10px;
    max-height: 80vh;
  }
  
  .preview-image-container {
    padding: 20px;
    min-height: 200px;
  }
}

@media (max-width: 480px) {
  /* 紫色状态栏已移至App.vue中统一管理 */
  
  .gallery-content {
    padding: 4px;
    /* 小屏幕设备上进一步优化触摸滚动 */
    -webkit-overflow-scrolling: touch;
    touch-action: pan-y;
    overscroll-behavior: contain;
    /* 小屏幕设备上特别优化 */
    -webkit-tap-highlight-color: transparent;
  }
  
  .image-grid {
    grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
    gap: 1px;
  }
  
  .image-thumbnail {
    height: 80px;
  }
  
  .image-icon {
    font-size: 24px;
  }
  
  .gallery-tools {
    gap: 8px;
  }
  
  .tool-btn {
    padding: 6px 12px;
    font-size: 12px;
  }
  
  .tool-icon {
    font-size: 14px;
  }
}

/* 下载进度显示样式 */
.download-progress-container {
  position: absolute;
  bottom: 100px;
  left: 50%;
  transform: translateX(-50%);
  width: 80%;
  max-width: 400px;
  background: rgba(0, 0, 0, 0.8);
  border-radius: 12px;
  padding: 12px 16px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  z-index: 1002;
  animation: fadeInUp 0.3s ease;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

.download-progress {
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 8px;
}

.download-progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  border-radius: 3px;
  transition: width 0.3s ease;
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

/* 详细进度信息样式 */
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
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  z-index: 1002;
  animation: fadeInUp 0.3s ease;
}

/* 移动端适配 */
@media (max-width: 768px) {
  /* 调整底部Tab高度为65px（移动端） */
  .media-preview-container {
    bottom: calc(56px + 65px + env(safe-area-inset-bottom, 0)); /* 56px是新的缩略图区域高度 */
  }
  
  /* 移动端图片预览位置调整 */
  .media-preview-content {
    margin-top: -10px; /* 由于缩略图变小，相应减少调整量 */
  }
  
  .media-thumbnails {
    bottom: calc(65px + env(safe-area-inset-bottom, 0));
    height: 56px; /* iOS风格：缩略图区域高度减少 */
  }
  
  /* 移动端缩略图大小调整 */
  .thumb-item {
    width: 32px; /* iOS风格：缩略图大小减少一半 */
    height: 32px; /* iOS风格：缩略图大小减少一半 */
    border-radius: 2px; /* 相应减少圆角 */
  }
  
  .download-progress-container {
    bottom: 120px;
    width: 90%;
    padding: 10px 14px;
  }
  
  .download-progress-details {
    bottom: 80px;
    width: 90%;
    padding: 10px 14px;
  }
  
  .download-progress-info {
    font-size: 11px;
  }
}
</style>