<template>
  <div class="settings-container" :class="{ 'android-native-app': isAndroidApp }">
    
    <!-- 紫色状态栏已移至App.vue中统一管理 -->

    <!-- 设置内容 -->
    <div class="settings-content">


      <!-- 占位设置项 -->
      <div class="settings-sections">
        <!-- 账户设置 -->
        <div class="settings-section">
          <h3 class="section-title">
            <span class="section-icon">👤</span>
            账户设置
          </h3>
          <div class="section-content">
            <div class="setting-item disabled">
              <div class="setting-info">
                <div class="setting-label">用户名</div>
                <div class="setting-value">{{ username || '未登录' }}</div>
              </div>
              <div class="setting-action">
                <button class="edit-btn" disabled>编辑</button>
              </div>
            </div>
            <div class="setting-item">
              <div class="setting-info">
                <div class="setting-label">登录状态</div>
                <div class="setting-value">{{ isLoggedIn ? '已登录' : '未登录' }}</div>
              </div>
              <div class="setting-action">
                <button class="logout-btn" @click="logout" v-if="isLoggedIn">退出</button>
                <button class="login-btn" @click="goToLogin" v-else>去登录</button>
              </div>
            </div>
          </div>
        </div>

        <!-- 服务器连接 -->
        <div class="settings-section">
          <h3 class="section-title">
            <span class="section-icon">🔗</span>
            服务器连接
          </h3>
          <div class="section-content">
            <div class="setting-item">
              <div class="setting-info">
                <div class="setting-label">连接状态</div>
                <div class="setting-value" :class="getConnectionStatusClass()">
                  {{ getConnectionStatusText() }}
                </div>
              </div>
              <div class="setting-action">
                <button class="reconnect-btn" disabled>
                  重连
                </button>
              </div>
            </div>
            <div class="setting-item">
              <div class="setting-info">
                <div class="setting-label">传输协议</div>
                <div class="setting-value">{{ transportType }}</div>
              </div>
              <div class="setting-action">
                <button class="refresh-btn" @click="refreshConnectionStatus">刷新</button>
              </div>
            </div>
            <div class="setting-item">
              <div class="setting-info">
                <div class="setting-label">重新加载页面</div>
                <div class="setting-value">刷新整个应用界面</div>
              </div>
              <div class="setting-action">
                <button class="reload-btn" @click="reloadPage">重载</button>
              </div>
            </div>
          </div>
        </div>

        <!-- 存储设置 -->
        <div class="settings-section">
          <h3 class="section-title">
            <span class="section-icon">💾</span>
            存储设置
          </h3>
          <div class="section-content">
            <div class="setting-item">
              <div class="setting-info">
                <div class="setting-label">缓存大小</div>
                <div class="setting-value">
                  <span v-if="loadingCacheSize">加载中...</span>
                  <span v-else>{{ cacheSizeFormatted }}</span>
                </div>
              </div>
              <div class="setting-action">
                <button class="clear-btn" @click="clearCache" :disabled="loadingCacheSize">清理</button>
              </div>
            </div>
            <div class="setting-item disabled">
              <div class="setting-info">
                <div class="setting-label">自动清理</div>
                <div class="setting-value">关闭</div>
              </div>
              <div class="setting-action">
                <button class="toggle-btn" disabled>开启</button>
              </div>
            </div>
            <div class="setting-item">
              <div class="setting-info">
                <div class="setting-label">下载文件</div>
                <div class="setting-value">管理本地已下载的文件</div>
              </div>
              <div class="setting-action">
                <button class="view-btn" @click="openDownloadFilesModal">查看</button>
              </div>
            </div>
          </div>
        </div>

        <!-- App设置 -->
        <div class="settings-section">
          <h3 class="section-title">
            <span class="section-icon">📱</span>
            App
          </h3>
          <div class="section-content">
            <!-- Native模式下的版本信息和更新按钮 -->
            <div v-if="isNativeMode" class="setting-item">
              <div class="setting-info">
                <div class="setting-label">版本信息</div>
                <div class="setting-value">{{ appVersion }}</div>
              </div>
              <div class="setting-action">
                <button class="update-btn" disabled>更新</button>
              </div>
            </div>
            
            <!-- 非Native模式下的APP下载按钮 -->
            <div v-else class="setting-item">
              <div class="setting-info">
                <div class="setting-label">APP下载</div>
                <div class="setting-value">下载Android应用安装包</div>
              </div>
              <div class="setting-action">
                <button class="download-btn" @click="downloadApp">下载</button>
              </div>
            </div>
          </div>
        </div>

        <!-- 关于 -->
        <div class="settings-section">
          <h3 class="section-title">
            <span class="section-icon">ℹ️</span>
            关于
          </h3>
          <div class="section-content">
            <div class="about-info">
              <div class="app-info">
                <div class="app-name">Neutron 文件管理器</div>
                <div class="app-version">版本 1.0.0</div>
              </div>
              <div class="about-links">
                <button class="link-btn" @click="showAbout">
                  <span class="link-icon">📄</span>
                  用户协议
                </button>
                <button class="link-btn" @click="showPrivacy">
                  <span class="link-icon">🔒</span>
                  隐私政策
                </button>
                <button class="link-btn" @click="showHelp">
                  <span class="link-icon">❓</span>
                  帮助中心
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    <!-- 待建设提示 -->
      <div class="construction-notice">
        <div class="construction-icon">🚧</div>
        <h2>待未来建设</h2>
        <p>设置功能正在开发中，敬请期待！</p>
        <div class="construction-details">
          <p>我们正在努力为您打造更好的设置体验，包括：</p>
          <ul class="features-list">
            <li>📱 应用主题设置</li>
            <li>🔒 安全与隐私设置</li>
            <li>💾 存储空间管理</li>
            <li>📤 数据同步设置</li>
            <li>🔔 通知设置</li>
            <li>🌐 网络设置</li>
          </ul>
        </div>
      </div>
    </div>

    <!-- 下载文件管理弹窗 -->
    <div v-if="showDownloadFilesModal" class="modal-overlay" @click.self="closeDownloadFilesModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title">
            <span class="modal-icon">📁</span>
            下载文件管理
          </h3>
          <button class="modal-close-btn" @click="closeDownloadFilesModal">×</button>
        </div>
        
        <div class="modal-body">
          <!-- 加载状态 -->
          <div v-if="loadingFiles" class="loading-container">
            <div class="loading-spinner"></div>
            <p>正在加载文件列表...</p>
          </div>
          
          <!-- 空状态 -->
          <div v-else-if="!loadingFiles && downloadedFiles.length === 0" class="empty-container">
            <div class="empty-icon">📂</div>
            <p class="empty-text">暂无下载文件</p>
            <p class="empty-subtext">您还没有下载任何文件</p>
          </div>
          
          <!-- 文件列表 -->
          <div v-else class="files-table-container">
            <div class="table-header">
              <div class="table-summary">
                共 {{ downloadedFiles.length }} 个文件
              </div>
              <button class="refresh-btn" @click="loadDownloadedFiles" :disabled="loadingFiles">
                <span class="refresh-icon">🔄</span>
                刷新
              </button>
            </div>
            
            <div class="files-table-wrapper">
              <table class="files-table">
                <thead>
                  <tr>
                    <th>文件名</th>
                    <th>下载状态</th>
                    <th>下载时间</th>
                    <th>本地状态</th>
                    <th>本地路径</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="file in downloadedFiles" :key="file.id || file.file_path">
                    <td class="file-name">
                      <span class="file-icon">📄</span>
                      {{ file.file_name || file.name || '未知文件' }}
                    </td>
                    <td>
                      <span class="status-badge status-completed">已下载</span>
                    </td>
                    <td class="download-time">
                      {{ formatDownloadTime(file.downloaded_at) }}
                    </td>
                    <td>
                      <span class="status-badge" :class="getLocalStatusClass(file)">
                        {{ getLocalStatusText(file) }}
                      </span>
                    </td>
                    <td class="local-path">
                      <span class="path-text" :title="file.local_path || file.localUrl">
                        {{ truncatePath(file.local_path || file.localUrl) }}
                      </span>
                    </td>
                    <td class="actions">
                      <button class="action-btn view-btn" @click="viewFile(file)" title="查看文件">
                        👁️
                      </button>
                      <button class="action-btn delete-btn" @click="deleteFile(file)" title="删除文件">
                        🗑️
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <button class="modal-btn secondary-btn" @click="closeDownloadFilesModal">关闭</button>
          <button class="modal-btn primary-btn" @click="loadDownloadedFiles" :disabled="loadingFiles">
            刷新列表
          </button>
        </div>
      </div>
    </div>

    <!-- 底部信息 -->
    <div class="settings-footer">
      <p>© 2024 Neutron 文件管理器. 保留所有权利.</p>
      <p class="footer-beian">京ICP备16041151号-1</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, defineEmits } from 'vue'
