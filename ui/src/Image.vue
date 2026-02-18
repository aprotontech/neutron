<template>
  <div class="image-gallery" :class="{ 'android-native-app': isAndroidApp }">

    <!-- 图库内容 -->
    <div class="gallery-content" @scroll="handleScroll">
      <!-- 只使用缩略图模式 -->
      <div class="image-grid">
        <div 
          v-for="(image, index) in images" 
          :key="image.id" 
          class="image-grid-item"
          @click="openImagePreview(image)"
        >
          <div class="image-thumbnail">
            <div v-if="image.thumbnailUrl" class="image-real">
              <img 
                :src="image.thumbnailUrl" 
                :alt="image.name"
                loading="lazy"
                @load="image.loaded = true"
              />
            </div>
            <div v-else class="image-placeholder">
              <span class="image-icon">{{ image.type === '视频' ? '🎬' : '🖼️' }}</span>
              <div v-if="image.loadingThumbnail" class="thumbnail-loading">
                <div class="loading-spinner"></div>
              </div>
            </div>
            <div class="image-overlay">
              <span class="image-name">{{ image.name }}</span>
              <span class="image-type">{{ image.type }}</span>
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
    </div>

    <!-- 媒体预览组件 -->
    <div 
      class="media-viewer" 
      :class="{ active: isViewingImage || isViewingVideo }"
      @click="handleMediaBackgroundClick"
      @touchstart="handleMediaTouchStart"
      @touchmove="handleMediaTouchMove"
      @touchend="handleMediaTouchEnd"
      @mousemove="handleMediaMouseMove"
      @mouseleave="handleMediaMouseLeave"
    >
      <button class="media-viewer-close" @click="closeMediaViewer">✕</button>
      
      <div 
        class="media-viewer-content" 
        :style="{ 
          transform: `translateY(${mediaSlideOffset}px)`,
          opacity: mediaSlideOpacity
        }"
      >
        <div v-if="isMediaLoading" class="media-loading">
          <div class="media-spinner"></div>
          <div class="media-loading-text">加载中...</div>
        </div>
        
        <img 
          v-if="isViewingImage && !isMediaLoading" 
          :src="currentMediaUrl" 
          :alt="currentMediaFile?.name" 
          @click.stop
        />
        
        <video 
          v-else-if="isViewingVideo && !isMediaLoading" 
          :src="currentMediaUrl" 
          controls 
          autoplay
          @click.stop
        ></video>
      </div>
      
      <div class="media-viewer-nav" v-if="currentMediaFile && !isMediaLoading">
        <span class="nav-info">{{ currentMediaFile.name }}</span>
        <span class="nav-counter" v-if="imageFiles.length > 1">
          {{ currentMediaIndex + 1 }} / {{ imageFiles.length }}
        </span>
        
        <!-- 导航按钮 -->
        <button 
          v-if="hasPrevMedia" 
          class="nav-btn nav-prev" 
          @click="prevMedia"
          @click.stop
        >
          ←
        </button>
        <button 
          v-if="hasNextMedia" 
          class="nav-btn nav-next" 
          @click="nextMedia"
          @click.stop
        >
          →
        </button>
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
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { Capacitor } from '@capacitor/core'
import FileAPI from './lib/file-api.js'
import { Config } from './lib/config.js'

// Android原生App检测
const isAndroidApp = ref(false)

// FileAPI实例
const fileAPI = new FileAPI()

// 图片数据
const images = ref([])
const totalImages = ref(0)
const loading = ref(false)
const hasMore = ref(true)
const currentOffset = ref(0)
const pageSize = 20 // 每页加载数量

// 预览相关状态
const previewImage = ref(null)

// 媒体预览相关状态
const isViewingImage = ref(false)
const isViewingVideo = ref(false)
const currentMediaFile = ref(null)
const currentMediaUrl = ref('')
const isMediaLoading = ref(false)

// 图片导航相关
const imageFiles = ref([])
const currentMediaIndex = ref(-1)

// 媒体预览手势相关（上下滑关闭、左右滑切图）
const mediaTouchStartX = ref(0)
const mediaTouchEndX = ref(0)
const mediaTouchStartY = ref(0)
const mediaTouchEndY = ref(0)
const mediaSwipeAxis = ref(null) // 'x' | 'y' | null
const mediaSwipeStartedOnClosableArea = ref(false)
const mediaSlideOffset = ref(0) // 滑动偏移量，用于动画效果
const mediaSlideOpacity = ref(1) // 滑动时的透明度，用于动画效果

