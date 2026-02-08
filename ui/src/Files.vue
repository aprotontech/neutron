<template>
  <div id="app" :class="{ 'android-native-app': isAndroidApp }">
    
    <div class="toolbar">
        <!-- 移动设备：导航按钮、当前目录按钮和视图切换按钮在同一行 -->
        <div class="mobile-toolbar mobile-only">
          <!-- 导航按钮组 -->
          <div class="mobile-nav-buttons">
            <!-- Home按钮（快速回到根目录） -->
            <button class="nav-home-btn" 
                    @click="goToRoot" 
                    title="根目录">
              <span class="nav-home-icon">🏠</span>
            </button>
            <!-- 刷新按钮（刷新当前列表） -->
            <button class="nav-refresh-btn"
                    @click="refreshCurrentList"
                    title="刷新">
              <span class="nav-refresh-icon">↻</span>
            </button>
            <!-- 向上按钮（到达上级目录） -->
            <button class="nav-up-btn" 
                    :class="{ disabled: currentPath === '/' }" 
                    @click="goBack" 
                    :disabled="currentPath === '/'" 
                    title="上级目录">
              <span class="nav-up-icon">↑</span>
            </button>
          </div>
          
          <!-- 当前目录按钮和下拉菜单 -->
          <div class="mobile-path-container">
            <button class="mobile-path-btn" @click="showPathDropdown">
              <span class="mobile-path-text">{{ getCurrentPathDisplay() }}</span>
            </button>
            
            <!-- 路径下拉菜单 -->
            <div class="path-dropdown-overlay" :class="{ active: showPathList }" @click="hidePathDropdown"></div>
            <div class="path-dropdown" :class="{ active: showPathList }">
              <div class="path-dropdown-list">
                <button class="path-item" @click="goToRoot">
                  <span class="path-icon">🏠</span>
                  <span>根目录</span>
                </button>
                <template v-for="(path, index) in currentPathArray" :key="index">
                  <button class="path-item" @click="goToPath(index)">
                    <span class="path-icon">📁</span>
                    <span>{{ path }}</span>
                  </button>
                </template>
              </div>
            </div>
          </div>
          
          <!-- 视图切换按钮和菜单按钮 -->
          <div class="mobile-view-toggle">
            <button class="mobile-view-btn" @click="toggleViewMode" :title="viewMode === 'list' ? '显示缩略图' : '显示列表'">
              <span class="mobile-view-icon">{{ viewMode === 'list' ? '□' : '≡' }}</span>
            </button>
            
            <!-- 右侧三点菜单按钮 -->
            <div class="mobile-menu-right">
              <button class="menu-btn" @click="toggleRightMenu">
                <span class="menu-icon">⋮</span>
              </button>
              <!-- 右侧菜单内容 -->
              <div class="menu-overlay" :class="{ active: showRightMenu }" @click="hideRightMenu"></div>
              <div class="menu-right" :class="{ active: showRightMenu }">
                <div class="menu-list">
                  <button class="menu-item" @click="toggleViewMode">
                    <span class="menu-item-icon">{{ viewMode === 'list' ? '□' : '≡' }}</span>
                    <span class="menu-item-text">{{ viewMode === 'list' ? '显示缩略图' : '显示列表' }}</span>
                  </button>
                  <button class="menu-item" @click="reloadPage">
                    <span class="menu-item-icon">↻</span>
                    <span class="menu-item-text">重新加载</span>
                  </button>
                  <button class="menu-item disabled">
                    <span class="menu-item-icon">⬇️</span>
                    <span class="menu-item-text">下载</span>
                  </button>
                  <button class="menu-item disabled">
                    <span class="menu-item-icon">⬆️</span>
                    <span class="menu-item-text">上传</span>
                  </button>
                  <button class="menu-item disabled">
                    <span class="menu-item-icon">ℹ️</span>
                    <span class="menu-item-text">文件详情</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 桌面端：合并的视图切换按钮 -->
        <div class="view-toggle desktop-only">
          <button class="view-toggle-btn" @click="toggleViewMode" :title="viewMode === 'list' ? '显示缩略图' : '显示列表'">
            <span class="view-toggle-icon">{{ viewMode === 'list' ? '□' : '≡' }}</span>
            <span class="view-toggle-text desktop-only">{{ viewMode === 'list' ? '显示缩略图' : '显示列表' }}</span>
          </button>
        </div>
      </div>

      <div
        class="content"
        ref="contentContainer"
      >
        <div v-if="error" class="error-message">{{ error }}</div>

        <div v-if="loading" class="loading"><div class="spinner"></div></div>

        <template v-else-if="files.length > 0">
          <div v-if="viewMode === 'list'" class="file-list">
            <div class="file-list-header">
              <div></div>
              <div>名称</div>
              <div>大小</div>
              <div>修改时间</div>
            </div>

            <div v-for="file in files" :key="file.name" class="file-list-item" :class="{ selected: selectedFile === file }" @click="handleFileClick(file, $event)" @dblclick="openFile(file)" @touchstart="handleFileTouchStart(file, $event)" @touchend="handleFileTouchEnd(file, $event)">
              <div class="file-icon">{{ getFileIcon(file) }}</div>
              <div class="file-name">{{ file.name }}</div>
              <div class="file-size">{{ formatSize(file.size) }}</div>
              <div class="file-modified">{{ formatDate(file.modTime) }}</div>
            </div>
          </div>

          <div v-else class="thumbnail-grid">
            <div v-for="file in files" :key="file.name" class="thumbnail-item" :class="{ selected: selectedFile === file }" @click="handleFileClick(file, $event)" @dblclick="openFile(file)" @touchstart="handleFileTouchStart(file, $event)" @touchend="handleFileTouchEnd(file, $event)" ref="thumbnailItems">
              <div class="thumbnail-preview" :ref="el => registerThumbnailElement(el, file)">
                <img v-if="isImage(file) && file.thumbUrl" :src="file.thumbUrl" :alt="file.name" />
                <div v-else-if="isVideo(file)" class="thumbnail-icon">🎬</div>
                <div v-else class="thumbnail-icon">{{ getFileIcon(file) }}</div> 
              </div>
              <div class="thumbnail-info">
                <div class="thumbnail-name" :title="file.name">{{ file.name }}</div>
                <div class="thumbnail-size">{{ formatSize(file.size) }}</div>
              </div>
            </div>
          </div>
        </template>

        <div v-else class="empty-state"><div class="empty-icon">📭</div><div>文件夹为空</div>
      </div>

      <!-- 提示组件 -->
      <div class="toast-container" :class="{ active: showToast }">
        <div class="toast" :class="toastType">
          <div class="toast-icon">
            <span v-if="toastType === 'info'" class="icon-info">i</span>
            <span v-else-if="toastType === 'success'" class="icon-success">✓</span>
            <span v-else-if="toastType === 'warning'" class="icon-warning">!</span>
            <span v-else-if="toastType === 'error'" class="icon-error">×</span>
          </div>
          <div class="toast-content" v-html="formatToastMessage(toastMessage)"></div>
          <button class="toast-close" @click="hideToast">×</button>
        </div>
      </div>

      <!-- 上下文菜单 -->
      <div 
        v-if="showContextMenu" 
        class="context-menu" 
        :style="{ left: contextMenuPosition.x + 'px', top: contextMenuPosition.y + 'px' }"
        @click.stop
      >
        <div class="context-menu-header">
          <div class="context-menu-title">{{ contextMenuFile?.name }}</div>
          <button class="context-menu-close" @click="hideContextMenu">✕</button>
        </div>
        <div class="context-menu-items">
          <button 
            class="context-menu-item" 
            @click="downloadCurrentFile"
            :disabled="contextMenuFile?.isDir"
          >
            <span class="context-menu-icon">⬇️</span>
            <span class="context-menu-text">下载</span>
          </button>
          <button 
            class="context-menu-item disabled" 
            disabled
          >
            <span class="context-menu-icon">📋</span>
            <span class="context-menu-text">复制</span>
          </button>
          <button 
            class="context-menu-item disabled" 
            disabled
          >
            <span class="context-menu-icon">✏️</span>
            <span class="context-menu-text">重命名</span>
          </button>
          <button 
            class="context-menu-item disabled" 
            disabled
          >
            <span class="context-menu-icon">🗑️</span>
            <span class="context-menu-text">删除</span>
          </button>
        </div>
      </div>

      <div
        id="media-viewer"
        class="media-viewer"
        :class="{ active: isViewingImage || isViewingVideo || isViewingAudio || isViewingText }"
        @click="handleMediaBackgroundClick"
        @touchstart="handleMediaTouchStart"
        @touchmove="handleMediaTouchMove"
        @touchend="handleMediaTouchEnd"
      >
        <button class="media-viewer-close" @click="closeMediaViewer">✕</button>
        <div
          class="media-viewer-content"
          @mousemove="handleMediaMouseMove"
          @mouseleave="handleMediaMouseLeave"
          :style="{
            transform: `translateY(${mediaSlideOffset}px)`,
            opacity: mediaSlideOpacity,
            transition: mediaSlideOffset === 0 ? 'transform 0.3s ease, opacity 0.3s ease' : 'none'
          }"
        >
          <!-- 加载动画 -->
          <div v-if="isMediaLoading" class="media-loading">
            <div class="media-spinner"></div>
            <div class="media-loading-text">加载中...</div>
          </div>
          
          <img v-if="isViewingImage && !isMediaLoading" :src="currentMediaUrl" :alt="currentMediaFile?.name" />
          <video v-else-if="isViewingVideo && !isMediaLoading" :src="currentMediaUrl" controls autoplay></video>
          <audio v-else-if="isViewingAudio && !isMediaLoading" :src="currentMediaUrl" controls autoplay></audio>
          <div v-else-if="isViewingText && !isMediaLoading" class="text-viewer">
            <pre v-if="FileTypeDetector.isCode(currentMediaFile?.name)" class="code-content" v-html="highlightedCode"></pre>
            <pre v-else class="plain-text-content">{{ currentTextContent }}</pre>
          </div>
          
          <!-- 桌面端导航按钮 -->
          <button class="nav-btn nav-prev desktop-only" :class="{ 'show-hover': showNavButtons }" @click="prevMedia" v-if="hasPrevMedia">
            <span class="nav-icon">←</span>
          </button>
          <button class="nav-btn nav-next desktop-only" :class="{ 'show-hover': showNavButtons }" @click="nextMedia" v-if="hasNextMedia">
            <span class="nav-icon">→</span>
          </button>
        </div>
        <div class="media-viewer-nav" v-if="currentMediaFile && !isMediaLoading">
          <span class="nav-info">{{ currentMediaFile.name }}</span>
          <span class="nav-counter" v-if="imageFiles.length > 1">
            {{ currentMediaIndex + 1 }} / {{ imageFiles.length }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, defineEmits, watch, onUnmounted, computed } from 'vue'