import { Capacitor } from '@capacitor/core'
import { RuntimeVariables, FileSizeFormatter } from './lib/helpers.js'
import UserAPI from './lib/user-api.js'
import FileAPI from './lib/file-api.js'
import TransferClient from './lib/transfer.js'
import { getLocalFileManager } from './lib/local-file-manager.js'

const emit = defineEmits(['login-state-changed'])

// 用户状态
const username = ref('')
const isLoggedIn = ref(false)

// Android原生App检测
const isAndroidApp = ref(false)

// 连接状态
const connectionStatus = ref('unknown')
const transportType = ref('webrtc') // 默认使用webrtc

// 缓存大小
const cacheSize = ref(0)
const cacheSizeFormatted = ref('0 B')
const loadingCacheSize = ref(false)

// App相关
const isNativeMode = ref(false)
const appVersion = ref('1.0.0')

// 初始化用户状态
function initUserState() {
  username.value = RuntimeVariables.getUserName()
  isLoggedIn.value = UserAPI.isLogined()
}

// 退出登录
async function logout() {
  if (confirm('确定要退出登录吗？')) {
    await UserAPI.logout()
    initUserState()
    emit('login-state-changed')
    alert('已退出登录')
  }
}

// 去登录
function goToLogin() {
  emit('login-state-changed')
}

