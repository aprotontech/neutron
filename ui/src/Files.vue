<template>
  <div id="app">
    <div>
      <div class="header">
        <div class="header-left">
          <h1>📁 文件浏览器</h1>
          <div class="breadcrumb-container">
            <button class="breadcrumb-btn" @click="goToRoot">根目录</button>
            <template v-for="(path, index) in currentPathArray" :key="index">
              <span class="breadcrumb-separator">/</span>
              <button class="breadcrumb-btn" @click="goToPath(index)">{{ path }}</button>
            </template>
          </div>
        </div>
        <div class="header-right">
          <div class="user-menu">
            <button class="user-btn" @click="toggleUserMenu">
              <span class="user-icon">👤</span>
              <span class="user-text">用户</span>
            </button>
            <div class="user-dropdown" :class="{ active: showUserMenu }">
              <button class="dropdown-item" @click="logout">
                <span class="dropdown-icon">🚪</span>
                <span>登出</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="toolbar">
        <div class="view-toggle">
          <button :class="{ active: viewMode === 'list' }" @click="viewMode = 'list'">📋 列表视图</button>
          <button :class="{ active: viewMode === 'thumbnail' }" @click="viewMode = 'thumbnail'">🖼️ 缩微图视图</button>
        </div>
      </div>

      <div class="content">
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

            <div v-for="file in files" :key="file.name" class="file-list-item" :class="{ selected: selectedFile === file }" @click="selectFile(file)" @dblclick="openFile(file)">
              <div class="file-icon">{{ getFileIcon(file) }}</div>
              <div class="file-name">{{ file.name }}</div>
              <div class="file-size">{{ formatSize(file.size) }}</div>
              <div class="file-modified">{{ formatDate(file.modTime) }}</div>
            </div>
          </div>

          <div v-else class="thumbnail-grid">
            <div v-for="file in files" :key="file.name" class="thumbnail-item" :class="{ selected: selectedFile === file }" @click="selectFile(file)" @dblclick="openFile(file)">
              <div class="thumbnail-preview">
                <img v-if="isImage(file) && file.thumbnailData" :src="file.thumbnailData" :alt="file.name" />
                <video v-else-if="isVideo(file)" :src="getFileUrl(file)" controls></video>
                <div v-else class="thumbnail-icon">{{ getFileIcon(file) }}</div>
              </div>
              <div class="thumbnail-info">
                <div class="thumbnail-name" :title="file.name">{{ file.name }}</div>
                <div class="thumbnail-size">{{ formatSize(file.size) }}</div>
              </div>
            </div>
          </div>
        </template>

        <div v-else class="empty-state"><div class="empty-icon">📭</div><div>文件夹为空</div></div>
      </div>

      <div id="media-viewer" class="media-viewer" :class="{ active: isViewingImage || isViewingVideo }">
        <button class="media-viewer-close" @click="closeMediaViewer">✕</button>
        <div class="media-viewer-content">
          <img v-if="isViewingImage" :src="currentMediaUrl" :alt="currentMediaFile?.name" />
          <video v-else-if="isViewingVideo" :src="currentMediaUrl" controls autoplay></video>
        </div>
        <div class="media-viewer-nav" v-if="currentMediaFile">{{ currentMediaFile.name }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, defineEmits } from 'vue'
import UserAPI from './lib/user-api'
import FileAPI from './lib/file-api'
import { FileTypeDetector, FileSizeFormatter, DateFormatter } from './lib/helpers'
import TransferClient from './lib/transfer'

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
const currentMediaFile = ref(null)
const currentMediaUrl = ref('')
const showUserMenu = ref(false)


function updateBreadcrumb() {
  if (currentPath.value === '/') currentPathArray.value = []
  else currentPathArray.value = currentPath.value.split('/').filter(p => p)
}

