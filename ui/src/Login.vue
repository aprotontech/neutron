<template>
  <div class="login-container">
    <div class="card">
      <h2>登录</h2>
      <div class="form-group">
        <label>用户名</label>
        <input v-model="username" type="text" autocomplete="username" @keyup.enter="login">
      </div>
      <div class="form-group">
        <label>密码</label>
        <input v-model="password" type="password" autocomplete="current-password" @keyup.enter="login">
      </div>
      <button @click="login" :disabled="loading">{{ loading ? '登录中...' : '登录' }}</button>
      <div v-if="error" class="error">{{ error }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, defineEmits } from 'vue'
import UserAPI from './lib/user-api.js'

const emit = defineEmits(['login-state-changed'])

const username = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function login() {
  error.value = ''
  if (!username.value || !password.value) {
    error.value = '请输入用户名和密码'
    return
  }

  loading.value = true
  const error_msg = await UserAPI.login(username.value, password.value, "home")
  loading.value = false
  if (error_msg === true) {
    emit('login-state-changed')
  } else {
    error.value = error_msg
  }
}

onMounted(() => {
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
  font-family: Arial, Helvetica, sans-serif;
  background: #f5f7fa;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  margin: 0;
}

.card {
  background: white;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 6px 18px rgba(0,0,0,0.08);
  width: 320px;
}

.card h2 {
  margin: 0 0 12px 0;
  font-size: 20px;
}

.form-group {
  margin-bottom: 12px;
}

label {
  display: block;
  margin-bottom: 6px;
  font-size: 13px;
  color: #333;
}

input[type=text], input[type=password] {
  width: 100%;
  padding: 8px 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

button {
  width: 100%;
  padding: 10px;
  border: none;
  border-radius: 4px;
  background: #667eea;
  color: white;
  font-weight: 600;
  cursor: pointer;
}

button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.error {
  color: #c33;
  margin-top: 8px;
  font-size: 13px;
}
</style>