// 显示关于信息
function showAbout() {
  alert('用户协议功能正在开发中')
}

// 显示隐私政策
function showPrivacy() {
  alert('隐私政策功能正在开发中')
}

// 显示帮助
function showHelp() {
  alert('帮助中心功能正在开发中')
}

// 获取连接状态文本
function getConnectionStatusText() {
  const statusMap = {
    'connected': '已连接',
    'connecting': '连接中',
    'disconnected': '未连接',
    'unknown': '未知状态'
  }
  return statusMap[connectionStatus.value] || connectionStatus.value
}

// 获取连接状态CSS类
function getConnectionStatusClass() {
  const classMap = {
    'connected': 'status-connected',
    'connecting': 'status-connecting',
    'disconnected': 'status-disconnected',
    'unknown': 'status-unknown'
  }
  return classMap[connectionStatus.value] || 'status-unknown'
}

// 刷新连接状态
async function refreshConnectionStatus() {
  try {
    // 检查TransferClient是否已初始化
    if (!TransferClient.instance) {
      connectionStatus.value = 'disconnected'
      return
    }
    
    const client = TransferClient.get()
    connectionStatus.value = await client.getConnectionStatus()
  } catch (error) {
    console.error('获取连接状态失败:', error)
    connectionStatus.value = 'disconnected'
  }
}