import { Capacitor } from '@capacitor/core'
import UserAPI from './lib/user-api'
import FileAPI from './lib/file-api'
import CacheManager from './lib/cache-manager'
import { FileTypeDetector, FileSizeFormatter, DateFormatter } from './lib/helpers'
import hljs from 'highlight.js/lib/core'
import javascript from 'highlight.js/lib/languages/javascript'
import typescript from 'highlight.js/lib/languages/typescript'
import python from 'highlight.js/lib/languages/python'
import java from 'highlight.js/lib/languages/java'
import cpp from 'highlight.js/lib/languages/cpp'
import csharp from 'highlight.js/lib/languages/csharp'
import php from 'highlight.js/lib/languages/php'
import ruby from 'highlight.js/lib/languages/ruby'
import go from 'highlight.js/lib/languages/go'
import rust from 'highlight.js/lib/languages/rust'
import swift from 'highlight.js/lib/languages/swift'
import kotlin from 'highlight.js/lib/languages/kotlin'
import sql from 'highlight.js/lib/languages/sql'
import bash from 'highlight.js/lib/languages/bash'
import powershell from 'highlight.js/lib/languages/powershell'
import yaml from 'highlight.js/lib/languages/yaml'
import json from 'highlight.js/lib/languages/json'
import xml from 'highlight.js/lib/languages/xml'
import css from 'highlight.js/lib/languages/css'
import html from 'highlight.js/lib/languages/xml'
import TransferClient from './lib/transfer'

// 注册 highlight.js 语言支持
hljs.registerLanguage('javascript', javascript)
hljs.registerLanguage('typescript', typescript)
hljs.registerLanguage('python', python)
hljs.registerLanguage('java', java)
hljs.registerLanguage('cpp', cpp)
hljs.registerLanguage('csharp', csharp)
hljs.registerLanguage('php', php)
hljs.registerLanguage('ruby', ruby)
hljs.registerLanguage('go', go)
hljs.registerLanguage('rust', rust)
hljs.registerLanguage('swift', swift)
hljs.registerLanguage('kotlin', kotlin)
hljs.registerLanguage('sql', sql)
hljs.registerLanguage('bash', bash)
hljs.registerLanguage('powershell', powershell)
hljs.registerLanguage('yaml', yaml)
hljs.registerLanguage('json', json)
hljs.registerLanguage('xml', xml)
hljs.registerLanguage('css', css)
hljs.registerLanguage('html', html)

const emit = defineEmits(['login-state-changed'])

const viewMode = ref('list')
const files = ref([])
const currentPath = ref('/')
const currentPathArray = ref([])
const selectedFile = ref(null)
const loading = ref(false)
const error = ref('')

const fileAPI = new FileAPI()
const isViewingImage = ref(false)
const isViewingVideo = ref(false)
const isViewingAudio = ref(false)
const isViewingText = ref(false)
const currentMediaFile = ref(null)
const currentMediaUrl = ref('')
const currentTextContent = ref('')
const isMediaLoading = ref(false)
const showUserMenu = ref(false)
const showPathList = ref(false)
const showRightMenu = ref(false)
const fileTouchStartTime = ref(0)
const fileTouchTimer = ref(null)
const touchedFile = ref(null)
const lastTapTime = ref(0)
const lastTappedFile = ref(null)

// 图片导航相关
const imageFiles = ref([])
const currentMediaIndex = ref(-1)
const showNavButtons = ref(false)
const mediaTouchStartX = ref(0)
const mediaTouchEndX = ref(0)
const mediaTouchStartY = ref(0)
const mediaTouchEndY = ref(0)
const mediaMouseMoveTimer = ref(null)

// 媒体预览手势相关（上下滑关闭、左右滑切图）
const mediaSwipeAxis = ref(null) // 'x' | 'y' | null
const mediaSwipeStartedOnClosableArea = ref(false)
const mediaSlideOffset = ref(0) // 滑动偏移量，用于动画效果
const mediaSlideOpacity = ref(1) // 滑动时的透明度，用于动画效果

const isMobile = ref(false)
const isAndroidApp = ref(false)
const contentContainer = ref(null)
let contentTouchStartListener = null

// 长按菜单相关
const showContextMenu = ref(false)
const contextMenuPosition = ref({ x: 0, y: 0 })
const contextMenuFile = ref(null)

const isMediaViewerActive = computed(() => {
  return isViewingImage.value || isViewingVideo.value || isViewingAudio.value || isViewingText.value
})

const backgroundScrollLock = {
  locked: false,
  contentOverflow: '',
  contentScrollTop: 0,
  bodyOverflow: '',
  htmlOverflow: ''
}

function lockBackgroundScroll() {
  if (backgroundScrollLock.locked) return
  backgroundScrollLock.locked = true

  if (contentContainer.value) {
    backgroundScrollLock.contentOverflow = contentContainer.value.style.overflow
    backgroundScrollLock.contentScrollTop = contentContainer.value.scrollTop
    contentContainer.value.style.overflow = 'hidden'
  }

  if (typeof document !== 'undefined') {
    backgroundScrollLock.bodyOverflow = document.body.style.overflow
    backgroundScrollLock.htmlOverflow = document.documentElement.style.overflow
    document.body.style.overflow = 'hidden'
    document.documentElement.style.overflow = 'hidden'
  }
}

function unlockBackgroundScroll() {
  if (!backgroundScrollLock.locked) return
  backgroundScrollLock.locked = false

  if (contentContainer.value) {
    contentContainer.value.style.overflow = backgroundScrollLock.contentOverflow
    contentContainer.value.scrollTop = backgroundScrollLock.contentScrollTop
  }

  if (typeof document !== 'undefined') {
    document.body.style.overflow = backgroundScrollLock.bodyOverflow
    document.documentElement.style.overflow = backgroundScrollLock.htmlOverflow
  }
}

// 提示系统相关
const showToast = ref(false)
const toastMessage = ref('')
const toastType = ref('info') // info, success, warning, error
const toastTimer = ref(null)

// 缩略图懒加载相关
const thumbnailObserver = ref(null)
const thumbnailElements = ref(new Map())

