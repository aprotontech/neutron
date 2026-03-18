<template>
  <div class="login-container" :class="{ 'native-app': isCapacitorNative }">
    <!-- 背景装饰 -->
    <div class="background-decor">
      <div class="gradient-circle circle-1"></div>
      <div class="gradient-circle circle-2"></div>
      <div class="gradient-circle circle-3"></div>
    </div>
    
    <!-- 登录内容 -->
    <div class="login-content">
      <!-- 顶部品牌区域 -->
      <div class="brand-section">
        <div class="app-icon">📱</div>
        <h1 class="app-title">年轮</h1>
        <p class="app-subtitle">家庭相册管理与同步</p>
      </div>
      
      <!-- 登录表单 -->
      <div class="login-form">
        <h2 class="form-title">登录您的账户</h2>
        
        <!-- 用户名输入 -->
        <div class="input-group">
          <div class="input-icon">👤</div>
          <input 
            v-model="username" 
            type="text" 
            placeholder="用户名" 
            autocomplete="username"
            @keyup.enter="login"
            class="modern-input"
          >
        </div>
        
        <!-- 密码输入 -->
        <div class="input-group">
          <div class="input-icon">🔒</div>
          <input 
            v-model="password" 
            :type="showPassword ? 'text' : 'password'" 
            placeholder="密码" 
            autocomplete="current-password"
            @keyup.enter="login"
            class="modern-input"
          >
          <button 
            class="password-toggle" 
            @click="showPassword = !showPassword"
            type="button"
          >
            {{ showPassword ? '🙈' : '👁️' }}
          </button>
        </div>
        
        <!-- 选项区域 -->
        <div class="options-row">
          <label class="option-checkbox" v-if="isCapacitorNative">
            <input type="checkbox" v-model="rememberPassword">
            <span class="checkbox-custom"></span>
            <span class="option-label">记住密码</span>
          </label>
          
          <!-- 生物识别登录选项暂时隐藏 -->
          <!-- 
          <button 
            class="biometric-btn" 
            v-if="isCapacitorNative && showBiometricOption"
            @click="tryBiometricLogin"
            type="button"
          >
            <span class="biometric-icon">👆</span>
            <span class="biometric-text">生物识别登录</span>
          </button>
          -->
        </div>
        
        <!-- 登录按钮 -->
        <button 
          @click="login" 
          :disabled="loading" 
          class="login-btn"
        >
          <span v-if="!loading">登录</span>
          <div v-else class="loading-spinner">
            <div class="spinner"></div>
            <span>登录中...</span>
          </div>
        </button>
        
        <!-- 错误提示 -->
        <div v-if="error" class="error-message">
          <span class="error-icon">⚠️</span>
          <span>{{ error }}</span>
        </div>
        
        <!-- 底部提示 -->
        <div class="bottom-hint" v-if="!isCapacitorNative">
          <p>提示：在移动设备上安装应用以获得更好的体验</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, defineEmits } from 'vue'
import { Capacitor } from '@capacitor/core'
import UserAPI from './lib/user-api.js'
import { RuntimeVariables } from './lib/helpers.js'
import { nativePlatform } from './lib/native-platform.js'

const emit = defineEmits(['login-state-changed'])

const username = ref('')
const password = ref('')
const rememberPassword = ref(false)
const showPassword = ref(false)
const error = ref('')
const loading = ref(false)
const isCapacitorNative = ref(false)
const showBiometricOption = ref(false)
const deviceInfo = ref(null)

async function login() {
  error.value = ''
  if (!username.value || !password.value) {
    error.value = '请输入用户名和密码'
    return
  }

  loading.value = true
  
  try {
    const error_msg = await UserAPI.login(username.value, password.value, "home", rememberPassword.value)
    
    if (error_msg === true) {
      // 登录成功，安全保存凭据
      if (rememberPassword.value && isCapacitorNative.value) {
        await nativePlatform.saveCredentialsSecurely(username.value, password.value, true)
      } else if (!rememberPassword.value) {
        // 不记住密码，清除保存的凭据
        await nativePlatform.clearCredentials()
      }
      
      emit('login-state-changed')
    } else {
      error.value = error_msg
    }
  } catch (err) {
    error.value = '登录过程中发生错误: ' + (err.message || '未知错误')
    console.error('登录错误:', err)
  } finally {
    loading.value = false
  }
}

