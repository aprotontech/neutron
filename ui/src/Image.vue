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

    <!-- 图片预览模态框 -->
    <div v-if="previewImage" class="image-preview-modal" @click="closePreview">
      <div class="preview-content" @click.stop>
        <button class="preview-close" @click="closePreview">×</button>
        <div class="preview-image-container">
          <div class="preview-image-placeholder">
            <span class="preview-icon">🖼️</span>
            <p class="preview-text">图片预览: {{ previewImage.name }}</p>
          </div>
        </div>
        <div class="preview-info">
          <h3>{{ previewImage.name }}</h3>
          <div class="preview-details">
            <p><strong>大小:</strong> {{ previewImage.size }}</p>
            <p><strong>日期:</strong> {{ previewImage.date }}</p>
            <p><strong>类型:</strong> {{ previewImage.type }}</p>
          </div>
          <div class="preview-actions">
            <button class="preview-action-btn" @click="downloadImage(previewImage)">
              <span class="action-icon">⬇️</span>
              <span>下载</span>
            </button>
            <button class="preview-action-btn" @click="shareImage(previewImage)">
              <span class="action-icon">↗️</span>
              <span>分享</span>
            </button>
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
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { Capacitor } from '@capacitor/core'
import FileAPI from './lib/file-api.js'

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

// 可见图片索引
const visibleImageIndices = ref(new Set())

// 缩略图缓存
const thumbnailCache = ref({})

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
    const blob = await fileAPI.getFileThumbnail(image.path, 200)
    if (blob) {
      const thumbnailUrl = URL.createObjectURL(blob)
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
  previewImage.value = image
}

// 关闭图片预览
function closePreview() {
  previewImage.value = null
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

// 清理缩略图URL
function cleanupThumbnailUrls() {
  Object.values(thumbnailCache.value).forEach(url => {
    if (url && url.startsWith('blob:')) {
      URL.revokeObjectURL(url)
    }
  })
  thumbnailCache.value = {}
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

/* 图片预览模态框 */
.image-preview-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.95);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-content {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  max-width: 800px;
  max-height: 90vh;
  position: relative;
  display: flex;
  flex-direction: column;
}

.preview-close {
  position: absolute;
  top: 15px;
  right: 15px;
  background: rgba(0, 0, 0, 0.5);
  border: none;
  color: white;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  font-size: 24px;
  cursor: pointer;
  z-index: 1001;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-close:hover {
  background: rgba(0, 0, 0, 0.8);
}

.preview-image-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  background: #f5f5f5;
  min-height: 300px;
}

.preview-image-placeholder {
  text-align: center;
}

.preview-icon {
  font-size: 64px;
  display: block;
  margin-bottom: 20px;
  opacity: 0.7;
}

.preview-text {
  color: #666;
  font-size: 16px;
}

.preview-info {
  padding: 20px;
  border-top: 1px solid #e0e0e0;
}

.preview-info h3 {
  margin: 0 0 15px 0;
  color: #333;
  font-size: 18px;
}

.preview-details {
  margin-bottom: 20px;
}

.preview-details p {
  margin: 8px 0;
  color: #666;
  font-size: 14px;
}

.preview-details strong {
  color: #333;
  margin-right: 8px;
}

.preview-actions {
  display: flex;
  gap: 10px;
}

.preview-action-btn {
  flex: 1;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  color: white;
  padding: 12px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.preview-action-btn:hover {
  opacity: 0.9;
  transform: translateY(-2px);
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