// 可见图片索引
const visibleImageIndices = ref(new Set())

// 缩略图缓存
const thumbnailCache = ref({})

// 计算是否有前一张/后一张图片
const hasPrevMedia = computed(() => {
  return currentMediaIndex.value > 0 && imageFiles.value.length > 1
})

const hasNextMedia = computed(() => {
  return currentMediaIndex.value < imageFiles.value.length - 1 && imageFiles.value.length > 1
})

const isMediaViewerActive = computed(() => {
  return isViewingImage.value || isViewingVideo.value
})

// 计算当前可视区域可以显示的图片数量
function calculateVisibleCount() {
  const grid = document.querySelector('.image-grid')
  if (!grid) return pageSize
  
  const gridRect = grid.getBoundingClientRect()
  const itemHeight = 120 // 图片项高度
  const itemWidth = 120 // 图片项宽度
  
  const cols = Math.floor(gridRect.width / itemWidth)
  const rows = Math.ceil(gridRect.height / itemHeight)
  
  return Math.max(pageSize, cols * rows * 2) // 加载比可视区域多一倍的图片
}

// 加载图片列表
async function loadImages(offset = 0, count = null) {
  if (loading.value) return
  
  loading.value = true
  try {
    const loadCount = count || calculateVisibleCount()
    console.log(`Loading images: offset=${offset}, count=${loadCount}`)
    
    const result = await fileAPI.getImageRepo(offset, loadCount)
    console.log('Image repo result:', result)
    
    if (offset === 0) {
      images.value = []
      thumbnailCache.value = {}
    }
    
    if (result && result.items) {
      // 转换服务器返回的数据格式
      const newImages = result.items.map((item, index) => {
        const path = typeof item === 'string' ? item : (item.path || item)
        const name = path.split('/').pop() || '未命名文件'
        return {
          id: offset + index,
          path: path,
          name: name,
          size: '未知大小',
          date: '未知日期',
          type: getFileType(name),
          thumbnailUrl: null,
          loadingThumbnail: false
        }
      })
      
      images.value = [...images.value, ...newImages]
      totalImages.value = result.total || 0
      currentOffset.value = offset + newImages.length
      hasMore.value = newImages.length > 0 && currentOffset.value < totalImages.value
      
      // 加载可见图片的缩略图
      loadVisibleThumbnails()
    }
  } catch (error) {
    console.error('Failed to load images:', error)
  } finally {
    loading.value = false
  }
}

// 获取文件类型
function getFileType(filename) {
  const ext = filename.split('.').pop().toLowerCase()
  const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg']
  const videoExts = ['mp4', 'avi', 'mov', 'mkv', 'wmv', 'flv', 'webm']
  
  if (imageExts.includes(ext)) return '图片'
  if (videoExts.includes(ext)) return '视频'
  return '文件'
}

// 判断文件类型
function isImage(file) {
  return !file.isDir && getFileType(file.name) === '图片'
}

function isVideo(file) {
  return !file.isDir && getFileType(file.name) === '视频'
}

// 加载可见图片的缩略图
async function loadVisibleThumbnails() {
  const visibleIndices = Array.from(visibleImageIndices.value)
  
  for (const index of visibleIndices) {
    if (index >= images.value.length) continue
    
    const image = images.value[index]
    if (!image.thumbnailUrl && !image.loadingThumbnail && !thumbnailCache.value[image.path]) {
      await loadThumbnail(image, index)
    }
  }
}

// 加载单个缩略图
async function loadThumbnail(image, index) {
  if (thumbnailCache.value[image.path]) {
    images.value[index].thumbnailUrl = thumbnailCache.value[image.path]
    return
  }
  
  images.value[index].loadingThumbnail = true
  
  try {
    const thumbnailUrl = await fileAPI.getFileThumbnailUrl(image.path, 200)
    if (thumbnailUrl) {
      images.value[index].thumbnailUrl = thumbnailUrl
      thumbnailCache.value[image.path] = thumbnailUrl
    }
  } catch (error) {
    console.error(`Failed to load thumbnail for ${image.path}:`, error)
  } finally {
    images.value[index].loadingThumbnail = false
  }
}