// 生物识别登录（暂时禁用）
/*
async function tryBiometricLogin() {
  if (!username.value) {
    error.value = '请先输入用户名'
    return
  }
  
  error.value = ''
  loading.value = true
  
  try {
    // 模拟生物识别过程
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // 从安全存储加载凭据
    const credentials = await nativePlatform.loadCredentialsSecurely()
    
    if (credentials.password) {
      const error_msg = await UserAPI.login(username.value, credentials.password, "home", true)
      if (error_msg === true) {
        emit('login-state-changed')
      } else {
        error.value = '生物识别登录失败，请使用密码登录'
      }
    } else {
      error.value = '未找到保存的密码，请使用密码登录'
    }
  } catch (err) {
    error.value = '生物识别登录失败: ' + (err.message || '未知错误')
    console.error('生物识别错误:', err)
  } finally {
    loading.value = false
  }
}
*/

// 自动填充保存的凭据
async function autoFillCredentials() {
  if (!isCapacitorNative.value) {
    return
  }
  
  try {
    const credentials = await nativePlatform.loadCredentialsSecurely()
    
    if (credentials.username) {
      username.value = credentials.username
      rememberPassword.value = true
    }
    
    if (credentials.password) {
      password.value = credentials.password
      // 生物识别选项暂时隐藏
      // showBiometricOption.value = true
    }
  } catch (error) {
    console.warn('自动填充凭据失败:', error)
  }
}

// 初始化原生平台优化
async function initializeNativeOptimizations() {
  if (!isCapacitorNative.value) {
    return
  }
  
  try {
    // 获取设备信息
    deviceInfo.value = await nativePlatform.getDeviceInfo()
    
    // 生物识别支持检查暂时禁用
    // showBiometricOption.value = await nativePlatform.checkBiometricSupport()
    
    // 初始化原生优化
    await nativePlatform.initializeNativeOptimizations()
    
    console.log('原生平台优化初始化完成:', deviceInfo.value)
  } catch (error) {
    console.error('初始化原生优化失败:', error)
  }
}

onMounted(async () => {
  isCapacitorNative.value = Capacitor.isNativePlatform()
  
  // 初始化原生平台优化
  await initializeNativeOptimizations()
  
  // 自动填充保存的凭据
  await autoFillCredentials()
  
  // 检查登录状态
  if (UserAPI.isLogined()) {
    UserAPI.refreshToken()
    .then(error_msg => {
      console.log("refreshToken", error_msg)
      if (error_msg === true){
          emit('login-state-changed')
      }
    })
  }
})
</script>

<style scoped>
.login-container {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  margin: 0;
  position: relative;
  overflow: hidden;
}

/* 原生应用模式 */
.login-container.native-app {
  background: #ffffff;
}

/* 背景装饰 */
.background-decor {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  z-index: 0;
}

.gradient-circle {
  position: absolute;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
}

.circle-1 {
  width: 300px;
  height: 300px;
  top: -150px;
  right: -100px;
}

.circle-2 {
  width: 200px;
  height: 200px;
  bottom: -100px;
  left: -50px;
}

.circle-3 {
  width: 150px;
  height: 150px;
  top: 50%;
  left: -75px;
}

/* 原生模式下的背景 */
.login-container.native-app .background-decor {
  display: none;
}

.login-container.native-app .gradient-circle {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.05) 100%);
}

/* 登录内容 */
.login-content {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 400px;
  padding: 20px;
}

/* 品牌区域 */
.brand-section {
  text-align: center;
  margin-bottom: 40px;
}

