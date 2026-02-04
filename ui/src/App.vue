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
import { ref, computed, onMounted } from 'vue'
import { Capacitor } from '@capacitor/core'
import Files from './Files.vue';
import UserAPI from './lib/user-api'
import Login from './Login.vue';

const loginState = ref(UserAPI.isLogined())
const isCapacitorNative = ref(false)

const isLoggedIn = computed(() => {
  return loginState.value
})

function handleLoginStateChanged() {
  console.log("App.vue: login state changed. logged in =", UserAPI.isLogined())
  loginState.value = UserAPI.isLogined()
}

onMounted(() => {
  isCapacitorNative.value = Capacitor.isNativePlatform()
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