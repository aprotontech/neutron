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
                <div class="setting-value">256 MB</div>
              </div>
              <div class="setting-action">
                <button class="clear-btn" @click="clearCache">清理</button>
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
import { RuntimeVariables } from './lib/helpers.js'
import UserAPI from './lib/user-api.js'
import FileAPI from './lib/file-api.js'
import CacheManager from './lib/cache-manager.js'
import TransferClient from './lib/transfer.js'

const emit = defineEmits(['login-state-changed'])

// 用户状态
const username = ref('')
const isLoggedIn = ref(false)

// Android原生App检测
const isAndroidApp = ref(false)

// 连接状态
const connectionStatus = ref('unknown')
const transportType = ref('webrtc') // 默认使用webrtc

// 初始化用户状态
function initUserState() {
  username.value = RuntimeVariables.getUserName()
  isLoggedIn.value = UserAPI.isLogined()
}

// 编辑用户名
function editUsername() {
  const newUsername = prompt('请输入新的用户名：', username.value)
  if (newUsername !== null && newUsername.trim() !== '') {
    // 这里可以添加更新用户名的API调用
    alert('用户名修改功能正在开发中')
  }
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

// 清理缓存
async function clearCache() {
  if (!confirm('确定要清理缓存吗？')) {
    return
  }
  
  try {
    // 创建FileAPI实例并清理缓存
    const fileAPI = new FileAPI()
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

// 组件挂载时初始化
onMounted(() => {
  initUserState()
  initConnectionStatus()
  
  // 判断是否为 Android 原生 App（Capacitor 环境）
  if (Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android') {
    isAndroidApp.value = true
  }
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

.toggle-btn, .select-btn {
  background: #4ecdc4;
  color: white;
  border-color: #4ecdc4 !important;
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
}
</style>