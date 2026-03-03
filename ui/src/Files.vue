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
                  <button 
                    class="menu-item" 
                    :class="{ disabled: !selectedFile || selectedFile.isDir }"
                    @click="handleMobileDownload"
                    :disabled="!selectedFile || selectedFile.isDir"
                  >
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
        
        <!-- 桌面端：完整的工具栏 -->
        <div class="desktop-toolbar desktop-only">
          <!-- 左侧：Home按钮、刷新按钮、面包屑导航 -->
          <div class="desktop-toolbar-left">
            <!-- Home按钮 -->
            <button class="desktop-nav-btn desktop-home-btn" 
                    @click="goToRoot" 
                    title="根目录">
              <span class="desktop-nav-icon">🏠</span>
              <span class="desktop-nav-text">Home</span>
            </button>
            
            <!-- 刷新按钮 -->
            <button class="desktop-nav-btn desktop-refresh-btn"
                    @click="refreshCurrentList"
                    title="刷新">
              <span class="desktop-nav-icon">↻</span>
              <span class="desktop-nav-text">刷新</span>
            </button>
            
            <!-- 面包屑导航 -->
            <div class="breadcrumb-nav">
              <button class="breadcrumb-item" @click="goToRoot">
                <span class="breadcrumb-text">根目录</span>
              </button>
              <template v-for="(path, index) in currentPathArray" :key="index">
                <span class="breadcrumb-separator"> > </span>
                <button v-if="index < currentPathArray.length - 1" class="breadcrumb-item" @click="goToPath(index)">
                  <span class="breadcrumb-text">{{ path }}</span>
                </button>
                <span v-else class="breadcrumb-current">
                  <span class="breadcrumb-text">{{ path }}</span>
                </span>
              </template>
            </div>
          </div>
          
          <!-- 右侧：视图切换按钮 -->
          <div class="desktop-toolbar-right">
            <button class="desktop-view-toggle-btn" @click="toggleViewMode" :title="viewMode === 'list' ? '显示缩略图' : '显示列表'">
              <span class="desktop-view-toggle-icon">{{ viewMode === 'list' ? '□' : '≡' }}</span>
              <span class="desktop-view-toggle-text">{{ viewMode === 'list' ? '显示缩略图' : '显示列表' }}</span>
            </button>
          </div>
        </div>
      </div>

      <div
        class="content"
        ref="contentContainer"
        @wheel="handleWheel"
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
            
            <div class="file-list-items-container">
              <div v-for="file in files" :key="file.name" class="file-list-item" :class="{ selected: selectedFile === file }" @click="handleFileClick(file, $event)" @dblclick="openFile(file)" @touchstart="handleFileTouchStart(file, $event)" @touchend="handleFileTouchEnd(file, $event)">
                <div class="file-icon">{{ getFileIcon(file) }}</div>
                <div class="file-name">{{ file.name }}</div>
                <div class="file-size">{{ formatSize(file.size) }}</div>
                <div class="file-modified">{{ formatDate(file.mtime) }}</div>
              </div>
            </div>
          </div>

          <div v-else class="thumbnail-grid">
            <div v-for="file in files" :key="file.name" class="thumbnail-item" :class="{ selected: selectedFile === file }" @click="handleFileClick(file, $event)" @dblclick="openFile(file)" @touchstart="handleFileTouchStart(file, $event)" @touchend="handleFileTouchEnd(file, $event)" ref="thumbnailItems">
              <div class="thumbnail-preview" :ref="el => registerThumbnailElement(el, file)">
                <img v-if="(isImage(file) || isVideo(file)) && file.thumbUrl" :src="file.thumbUrl" :alt="file.name" />
                <div v-else-if="isVideo(file)" class="thumbnail-icon">🎬</div>
                <div v-else class="thumbnail-icon">{{ getFileIcon(file) }}</div> 
                <!-- 视频文件播放按钮 -->
                <div v-if="isVideo(file)" class="video-play-button">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 5V19L19 12L8 5Z" fill="white" fill-opacity="0.8"/>
                  </svg>
                </div>
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

      <!-- 媒体/文件预览：使用统一 Preview 组件 -->
      <Preview
        v-model="isViewingMedia"
        :total-count="previewableFiles.length"
        :initial-offset="currentPreviewIndex"
        :initial-items="previewInitialItems"
        :file-api="fileAPI"
        :fetch-nearby="fetchNearbyForPreview"
        :highlight-code="highlightCodeForPreview"
        :is-code="isCodeForPreview"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, defineEmits, watch, onUnmounted, computed } from 'vue'
