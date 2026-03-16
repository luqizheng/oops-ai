<template>
  <div class="min-h-screen flex flex-col md:flex-row bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
    <!-- 左侧品牌展示区 -->
    <div class="hidden md:flex md:w-1/2 items-center justify-center p-8">
      <div class="max-w-md text-center">
        <div class="mb-8 flex justify-center">
          <div class="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-xl">
            <span class="text-3xl font-bold text-white">AI</span>
          </div>
        </div>
        <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-4">OOPS-AI</h1>
        <p class="text-lg text-gray-600 dark:text-gray-300 mb-8">
          软件团队专属需求智能体
        </p>
        <div class="space-y-4">
          <div class="flex items-center justify-center space-x-3">
            <svg class="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            <span class="text-gray-600 dark:text-gray-300">智能需求分析</span>
          </div>
          <div class="flex items-center justify-center space-x-3">
            <svg class="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            <span class="text-gray-600 dark:text-gray-300">高效项目管理</span>
          </div>
          <div class="flex items-center justify-center space-x-3">
            <svg class="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            <span class="text-gray-600 dark:text-gray-300">团队协作平台</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 右侧登录表单区 -->
    <div class="flex w-full md:w-1/2 items-center justify-center p-8">
      <div class="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 md:p-12 animate-fadeIn">
        <div>
          <h2 class="mt-6 text-center text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            欢迎回来
          </h2>
          <p class="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            登录您的账户继续使用
          </p>
        </div>

        <form @submit.prevent="handleLogin" class="mt-8 space-y-6">
          <!-- 邮箱输入 -->
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              电子邮箱
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                </svg>
              </div>
              <input
                id="email"
                name="email"
                type="email"
                v-model="loginForm.email"
                required
                class="w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                placeholder="your@email.com"
              />
            </div>
          </div>

          <!-- 密码输入 -->
          <div>
            <div class="flex justify-between items-center mb-1">
              <label for="password" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                密码
              </label>
              <a href="#" class="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">
                忘记密码？
              </a>
            </div>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                </svg>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                v-model="loginForm.password"
                required
                class="w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                placeholder="••••••••"
              />
            </div>
          </div>

          <!-- 登录按钮 -->
          <div>
            <button
              type="submit"
              :disabled="isLoading"
              class="group relative w-full flex justify-center py-3 px-6 border border-transparent text-base font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <span v-if="!isLoading">登录</span>
              <span v-else class="flex items-center">
                <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                登录中...
              </span>
            </button>
          </div>

          <!-- 错误提示 -->
          <div v-if="errorMessage" class="p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
            <p class="text-sm text-red-600 dark:text-red-300">{{ errorMessage }}</p>
          </div>

          <!-- 注册链接 -->
          <div class="text-center">
            <p class="text-sm text-gray-600 dark:text-gray-400">
              还没有账号？
              <router-link
                to="/register"
                class="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-150"
              >
                立即注册
              </router-link>
            </p>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from '../utils/api'

interface LoginForm {
  email: string
  password: string
}

const loginForm = ref<LoginForm>({
  email: '',
  password: '',
})

const router = useRouter()
const isLoading = ref(false)
const errorMessage = ref('')

const handleLogin = async () => {
  errorMessage.value = ''
  isLoading.value = true
  
  try {
    const response = await axios.post('/auth/login', loginForm.value)
    localStorage.setItem('token', response.data.accessToken)
    localStorage.setItem('user', JSON.stringify(response.data.user))
    router.push('/')
  } catch (error: any) {
    console.error('Login failed:', error)
    errorMessage.value = error.response?.data?.message || '登录失败，请检查邮箱和密码'
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fadeIn {
  animation: fadeIn 0.5s ease-out;
}
</style>