// 将文件名映射到 highlight.js 语言标识符
function getLanguageFromFilename(filename) {
  const ext = filename.toLowerCase().substring(filename.lastIndexOf('.'));
  const languageMap = {
    '.js': 'javascript',
    '.jsx': 'javascript',
    '.mjs': 'javascript',
    '.ts': 'typescript',
    '.tsx': 'typescript',
    '.py': 'python',
    '.java': 'java',
    '.c': 'c',
    '.h': 'c',
    '.cpp': 'cpp',
    '.cc': 'cpp',
    '.cxx': 'cpp',
    '.hpp': 'cpp',
    '.hh': 'cpp',
    '.hxx': 'cpp',
    '.cs': 'csharp',
    '.php': 'php',
    '.rb': 'ruby',
    '.go': 'go',
    '.rs': 'rust',
    '.swift': 'swift',
    '.kt': 'kotlin',
    '.kts': 'kotlin',
    '.lua': 'lua',
    '.pl': 'perl',
    '.pm': 'perl',
    '.sql': 'sql',
    '.sh': 'bash',
    '.bash': 'bash',
    '.zsh': 'bash',
    '.ps1': 'powershell',
    '.bat': 'batch',
    '.cmd': 'batch',
    '.html': 'html',
    '.htm': 'html',
    '.css': 'css',
    '.json': 'json',
    '.xml': 'xml',
    '.yaml': 'yaml',
    '.yml': 'yaml',
    '.toml': 'toml',
    '.ini': 'ini',
    '.md': 'markdown',
    '.markdown': 'markdown',
  };
  return languageMap[ext] || 'plaintext';
}

// 计算高亮后的代码内容
const highlightedCode = computed(() => {
  if (!currentTextContent.value || !currentMediaFile.value) return ''
  if (FileTypeDetector.isCode(currentMediaFile.value.name)) {
    const language = getLanguageFromFilename(currentMediaFile.value.name)
    try {
      const result = hljs.highlight(currentTextContent.value, { language })
      return result.value
    } catch (error) {
      console.error('代码高亮失败:', error)
      return currentTextContent.value
    }
  }
  return currentTextContent.value
})

function refreshCurrentList() {
  if (loading.value) return
  return loadFiles(currentPath.value)
}


function updateBreadcrumb() {
  if (currentPath.value === '/') currentPathArray.value = []
  else currentPathArray.value = currentPath.value.split('/').filter(p => p)
}

async function loadFiles(path = '/') {
  loading.value = true
  error.value = ''
  selectedFile.value = null
  
  // 清理旧的缩略图对象URL资源
  cleanupThumbnailUrls()
  
  try {
    const list = await fileAPI.listFiles(path)
    // 为每个文件添加thumbUrl属性
    const processedList = list.map(file => ({
      ...file,
      thumbUrl: null // 初始化为null，懒加载时再设置
    }))
    files.value = processedList.sort((a,b) => {
      if ((a.isDir?1:0) !== (b.isDir?1:0)) return (b.isDir?1:0) - (a.isDir?1:0)
      return a.name.localeCompare(b.name)
    })
    currentPath.value = path
    updateBreadcrumb()
    
    // 更新URL参数，支持浏览器返回
    updateUrlPath(path)
  } catch (e) {
    error.value = '加载文件列表失败: ' + (e.message || e)
    files.value = []
  } finally {
    loading.value = false
  }
}

function selectFile(f) { selectedFile.value = f }

async function openFile(f) {
  if (f.isDir) {
    const newPath = f.path || (currentPath.value.endsWith('/') ? currentPath.value + f.name : currentPath.value + '/' + f.name)
    await loadFiles(newPath)
  } else {
    if (isPreviewable(f)) {
      console.log("start to preview file", f.name)
      await openMediaViewer(f)
    } else {
      console.log("not support preview of file ", f.name)
      // 文件不支持预览，显示提示
      selectedFile.value = f // 设置选中的文件，以便下载按钮可以正常工作
      showToastMessage(`"${f.name}" 不支持预览，请下载后再查看。`, 'warning', 5000)
    }
  }
}

async function openMediaViewer(file) {
  currentMediaFile.value = file
  isMediaLoading.value = true
  
  // 重置所有查看状态
  isViewingImage.value = false
  isViewingVideo.value = false
  isViewingAudio.value = false
  isViewingText.value = false
  currentMediaUrl.value = ''
  currentTextContent.value = ''
  
  // 检查文件大小限制（5MB）
  if (file.size > 5 * 1024 * 1024) {
    selectedFile.value = file // 设置选中的文件，以便下载按钮可以正常工作
    showToastMessage('文件内容过大，暂时不支持预览，请下载后再预览。', 'warning')
    isMediaLoading.value = false
    return
  }
  
  // 更新图片文件列表
  updateImageFilesList()
  
  // 查找当前文件在图片列表中的位置
  const index = imageFiles.value.findIndex(f => f.path === file.path)
  currentMediaIndex.value = index
  
  if (isImage(file)) {
    isViewingImage.value = true
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
  } else if (isVideo(file)) {
    isViewingVideo.value = true
    currentMediaUrl.value = await fileAPI.getFileUrl(file.path)
    isMediaLoading.value = false
  } else if (isAudio(file)) {
    isViewingAudio.value = true
    currentMediaUrl.value = await fileAPI.getFileUrl(file.path)
    isMediaLoading.value = false
  } else if (isText(file)) {
    isViewingText.value = true
    try {
      // 获取文本文件内容
      const response = await fetch(await fileAPI.getFileUrl(file.path))
      if (response.ok) {
        const text = await response.text()
        // 限制文本大小，避免过大文件导致性能问题
        if (text.length > 100000) { // 100KB限制
          currentTextContent.value = text.substring(0, 100000) + '\n\n... (文件过大，已截断显示前100KB内容)'
        } else {
          currentTextContent.value = text
        }
      } else {
        currentTextContent.value = '无法加载文件内容'
      }
    } catch (error) {
      console.error('加载文本文件失败:', error)
      currentTextContent.value = '加载文件内容失败'
    }
    isMediaLoading.value = false
  }
}

// 更新图片文件列表
function updateImageFilesList() {
  imageFiles.value = files.value.filter(f => isImage(f))
}

// 计算是否有前一张/后一张图片
const hasPrevMedia = computed(() => {
  return currentMediaIndex.value > 0 && imageFiles.value.length > 1
})

const hasNextMedia = computed(() => {
  return currentMediaIndex.value < imageFiles.value.length - 1 && imageFiles.value.length > 1
})

// 切换到前一张图片
async function prevMedia() {
  if (!hasPrevMedia.value) return
  
  const prevIndex = currentMediaIndex.value - 1
  const prevFile = imageFiles.value[prevIndex]
  
  if (prevFile) {
    currentMediaIndex.value = prevIndex
    await loadMediaFile(prevFile)
  }
}

// 切换到后一张图片
async function nextMedia() {
  if (!hasNextMedia.value) return
  
  const nextIndex = currentMediaIndex.value + 1
  const nextFile = imageFiles.value[nextIndex]
  
  if (nextFile) {
    currentMediaIndex.value = nextIndex
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
    currentMediaUrl.value = await fileAPI.getFileUrl(file.path, 'image')
    
    // 图片加载完成后隐藏加载动画
    const img = new Image()
    img.onload = () => {
      isMediaLoading.value = false
    }
    img.onerror = () => {
      isMediaLoading.value = false
    }
    img.src = currentMediaUrl.value
  } else if (isVideo(file)) {
    isViewingImage.value = false
    isViewingVideo.value = true
    currentMediaUrl.value = await fileAPI.getFileUrl(file.path, 'video')
    isMediaLoading.value = false
  }
}

// 触摸滑动导航
function handleMediaTouchStart(event) {
  if (!isMediaViewerActive.value) return

  const touch = event.touches[0]
  mediaTouchStartX.value = touch.clientX
  mediaTouchStartY.value = touch.clientY
  mediaTouchEndX.value = touch.clientX
  mediaTouchEndY.value = touch.clientY

  mediaSwipeAxis.value = null

  // 所有预览类型都支持上下滑关闭手势
  // 但如果是视频/音频的控件区域，优先响应控件操作
  const startedOnMediaElement = !!event.target.closest('img, video, audio, .text-viewer')
  const startedOnMediaControls = !!event.target.closest('video, audio') && 
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
  showNavButtons.value = true
  
  // 清除之前的定时器
  if (mediaMouseMoveTimer.value) {
    clearTimeout(mediaMouseMoveTimer.value)
  }
  
  // 设置定时器，2秒后隐藏按钮
  mediaMouseMoveTimer.value = setTimeout(() => {
    showNavButtons.value = false
  }, 2000)
}

function handleMediaMouseLeave() {
  showNavButtons.value = false
  
  if (mediaMouseMoveTimer.value) {
    clearTimeout(mediaMouseMoveTimer.value)
    mediaMouseMoveTimer.value = null
  }
}

function closeMediaViewer() {
  isViewingImage.value = false
  isViewingVideo.value = false
  isViewingAudio.value = false
  isViewingText.value = false
  currentMediaFile.value = null
  currentMediaUrl.value = ''
  currentTextContent.value = ''
  isMediaLoading.value = false
  currentMediaIndex.value = -1
  imageFiles.value = []
  
  // 重置滑动动画
  mediaSlideOffset.value = 0
  mediaSlideOpacity.value = 1
  
  // 清理鼠标移动定时器
  if (mediaMouseMoveTimer.value) {
    clearTimeout(mediaMouseMoveTimer.value)
    mediaMouseMoveTimer.value = null
  }
}