// 处理滚动事件
function handleScroll() {
  const grid = document.querySelector('.image-grid')
  if (!grid) return
  
  const items = grid.querySelectorAll('.image-grid-item')
  const gridRect = grid.getBoundingClientRect()
  
  visibleImageIndices.value.clear()
  
  items.forEach((item, index) => {
    const itemRect = item.getBoundingClientRect()
    
    // 检查是否在可视区域内
    if (
      itemRect.bottom >= gridRect.top &&
      itemRect.top <= gridRect.bottom &&
      itemRect.right >= gridRect.left &&
      itemRect.left <= gridRect.right
    ) {
      visibleImageIndices.value.add(index)
    }
  })
  
  // 加载可见图片的缩略图
  loadVisibleThumbnails()
  
  // 检查是否需要加载更多图片
  if (!loading.value && hasMore.value) {
    const lastItem = items[items.length - 1]
    if (lastItem) {
      const lastItemRect = lastItem.getBoundingClientRect()
      if (lastItemRect.bottom <= gridRect.bottom + 100) {
        loadImages(currentOffset.value)
      }
    }
  }
}

// 打开图片预览
function openImagePreview(image) {
  openMediaViewer(image)
}

// 关闭图片预览
function closePreview() {
  closeMediaViewer()
}

// 打开媒体查看器
async function openMediaViewer(file) {
  currentMediaFile.value = file
  isMediaLoading.value = true
  
  // 重置所有查看状态
  isViewingImage.value = false
  isViewingVideo.value = false
  currentMediaUrl.value = ''
  
  // 检查文件大小限制（5MB）
  if (file.size && file.size > Config.getMaxPreviewFileSize()) {
    // 显示确认对话框，让用户选择是否继续查看
    const maxSizeMB = Config.getMaxPreviewFileSize() / (1024 * 1024)
    const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2)
    const confirmMessage = `文件内容过大（${fileSizeMB}MB > ${maxSizeMB}MB），是否确认要进行查看？\n\n注意：大文件可能会导致加载缓慢或性能问题。`
    
    if (!confirm(confirmMessage)) {
      // 用户点击取消
      showToastMessage('已取消查看大文件。', 'info')
      isMediaLoading.value = false
      return
    }
    
    // 用户点击确认，继续查看
    showToastMessage('正在加载大文件，请稍候...', 'info', 3000)
  }
  
  // 更新图片文件列表
  updateImageFilesList()
  
  // 查找当前文件在图片列表中的位置
  const index = imageFiles.value.findIndex(f => f.path === file.path)
  currentMediaIndex.value = index
  
  if (isImage(file)) {
    isViewingImage.value = true
    try {
      currentMediaUrl.value = await fileAPI.getFileUrl(file.path)
      
      // 图片加载完成后隐藏加载动画
      const img = new Image()
      img.onload = () => {
        isMediaLoading.value = false
      }
      img.onerror = () => {
        isMediaLoading.value = false
      }
      img.src = currentMediaUrl.value
    } catch (error) {
      console.error('加载图片失败:', error)
      isMediaLoading.value = false
    }
  } else if (isVideo(file)) {
    isViewingVideo.value = true
    try {
      currentMediaUrl.value = await fileAPI.getFileUrl(file.path)
      isMediaLoading.value = false
    } catch (error) {
      console.error('加载视频失败:', error)
      isMediaLoading.value = false
    }
  }
}

// 关闭媒体查看器
function closeMediaViewer() {
  isViewingImage.value = false
  isViewingVideo.value = false
  currentMediaFile.value = null
  currentMediaUrl.value = ''
  isMediaLoading.value = false
  currentMediaIndex.value = -1
  imageFiles.value = []
  
  // 重置滑动动画
  mediaSlideOffset.value = 0
  mediaSlideOpacity.value = 1
}

// 更新图片文件列表
function updateImageFilesList() {
  imageFiles.value = images.value.filter(f => isImage(f) || isVideo(f))
}

// 切换到前一张图片
async function prevMedia() {
  if (!hasPrevMedia.value) return
  
  const prevIndex = currentMediaIndex.value - 1
  const prevFile = imageFiles.value[prevIndex]
  
  if (prevFile) {
    await loadMediaFile(prevFile)
  }
}

// 切换到后一张图片
async function nextMedia() {
  if (!hasNextMedia.value) return
  
  const nextIndex = currentMediaIndex.value + 1
  const nextFile = imageFiles.value[nextIndex]
  
  if (nextFile) {
    await loadMediaFile(nextFile)
  }
}

