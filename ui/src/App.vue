<template>
  <div class="app-container">
    <!-- 登录页面 -->
    <Login v-if="!isLoggedIn" @login-state-changed="handleLoginStateChanged" />
    
    <!-- 主应用页面（登录后显示） -->
    <div v-else class="main-app">
      <!-- 统一的紫色状态栏 -->
      <div class="app-header" :class="{ 'android-native-app': isCapacitorNative }">
        <div class="header-left">
          <h1 v-if="getHeaderTitle()">{{ getHeaderTitle() }}</h1>
          <!-- 即使标题为空，也保留一个占位元素确保高度 -->
          <div v-else class="header-placeholder"></div>
        </div>
        <div class="header-right">
          <!-- 这里可以添加全局操作按钮 -->
        </div>
      </div>
      
      <!-- 内容区域 -->
      <div class="tab-content">
        <Image v-if="activeTab === 'gallery'" />
        <Files v-else-if="activeTab === 'browse'" @login-state-changed="handleLoginStateChanged" />
        <Settings v-else-if="activeTab === 'settings'" @login-state-changed="handleLoginStateChanged" />
      </div>
      
      <!-- 底部Tab导航 - 扁平化设计 -->
      <div class="tab-navigation bottom-tab">
        <button 
          class="tab-btn" 
          :class="{ active: activeTab === 'gallery' }"
          @click="switchTab('gallery')"
        >
          <div class="tab-icon-container">
            <span class="tab-icon">🖼️</span>
            <span class="tab-label">图库</span>
          </div>
        </button>
        <button 
          class="tab-btn" 
          :class="{ active: activeTab === 'browse' }"
          @click="switchTab('browse')"
        >
          <div class="tab-icon-container">
            <span class="tab-icon">📂</span>
            <span class="tab-label">文件</span>
          </div>
        </button>
        <button 
          class="tab-btn" 
          :class="{ active: activeTab === 'settings' }"
          @click="switchTab('settings')"
        >
          <div class="tab-icon-container">
            <span class="tab-icon">⚙️</span>
            <span class="tab-label">设置</span>
          </div>
        </button>
      </div>
    </div>
    
    <!-- 底部备案信息（仅Web版显示） -->
    <div v-if="!isCapacitorNative && isLoggedIn" class="footer-beian">
      京ICP备16041151号-1
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { Capacitor } from '@capacitor/core'
import { StatusBar, Style } from '@capacitor/status-bar';
import { App } from '@capacitor/app'
import Files from './Files.vue';
import Image from './Image.vue';
import Settings from './Settings.vue';
import UserAPI from './lib/user-api'
import Login from './Login.vue';
import { triggerAppResumed, triggerAppRefreshError } from './lib/app-events';

const loginState = ref(UserAPI.isLogined())
const isCapacitorNative = ref(false)
const appState = ref('active')
const activeTab = ref('gallery') // 默认显示图库Tab

const isLoggedIn = computed(() => {
  return loginState.value
})

function handleLoginStateChanged() {
  console.log("App.vue: login state changed. logged in =", UserAPI.isLogined())
  loginState.value = UserAPI.isLogined()
}

// 切换Tab
function switchTab(tab) {
  console.log("切换Tab到:", tab)
  activeTab.value = tab
}

// 获取头部标题
function getHeaderTitle() {
  if (Capacitor.isNativePlatform()) {
    return ""
  }
  switch (activeTab.value) {
    case 'gallery':
      return '图库'
    case 'browse':
      return '文件浏览器'
    case 'settings':
      return '设置'
    default:
      return 'Neutron'
  }
}

// 处理应用状态变化
async function handleAppStateChange(state) {
  console.log('App state changed:', state)
  appState.value = state
  
  // 当应用从后台切换到前台时刷新页面
  if (state === 'active') {
    console.log('App resumed from background, refreshing page...')
    // 触发页面刷新逻辑
    await refreshPage()
  }
}

