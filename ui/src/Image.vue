<template>
  <div class="image-gallery" :class="{ 'android-native-app': isAndroidApp }">
    <!-- 图库头部 -->
    <div class="gallery-header">
      <h1>图库</h1>
      <div class="gallery-tools">
        <button class="tool-btn" @click="refreshGallery">
          <span class="tool-icon">↻</span>
          <span class="tool-text">刷新</span>
        </button>
        <button class="tool-btn" @click="toggleViewMode">
          <span class="tool-icon">{{ viewMode === 'grid' ? '☰' : '⏹' }}</span>
          <span class="tool-text">{{ viewMode === 'grid' ? '列表' : '网格' }}</span>
        </button>
      </div>
    </div>

    <!-- 图库内容 -->
    <div class="gallery-content">
      <!-- 网格视图 -->
      <div v-if="viewMode === 'grid'" class="image-grid">
        <div 
          v-for="(image, index) in sampleImages" 
          :key="index" 
          class="image-grid-item"
          @click="openImagePreview(image)"
        >
          <div class="image-thumbnail">
            <div class="image-placeholder">
              <span class="image-icon">🖼️</span>
            </div>
            <div class="image-overlay">
              <span class="image-name">{{ image.name }}</span>
              <span class="image-date">{{ image.date }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 列表视图 -->
      <div v-else class="image-list">
        <div 
          v-for="(image, index) in sampleImages" 
          :key="index" 
          class="image-list-item"
          @click="openImagePreview(image)"
        >
          <div class="list-image-icon">
            <span>🖼️</span>
          </div>
          <div class="list-image-info">
            <div class="list-image-name">{{ image.name }}</div>
            <div class="list-image-details">
              <span class="list-image-size">{{ image.size }}</span>
              <span class="list-image-date">{{ image.date }}</span>
            </div>
          </div>
          <div class="list-image-actions">
            <button class="action-btn" @click.stop="downloadImage(image)">
              <span class="action-icon">⬇️</span>
            </button>
          </div>
        </div>
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
    <div v-if="sampleImages.length === 0" class="empty-state">
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
import { ref, onMounted } from 'vue'
import { Capacitor } from '@capacitor/core'

// 视图模式：grid（网格）或 list（列表）
const viewMode = ref('grid')

// Android原生App检测
const isAndroidApp = ref(false)

// 示例图片数据
const sampleImages = ref([
  { id: 1, name: '风景照.jpg', size: '2.3 MB', date: '2024-01-15', type: 'JPEG' },
  { id: 2, name: '人物照.png', size: '1.8 MB', date: '2024-01-14', type: 'PNG' },
  { id: 3, name: '建筑照.jpg', size: '3.1 MB', date: '2024-01-13', type: 'JPEG' },
  { id: 4, name: '夜景照.jpg', size: '4.2 MB', date: '2024-01-12', type: 'JPEG' },
  { id: 5, name: '花卉照.png', size: '1.5 MB', date: '2024-01-11', type: 'PNG' },
  { id: 6, name: '动物照.jpg', size: '2.7 MB', date: '2024-01-10', type: 'JPEG' },
  { id: 7, name: '美食照.jpg', size: '2.1 MB', date: '2024-01-09', type: 'JPEG' },
  { id: 8, name: '旅行照.png', size: '3.5 MB', date: '2024-01-08', type: 'PNG' },
])

// 预览相关状态
const previewImage = ref(null)

// 切换视图模式
function toggleViewMode() {
  viewMode.value = viewMode.value === 'grid' ? 'list' : 'grid'
}

// 刷新图库
function refreshGallery() {
  // 这里可以添加实际的API调用
  console.log('刷新图库')
  // 模拟加载
  setTimeout(() => {
    console.log('图库刷新完成')
  }, 500)
}

// 打开图片预览
function openImagePreview(image) {
  previewImage.value = image
}

// 关闭图片预览
function closePreview() {
  previewImage.value = null
}

// 下载图片
function downloadImage(image) {
  console.log('下载图片:', image.name)
  // 这里可以添加实际的下载逻辑
  alert(`开始下载: ${image.name}`)
}

// 分享图片
function shareImage(image) {
  console.log('分享图片:', image.name)
  // 这里可以添加实际的分享逻辑
  alert(`分享图片: ${image.name}`)
}

onMounted(() => {
  console.log('Image.vue 组件已加载')
  // 这里可以添加初始化逻辑，比如加载图片数据
})
</script>

<style scoped>
.image-gallery {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #f5f5f5;
}

.gallery-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 10px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.android-native-app .gallery-header {
  padding-top: calc(0px + var(--safe-area-inset-top, env(safe-area-inset-top, 0px)));
}

.gallery-header h1 {
  font-size: 24px;
  margin: 0;
}

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

/* 网格视图样式 */
.image-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
}

.image-grid-item {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  cursor: pointer;
  transition: all 0.3s;
}

.image-grid-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 16px rgba(0,0,0,0.15);
}

.image-thumbnail {
  position: relative;
  width: 100%;
  height: 180px;
}

.image-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-icon {
  font-size: 48px;
  opacity: 0.7;
}

.image-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 10px;
  transform: translateY(100%);
  transition: transform 0.3s;
}

.image-grid-item:hover .image-overlay {
  transform: translateY(0);
}

.image-name {
  display: block;
  font-size: 12px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.image-date {
  display: block;
  font-size: 11px;
  color: #ccc;
  margin-top: 4px;
}

/* 列表视图样式 */
.image-list {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.image-list-item {
  display: flex;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: all 0.2s;
}

.image-list-item:hover {
  background: #f9f9f9;
}

.image-list-item:last-child {
  border-bottom: none;
}

.list-image-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;
  margin-right: 15px;
}

.list-image-info {
  flex: 1;
}

.list-image-name {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
}

.list-image-details {
  display: flex;
  gap: 15px;
  font-size: 12px;
  color: #999;
}

.list-image-actions {
  display: flex;
  gap: 8px;
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
  .gallery-header {
    padding: 12px;
    flex-direction: column;
    gap: 12px;
  }
  
  .gallery-header h1 {
    font-size: 16px;
    margin-bottom: 6px;
  }
  
  .android-native-app .gallery-header {
    padding-top: calc(12px + var(--safe-area-inset-top, env(safe-area-inset-top, 0px)));
  }
  
  .gallery-content {
    padding: 12px;
  }
  
  .image-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 15px;
  }
  
  .image-thumbnail {
    height: 150px;
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
  .gallery-header {
    padding: 10px;
    flex-direction: column;
    gap: 10px;
  }
  
  .gallery-header h1 {
    font-size: 14px;
    margin-bottom: 4px;
  }
  
  .android-native-app .gallery-header {
    padding-top: calc(10px + var(--safe-area-inset-top, env(safe-area-inset-top, 0px)));
  }
  
  .gallery-content {
    padding: 8px;
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