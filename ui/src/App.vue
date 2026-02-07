<template>
  <div class="app-container">
    <!-- 登录页面 -->
    <Login v-if="!isLoggedIn" @login-state-changed="handleLoginStateChanged" />
    
    <!-- 主应用页面（登录后显示） -->
    <div v-else class="main-app">
      <!-- 内容区域 -->
      <div class="tab-content">
        <Image v-if="activeTab === 'gallery'" />
        <Files v-else-if="activeTab === 'browse'" @login-state-changed="handleLoginStateChanged" />
        <Settings v-else-if="activeTab === 'settings'" @login-state-changed="handleLoginStateChanged" />
      </div>
      
      <!-- 底部Tab导航 -->
      <div class="tab-navigation bottom-tab">
        <button 
          class="tab-btn" 
          :class="{ active: activeTab === 'gallery' }"
          @click="switchTab('gallery')"
        >
          <span class="tab-icon">🖼️</span>
        </button>
        <button 
          class="tab-btn" 
          :class="{ active: activeTab === 'browse' }"
          @click="switchTab('browse')"
        >
          <span class="tab-icon">📁</span>
        </button>
        <button 
          class="tab-btn" 
          :class="{ active: activeTab === 'settings' }"
          @click="switchTab('settings')"
        >
          <span class="tab-icon">⚙️</span>
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
const activeTab = ref('browse') // 默认显示浏览Tab

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
  document.addEventListener('touchstart', (e) => {
    // 如果是长按事件，阻止默认行为
    if (e.touches && e.touches.length > 0) {
      const target = e.target;
      
      // 检查是否应该允许自定义菜单
      const shouldAllowCustomMenu = target.closest('.file-list-item') || 
                                    target.closest('.thumbnail-item') ||
                                    target.closest('.context-menu') ||
                                    target.closest('[data-allow-context-menu]');
      
      // 如果是图片元素且不是文件项，阻止长按菜单
      if (target.tagName === 'IMG' && !shouldAllowCustomMenu) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    }
  }, { passive: false, capture: true });
  
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
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* 主应用容器 */
.main-app {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100vh;
  position: relative;
}

/* Tab导航样式 - 固定在窗口底部 */
.tab-navigation {
  display: flex;
  background: white;
  box-shadow: 0 -2px 8px rgba(0,0,0,0.05);
  z-index: 1000;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60px; /* 固定高度 */
}

/* 底部Tab导航 */
.tab-navigation.bottom-tab {
  border-top: 1px solid #e0e0e0;
  border-bottom: none;
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
  transition: all 0.3s;
  position: relative;
  height: 100%; /* 占满父容器高度 */
}

.tab-btn:hover {
  background: #f9f9f9;
}

.tab-btn.active {
  color: #667eea;
}

.tab-btn.active::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 0 0 3px 3px;
}

.tab-icon {
  font-size: 20px;
  transition: all 0.3s;
}

.tab-btn.active .tab-icon {
  transform: scale(1.1);
}

.tab-text {
  font-size: 12px;
  font-weight: 500;
}

/* 内容区域 */
.tab-content {
  flex: 1;
  overflow-y: auto;
  position: relative;
  padding-bottom: 60px; /* 为底部固定Tab导航留出空间 */
  margin-bottom: 60px; /* 确保内容不被Tab遮挡 */
  background: #f5f7fa; /* 统一所有Tab页面的背景色 */
}

/* 移动端优化 */
@media (max-width: 768px) {
  .tab-navigation {
    height: 56px; /* 移动端稍矮一些 */
  }
  
  .tab-btn {
    padding: 6px 0;
  }
  
  .tab-icon {
    font-size: 20px; /* 移动端图标稍大 */
  }
  
  .tab-text {
    font-size: 10px; /* 移动端文字稍小 */
  }
  
  .tab-content {
    padding-bottom: 56px;
    margin-bottom: 56px;
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