.app-icon {
  font-size: 64px;
  margin-bottom: 16px;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.app-title {
  font-size: 32px;
  font-weight: 700;
  color: white;
  margin: 0 0 8px 0;
  letter-spacing: -0.5px;
}

.login-container.native-app .app-title {
  color: #333333;
}

.app-subtitle {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
  font-weight: 400;
}

.login-container.native-app .app-subtitle {
  color: #666666;
}

/* 登录表单 */
.login-form {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 24px;
  padding: 32px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(10px);
}

.login-container.native-app .login-form {
  background: #ffffff;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #f0f0f0;
}

.form-title {
  font-size: 20px;
  font-weight: 600;
  color: #333333;
  margin: 0 0 24px 0;
  text-align: center;
}

/* 输入组 */
.input-group {
  position: relative;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  background: #f8f9fa;
  border-radius: 12px;
  padding: 0 16px;
  border: 2px solid transparent;
  transition: all 0.3s ease;
}

.input-group:focus-within {
  border-color: #667eea;
  background: #ffffff;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.input-icon {
  font-size: 20px;
  margin-right: 12px;
  color: #667eea;
}

.modern-input {
  flex: 1;
  padding: 16px 0;
  border: none;
  background: transparent;
  font-size: 16px;
  color: #333333;
  outline: none;
}

.modern-input::placeholder {
  color: #999999;
}

.password-toggle {
  background: transparent;
  border: none;
  font-size: 20px;
  color: #667eea;
  cursor: pointer;
  padding: 8px;
  margin-left: 8px;
  border-radius: 8px;
  transition: background-color 0.2s ease;
}

.password-toggle:hover {
  background: rgba(102, 126, 234, 0.1);
}

/* 选项区域 */
.options-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 12px;
}

.option-checkbox {
  display: flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
}

.option-checkbox input {
  display: none;
}

.checkbox-custom {
  width: 20px;
  height: 20px;
  border: 2px solid #ddd;
  border-radius: 6px;
  margin-right: 8px;
  position: relative;
  transition: all 0.2s ease;
}

.option-checkbox input:checked + .checkbox-custom {
  background: #667eea;
  border-color: #667eea;
}

.option-checkbox input:checked + .checkbox-custom::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 12px;
}

.option-label {
  font-size: 14px;
  color: #666666;
}

/* 生物识别按钮样式暂时隐藏 */
  /*
  .biometric-btn {
    display: flex;
    align-items: center;
    background: transparent;
    border: 1px solid #667eea;
    color: #667eea;
    padding: 8px 16px;
    border-radius: 20px;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .biometric-btn:hover {
    background: rgba(102, 126, 234, 0.1);
  }

  .biometric-icon {
    margin-right: 6px;
    font-size: 16px;
  }
  */

/* 登录按钮 */
.login-btn {
  width: 100%;
  padding: 18px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.login-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.login-btn:active:not(:disabled) {
  transform: translateY(0);
}

.login-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.loading-spinner {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 错误提示 */
.error-message {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 16px;
  padding: 12px;
  background: rgba(220, 53, 69, 0.1);
  border: 1px solid rgba(220, 53, 69, 0.2);
  border-radius: 8px;
  color: #dc3545;
  font-size: 14px;
}

.error-icon {
  font-size: 16px;
}

/* 底部提示 */
.bottom-hint {
  margin-top: 24px;
  text-align: center;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

.bottom-hint p {
  font-size: 12px;
  color: #999999;
  margin: 0;
}

/* 移动端优化 */
@media (max-width: 480px) {
  .login-content {
    padding: 16px;
  }
  
  .login-form {
    padding: 24px;
    border-radius: 20px;
  }
  
  .app-icon {
    font-size: 48px;
  }
  
  .app-title {
    font-size: 28px;
  }
  
  .app-subtitle {
    font-size: 14px;
  }
  
  .form-title {
    font-size: 18px;
  }
  
  .modern-input {
    padding: 14px 0;
    font-size: 15px;
  }
  
  .login-btn {
    padding: 16px;
    font-size: 15px;
  }
  
  .options-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .biometric-btn {
    width: 100%;
    justify-content: center;
  }
}

/* 平板优化 */
@media (min-width: 481px) and (max-width: 768px) {
  .login-content {
    max-width: 360px;
  }
}

/* 暗色模式支持 */
@media (prefers-color-scheme: dark) {
  .login-container.native-app {
    background: #121212;
  }
  
  .login-container.native-app .app-title {
    color: #ffffff;
  }
  
  .login-container.native-app .app-subtitle {
    color: #aaaaaa;
  }
  
  .login-container.native-app .login-form {
    background: #1e1e1e;
    border-color: #333333;
  }
  
  .form-title {
    color: #ffffff;
  }
  
  .input-group {
    background: #2d2d2d;
  }
  
  .modern-input {
    color: #ffffff;
  }
  
  .modern-input::placeholder {
    color: #777777;
  }
  
  .option-label {
    color: #aaaaaa;
  }
  
  .bottom-hint p {
    color: #777777;
  }
}
</style>