// 刷新页面逻辑
async function refreshPage() {
  try {
    console.log('Starting page refresh after app resume...')
    
    // 重新检查登录状态
    const wasLoggedIn = loginState.value
    loginState.value = UserAPI.isLogined()
    
    // 如果登录状态发生变化，重新加载组件
    if (wasLoggedIn !== loginState.value) {
      console.log('Login state changed after resume, updating UI...')
      // 这里可以添加更多刷新逻辑，比如重新加载数据等
    }
    
    // 触发全局刷新事件，供子组件监听
    triggerAppResumed({
      previousState: appState.value,
      currentState: 'active'
    })
    
    console.log('Page refresh completed')
    
  } catch (error) {
    console.error('Error refreshing page:', error)
    
    // 触发错误事件
    triggerAppRefreshError(error)
  }
}

const initializeApp = async () => {
  if (Capacitor.isNativePlatform()) {
    try {
      // 确保状态栏显示
      await StatusBar.show();
      
      // 强制设置不覆盖内容（关键）
      await StatusBar.setOverlaysWebView({ overlay: false });
      
      // 设置背景色
      await StatusBar.setBackgroundColor({ color: '#ffffff' });
      
      // 设置样式
      await StatusBar.setStyle({ style: Style.Default });
      
      console.log('状态栏设置完成');
    } catch (error) {
      console.error('状态栏设置失败:', error);
    }
  }
};

// 禁用浏览器原始菜单
const disableBrowserMenus = () => {
  if (!Capacitor.isNativePlatform()) {
    return; // 只在Capacitor本地模式下生效
  }
  
  console.log('禁用浏览器原始菜单...');
  
  // 1. 禁用全局上下文菜单
  document.addEventListener('contextmenu', (e) => {
    // 检查是否应该允许自定义上下文菜单
    const target = e.target;
    const shouldAllowCustomMenu = target.closest('.file-list-item') || 
                                  target.closest('.thumbnail-item') ||
                                  target.closest('.context-menu') ||
                                  target.closest('[data-allow-context-menu]');
    
    if (!shouldAllowCustomMenu) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
  }, { capture: true });
  
  // 2. 禁用文本选择菜单（长按文本时出现的菜单）
  document.addEventListener('selectstart', (e) => {
    e.preventDefault();
    e.stopPropagation();
    return false;
  }, { capture: true });
  
  // 3. 禁用拖拽相关菜单
  document.addEventListener('dragstart', (e) => {
    e.preventDefault();
    e.stopPropagation();
    return false;
  }, { capture: true });
  
  // 4. 禁用图片长按菜单
  // document.addEventListener('touchstart', (e) => {
  //   // 仅用于检测触摸目标；不要在 touchstart 上调用 preventDefault
  //   // 因为这会在部分 WebView/Android 原生容器中阻塞滚动。
  //   // 使用 CSS (-webkit-touch-callout / user-select) 来抑制长按菜单。
  //   if (!(e.touches && e.touches.length > 0)) return;
  //   const target = e.target;
  //   const shouldAllowCustomMenu = target.closest('.file-list-item') || 
  //                                 target.closest('.thumbnail-item') ||
  //                                 target.closest('.context-menu') ||
  //                                 target.closest('[data-allow-context-menu]');
  //   if (target.tagName === 'IMG' && !shouldAllowCustomMenu) {
  //     // 保留默认行为以允许从缩略图开始的滚动。
  //     return;
  //   }
  // }, { passive: true, capture: true });
  
  // 5. 添加CSS样式禁用文本选择
  const style = document.createElement('style');
  style.textContent = `
    * {
      -webkit-touch-callout: none !important; /* iOS Safari */
      -webkit-user-select: none !important; /* Safari */
      -khtml-user-select: none !important; /* Konqueror HTML */
      -moz-user-select: none !important; /* Firefox */
      -ms-user-select: none !important; /* Internet Explorer/Edge */
      user-select: none !important; /* Non-prefixed version, currently supported by Chrome and Opera */
      -webkit-tap-highlight-color: transparent !important;
    }
    
    /* 允许输入框和可编辑区域的文本选择 */
    input, textarea, [contenteditable="true"] {
      -webkit-user-select: text !important;
      -moz-user-select: text !important;
      -ms-user-select: text !important;
      user-select: text !important;
    }
    
    /* 允许文件项中的文本选择（用于自定义菜单） */
    .file-list-item, .file-list-item *,
    .thumbnail-item, .thumbnail-item * {
      -webkit-touch-callout: default !important;
      -webkit-user-select: text !important;
      -moz-user-select: text !important;
      -ms-user-select: text !important;
      user-select: text !important;
    }
    
    /* 允许链接的正常点击 */
    a {
      -webkit-touch-callout: default !important;
    }
  `;
  document.head.appendChild(style);
  
  console.log('浏览器原始菜单已禁用');
};