// 加载媒体文件
async function loadMediaFile(file) {
  currentMediaFile.value = file
  isMediaLoading.value = true
  
  if (isImage(file)) {
    isViewingImage.value = true
    isViewingVideo.value = false
    try {
      currentMediaUrl.value = await fileAPI.getFileUrl(file.path)
      
      // 图片加载完成后隐藏加载动画
      const img = new Image()
      img.onload = () => {
        isMediaLoading.value = false
      }
      img.onerror = () => {
        isMediaLoading.value = false
      }
      img.src = currentMediaUrl.value
    } catch (error) {
      console.error('加载图片失败:', error)
      isMediaLoading.value = false
    }
  } else if (isVideo(file)) {
    isViewingVideo.value = true
    isViewingImage.value = false
    try {
      currentMediaUrl.value = await fileAPI.getFileUrl(file.path)
      isMediaLoading.value = false
    } catch (error) {
      console.error('加载视频失败:', error)
      isMediaLoading.value = false
    }
  }
  
  // 更新当前索引
  const index = imageFiles.value.findIndex(f => f.path === file.path)
  currentMediaIndex.value = index
}

// 刷新图库
function refreshGallery() {
  console.log('Refreshing gallery...')
  currentOffset.value = 0
  hasMore.value = true
  loadImages(0)
}

// 下载图片
async function downloadImage(image) {
  console.log('下载图片:', image.name)
  try {
    alert(`开始下载: ${image.name}`)
    await fileAPI.downloadFile(image.path, image)
    alert(`下载成功: ${image.name}`)
  } catch (error) {
    console.error('下载失败:', error)
    alert(`下载失败: ${error.message}`)
  }
}

// 分享图片
function shareImage(image) {
  console.log('分享图片:', image.name)
  // 这里可以添加实际的分享逻辑
  alert(`分享图片: ${image.name}`)
}

// 触摸事件处理函数
function handleMediaTouchStart(event) {
  if (!isMediaViewerActive.value) return

  const touch = event.touches[0]
  mediaTouchStartX.value = touch.clientX
  mediaTouchStartY.value = touch.clientY
  mediaTouchEndX.value = touch.clientX
  mediaTouchEndY.value = touch.clientY

  mediaSwipeAxis.value = null

  // 所有预览类型都支持上下滑关闭手势
  // 但如果是视频的控件区域，优先响应控件操作
  const startedOnMediaElement = !!event.target.closest('img, video, .media-viewer-content')
  const startedOnMediaControls = !!event.target.closest('video') && 
    (event.target.tagName === 'BUTTON' || event.target.tagName === 'INPUT' || 
     event.target.hasAttribute('controls'))
  
  // 如果触摸开始于媒体控件，则不触发上下滑关闭
  mediaSwipeStartedOnClosableArea.value = !startedOnMediaControls
  
  // 重置滑动动画
  mediaSlideOffset.value = 0
  mediaSlideOpacity.value = 1
}

function handleMediaTouchMove(event) {
  if (!isMediaViewerActive.value) return

  const touch = event.touches[0]
  mediaTouchEndX.value = touch.clientX
  mediaTouchEndY.value = touch.clientY

  const deltaX = mediaTouchEndX.value - mediaTouchStartX.value
  const deltaY = mediaTouchEndY.value - mediaTouchStartY.value

  // 方向锁定（避免轻微抖动）
  if (!mediaSwipeAxis.value) {
    const absX = Math.abs(deltaX)
    const absY = Math.abs(deltaY)
    if (absX < 10 && absY < 10) return
    mediaSwipeAxis.value = absX > absY ? 'x' : 'y'
  }

  // 纵向手势：阻止默认滚动，避免底层列表跟着滚
  if (mediaSwipeAxis.value === 'y' && mediaSwipeStartedOnClosableArea.value) {
    event.preventDefault()
    event.stopPropagation()
    
    // 更新滑动动画效果
    const slideRatio = Math.min(Math.abs(deltaY) / 200, 1) // 最大滑动200px
    mediaSlideOffset.value = deltaY
    mediaSlideOpacity.value = 1 - slideRatio * 0.5 // 最多变淡50%
  }
}