// 处理点击媒体查看器背景关闭预览
function handleMediaBackgroundClick(event) {
  // 只有在媒体查看器激活时才处理点击
  if (!isViewingImage.value && !isViewingVideo.value && !isViewingAudio.value && !isViewingText.value) {
    return
  }
  
  // 如果点击的是关闭按钮，不处理（关闭按钮有自己的点击事件）
  if (event.target.closest('.media-viewer-close')) {
    return
  }
  
  // 如果点击的是导航按钮，不处理（导航按钮有自己的点击事件）
  if (event.target.closest('.nav-btn')) {
    return
  }
  
  // 如果点击的是内容区域（图片、视频、音频、文本查看器），不处理
  const contentElement = event.target.closest('.media-viewer-content')
  if (contentElement) {
    // 进一步检查是否点击的是内容区域内的媒体元素
    const mediaElements = contentElement.querySelectorAll('img, video, audio, .text-viewer, .media-loading')
    for (const mediaElement of mediaElements) {
      if (mediaElement.contains(event.target)) {
        return
      }
    }
    // 如果点击的是内容区域但不是媒体元素本身（比如内容区域的空白部分），也不关闭
    return
  }
  
  // 如果点击的是媒体查看器导航信息，不处理
  if (event.target.closest('.media-viewer-nav')) {
    return
  }
  
  // 否则，点击的是背景区域，关闭媒体查看器
  closeMediaViewer()
}

// 更新是否为移动设备视图
function handleResize() {
  if (typeof window !== 'undefined') {
    isMobile.value = window.innerWidth <= 768
  }
}

async function goToRoot() { 
  await loadFiles('/')
  hidePathDropdown()
}
async function goToPath(index) {
  const parts = currentPathArray.value.slice(0, index + 1)
  const path = '/' + parts.join('/')
  await loadFiles(path)
  hidePathDropdown()
}

// 移动设备导航方法
function goBack() {
  if (currentPathArray.value.length > 0) {
    const parts = currentPathArray.value.slice(0, -1)
    const path = parts.length === 0 ? '/' : '/' + parts.join('/')
    loadFiles(path)
  }
}

function getCurrentPathDisplay() {
  if (currentPath.value === '/') return '根目录'
  const parts = currentPathArray.value
  return parts.length > 0 ? parts[parts.length - 1] : '根目录'
}

function showPathDropdown() {
  showPathList.value = true
}

function hidePathDropdown() {
  showPathList.value = false
}

// URL参数处理
function updateUrlPath(path) {
  const url = new URL(window.location.href)
  if (path === '/') {
    url.searchParams.delete('path')
  } else {
    url.searchParams.set('path', encodeURIComponent(path))
  }
  window.history.pushState({ path }, '', url.toString())
}

function getUrlPath() {
  const urlParams = new URLSearchParams(window.location.search)
  const pathParam = urlParams.get('path')
  return pathParam ? decodeURIComponent(pathParam) : '/'
}

// 处理浏览器前进/后退
function handlePopState(event) {
  const path = event.state?.path || '/'
  if (path !== currentPath.value) {
    loadFiles(path)
  }
}



// 文件触摸事件处理
function handleFileTouchStart(file, event) {
  fileTouchStartTime.value = Date.now()
  touchedFile.value = file
  fileTouchTimer.value = setTimeout(() => {
    // 长按文件（超过500ms）显示文件操作菜单
    showContextMenuForFile(file, event)
  }, 500)
}

function handleFileTouchEnd(file, event) {
  clearTimeout(fileTouchTimer.value)
  const touchDuration = Date.now() - fileTouchStartTime.value
  const currentTime = Date.now()
  
  // 如果是长按（超过500ms），不处理短按逻辑
  if (touchDuration >= 500) {
    // 长按已经显示了菜单，不需要其他处理
    touchedFile.value = null
    return
  }
  
  // 检测双击
  if (lastTappedFile.value === file && (currentTime - lastTapTime.value) < 500) {
    // 双击：调用 openFile 处理所有文件类型
    openFile(file)
    lastTapTime.value = 0
    lastTappedFile.value = null
    touchedFile.value = null
    // 阻止事件冒泡，避免触发click事件
    if (event) {
      event.preventDefault()
      event.stopPropagation()
    }
    return
  }
  
  // 短按（小于500ms）只选中文件/目录，不打开
  if (touchDuration < 500 && touchedFile.value === file) {
    selectFile(file)
  }
  
  // 记录点击时间和文件
  lastTapTime.value = currentTime
  lastTappedFile.value = file
  touchedFile.value = null
}

function isImage(file) { return !file.isDir && FileTypeDetector.isImage(file.name) }
function isVideo(file) { return !file.isDir && FileTypeDetector.isVideo(file.name) }
function isAudio(file) { return !file.isDir && FileTypeDetector.isAudio(file.name) }
function isText(file) { return !file.isDir && FileTypeDetector.isText(file.name) }
function isPreviewable(file) { return !file.isDir && (isImage(file) || isVideo(file) || isAudio(file) || isText(file)) }

// 处理文件点击事件
function handleFileClick(file, event) {
  // 在移动设备上，单击打开文件；在PC上，只选择文件
  if (isMobile.value) {
    // 移动设备：单击打开文件
    openFile(file)
  } else {
    // PC：只选择文件（双击打开）
    selectFile(file)
  }
}

// 上下文菜单相关函数
function showContextMenuForFile(file, event) {
  // 阻止默认行为
  if (event) {
    event.preventDefault()
    event.stopPropagation()
  }
  
  // 设置菜单位置
  let x, y
  if (event && event.touches && event.touches[0]) {
    // 触摸事件
    x = event.touches[0].clientX
    y = event.touches[0].clientY
  } else if (event) {
    // 鼠标事件
    x = event.clientX
    y = event.clientY
  } else {
    // 默认位置
    x = window.innerWidth / 2
    y = window.innerHeight / 2
  }
  
  // 确保菜单在可视区域内
  const menuWidth = 200
  const menuHeight = 150
  if (x + menuWidth > window.innerWidth) {
    x = window.innerWidth - menuWidth - 10
  }
  if (y + menuHeight > window.innerHeight) {
    y = window.innerHeight - menuHeight - 10
  }
  
  contextMenuPosition.value = { x, y }
  contextMenuFile.value = file
  showContextMenu.value = true
  
  // 选中文件
  selectFile(file)
}

function hideContextMenu() {
  showContextMenu.value = false
  contextMenuFile.value = null
}

async function downloadCurrentFile() {
  // 优先使用contextMenuFile，如果没有则使用selectedFile
  const file = contextMenuFile.value || selectedFile.value
  if (!file) return
  
  const filePath = file.path || (currentPath.value + (currentPath.value.endsWith('/') ? '' : '/') + file.name)
  
  try {
    showToastMessage('开始下载文件: ' + file.name, 'info')
    
    // 调用FileAPI下载文件
    const fileAPI = new FileAPI()
    const success = await fileAPI.downloadFile(filePath, file)
    
    if (success) {
      showToastMessage('文件下载成功: ' + file.name, 'success')
    } else {
      showToastMessage('文件下载失败', 'error')
    }
  } catch (error) {
    console.error('Download error:', error)
    showToastMessage('下载失败: ' + error.message, 'error')
  } finally {
    hideContextMenu()
  }
}

// 点击其他地方关闭菜单
function handleDocumentClick(event) {
  if (showContextMenu.value) {
    const menuElement = document.querySelector('.context-menu')
    if (menuElement && !menuElement.contains(event.target)) {
      hideContextMenu()
    }
  }
}
function getFileIcon(file) {
  if (file.isDir) return '📁'
  const ext = file.name.toLowerCase().substring(file.name.lastIndexOf('.'))
  const iconMap = { 
    '.jpg':'🖼️','.jpeg':'🖼️','.png':'🖼️','.gif':'🖼️','.bmp':'🖼️','.webp':'🖼️','.svg':'🖼️',
    '.mp4':'🎬','.webm':'🎬','.mov':'🎬','.avi':'🎬','.mkv':'🎬','.flv':'🎬',
    '.mp3':'🎵','.mpeg':'🎵','.wav':'🎵','.ogg':'🎵','.aac':'🎵','.flac':'🎵','.m4a':'🎵'
  }
  return iconMap[ext] || '📄'
}
function formatSize(b) { return FileSizeFormatter.format(b) }
function formatDate(d) { return DateFormatter.format(d) }
function getFileUrl(file) { return fileAPI.getFileUrl(file.path) }