import { Capacitor } from '@capacitor/core'
import UserAPI from './lib/user-api'
import FileAPI from './lib/file-api'
import { FileTypeDetector, FileSizeFormatter, DateFormatter } from './lib/helpers'
import { Config } from './lib/config'
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
import Preview from './Preview.vue'

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

const fileAPI = FileAPI.getInstance()
const isViewingMedia = ref(false)
const previewableFiles = ref([])
const currentPreviewIndex = ref(-1)
const showUserMenu = ref(false)
const showPathList = ref(false)
const showRightMenu = ref(false)
const fileTouchStartTime = ref(0)
const fileTouchTimer = ref(null)
const touchedFile = ref(null)
const lastTapTime = ref(0)
const lastTappedFile = ref(null)

// 预览列表由 Preview 组件内部管理，此处仅提供打开时的数据

const isMobile = ref(false)
const isAndroidApp = ref(false)
const contentContainer = ref(null)
let contentTouchStartListener = null

const isMediaViewerActive = computed(() => isViewingMedia.value)

function getPreviewType(f) {
  if (isImage(f)) return '图片'
  if (isVideo(f)) return '视频'
  if (isAudio(f)) return '音频'
  if (isText(f)) return '文本'
  return '文件'
}

const previewInitialItems = computed(() => {
  return previewableFiles.value.map((f, i) => ({
    offset: i,
    path: f.path,
    thumbnailUrl: f.thumbUrl || null,
    name: f.name,
    type: getPreviewType(f)
  }))
})

function fetchNearbyForPreview(offset, count) {
  const list = previewableFiles.value
  const start = Math.max(0, offset)
  const end = Math.min(list.length, offset + count)
  const slice = list.slice(start, end)
  return Promise.resolve(
    slice.map((f, i) => ({
      offset: start + i,
      path: f.path,
      thumbnailUrl: f.thumbUrl || null,
      name: f.name,
      type: getPreviewType(f)
    }))
  )
}

function highlightCodeForPreview(content, filename) {
  const language = getLanguageFromFilename(filename)
  try {
    const result = hljs.highlight(content, { language })
    return result.value
  } catch (e) {
    return content
  }
}