// 重新加载页面
function reloadPage() {
  if (confirm('确定要重新加载页面吗？当前页面状态可能会丢失。')) {
    window.location.reload()
  }
}



// 初始化连接状态
async function initConnectionStatus() {
  await refreshConnectionStatus()
  // 设置定时刷新连接状态
  setInterval(refreshConnectionStatus, 30000) // 每30秒刷新一次
}

// 下载文件管理相关
const showDownloadFilesModal = ref(false)
const downloadedFiles = ref([])
const loadingFiles = ref(false)

// 打开下载文件管理弹窗
async function openDownloadFilesModal() {
  showDownloadFilesModal.value = true
  await loadDownloadedFiles()
}

// 关闭下载文件管理弹窗
function closeDownloadFilesModal() {
  showDownloadFilesModal.value = false
}

// 加载已下载文件列表
async function loadDownloadedFiles() {
  try {
    loadingFiles.value = true
    
    // 获取 LocalFileManager 实例
    const fileManager = getLocalFileManager()
    
    // 调用 getAllFiles 方法
    const files = await fileManager.getAllFiles()
    
    // 处理文件数据
    downloadedFiles.value = files.map(file => ({
      ...file,
      // 检查本地文件是否存在
      localExists: true // 这里可以添加实际的文件存在性检查
    }))
    
    console.log('已加载下载文件列表:', downloadedFiles.value.length, '个文件')
  } catch (error) {
    console.error('加载下载文件列表失败:', error)
    alert('加载文件列表失败: ' + error.message)
  } finally {
    loadingFiles.value = false
  }
}

// 格式化下载时间
function formatDownloadTime(timestamp) {
  if (!timestamp) return '未知时间'
  
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now - date
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) {
    // 今天
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  } else if (diffDays === 1) {
    // 昨天
    return '昨天 ' + date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  } else if (diffDays < 7) {
    // 一周内
    return `${diffDays}天前`
  } else {
    // 更早
    return date.toLocaleDateString('zh-CN')
  }
}

// 获取本地状态文本
function getLocalStatusText(file) {
  if (file.localExists === false) {
    return '文件丢失'
  }
  return '文件存在'
}

// 获取本地状态CSS类
function getLocalStatusClass(file) {
  if (file.localExists === false) {
    return 'status-error'
  }
  return 'status-success'
}

// 截断路径显示
function truncatePath(path) {
  if (!path) return '未知路径'
  
  if (path.length > 40) {
    return path.substring(0, 20) + '...' + path.substring(path.length - 20)
  }
  return path
}

// 查看文件
function viewFile(file) {
  if (file.local_path || file.localUrl) {
    // 在实际应用中，这里可以打开文件预览或使用系统应用打开文件
    alert(`查看文件: ${file.file_name}\n路径: ${file.local_path || file.localUrl}`)
  } else {
    alert('文件路径不可用')
  }
}

// 删除文件
async function deleteFile(file) {
  if (!confirm(`确定要删除文件 "${file.file_name}" 吗？`)) {
    return
  }
  
  try {
    const fileManager = getLocalFileManager()
    const success = await fileManager.deleteLocalFile(file.file_path)
    
    if (success) {
      alert('文件删除成功')
      await loadDownloadedFiles() // 刷新列表
    } else {
      alert('文件删除失败')
    }
  } catch (error) {
    console.error('删除文件失败:', error)
    alert('删除文件失败: ' + error.message)
  }
}

// 下载APK应用
async function downloadApp() {
  if (!confirm('确定要下载Android应用安装包吗？文件大小约为30MB。')) {
    return
  }
  
  try {
    // 创建下载链接
    let downloadUrl = '/app-debug.apk'
    if (window.location.protocol === 'https') {
      downloadUrl = '/app-release.apk'
    }
    
    // 创建隐藏的a标签进行下载
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = 'neutron-app.apk'
    link.style.display = 'none'
    
    // 添加到文档并触发点击
    document.body.appendChild(link)
    link.click()
    
    // 清理
    setTimeout(() => {
      document.body.removeChild(link)
    }, 100)
    
  } catch (error) {
    console.error('下载APK失败:', error)
    alert('下载失败: ' + error.message)
  }
}