initializeApp();


onMounted(() => {
  isCapacitorNative.value = Capacitor.isNativePlatform()
  
  // 如果是原生平台，添加应用状态监听器
  if (isCapacitorNative.value) {
    console.log('Setting up app state change listener...')
    App.addListener('appStateChange', handleAppStateChange)
    
    // 禁用浏览器原始菜单
    disableBrowserMenus();
  }
})

onUnmounted(() => {
  // 清理监听器
  if (isCapacitorNative.value) {
    App.removeAllListeners()
  }
})


</script>

<style scoped>
.app-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

/* 主应用容器 */
.main-app {
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
}

/* Tab导航样式 - 固定在窗口底部 - 扁平化设计 */
.tab-navigation {
  display: flex;
  background: #ffffff;
  border-top: 1px solid #e0e0e0;
  z-index: 1000;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60px; /* 更紧凑的高度 */
}

/* 底部Tab导航 */
.tab-navigation.bottom-tab {
  border-top: 1px solid #e0e0e0;
}

.tab-btn {
  flex: 1;
  padding: 8px 0;
  background: transparent;
  border: none;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  transition: all 0.2s ease;
  position: relative;
  height: 100%;
}

.tab-btn:hover {
  background: #f5f5f5;
}

.tab-btn.active {
  color: #667eea;
  background: #f0f4ff;
}

.tab-btn.active::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: #667eea;
}

.tab-icon-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.tab-icon {
  font-size: 20px;
  transition: all 0.2s ease;
}

.tab-btn.active .tab-icon {
  transform: none;
  filter: none;
  opacity: 1;
  text-shadow: none;
}

.tab-label {
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 0.2px;
  color: #666666;
  transition: all 0.2s ease;
}

.tab-btn.active .tab-label {
  color: #667eea;
  font-weight: 600;
  transform: none;
}

/* 统一的紫色状态栏 - 扁平化设计 */
.app-header {
  background: #667eea;
  color: white;
  padding: 12px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #5a6fd8;
  min-height: 48px; /* 确保即使标题为空也有足够高度 */
  box-sizing: border-box;
}

/* Android 原生 App 模式下，为顶部预留状态栏高度 */
.android-native-app .app-header {
  padding-top: calc(12px + var(--safe-area-inset-top, env(safe-area-inset-top, 0px)));
  min-height: calc(48px + var(--safe-area-inset-top, env(safe-area-inset-top, 0px)));
}

.header-left {
  flex: 1;
}

.app-header h1 {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
}

.header-placeholder {
  height: 24px; /* 与h1大致相同的高度 */
  visibility: hidden;
}

.header-right {
  position: relative;
}

/* 内容区域 */
.tab-content {
  flex: 1;
  overflow-y: auto;
  position: relative;
  background: #ffffff; /* 扁平化设计使用纯白色背景 */
}

/* 移动端优化 */
@media (max-width: 768px) {
  .app-header {
    padding: 10px 12px;
  }
  
  .app-header h1 {
    font-size: 16px;
  }
  
  .tab-navigation {
    height: 56px; /* 移动端更紧凑 */
  }
  
  .tab-btn {
    padding: 6px 0;
  }
  
  .tab-icon {
    font-size: 18px;
  }
  
  .tab-label {
    font-size: 9px;
  }
}

@media (max-width: 480px) {
  .app-header {
    padding: 8px 10px;
  }
  
  .app-header h1 {
    font-size: 14px;
  }
  
  .tab-navigation {
    height: 52px;
  }
  
  .tab-icon {
    font-size: 16px;
  }
  
  .tab-label {
    font-size: 8px;
  }
}

/* Android原生App适配 */
.android-native-app .tab-navigation {
  padding-bottom: env(safe-area-inset-bottom);
}

.android-native-app .tab-navigation.bottom-tab {
  padding-top: 0;
  padding-bottom: env(safe-area-inset-bottom);
}

.footer-beian {
  margin-top: auto;
  padding: 16px;
  text-align: center;
  font-size: 12px;
  color: #666;
  background-color: #f5f5f5;
  border-top: 1px solid #e0e0e0;
}
</style>