// 缩略图懒加载函数
async function loadThumbnail(file) {
  if (!file.thumbUrl && isImage(file)) {
    try {
      const blob = await fileAPI.getFileThumbnail(file.path)
      if (blob) {
        // 使用URL.createObjectURL创建对象URL
        const objectUrl = URL.createObjectURL(blob)
        // 更新文件的thumbUrl属性
        const fileIndex = files.value.findIndex(f => f.path === file.path)
        if (fileIndex !== -1) {
          files.value[fileIndex].thumbUrl = objectUrl
        }
      }
    } catch (error) {
      console.error('加载缩略图失败:', error)
    }
  }
}

// 初始化Intersection Observer
function initThumbnailObserver() {
  if (thumbnailObserver.value) {
    thumbnailObserver.value.disconnect()
  }
  
  thumbnailObserver.value = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && viewMode.value === 'thumbnail') {
        const fileId = entry.target.dataset.fileId
        if (fileId) {
          const file = files.value.find(f => f.path === fileId)
          if (file) {
            loadThumbnail(file)
          }
        }
      }
    })
  }, {
    root: null,
    rootMargin: '100px', // 提前100px开始加载
    threshold: 0.1
  })
}

// 注册缩略图元素到Observer
function registerThumbnailElement(element, file) {
  if (element && file) {
    element.dataset.fileId = file.path
    thumbnailElements.value.set(file.path, element)
    if (thumbnailObserver.value) {
      thumbnailObserver.value.observe(element)
    }
  }
}

// 清理缩略图对象URL资源
function cleanupThumbnailUrls() {
  // 清理所有对象URL
  files.value.forEach(file => {
    if (file.thumbUrl && file.thumbUrl.startsWith('blob:')) {
      URL.revokeObjectURL(file.thumbUrl)
    }
  })
}

// 清理所有缩略图资源（包括Observer）
function cleanupThumbnails() {
  cleanupThumbnailUrls()
  
  // 清理Observer
  if (thumbnailObserver.value) {
    thumbnailObserver.value.disconnect()
    thumbnailObserver.value = null
  }
  
  // 清理元素映射
  thumbnailElements.value.clear()
}


// 显示提示消息
function showToastMessage(message, type = 'info', duration = 3000) {
  // 清除之前的定时器
  if (toastTimer.value) {
    clearTimeout(toastTimer.value)
    toastTimer.value = null
  }
  
  // 设置新的提示
  toastMessage.value = message
  toastType.value = type
  showToast.value = true
  
  // 如果是警告类型且包含下载提示，延长显示时间
  if (type === 'warning' && message.includes('下载')) {
    duration = 5000
  }
  
  // 自动隐藏
  toastTimer.value = setTimeout(() => {
    hideToast()
  }, duration)
}

// 隐藏提示
function hideToast() {
  showToast.value = false
  if (toastTimer.value) {
    clearTimeout(toastTimer.value)
    toastTimer.value = null
  }
}

// 格式化提示消息，添加下载链接
function formatToastMessage(message) {
  // 如果消息包含"下载"字样，添加下载按钮
  if (message.includes('下载') && selectedFile.value) {
    return `${message}<br><button class="download-btn" data-action="download">立即下载</button>`
  }
  return message
}

function toggleUserMenu() {
  showUserMenu.value = !showUserMenu.value
}

// 右侧菜单控制函数
function toggleRightMenu() {
  showRightMenu.value = !showRightMenu.value

}

function hideRightMenu() {
  showRightMenu.value = false
}

// 切换视图模式
function toggleViewMode() {
  viewMode.value = viewMode.value === 'list' ? 'thumbnail' : 'list'
  hideRightMenu()
}

// 获取用户名
function getUserName() {
  try {
    // 从 RuntimeVariables 获取用户名
    return window.RuntimeVariables?.getUserName() || '用户'
  } catch (e) {
    return '用户'
  }
}

// 清理缓存
async function cleanCache() {
  showUserMenu.value = false
  showRightMenu.value = false
  
  try {
    // 清理文件API的缓存
    fileAPI.clearMemoryCache()
    
    // 获取CacheManager实例
    const cacheManager = CacheManager.getInstance()
    
    // 清理CacheManager的localStorage缓存
    cacheManager.cleanupLocalStorage()
    
    // 清理CacheManager的文件系统缓存
    await cacheManager.cleanupCache()
    
    // 清理CacheManager的内存缓存
    cacheManager.clearMemoryCache()
    
    alert('缓存清理完成！已清理：内存缓存、localStorage缓存和文件系统缓存。')
  } catch (error) {
    console.error('清理缓存失败:', error)
    alert('清理缓存失败: ' + error.message)
  }
}

// 重新加载页面
function reloadPage() {
  showUserMenu.value = false
  showRightMenu.value = false
  window.location.reload()
}

function logout() {
  
  showUserMenu.value = false
  UserAPI.logout().then(() => {
    console.log("用户已登出")
    emit('login-state-changed')
  })
}

onMounted(() => {
  // 初始化移动端视图判断
  handleResize()
  if (typeof window !== 'undefined') {
    window.addEventListener('resize', handleResize)
  }

  // 判断是否为 Android 原生 App（Capacitor 环境）
  if (Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android') {
    isAndroidApp.value = true
  }
  
  // 添加文档点击事件监听器，用于关闭上下文菜单
  document.addEventListener('click', handleDocumentClick)
  
  // content 触摸监听（touchstart 用 passive:true，不影响滚动）
  if (contentContainer.value) {
    // 下拉刷新已移除：不再劫持 touch 事件，避免滚动混乱
  }

  if (UserAPI.isLogined()) {
    UserAPI.refreshToken().then(error_msg => {
      console.log("refreshToken", error_msg)
      if (error_msg === true){
        TransferClient.init('webrtc')
        
        // 从URL参数读取路径
        const initialPath = getUrlPath()
        loadFiles(initialPath)
      } else {
        console.log("Token 刷新失败，跳转到登录页面")
        emit('login-state-changed')
      }
    })
  } else {
    console.log("用户未登录，跳转到登录页面")
    emit('login-state-changed')
    return
  }
 
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && (isViewingImage.value || isViewingVideo.value)) {
      closeMediaViewer()
    } else if (isViewingImage.value && imageFiles.value.length > 1) {
      // 左右箭头键切换图片
      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        prevMedia()
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        nextMedia()
      }
    }
  })
  
  // 点击页面其他地方时关闭菜单
  document.addEventListener('click', (e) => {
    // 关闭用户菜单
    if (showUserMenu.value && !e.target.closest('.user-menu')) {
      showUserMenu.value = false
    }
    // 关闭左侧菜单

    // 关闭右侧菜单
    if (showRightMenu.value && !e.target.closest('.mobile-menu-right')) {
      showRightMenu.value = false
    }
  })
  
  // 监听浏览器前进/后退事件
  window.addEventListener('popstate', handlePopState)
  
  // 初始化缩略图Observer
  initThumbnailObserver()
  
  // 添加提示组件点击事件委托
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('download-btn') || e.target.closest('.download-btn')) {
      e.preventDefault()
      downloadCurrentFile()
    }
  })
})

// 组件卸载时清理资源
onUnmounted(() => {
  cleanupThumbnails()
  unlockBackgroundScroll()
  if (typeof window !== 'undefined') {
    window.removeEventListener('resize', handleResize)
  }
  if (contentContainer.value && contentTouchStartListener) {
    contentContainer.value.removeEventListener('touchstart', contentTouchStartListener)
  }
  contentTouchStartListener = null
  
  // 移除文档点击事件监听器
  document.removeEventListener('click', handleDocumentClick)
})

// 预览打开时锁住背景滚动，避免手势带动列表滚动
watch(isMediaViewerActive, (active) => {
  if (active) {
    lockBackgroundScroll()
  } else {
    unlockBackgroundScroll()
  }
})

// 监听视图模式变化，重新初始化Observer
watch(viewMode, (newMode) => {
  if (newMode === 'thumbnail') {
    // 延迟一点时间确保DOM已更新
    setTimeout(() => {
      initThumbnailObserver()
      // 重新注册所有可见的缩略图元素
      thumbnailElements.value.forEach((element, filePath) => {
        const file = files.value.find(f => f.path === filePath)
        if (file && thumbnailObserver.value) {
          thumbnailObserver.value.observe(element)
        }
      })
    }, 100)
  } else {
    // 列表模式时清理Observer
    if (thumbnailObserver.value) {
      thumbnailObserver.value.disconnect()
    }
  }
})

// 监听文件列表变化，清理旧的缩略图资源
watch(files, (newFiles, oldFiles) => {
  // 清理旧文件中不再需要的对象URL
  if (oldFiles && oldFiles.length > 0) {
    oldFiles.forEach(oldFile => {
      const stillExists = newFiles.some(newFile => newFile.path === oldFile.path)
      if (!stillExists && oldFile.thumbUrl && oldFile.thumbUrl.startsWith('blob:')) {
        URL.revokeObjectURL(oldFile.thumbUrl)
      }
    })
  }
  
  // 更新图片文件列表
  updateImageFilesList()
  
  // 如果当前正在查看的图片不在新列表中，关闭查看器
  if (currentMediaFile.value && isViewingImage.value) {
    const stillExists = newFiles.some(file => file.path === currentMediaFile.value.path)
    if (!stillExists) {
      closeMediaViewer()
    }
  }
  
  // 文件列表变化后重新初始化Observer
  if (viewMode.value === 'thumbnail') {
    setTimeout(() => {
      initThumbnailObserver()
    }, 100)
  }
}, { deep: true })
</script>