function isCodeForPreview(name) {
  return FileTypeDetector.isCode(name)
}

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
    const sep = path == '/' ? '' : '/';
    const processedList = list.files.map(file => ({
      ...file,
      path: path + sep + file.name,
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
  if (!(await fileAPI.getFileLocalCachedUrl(file.path))) {
    if (file.size > Config.getMaxPreviewFileSize()) {
      selectedFile.value = file
      const maxSizeMB = Config.getMaxPreviewFileSize() / (1024 * 1024)
      const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2)
      const confirmMessage = `文件内容过大（${fileSizeMB}MB > ${maxSizeMB}MB），是否确认要进行查看？\n\n注意：大文件可能会导致加载缓慢或性能问题。`
      if (!confirm(confirmMessage)) {
        return
      }
      // showToastMessage('正在加载大文件，请稍候...', 'info', 3000)
    }
  }
  previewableFiles.value = files.value.filter(f => isPreviewable(f))
  const index = previewableFiles.value.findIndex(f => f.path === file.path)
  currentPreviewIndex.value = index >= 0 ? index : 0
  isViewingMedia.value = true
}

function closeMediaViewer() {
  isViewingMedia.value = false
  currentPreviewIndex.value = -1
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
  // 移除长按显示菜单功能，改为只记录触摸开始时间
  // 长按功能已移除，改为使用右上角菜单按钮
}

function handleFileTouchEnd(file, event) {
  const touchDuration = Date.now() - fileTouchStartTime.value
  const currentTime = Date.now()
  
  // 移除长按判断逻辑，不再显示菜单
  // 长按功能已移除，改为使用右上角菜单按钮
  
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

async function downloadCurrentFile() {
  // 使用选中的文件
  const file = selectedFile.value
  if (!file) return
  
  const filePath = file.path || (currentPath.value + (currentPath.value.endsWith('/') ? '' : '/') + file.name)
  
  try {
    showToastMessage('开始下载文件: ' + file.name, 'info')
    
    // 调用FileAPI下载文件（使用单例实例）
    const success = await fileAPI.downloadFile(filePath, file)
    
    if (success) {
      showToastMessage('文件下载成功: ' + file.name, 'success')
    } else {
      showToastMessage('文件下载失败', 'error')
    }
  } catch (error) {
    console.error('Download error:', error)
    showToastMessage('下载失败: ' + error.message, 'error')
  }
}

// 移动设备右上角菜单下载处理
async function handleMobileDownload() {
  // 隐藏右侧菜单
  hideRightMenu()
  
  // 检查是否有选中的文件
  if (!selectedFile.value) {
    showToastMessage('请先选择一个文件', 'warning')
    return
  }
  
  // 检查选中的是否是文件夹
  if (selectedFile.value.isDir) {
    showToastMessage('不能下载文件夹', 'warning')
    return
  }
  
  // 调用下载函数
  await downloadCurrentFile()
}

// 点击其他地方关闭菜单
function handleDocumentClick(event) {
  // 上下文菜单已移除，此函数现在为空
}

// 处理鼠标滚轮事件
function handleWheel(event) {
  // 确保事件在content元素上正常处理滚动
  // 不需要额外处理，CSS的overflow:auto会自动处理滚动
  // 这里主要是为了确保事件不会冒泡到其他元素
  event.stopPropagation()
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

// 缩略图懒加载函数
async function loadThumbnail(file) {
  if (!file.thumbUrl && (isImage(file)|| isVideo(file))) {
    try {
      const objectUrl = await fileAPI.getFileThumbnailUrl(file.path)
      if (objectUrl) {
        console.log(file.path, ' thumbnail ', objectUrl)
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
  // 如果消息包含"下载"字样但不包含"成功"，且不是下载开始提示，添加下载按钮
  // 下载成功和下载失败的消息不应该显示下载按钮
  if (message.includes('下载') && 
      !message.includes('成功') && 
      !message.includes('失败') && 
      !message.includes('开始下载') && 
      selectedFile.value) {
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
  
  // 在移动模式下禁用浏览器原生的右键菜单
  if (typeof window !== 'undefined') {
    const disableContextMenu = (e) => {
      // 只在移动模式下禁用右键菜单
      if (isMobile.value) {
        e.preventDefault()
        e.stopPropagation()
        return false
      }
    }
    
    // 为整个文档添加contextmenu事件监听器
    document.addEventListener('contextmenu', disableContextMenu)
    
    // 存储监听器引用以便清理
    window._disableContextMenuListener = disableContextMenu
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
    if (e.key === 'Escape' && isViewingMedia.value) {
      closeMediaViewer()
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
  
  // 移除移动模式右键菜单禁用监听器
  if (typeof window !== 'undefined' && window._disableContextMenuListener) {
    document.removeEventListener('contextmenu', window._disableContextMenuListener)
    delete window._disableContextMenuListener
  }
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
  
  // 如果当前正在预览的文件不在新列表中，关闭预览
  if (isViewingMedia.value && previewableFiles.value.length > 0 && currentPreviewIndex.value >= 0) {
    const currentPath = previewableFiles.value[currentPreviewIndex.value]?.path
    const stillExists = newFiles.some(file => file.path === currentPath)
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
html, body { height: 100%; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5; margin: 0; padding: 0; }
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
.toolbar { background: white; padding: 10px 16px; display: flex; justify-content: flex-end; border-bottom: 1px solid #e0e0e0; min-height: 52px; box-sizing: border-box; }

/* 桌面端工具栏样式 */
.desktop-toolbar {
  display: flex;
  width: 100%;
  height: 32px;
  gap: 12px;
  align-items: stretch;
}

.desktop-toolbar-left {
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 1 1 auto;
  min-width: 0;
  height: 100%;
  overflow: hidden;
  align-items: stretch;
}

.desktop-toolbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
  margin-left: 12px;
  min-width: 120px;
  justify-content: flex-end;
  height: 100%;
  align-items: stretch;
}

.desktop-nav-btn {
  padding: 4px 8px;
  border: 1px solid #e0e0e0;
  background: white;
  cursor: pointer;
  border-radius: 3px;
  font-size: 13px;
  color: #555;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: all 0.2s;
  white-space: nowrap;
  height: 100%;
  box-sizing: border-box;
}

.desktop-nav-btn:hover {
  background: #f8f9fa;
  border-color: #667eea;
  color: #333;
}

.desktop-nav-icon {
  font-size: 14px;
}

.desktop-nav-text {
  font-weight: 500;
  font-size: 12px;
}

/* 面包屑导航样式 */
.breadcrumb-nav {
  display: flex;
  align-items: center;
  gap: 2px;
  flex-shrink: 1;
  min-width: 0;
  overflow: hidden;
  margin-left: 8px;
  padding-left: 8px;
  border-left: 1px solid #eee;
  height: 100%;
  flex-wrap: nowrap;
}

.breadcrumb-item {
  padding: 6px 8px;
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 13px;
  color: #555;
  text-decoration: underline;
  text-decoration-color: #667eea;
  text-underline-offset: 1px;
  text-decoration-thickness: 1px;
  transition: all 0.2s;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100px;
  border-radius: 2px;
  flex-shrink: 1;
  height: 100%;
  display: flex;
  align-items: center;
  box-sizing: border-box;
}

.breadcrumb-item:hover {
  color: #667eea;
  text-decoration-color: #4c51bf;
  background: #f8f9fa;
}

.breadcrumb-separator {
  color: #ccc;
  font-size: 12px;
  margin: 0 1px;
  font-weight: 300;
  line-height: 1;
  height: 100%;
  display: flex;
  align-items: center;
}

.breadcrumb-text {
  display: inline-block;
  max-width: 110px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  line-height: 1;
}

.breadcrumb-current {
  padding: 6px 8px;
  font-size: 13px;
  color: #333;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100px;
  flex-shrink: 1;
  height: 100%;
  display: flex;
  align-items: center;
  box-sizing: border-box;
}

.desktop-view-toggle-btn {
  padding: 4px 8px;
  border: 1px solid #e0e0e0;
  background: white;
  cursor: pointer;
  border-radius: 3px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 4px;
  height: 100%;
  font-size: 13px;
  color: #555;
  box-sizing: border-box;
}

.desktop-view-toggle-btn:hover {
  background: #f8f9fa;
  border-color: #667eea;
  color: #333;
}

.desktop-view-toggle-icon {
  font-size: 14px;
}

.desktop-view-toggle-text {
  font-size: 12px;
  font-weight: 500;
}

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
  box-sizing: border-box;
}
.file-list { background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.05); position: relative; display: flex; flex-direction: column; max-height: 100%; }
.file-list-header { display: grid; grid-template-columns: 40px 1fr 120px 120px; gap: 20px; padding: 15px 20px; background: #f9f9f9; border-bottom: 1px solid #e0e0e0; font-weight: 600; color: #333; position: sticky; top: 0; z-index: 10; backdrop-filter: blur(10px); background-color: rgba(249, 249, 249, 0.95); }
.file-list-items-container { overflow-y: auto; flex: 1; }
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
/* 视频播放按钮样式 */
.video-play-button {
  position: absolute;
  bottom: 8px;
  left: 8px;
  width: 32px;
  height: 32px;
  background: rgba(0, 0, 0, 0.6);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  transition: all 0.2s ease;
}
.video-play-button:hover {
  background: rgba(0, 0, 0, 0.8);
  transform: scale(1.1);
}
.video-play-button svg {
  width: 18px;
  height: 18px;
  margin-left: 2px; /* 让播放三角形稍微向右偏移，看起来更居中 */
}
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
  
  /* 桌面工具栏在小屏幕上的调整 */
  .desktop-toolbar-right {
    min-width: 100px;
  }
  .breadcrumb-item,
  .breadcrumb-current {
    max-width: 80px;
  }
  
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
@media (max-width: 600px) {
  /* 中等屏幕调整 */
  .desktop-toolbar-right {
    min-width: 90px;
  }
  .breadcrumb-item,
  .breadcrumb-current {
    max-width: 70px;
  }
  .desktop-nav-text,
  .desktop-view-toggle-text {
    display: none;
  }
  .desktop-nav-btn,
  .desktop-view-toggle-btn {
    padding: 4px 6px;
    gap: 2px;
  }
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

/* 下载进度显示样式 */
.download-progress-container {
  position: absolute;
  bottom: 80px;
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

/* 移动端适配 */
@media (max-width: 768px) {
  .download-progress-container {
    bottom: 100px;
    width: 90%;
    padding: 10px 14px;
  }
  
  .download-progress-info {
    font-size: 11px;
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

</style>
