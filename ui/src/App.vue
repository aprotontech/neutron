<template>
  <div class="app-container">
    <Login v-if="!isLoggedIn" @login-state-changed="handleLoginStateChanged" />
    <Files v-else @login-state-changed="handleLoginStateChanged" />
    
    <div v-if="!isCapacitorNative" class="footer-beian">
      京ICP备16041151号-1
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { Capacitor } from '@capacitor/core'
import { App } from '@capacitor/app'
import Files from './Files.vue';
import UserAPI from './lib/user-api'
import Login from './Login.vue';
import { triggerAppResumed, triggerAppRefreshError } from './lib/app-events';

const loginState = ref(UserAPI.isLogined())
const isCapacitorNative = ref(false)
const appState = ref('active')

const isLoggedIn = computed(() => {
  return loginState.value
})

function handleLoginStateChanged() {
  console.log("App.vue: login state changed. logged in =", UserAPI.isLogined())
  loginState.value = UserAPI.isLogined()
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



onMounted(() => {
  isCapacitorNative.value = Capacitor.isNativePlatform()
  
  // 如果是原生平台，添加应用状态监听器
  if (isCapacitorNative.value) {
    console.log('Setting up app state change listener...')
    App.addListener('appStateChange', handleAppStateChange)
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