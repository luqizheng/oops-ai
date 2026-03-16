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

    <!-- 右侧注册表单区 -->
    <div class="flex w-full md:w-1/2 items-center justify-center p-8">
      <div class="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 md:p-12 animate-fadeIn">
        <div>
          <h2 class="mt-6 text-center text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            创建新账号
          </h2>
          <p class="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            加入我们，提升团队需求管理效率
          </p>
        </div>

        <form @submit.prevent="handleRegister" class="mt-8 space-y-6">
          <!-- 姓名输入 -->
          <div>
            <label for="name" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              姓名
            </label>
            <el-input
              id="name"
              name="name"
              type="text"
              v-model="registerForm.name"
              required
              placeholder="您的姓名"
              prefix-icon="User"
              size="large"
              class="rounded-lg"
            />
          </div>

          <!-- 邮箱输入 -->
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              电子邮箱
            </label>
            <el-input
              id="email"
              name="email"
              type="email"
              v-model="registerForm.email"
              required
              placeholder="your@email.com"
              prefix-icon="Message"
              size="large"
              class="rounded-lg"
            />
          </div>

          <!-- 密码输入 -->
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              密码
            </label>
            <el-input
              id="password"
              name="password"
              type="password"
              v-model="registerForm.password"
              required
              minlength="6"
              placeholder="•••••••• (至少6位)"
              prefix-icon="Lock"
              size="large"
              class="rounded-lg"
            />
          </div>

          <!-- 注册按钮 -->
          <div>
            <el-button
              type="primary"
              native-type="submit"
              :loading="isLoading"
              class="w-full rounded-lg h-12 text-base"
              size="large"
            >
              注册
            </el-button>
          </div>

          <!-- 错误提示 -->
          <el-alert
            v-if="errorMessage"
            :title="errorMessage"
            type="error"
            show-icon
            class="rounded-lg"
          />

          <!-- 登录链接 -->
          <div class="text-center">
            <p class="text-sm text-gray-600 dark:text-gray-400">
              已有账号？
              <router-link
                to="/login"
                class="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-150"
              >
                立即登录
              </router-link>
            </p>
          </div>
        </form>
      </div>
    </div>
    
    <!-- 操作反馈提示条 -->
    <div
      v-if="actionFeedback.show"
      :class="[
        'fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg p-4 z-40 transform transition-transform duration-300',
        actionFeedback.show ? 'translate-y-0' : 'translate-y-full'
      ]"
    >
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <el-icon :class="actionFeedback.type === 'success' ? 'text-green-500' : 'text-red-500'">
            <Check v-if="actionFeedback.type === 'success'" />
            <CircleClose v-else />
          </el-icon>
          <span class="text-gray-700 dark:text-gray-300">{{ actionFeedback.message }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from '../utils/api'
import { Check, CircleClose } from '@element-plus/icons-vue'

interface RegisterForm {
  name: string
  email: string
  password: string
}

interface ActionFeedback {
  show: boolean
  message: string
  type: 'success' | 'error'
}

const registerForm = ref<RegisterForm>({
  name: '',
  email: '',
  password: '',
})

const router = useRouter()
const isLoading = ref(false)
const errorMessage = ref('')
const actionFeedback = ref<ActionFeedback>({
  show: false,
  message: '',
  type: 'success'
})

// 显示操作反馈
const showFeedback = (message: string, type: 'success' | 'error' = 'success') => {
  actionFeedback.value = {
    show: true,
    message,
    type
  }
  
  // 5秒后自动隐藏
  setTimeout(() => {
    actionFeedback.value.show = false
  }, 5000)
}

const handleRegister = async () => {
  errorMessage.value = ''
  isLoading.value = true
  
  try {
    await axios.post('/auth/register', registerForm.value)
    showFeedback('注册成功，请登录', 'success')
    // 延迟跳转，让用户看到反馈
    setTimeout(() => {
      router.push('/login')
    }, 1000)
  } catch (error: any) {
    console.error('Registration failed:', error)
    errorMessage.value = error.response?.data?.message || '注册失败，请检查信息是否正确'
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