<style>
/* 导入 highlight.js 样式 */
@import 'highlight.js/styles/github-dark.css';

* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5; margin: 0; padding: 0; }
#app { width: 100%; height: 100%; display: flex; flex-direction: column; }
/* 紫色状态栏已移至App.vue中统一管理 */

.breadcrumb-container { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
.user-menu { position: relative; }
.user-btn { background: transparent; border: none; color: white; padding: 8px; cursor: pointer; font-size: 24px; display: flex; align-items: center; justify-content: center; transition: all 0.3s; width: 44px; height: 44px; border-radius: 50%; }
.user-btn:hover { background: rgba(255,255,255,0.2); }
.user-icon { font-size: 24px; }
.user-dropdown { position: absolute; top: 100%; right: 0; margin-top: 8px; background: white; border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.15); min-width: 160px; overflow: hidden; display: none; z-index: 1000; }
.user-dropdown.active { display: block; }
.dropdown-item { width: 100%; padding: 12px 16px; border: none; background: white; color: #333; text-align: left; cursor: pointer; display: flex; align-items: center; gap: 10px; font-size: 14px; transition: all 0.2s; }
.dropdown-item:hover { background: #f5f7fa; }
.dropdown-icon { font-size: 16px; }
.breadcrumb-btn { background: rgba(255,255,255,0.2); border: 1px solid rgba(255,255,255,0.3); color: white; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 14px; transition: all 0.3s; }
.breadcrumb-btn:hover { background: rgba(255,255,255,0.3); }
.breadcrumb-separator { color: rgba(255,255,255,0.7); }
.toolbar { background: white; padding: 15px 20px; display: flex; justify-content: flex-end; border-bottom: 1px solid #e0e0e0; }
.view-toggle { display: flex; gap: 8px; }
.view-toggle-btn { padding: 6px 12px; border: 1px solid #ddd; background: white; cursor: pointer; border-radius: 4px; transition: all 0.3s; display: flex; align-items: center; gap: 6px; }
.view-toggle-btn:hover { background: #f5f7fa; border-color: #667eea; }
.view-toggle-icon { font-size: 16px; }
.view-toggle-text { font-size: 14px; }

/* 移动设备工具栏样式 */
.mobile-toolbar {
  display: flex;
  width: 100%;
  align-items: center;
  gap: 8px;
}

.mobile-nav-buttons {
  flex-shrink: 0; /* 防止导航按钮被压缩 */
}

.mobile-path-container {
  flex: 1;
  min-width: 0; /* 防止flex item溢出 */
  position: relative; /* 为下拉菜单提供定位上下文 */
}

.mobile-view-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0; /* 防止视图切换按钮被压缩 */
}

.mobile-path-btn {
  width: 100%;
  padding: 6px 12px;
  border: 1px solid #ddd;
  background: white;
  cursor: pointer;
  border-radius: 4px;
  font-size: 14px;
  color: #333;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  transition: all 0.3s;
}

.mobile-path-btn:hover {
  background: #f5f7fa;
  border-color: #667eea;
}

/* 移动设备导航按钮样式 */
.mobile-nav-buttons {
  display: flex;
  gap: 6px;
  align-items: center;
}

.nav-up-btn,
.nav-home-btn,
.nav-refresh-btn {
  padding: 4px 8px;
  border: 1px solid #ddd;
  background: white;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  font-size: 14px;
}

.nav-up-btn:hover:not(.disabled),
.nav-home-btn:hover,
.nav-refresh-btn:hover {
  background: #f5f7fa;
  border-color: #667eea;
}

.nav-up-btn.disabled {
  background: #f5f5f5;
  color: #999;
  cursor: not-allowed;
  opacity: 0.6;
  border-color: #eee;
}

.nav-up-btn.disabled:hover {
  background: #f5f5f5;
  border-color: #eee;
}

.nav-up-icon {
  font-size: 16px;
  font-weight: bold;
}

.nav-home-icon {
  font-size: 16px;
}

.nav-refresh-icon {
  font-size: 16px;
}

.mobile-view-toggle {
  display: flex;
  gap: 8px;
}

.mobile-view-btn {
  padding: 6px 12px;
  border: 1px solid #ddd;
  background: white;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 34px;
}

.mobile-view-btn:hover {
  background: #f5f7fa;
  border-color: #667eea;
}

.mobile-view-icon {
  font-size: 16px;
}
.content {
  flex: 1;
  overflow: auto;
  padding: 20px;
  position: relative; /* 为下拉刷新指示器提供定位上下文 */
  overscroll-behavior: contain; /* 防止滚动到边界后把手势传递给 body */
  touch-action: pan-y; /* 提示浏览器以垂直滚动为主 */
}
.file-list { background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
.file-list-header { display: grid; grid-template-columns: 40px 1fr 120px 120px; gap: 20px; padding: 15px 20px; background: #f9f9f9; border-bottom: 1px solid #e0e0e0; font-weight: 600; color: #333; position: sticky; top: 0; }
.file-list-item { display: grid; grid-template-columns: 40px 1fr 120px 120px; gap: 20px; padding: 12px 20px; align-items: center; border-bottom: 1px solid #f0f0f0; cursor: pointer; transition: all 0.2s; }
.file-list-item:hover { background: #f9f9f9; }
.file-list-item.selected { background: #e6f0ff; }
.file-icon { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; font-size: 18px; }
.file-name { display: flex; align-items: center; gap: 10px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.file-size { color: #666; text-align: right; font-size: 14px; }
.file-modified { color: #999; text-align: right; font-size: 14px; }
.thumbnail-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 20px; }
.thumbnail-item { background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); cursor: pointer; transition: all 0.3s; }
.thumbnail-item:hover { transform: translateY(-4px); box-shadow: 0 4px 16px rgba(0,0,0,0.15); }
.thumbnail-item.selected { box-shadow: 0 0 0 3px #667eea; }
.thumbnail-preview { width: 100%; height: 130px; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%); position: relative; overflow: hidden; }
.thumbnail-preview img, .thumbnail-preview video { width: 100%; height: 100%; object-fit: cover; }
.thumbnail-icon { font-size: 40px; color: #999; }
.thumbnail-info { padding: 10px; border-top: 1px solid #f0f0f0; }
.thumbnail-name { font-size: 12px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: #333; margin-bottom: 5px; }
.thumbnail-size { font-size: 11px; color: #999; }
.media-viewer { display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.95); z-index: 1000; align-items: center; justify-content: center; flex-direction: column; }
.media-viewer.active { display: flex; }
.media-viewer-content { position: relative; max-width: 90%; max-height: 90%; display: flex; align-items: center; justify-content: center; }
.media-viewer-content img, .media-viewer-content video { display: block; width: auto; height: auto; max-width: 100%; max-height: 100%; object-fit: contain; background: transparent; border-radius: 8px; }
.media-viewer-close { position: absolute; top: 20px; right: 20px; color: white; font-size: 32px; cursor: pointer; background: rgba(0,0,0,0.5); border: none; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; z-index: 1001; }
.media-viewer-close:hover { background: rgba(0,0,0,0.8); }
.media-viewer-nav { position: absolute; bottom: 20px; color: white; font-size: 14px; display: flex; align-items: center; justify-content: center; gap: 20px; width: 100%; }

/* Android 原生 App 模式下，预览层整体和关闭按钮避开状态栏 */
.android-native-app .media-viewer {
  padding-top: var(--safe-area-inset-top, env(safe-area-inset-top, 0px));
  box-sizing: border-box;
}

.android-native-app .media-viewer-close {
  top: calc(20px + var(--safe-area-inset-top, env(safe-area-inset-top, 0px)));
}

.nav-info { max-width: 60%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.nav-counter { background: rgba(255, 255, 255, 0.2); padding: 4px 12px; border-radius: 12px; font-size: 12px; }

/* 导航按钮样式 */
.nav-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.5);
  border: none;
  color: white;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  transition: all 0.3s ease;
  opacity: 0;
  z-index: 1002;
}

.nav-btn:hover {
  background: rgba(0, 0, 0, 0.8);
  transform: translateY(-50%) scale(1.1);
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
    display: none;
  }
  
  .media-viewer-content {
    cursor: grab;
  }
  
  .media-viewer-content:active {
    cursor: grabbing;
  }
}

/* 媒体加载动画 */
.media-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
}

.media-spinner {
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top: 4px solid white;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  animation: spin 1s linear infinite;
}

.media-loading-text {
  color: white;
  font-size: 16px;
  font-weight: 500;
}

.loading { display: flex; justify-content: center; align-items: center; height: 200px; }
.spinner { border: 4px solid #f3f3f3; border-top: 4px solid #667eea; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; }
@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
.empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 300px; color: #999; }
.empty-icon { font-size: 60px; margin-bottom: 20px; opacity: 0.5; }
.error-message { background: #fee; border: 1px solid #fcc; color: #c33; padding: 15px; border-radius: 4px; margin-bottom: 20px; }

/* 移动设备导航样式 */
.desktop-only { display: block; }
.mobile-only { display: none; }

/* 移动设备专用header已移除，因为现在有了统一的紫色状态栏 */
.mobile-title { font-size: 18px; margin: 0; }

.back-btn {
  background: rgba(255,255,255,0.2);
  border: 1px solid rgba(255,255,255,0.3);
  color: white;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all 0.3s;
  height: 36px;
  min-width: 70px;
}

.back-btn:hover {
  background: rgba(255,255,255,0.3);
}

.back-icon {
  font-size: 16px;
  font-weight: bold;
}

.back-text {
  font-weight: 500;
}

.current-path-btn {
  flex: 1;
  background: rgba(255,255,255,0.1);
  border: 1px solid rgba(255,255,255,0.2);
  color: white;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-align: center;
  transition: all 0.3s;
  border: none;
  font-family: inherit;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.current-path-btn:hover {
  background: rgba(255,255,255,0.15);
}

.current-path-text {
  font-weight: 500;
}

.current-path-container {
  flex: 1;
  position: relative;
}

/* 路径下拉菜单 */
.path-dropdown-overlay {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.5);
  z-index: 999;
}

.path-dropdown-overlay.active {
  display: block;
}

.path-dropdown {
  display: none;
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  width: 100%;
  max-height: 300px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.15);
  z-index: 1000;
  overflow: hidden;
}

.path-dropdown.active {
  display: block;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

.path-dropdown-header {
  display: none;
}

.path-dropdown-list {
  max-height: 300px;
  overflow-y: auto;
  padding: 8px 0;
}

.path-item {
  width: 100%;
  padding: 10px 16px;
  border: none;
  background: white;
  color: #333;
  text-align: left;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  transition: all 0.2s;
}

.path-item:hover {
  background: #f5f7fa;
}

.path-icon {
  font-size: 16px;
  width: 20px;
  text-align: center;
}

/* 移动设备菜单样式 */
.mobile-header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  margin-bottom: 8px;
}

.mobile-menu-right {
  position: relative;
  display: flex;
  align-items: center;
}

.menu-btn {
  background: white;
  border: 1px solid #ddd;
  color: #333;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 34px;
  transition: all 0.3s;
}

.menu-btn:hover {
  background: #f5f7fa;
  border-color: #667eea;
}

.menu-icon {
  font-size: 20px;
  font-weight: bold;
}

.menu-overlay {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: transparent;
  z-index: 999;
}

.menu-overlay.active {
  display: block;
}

.menu-right {
  display: none;
  position: absolute;
  top: 100%;
  right: 0;
  width: 200px;
  max-height: 300px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  overflow-y: auto;
  transform: translateY(-10px);
  opacity: 0;
  transition: all 0.3s ease;
  margin-top: 8px;
}

.menu-right.active {
  display: block;
  transform: translateY(0);
  opacity: 1;
}

.menu-header {
  padding: 20px 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.menu-user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.menu-user-icon {
  font-size: 24px;
}

.menu-username {
  font-size: 16px;
  font-weight: 500;
}

.menu-list {
  padding: 16px 0;
}

.menu-item {
  width: 100%;
  padding: 14px 20px;
  border: none;
  background: white;
  color: #333;
  text-align: left;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 15px;
  transition: all 0.2s;
  border-bottom: 1px solid #f0f0f0;
}

.menu-item:last-child {
  border-bottom: none;
}

.menu-item:hover {
  background: #f5f7fa;
}

.menu-item.disabled {
  color: #999;
  cursor: not-allowed;
  opacity: 0.6;
}

.menu-item.disabled:hover {
  background: white;
}

.menu-item-icon {
  font-size: 18px;
  width: 24px;
  text-align: center;
}

.menu-item-text {
  font-weight: 500;
}

.mobile-title {
  font-size: 18px;
  margin: 0;
  text-align: center;
  flex: 1;
  padding: 0 12px;
}

@media (max-width: 768px) {
  .desktop-only { display: none !important; }
  .mobile-only { display: flex !important; }
  
  /* 紫色状态栏已移至App.vue中统一管理 */
  /* 移动设备专用header已移除，因为现在有了统一的紫色状态栏 */
  .back-btn { background: rgba(255,255,255,0.2); border: 1px solid rgba(255,255,255,0.3); color: white; padding: 8px 12px; border-radius: 4px; cursor: pointer; font-size: 14px; display: flex; align-items: center; justify-content: center; gap: 6px; transition: all 0.3s; height: 36px; min-width: 70px; }
  .back-btn:hover { background: rgba(255,255,255,0.3); }
  .back-icon { font-size: 16px; }
  .current-path-btn { height: 36px; }
  .user-btn { padding: 6px; font-size: 22px; width: 40px; height: 40px; }
  .user-btn .user-icon { margin-right: 0; }
  
  /* 移动设备菜单按钮样式 */
  .menu-btn { padding: 4px 8px; font-size: 18px; width: 36px; height: 32px; }
  .mobile-title { font-size: 16px; }
  
  /* 移动设备工具栏样式 */
  .mobile-toolbar { display: flex; }
  .mobile-nav { display: none; } /* 隐藏旧的导航 */
  .toolbar { padding: 8px; justify-content: space-between; }
  .mobile-nav-buttons { gap: 4px; }
  .nav-up-btn,
  .nav-home-btn,
  .nav-refresh-btn { padding: 3px 6px; width: 30px; height: 30px; font-size: 12px; }
  .nav-up-icon,
  .nav-home-icon,
  .nav-refresh-icon { font-size: 14px; }
  .mobile-path-btn { padding: 6px 10px; font-size: 13px; height: 34px; }
  .mobile-view-btn { padding: 4px 8px; width: 36px; height: 32px; }
  .mobile-view-icon { font-size: 14px; }
  /* 移动设备菜单样式 */
  .menu-right { width: 180px; max-height: 280px; }
  .menu-item { padding: 12px 16px; font-size: 14px; }
}
@media (max-width: 480px) {
  /* 紫色状态栏已移至App.vue中统一管理 */
  .mobile-title { font-size: 14px; }
  .user-btn { padding: 4px; font-size: 20px; width: 36px; height: 36px; }
  .user-dropdown { min-width: 140px; }
  .dropdown-item { padding: 10px 14px; font-size: 13px; }
  /* 移动设备专用header已移除，因为现在有了统一的紫色状态栏 */
  /* 小屏幕菜单样式 */
  .menu-right { width: 160px; max-height: 250px; }
  .menu-item { padding: 10px 14px; font-size: 13px; }
  .back-btn { padding: 6px 10px; font-size: 12px; min-width: 55px; height: 32px; }
  .back-icon { font-size: 14px; }
  .current-path-btn { padding: 6px 10px; font-size: 12px; height: 32px; }
  .toolbar { padding: 6px; justify-content: space-between; }
  .view-toggle-btn { padding: 4px 8px; font-size: 12px; }
  .view-toggle-icon { font-size: 14px; }
  .content { padding: 4px; }
  
  /* 小屏幕移动设备工具栏样式 */
  .mobile-path-btn { padding: 4px 8px; font-size: 12px; height: 32px; }
  .mobile-view-btn { padding: 3px 6px; width: 34px; height: 30px; }
  .mobile-view-icon { font-size: 13px; }
  
  /* 小屏幕导航按钮样式 */
  .mobile-nav-buttons { gap: 3px; }
  .nav-up-btn,
  .nav-home-btn,
  .nav-refresh-btn { padding: 2px 4px; width: 28px; height: 28px; font-size: 11px; }
  .nav-up-icon,
  .nav-home-icon,
  .nav-refresh-icon { font-size: 13px; }
  .file-list-header { display: none; }
  .file-list-item { display: flex; flex-direction: column; align-items: stretch; gap: 6px; padding: 10px; }
  .file-list-item .file-name { font-size: 14px; }
  .file-list-item .file-size, .file-list-item .file-modified { font-size: 12px; color: #777; }
  .file-list-item > .file-size, .file-list-item > .file-modified { text-align: left; }
  .thumbnail-grid { grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); gap: 10px; }
  .thumbnail-preview { height: 100px; }
  .media-viewer-close { top: 8px; right: 8px; width: 34px; height: 34px; font-size: 24px; }
  .media-viewer-content { max-width: 100%; max-height: calc(100% - 64px); }
  .path-dropdown-header { padding: 14px 16px; }
  .path-dropdown-header h3 { font-size: 16px; }
  .path-item { padding: 12px 16px; font-size: 15px; }
  
  /* 小屏幕菜单样式 */
  .menu-btn { padding: 3px 6px; font-size: 16px; width: 34px; height: 30px; }
  .menu-right { width: 240px; }
  .menu-header { padding: 16px 14px; }
  .menu-user-icon { font-size: 20px; }
  .menu-username { font-size: 14px; }
  .menu-item { padding: 12px 16px; font-size: 14px; gap: 10px; }
  .menu-item-icon { font-size: 16px; width: 20px; }
}

/* 提示组件样式 */
.toast-container {
  position: fixed;
  top: 24px;
  right: 24px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  pointer-events: none;
  opacity: 0;
  transform: translateY(-24px) scale(0.95);
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.toast-container.active {
  opacity: 1;
  transform: translateY(0) scale(1);
  pointer-events: auto;
}

.toast {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 18px 20px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.98) 100%);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-radius: 16px;
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.12),
    0 2px 8px rgba(0, 0, 0, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.6);
  min-width: 320px;
  max-width: 420px;
  animation: toastSlideIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  border: 1px solid rgba(255, 255, 255, 0.3);
  position: relative;
  overflow: hidden;
}

.toast::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #2196F3, #21CBF3);
  border-radius: 16px 16px 0 0;
}

.toast.info::before {
  background: linear-gradient(90deg, #3B82F6, #60A5FA);
}

.toast.success::before {
  background: linear-gradient(90deg, #10B981, #34D399);
}

.toast.warning::before {
  background: linear-gradient(90deg, #F59E0B, #FBBF24);
}

.toast.error::before {
  background: linear-gradient(90deg, #EF4444, #F87171);
}

@keyframes toastSlideIn {
  0% {
    opacity: 0;
    transform: translateX(40px) scale(0.9);
  }
  70% {
    transform: translateX(-5px) scale(1.02);
  }
  100% {
    opacity: 1;
    transform: translateX(0) scale(1);
  }
}

.toast-icon {
  font-size: 22px;
  flex-shrink: 0;
  margin-top: 2px;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  font-weight: bold;
}

.icon-info {
  background: linear-gradient(135deg, #3B82F6, #60A5FA);
  color: white;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-size: 16px;
  font-weight: 700;
}

.icon-success {
  background: linear-gradient(135deg, #10B981, #34D399);
  color: white;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-size: 18px;
  font-weight: 700;
}

.icon-warning {
  background: linear-gradient(135deg, #F59E0B, #FBBF24);
  color: white;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-size: 18px;
  font-weight: 900;
}

.icon-error {
  background: linear-gradient(135deg, #EF4444, #F87171);
  color: white;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-size: 18px;
  font-weight: 700;
}

.toast-content {
  flex: 1;
  font-size: 14px;
  line-height: 1.5;
  color: #2D3748;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

.toast-content a,
.toast-content button {
  color: inherit;
  text-decoration: none;
  font-weight: 500;
}

.toast-close {
  background: rgba(0, 0, 0, 0.05);
  border: none;
  color: #718096;
  font-size: 16px;
  cursor: pointer;
  padding: 6px;
  margin-left: 4px;
  flex-shrink: 0;
  transition: all 0.2s ease;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: -2px;
}

.toast-close:hover {
  background: rgba(0, 0, 0, 0.1);
  color: #4A5568;
  transform: rotate(90deg);
}

.toast-close:active {
  transform: scale(0.95) rotate(90deg);
}

/* 移动端适配 */
@media (max-width: 768px) {
  .toast-container {
    top: 16px;
    right: 16px;
    left: 16px;
    align-items: center;
  }
  
  .toast {
    min-width: auto;
    width: 100%;
    max-width: 100%;
    padding: 16px;
    border-radius: 14px;
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
  }
  
  .toast-content {
    font-size: 13px;
    line-height: 1.4;
  }
  
  .toast-icon {
    font-size: 20px;
  }
  
  .icon-info,
  .icon-success,
  .icon-warning,
  .icon-error {
    width: 24px;
    height: 24px;
    font-size: 14px;
  }
  
  .icon-success,
  .icon-warning,
  .icon-error {
    font-size: 16px;
  }
  
  .toast-close {
    width: 26px;
    height: 26px;
    font-size: 14px;
  }
}

/* 下载按钮样式 */
.download-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 12px;
  padding: 10px 20px;
  background: linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  text-decoration: none;
  box-shadow: 
    0 4px 16px rgba(99, 102, 241, 0.25),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
  position: relative;
  overflow: hidden;
  letter-spacing: 0.3px;
}

.download-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.25), transparent);
  transition: left 0.7s ease;
}

.download-btn:hover {
  transform: translateY(-3px) scale(1.02);
  box-shadow: 
    0 10px 25px rgba(99, 102, 241, 0.35),
    inset 0 1px 0 rgba(255, 255, 255, 0.4);
  background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%);
}

.download-btn:hover::before {
  left: 100%;
}

.download-btn:active {
  transform: translateY(-1px) scale(0.98);
  box-shadow: 
    0 3px 10px rgba(99, 102, 241, 0.25),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.download-btn::after {
  content: '↓';
  font-size: 14px;
  font-weight: bold;
  margin-left: 2px;
}

/* 在警告提示中的下载按钮 */
.toast.warning .download-btn {
  background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%);
  box-shadow: 
    0 4px 16px rgba(245, 158, 11, 0.25),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
}

.toast.warning .download-btn:hover {
  background: linear-gradient(135deg, #EAB308 0%, #CA8A04 100%);
  box-shadow: 
    0 10px 25px rgba(245, 158, 11, 0.35),
    inset 0 1px 0 rgba(255, 255, 255, 0.4);
}

.toast.warning .download-btn:active {
  box-shadow: 
    0 3px 10px rgba(245, 158, 11, 0.25),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

/* 文本查看器样式 */
.text-viewer {
  background: #0d1117; /* GitHub Dark 主题背景色 */
  border-radius: 8px;
  padding: 20px;
  max-width: 90%;
  max-height: 90%;
  overflow: auto;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace;
  font-size: 14px;
  line-height: 1.5;
  text-align: left;
}

.plain-text-content {
  margin: 0;
  padding: 0;
  color: #c9d1d9; /* GitHub Dark 文本颜色 */
}

.code-content {
  margin: 0;
  padding: 0;
  background: transparent !important;
}

/* highlight.js 会提供自己的样式，这里只需要确保背景透明 */

/* 音频播放器样式 */
audio {
  background: #2d2d2d;
  border-radius: 8px;
  padding: 10px;
  min-width: 300px;
  max-width: 500px;
}

/* 媒体查看器中音频和文本的特定样式 */
.media-viewer-content audio,
.media-viewer-content .text-viewer {
  background: rgba(30, 30, 30, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

/* 响应式调整 */
@media (max-width: 768px) {
  .text-viewer {
    max-width: 95%;
    max-height: 80%;
    font-size: 12px;
    padding: 15px;
  }
  
  audio {
    min-width: 250px;
    max-width: 350px;
  }
}

@media (max-width: 480px) {
  .text-viewer {
    max-width: 98%;
    max-height: 70%;
    font-size: 11px;
    padding: 10px;
  }
  
  audio {
    min-width: 200px;
    max-width: 280px;
  }
}

/* 上下文菜单样式 */
.context-menu {
  position: fixed;
  z-index: 3000;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  min-width: 200px;
  max-width: 300px;
  animation: contextMenuFadeIn 0.2s ease;
  overflow: hidden;
}

.context-menu-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: #f5f5f5;
  border-bottom: 1px solid #e0e0e0;
}

.context-menu-title {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 180px;
}

.context-menu-close {
  background: none;
  border: none;
  font-size: 16px;
  color: #666;
  cursor: pointer;
  padding: 4px;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background 0.2s;
}

.context-menu-close:hover {
  background: rgba(0, 0, 0, 0.1);
}

.context-menu-items {
  padding: 8px 0;
}

.context-menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 12px 16px;
  background: none;
  border: none;
  text-align: left;
  font-size: 14px;
  color: #333;
  cursor: pointer;
  transition: background 0.2s;
}

.context-menu-item:hover:not(:disabled) {
  background: #f0f0f0;
}

.context-menu-item:disabled {
  color: #999;
  cursor: not-allowed;
}

.context-menu-icon {
  font-size: 16px;
  width: 20px;
  text-align: center;
}

.context-menu-text {
  flex: 1;
}

@keyframes contextMenuFadeIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* 移动端上下文菜单适配 */
@media (max-width: 768px) {
  .context-menu {
    min-width: 180px;
    max-width: 250px;
  }
  
  .context-menu-title {
    max-width: 140px;
  }
}
</style>