async function loadFiles(path = '/') {
  loading.value = true
  error.value = ''
  selectedFile.value = null
  try {
    const list = await fileAPI.listFiles(path)
    files.value = list.sort((a,b) => {
      if ((a.isDir?1:0) !== (b.isDir?1:0)) return (b.isDir?1:0) - (a.isDir?1:0)
      return a.name.localeCompare(b.name)
    })
    currentPath.value = path
    updateBreadcrumb()
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
    if (isImage(f) || isVideo(f)) await openMediaViewer(f)
  }
}

async function openMediaViewer(file) {
  currentMediaFile.value = file
  if (isImage(file)) {
    isViewingImage.value = true
    isViewingVideo.value = false
    currentMediaUrl.value = await fileAPI.getFileUrl(file.path)
  } else if (isVideo(file)) {
    isViewingImage.value = false
    isViewingVideo.value = true
    currentMediaUrl.value = await fileAPI.getFileUrl(file.path)
  }
}

function closeMediaViewer() {
  isViewingImage.value = false
  isViewingVideo.value = false
  currentMediaFile.value = null
  currentMediaUrl.value = ''
}

function goToRoot() { loadFiles('/') }
async function goToPath(index) {
  const parts = currentPathArray.value.slice(0, index + 1)
  const path = '/' + parts.join('/')
  await loadFiles(path)
}

function isImage(file) { return !file.isDir && FileTypeDetector.isImage(file.name) }
function isVideo(file) { return !file.isDir && FileTypeDetector.isVideo(file.name) }
function getFileIcon(file) {
  if (file.isDir) return '📁'
  const ext = file.name.toLowerCase().substring(file.name.lastIndexOf('.'))
  const iconMap = { '.jpg':'🖼️','.jpeg':'🖼️','.png':'🖼️','.gif':'🖼️','.mp4':'🎬' }
  return iconMap[ext] || '📄'
}
function formatSize(b) { return FileSizeFormatter.format(b) }
function formatDate(d) { return DateFormatter.format(d) }
function getFileUrl(file) { return fileAPI.getFileUrl(file.path) }


function toggleUserMenu() {
  showUserMenu.value = !showUserMenu.value
}

function logout() {
  
  showUserMenu.value = false
  UserAPI.logout().then(() => {
    console.log("用户已登出")
    emit('login-state-changed')
  })
}

