<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100">
    <div class="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          注册 OOPS-AI
        </h2>
      </div>
      <form @submit.prevent="handleRegister" class="mt-8 space-y-6">
        <div class="rounded-md -space-y-px">
          <div>
            <label for="name" class="sr-only">姓名</label>
            <input
              id="name"
              name="name"
              type="text"
              v-model="registerForm.name"
              required
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              placeholder="姓名"
            />
          </div>
          <div>
            <label for="email" class="sr-only">邮箱</label>
            <input
              id="email"
              name="email"
              type="email"
              v-model="registerForm.email"
              required
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              placeholder="邮箱"
            />
          </div>
          <div>
            <label for="password" class="sr-only">密码</label>
            <input
              id="password"
              name="password"
              type="password"
              v-model="registerForm.password"
              required
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              placeholder="密码 (至少6位)"
            />
          </div>
        </div>

        <div>
          <button
            type="submit"
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            注册
          </button>
        </div>

        <div class="text-center">
          <p class="text-sm text-gray-600">
            已有账号？
            <router-link
              to="/login"
              class="font-medium text-blue-600 hover:text-blue-500"
            >
              立即登录
            </router-link>
          </p>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from '../utils/api'

interface RegisterForm {
  name: string
  email: string
  password: string
}

const registerForm = ref<RegisterForm>({
  name: '',
  email: '',
  password: '',
})

const router = useRouter()

const handleRegister = async () => {
  try {
    await axios.post('/auth/register', registerForm.value)
    alert('注册成功，请登录')
    router.push('/login')
  } catch (error) {
    console.error('Registration failed:', error)
    alert('注册失败，请检查信息是否正确')
  }
}
</script>
