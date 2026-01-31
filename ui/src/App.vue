<template>
  <Login v-if="!isLoggedIn" @login-state-changed="handleLoginStateChanged" />
  <Files v-else @login-state-changed="handleLoginStateChanged" />

</template>

<script setup>
import { ref, computed } from 'vue'
import Files from './Files.vue';
import UserAPI from './lib/user-api'
import Login from './Login.vue';

const loginState = ref(UserAPI.isLogined())

const isLoggedIn = computed(() => {
  return loginState.value
})

function handleLoginStateChanged() {
  console.log("App.vue: login state changed. logged in =", UserAPI.isLogined())
  loginState.value = UserAPI.isLogined()
}
</script>