onMounted(() => {
  if (UserAPI.isLogined()) {
    UserAPI.refreshToken().then(error_msg => {
      console.log("refreshToken", error_msg)
      if (error_msg === true){
        TransferClient.init('webrtc', UserAPI.getToken())
        loadFiles('/')
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
    if (e.key === 'Escape' && (isViewingImage.value || isViewingVideo.value)) closeMediaViewer()
  })
  
  // 点击页面其他地方时关闭用户菜单
  document.addEventListener('click', (e) => {
    if (showUserMenu.value && !e.target.closest('.user-menu')) {
      showUserMenu.value = false
    }
  })
})
</script>

<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5; }
#app { height: 100vh; display: flex; flex-direction: column; }
.header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); display: flex; justify-content: space-between; align-items: flex-start; }
.header-left { flex: 1; }
.header h1 { font-size: 24px; margin-bottom: 10px; }
.breadcrumb-container { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
.header-right { position: relative; }
.user-menu { position: relative; }
.user-btn { background: rgba(255,255,255,0.2); border: 1px solid rgba(255,255,255,0.3); color: white; padding: 8px 16px; border-radius: 4px; cursor: pointer; font-size: 14px; display: flex; align-items: center; gap: 8px; transition: all 0.3s; }
.user-btn:hover { background: rgba(255,255,255,0.3); }
.user-icon { font-size: 16px; }
.user-text { font-weight: 500; }
.user-dropdown { position: absolute; top: 100%; right: 0; margin-top: 8px; background: white; border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.15); min-width: 160px; overflow: hidden; display: none; z-index: 1000; }
.user-dropdown.active { display: block; }
.dropdown-item { width: 100%; padding: 12px 16px; border: none; background: white; color: #333; text-align: left; cursor: pointer; display: flex; align-items: center; gap: 10px; font-size: 14px; transition: all 0.2s; }
.dropdown-item:hover { background: #f5f7fa; }
.dropdown-icon { font-size: 16px; }
.breadcrumb-btn { background: rgba(255,255,255,0.2); border: 1px solid rgba(255,255,255,0.3); color: white; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 14px; transition: all 0.3s; }
.breadcrumb-btn:hover { background: rgba(255,255,255,0.3); }
.breadcrumb-separator { color: rgba(255,255,255,0.7); }
.toolbar { background: white; padding: 15px 20px; display: flex; gap: 15px; align-items: center; border-bottom: 1px solid #e0e0e0; flex-wrap: wrap; }
.view-toggle { display: flex; gap: 10px; }
.view-toggle button { padding: 8px 16px; border: 1px solid #ddd; background: white; cursor: pointer; border-radius: 4px; transition: all 0.3s; }
.view-toggle button.active { background: #667eea; color: white; border-color: #667eea; }
.content { flex: 1; overflow: auto; padding: 20px; }
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
.media-viewer-nav { position: absolute; bottom: 20px; color: white; font-size: 14px; }
.loading { display: flex; justify-content: center; align-items: center; height: 200px; }
.spinner { border: 4px solid #f3f3f3; border-top: 4px solid #667eea; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; }
@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
.empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 300px; color: #999; }
.empty-icon { font-size: 60px; margin-bottom: 20px; opacity: 0.5; }
.error-message { background: #fee; border: 1px solid #fcc; color: #c33; padding: 15px; border-radius: 4px; margin-bottom: 20px; }
@media (max-width: 768px) {
  .header { padding: 12px; flex-direction: column; gap: 12px; }
  .header-left { width: 100%; }
  .header-right { width: 100%; display: flex; justify-content: flex-end; }
  .header h1 { font-size: 18px; }
  .user-btn { padding: 6px 12px; font-size: 13px; }
  .user-text { display: none; }
  .user-btn .user-icon { margin-right: 0; }
  .toolbar { padding: 10px; gap: 10px; }
  .content { padding: 12px; }
  .file-list-header { grid-template-columns: 40px 1fr 100px; font-size: 13px; }
  .file-list-item { grid-template-columns: 40px 1fr 80px; padding: 10px; }
  .file-size, .file-modified { font-size: 12px; }
  .thumbnail-grid { grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 12px; }
  .thumbnail-preview { height: 110px; }
  .media-viewer-close { top: 12px; right: 12px; width: 36px; height: 36px; font-size: 28px; }
  .media-viewer-content { max-width: 100%; max-height: calc(100% - 80px); padding: 8px; }
  .media-viewer-nav { bottom: 12px; font-size: 13px; }
}
@media (max-width: 480px) {
  .header { padding: 10px; flex-direction: column; gap: 10px; }
  .header h1 { font-size: 16px; }
  .user-btn { padding: 5px 10px; font-size: 12px; }
  .user-dropdown { min-width: 140px; }
  .dropdown-item { padding: 10px 14px; font-size: 13px; }
  .toolbar { padding: 8px; }
  .content { padding: 8px; }
  .file-list-header { display: none; }
  .file-list-item { display: flex; flex-direction: column; align-items: stretch; gap: 6px; padding: 10px; }
  .file-list-item .file-name { font-size: 14px; }
  .file-list-item .file-size, .file-list-item .file-modified { font-size: 12px; color: #777; }
  .file-list-item > .file-size, .file-list-item > .file-modified { text-align: left; }
  .thumbnail-grid { grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); gap: 10px; }
  .thumbnail-preview { height: 100px; }
  .media-viewer-close { top: 8px; right: 8px; width: 34px; height: 34px; font-size: 24px; }
  .media-viewer-content { max-width: 100%; max-height: calc(100% - 64px); }
}
</style>
