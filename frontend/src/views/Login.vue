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
            <el-input
              id="email"
              name="email"
              type="email"
              v-model="loginForm.email"
              required
              placeholder="your@email.com"
              prefix-icon="Message"
              size="large"
            />
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
            <el-input
              id="password"
              name="password"
              type="password"
              v-model="loginForm.password"
              required
              placeholder="••••••••"
              prefix-icon="Lock"
              size="large"
            />
          </div>

          <!-- 登录按钮 -->
          <div>
            <el-button
              type="primary"
              native-type="submit"
              :loading="isLoading"
              class="w-full"
              size="large"
            >
              登录
            </el-button>
          </div>

          <!-- 错误提示 -->
          <el-alert
            v-if="errorMessage"
            :title="errorMessage"
            type="error"
            show-icon
          />

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