// 获取缓存大小
async function getCacheSize() {
  try {
    loadingCacheSize.value = true
    const fileAPI = new FileAPI()
    const size = await fileAPI.getCacheSize()
    cacheSize.value = size
    cacheSizeFormatted.value = FileSizeFormatter.format(size)
    console.log('缓存大小:', cacheSizeFormatted.value, '(', size, 'bytes)')
  } catch (error) {
    console.error('获取缓存大小失败:', error)
    cacheSizeFormatted.value = '获取失败'
  } finally {
    loadingCacheSize.value = false
  }
}

// 清理缓存
async function clearCache() {
  if (!confirm('确定要清理缓存吗？')) {
    return
  }
  
  try {
    // 创建FileAPI实例并清理缓存
    const fileAPI = new FileAPI()
    fileAPI.cleanAllCaches()
    
    // 清理后重新获取缓存大小
    await getCacheSize()
        
    alert('缓存清理完成！已清理：内存缓存、localStorage缓存和文件系统缓存。')
  } catch (error) {
    console.error('清理缓存失败:', error)
    alert('清理缓存失败: ' + error.message)
  }
}

// 组件挂载时初始化
onMounted(() => {
  initUserState()
  initConnectionStatus()
  
  // 判断是否为 Android 原生 App（Capacitor 环境）
  if (Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android') {
    isAndroidApp.value = true
    isNativeMode.value = true
  }
  
  // 初始化缓存大小
  getCacheSize()
})
</script>

<style scoped>
.settings-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #f5f5f5;
}

/* 紫色状态栏已移至App.vue中统一管理 */

.settings-actions {
  display: flex;
  gap: 10px;
}

.action-btn {
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

.action-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.action-icon {
  font-size: 16px;
}

.action-text {
  font-size: 14px;
}

.settings-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

/* 待建设提示 */
.construction-notice {
  background: white;
  border-radius: 12px;
  padding: 40px 30px;
  text-align: center;
  margin-bottom: 30px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.1);
  border: 2px dashed #667eea;
}

.construction-icon {
  font-size: 64px;
  margin-bottom: 20px;
  opacity: 0.8;
}

.construction-notice h2 {
  color: #333;
  margin-bottom: 15px;
  font-size: 24px;
}

.construction-notice p {
  color: #666;
  margin-bottom: 25px;
  font-size: 16px;
  line-height: 1.6;
}

.construction-details {
  text-align: left;
  max-width: 600px;
  margin: 0 auto;
}

.construction-details p {
  color: #444;
  font-weight: 500;
  margin-bottom: 15px;
}

.features-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
}

.features-list li {
  background: #f8f9fa;
  padding: 12px 15px;
  border-radius: 8px;
  font-size: 14px;
  color: #555;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: all 0.3s;
}

.features-list li:hover {
  background: #e9ecef;
  transform: translateX(5px);
}