function handleMediaTouchEnd() {
  if (!isMediaViewerActive.value) return

  const diffX = mediaTouchStartX.value - mediaTouchEndX.value
  const diffY = mediaTouchStartY.value - mediaTouchEndY.value

  // 保持原来的左右滑逻辑：仅在“图片 + 多张”时切换
  if (isViewingImage.value && imageFiles.value.length > 1) {
    // 水平滑动距离大于垂直滑动距离，且滑动距离大于50px
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
      if (diffX > 0) {
        // 向左滑动，显示下一张
        nextMedia()
      } else {
        // 向右滑动，显示上一张
        prevMedia()
      }
    }
  }

  // 上下滑关闭预览：仅在纵向为主，且距离足够时触发
  if (mediaSwipeStartedOnClosableArea.value) {
    if (Math.abs(diffY) > Math.abs(diffX) && Math.abs(diffY) > 80) {
      closeMediaViewer()
    } else {
      // 如果没有触发关闭，则添加滑动返回动画
      mediaSlideOffset.value = 0
      mediaSlideOpacity.value = 1
    }
  }

  // 重置触摸位置
  mediaTouchStartX.value = 0
  mediaTouchEndX.value = 0
  mediaTouchStartY.value = 0
  mediaTouchEndY.value = 0
  mediaSwipeAxis.value = null
  mediaSwipeStartedOnClosableArea.value = false
  // 滑动动画变量会在下次触摸开始时重置
}

// 鼠标移动显示/隐藏导航按钮
function handleMediaMouseMove() {
  // 在 Image.vue 中，我们暂时不需要鼠标移动功能
}

function handleMediaMouseLeave() {
  // 在 Image.vue 中，我们暂时不需要鼠标离开功能
}

// 处理点击媒体查看器背景关闭预览
function handleMediaBackgroundClick(event) {
  // 如果点击的是背景区域（不是媒体内容或导航按钮），则关闭预览
  if (event.target.classList.contains('media-viewer')) {
    closeMediaViewer()
  }
}

// 清理缩略图URL
function cleanupThumbnailUrls() {
  Object.values(thumbnailCache.value).forEach(url => {
    if (url && url.startsWith('blob:')) {
      URL.revokeObjectURL(url)
    }
  })
  thumbnailCache.value = {}
}

// 显示提示消息
function showToastMessage(message, type = 'info', duration = 3000) {
  // 在 Image.vue 中，我们暂时使用简单的 alert
  alert(message)
}

onMounted(() => {
  console.log('Image.vue 组件已加载')
  
  // 判断是否为 Android 原生 App（Capacitor 环境）
  if (Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android') {
    isAndroidApp.value = true
  }
  
  // 初始加载图片
  loadImages(0)
  
  // 添加滚动监听
  const galleryContent = document.querySelector('.gallery-content')
  if (galleryContent) {
    galleryContent.addEventListener('scroll', handleScroll)
  }
  
  // 初始计算可见区域
  setTimeout(handleScroll, 100)
})

onUnmounted(() => {
  // 清理缩略图URL
  cleanupThumbnailUrls()
  
  // 移除滚动监听
  const galleryContent = document.querySelector('.gallery-content')
  if (galleryContent) {
    galleryContent.removeEventListener('scroll', handleScroll)
  }
})
</script>

<style scoped>
.image-gallery {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #ffffff;
}

/* 紫色状态栏已移至App.vue中统一管理 */

.gallery-tools {
  display: flex;
  gap: 10px;
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

.gallery-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

/* 网格视图样式 - iOS风格 */
.image-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 2px;
}

.image-grid-item {
  background: transparent;
  border-radius: 4px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s;
  -webkit-tap-highlight-color: transparent;
}

.image-grid-item:hover,
.image-grid-item:active {
  opacity: 0.8;
  transform: scale(0.98);
}

.image-thumbnail {
  position: relative;
  width: 100%;
  height: 120px;
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
  transition: transform 0.3s;
}

.image-grid-item:hover .image-real img {
  transform: scale(1.05);
}

.image-icon {
  font-size: 32px;
  opacity: 0.5;
}

.thumbnail-loading {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.8);
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
  z-index: 1000;
  align-items: center;
  justify-content: center;
  flex-direction: column;
}

.media-viewer.active {
  display: flex;
}

.media-viewer-content {
  position: relative;
  max-width: 90%;
  max-height: 90%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.media-viewer-content img,
.media-viewer-content video {
  display: block;
  width: auto;
  height: auto;
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  background: transparent;
  border-radius: 8px;
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
  top: env(safe-area-inset-top, 0);
  height: calc(100% - env(safe-area-inset-top, 0));
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

/* 媒体加载动画 */
.media-loading {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  color: white;
}

.media-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top: 4px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 15px;
}

.media-loading-text {
  font-size: 14px;
  opacity: 0.8;
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
</style>