/* 设置区域 */
.settings-sections {
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.settings-section {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.section-title {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 18px 25px;
  margin: 0;
  font-size: 18px;
  color: #333;
  display: flex;
  align-items: center;
  gap: 10px;
}

.section-icon {
  font-size: 20px;
}

.section-content {
  padding: 20px 25px;
}

/* 设置项 */
.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 0;
  border-bottom: 1px solid #f0f0f0;
}

.setting-item:last-child {
  border-bottom: none;
}

.setting-item.disabled {
  opacity: 0.6;
}

.setting-info {
  flex: 1;
}

.setting-label {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
}

.setting-value {
  font-size: 13px;
  color: #666;
}

.setting-action button {
  padding: 8px 16px;
  border-radius: 4px;
  border: 1px solid #ddd;
  background: white;
  color: #666;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.3s;
}

.setting-action button:hover:not(:disabled) {
  background: #f5f5f5;
  border-color: #667eea;
  color: #667eea;
}

.setting-action button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.edit-btn {
  background: #667eea;
  color: white;
  border-color: #667eea !important;
}

.logout-btn {
  background: #ff6b6b;
  color: white;
  border-color: #ff6b6b !important;
}

.login-btn {
  background: #4caf50;
  color: white;
  border-color: #4caf50 !important;
}

.clear-btn {
  background: #ffa726;
  color: white;
  border-color: #ffa726 !important;
}

.view-btn {
  background: #667eea;
  color: white;
  border-color: #667eea !important;
}

.toggle-btn, .select-btn {
  background: #4ecdc4;
  color: white;
  border-color: #4ecdc4 !important;
}

.update-btn {
  background: #9c27b0;
  color: white;
  border-color: #9c27b0 !important;
  opacity: 0.6;
  cursor: not-allowed;
}

.download-btn {
  background: #ff9800;
  color: white;
  border-color: #ff9800 !important;
}

.reconnect-btn {
  background: #667eea;
  color: white;
  border-color: #667eea !important;
}

.refresh-btn {
  background: #4caf50;
  color: white;
  border-color: #4caf50 !important;
}

.reload-btn {
  background: #9c27b0;
  color: white;
  border-color: #9c27b0 !important;
}

/* 连接状态样式 */
.status-connected {
  color: #4caf50;
  font-weight: 600;
}

.status-connecting {
  color: #ffa726;
  font-weight: 600;
}

.status-disconnected {
  color: #ff6b6b;
  font-weight: 600;
}

.status-unknown {
  color: #666;
  font-weight: 600;
}

/* 关于信息 */
.about-info {
  text-align: center;
}

.app-info {
  margin-bottom: 25px;
}

.app-name {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.app-version {
  font-size: 14px;
  color: #666;
}

.about-links {
  display: flex;
  justify-content: center;
  gap: 15px;
  flex-wrap: wrap;
}

.link-btn {
  background: transparent;
  border: 1px solid #ddd;
  color: #666;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 8px;
}

.link-btn:hover {
  background: #f5f5f5;
  border-color: #667eea;
  color: #667eea;
}

.link-icon {
  font-size: 16px;
}

/* 底部信息 */
.settings-footer {
  background: white;
  padding: 20px;
  text-align: center;
  border-top: 1px solid #e0e0e0;
  color: #666;
  font-size: 13px;
}

.settings-footer p {
  margin: 5px 0;
}

.footer-beian {
  color: #999;
  font-size: 12px;
}

/* 下载文件管理弹窗样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 900px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  animation: modalSlideIn 0.3s ease-out;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  padding: 20px 25px;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-title {
  margin: 0;
  font-size: 18px;
  color: #333;
  display: flex;
  align-items: center;
  gap: 10px;
}

.modal-icon {
  font-size: 20px;
}

.modal-close-btn {
  background: none;
  border: none;
  font-size: 24px;
  color: #666;
  cursor: pointer;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.3s;
}

.modal-close-btn:hover {
  background: #f5f5f5;
  color: #333;
}

.modal-body {
  flex: 1;
  padding: 25px;
  overflow-y: auto;
}

/* 加载状态 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-container p {
  color: #666;
  font-size: 14px;
}

/* 空状态 */
.empty-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
}

.empty-icon {
  font-size: 48px;
  color: #ccc;
  margin-bottom: 20px;
}

.empty-text {
  font-size: 16px;
  color: #666;
  margin-bottom: 8px;
  font-weight: 500;
}

.empty-subtext {
  font-size: 14px;
  color: #999;
}

/* 文件列表表格 */
.files-table-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.table-summary {
  font-size: 14px;
  color: #666;
}

.refresh-btn {
  background: #4caf50;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.3s;
}

.refresh-btn:hover:not(:disabled) {
  background: #43a047;
}

.refresh-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.refresh-icon {
  font-size: 14px;
}

.files-table-wrapper {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
}

.files-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.files-table thead {
  background: #f8f9fa;
}

.files-table th {
  padding: 12px 16px;
  text-align: left;
  font-weight: 600;
  color: #333;
  border-bottom: 2px solid #e0e0e0;
}

.files-table td {
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
  vertical-align: middle;
}

.files-table tbody tr:hover {
  background: #f9f9f9;
}

.files-table tbody tr:last-child td {
  border-bottom: none;
}

.file-name {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  color: #333;
}

.file-icon {
  font-size: 16px;
  color: #667eea;
}

.status-badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.status-completed {
  background: #e8f5e9;
  color: #2e7d32;
}

.status-success {
  background: #e8f5e9;
  color: #2e7d32;
}

.status-error {
  background: #ffebee;
  color: #c62828;
}

.download-time {
  color: #666;
  font-size: 12px;
}

.local-path {
  max-width: 200px;
}

.path-text {
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #666;
  font-size: 12px;
  font-family: monospace;
}

.actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  background: none;
  border: 1px solid #ddd;
  color: #666;
  width: 32px;
  height: 32px;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  transition: all 0.3s;
}

.action-btn:hover {
  background: #f5f5f5;
}

.view-btn:hover {
  border-color: #667eea;
  color: #667eea;
}

.delete-btn:hover {
  border-color: #ff6b6b;
  color: #ff6b6b;
}

.modal-footer {
  padding: 20px 25px;
  border-top: 1px solid #e0e0e0;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.modal-btn {
  padding: 10px 20px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s;
}

.primary-btn {
  background: #667eea;
  color: white;
}

.primary-btn:hover:not(:disabled) {
  background: #5a67d8;
}

.secondary-btn {
  background: #f5f5f5;
  color: #666;
}

.secondary-btn:hover {
  background: #e0e0e0;
}

.modal-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 响应式设计 */
@media (max-width: 768px) {
  /* 紫色状态栏已移至App.vue中统一管理 */
  
  .settings-content {
    padding: 12px;
  }
  
  .settings-actions {
    width: 100%;
    justify-content: center;
  }
  
  .features-list {
    grid-template-columns: 1fr;
  }
  
  .about-links {
    flex-direction: column;
    align-items: center;
  }
  
  .link-btn {
    width: 200px;
    justify-content: center;
  }
  
  /* 弹窗响应式 */
  .modal-content {
    max-width: 95%;
    max-height: 85vh;
  }
  
  .modal-header,
  .modal-body,
  .modal-footer {
    padding: 15px;
  }
  
  .files-table {
    font-size: 12px;
  }
  
  .files-table th,
  .files-table td {
    padding: 8px 12px;
  }
  
  .actions {
    flex-direction: column;
    gap: 4px;
  }
  
  .action-btn {
    width: 28px;
    height: 28px;
    font-size: 12px;
  }
}

@media (max-width: 480px) {
  /* 紫色状态栏已移至App.vue中统一管理 */
  
  .settings-content {
    padding: 8px;
  }
  
  .settings-actions {
    gap: 8px;
  }
  
  .action-btn {
    padding: 6px 12px;
    font-size: 12px;
  }
  
  .action-icon {
    font-size: 14px;
  }
  
  /* 弹窗响应式 */
  .modal-content {
    max-width: 100%;
    max-height: 90vh;
    margin: 10px;
  }
  
  .files-table {
    display: block;
    overflow-x: auto;
  }
  
  .files-table th:nth-child(4),
  .files-table td:nth-child(4),
  .files-table th:nth-child(5),
  .files-table td:nth-child(5) {
    display: none;
  }
  
  .modal-btn {
    padding: 8px 16px;
    font-size: 13px;
  }
}
</style>