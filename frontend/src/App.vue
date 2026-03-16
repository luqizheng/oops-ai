<template>
  <div id="app">
    <!-- 对于不需要认证的页面（登录、注册），直接渲染内容 -->
    <router-view v-if="!requiresAuth" />
    
    <!-- 对于需要认证的页面，渲染完整的后台布局 -->
    <div v-else class="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <!-- 移动端侧边栏触发器 -->
      <button
        v-if="!isSidebarOpen && !isDesktop"
        @click="toggleSidebar"
        class="fixed top-4 left-4 z-50 p-2 rounded-lg bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-shadow"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
        </svg>
      </button>

      <!-- 侧边栏导航 -->
      <aside
        :class="[
          'fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-gray-800 shadow-xl transform transition-transform duration-300 ease-in-out',
          isSidebarOpen || isDesktop ? 'translate-x-0' : '-translate-x-full'
        ]"
      >
        <!-- 侧边栏头部 -->
        <div class="flex items-center justify-between h-16 px-6 border-b border-gray-200 dark:border-gray-700">
          <div class="flex items-center space-x-2">
            <div class="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <span class="text-white font-bold">AI</span>
            </div>
            <div>
              <h1 class="text-xl font-bold">OOPS-AI</h1>
              <span class="text-xs text-gray-500 dark:text-gray-400">需求智能体</span>
            </div>
          </div>
          <button
            v-if="!isDesktop"
            @click="toggleSidebar"
            class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <!-- 导航菜单 -->
        <nav class="px-4 py-4">
          <div class="space-y-1">
            <router-link
              v-for="item in menuItems"
              :key="item.path"
              :to="item.path"
              @click="!isDesktop && toggleSidebar"
              class="flex items-center px-4 py-3 rounded-lg transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              :class="$route.path === item.path ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : ''"
            >
              <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="item.icon"></path>
              </svg>
              <span>{{ item.label }}</span>
            </router-link>
          </div>
        </nav>
      </aside>

      <!-- 遮罩层 -->
      <div
        v-if="isSidebarOpen && !isDesktop"
        @click="toggleSidebar"
        class="fixed inset-0 z-30 bg-black bg-opacity-50"
      ></div>

      <!-- 主内容区 -->
      <div :class="['transition-all duration-300', isDesktop ? 'ml-64' : 'ml-0']">
        <!-- 顶部导航栏 -->
        <header class="sticky top-0 z-30 bg-white dark:bg-gray-800 shadow-sm">
          <div class="px-6 py-4 flex items-center justify-between">
            <div class="flex items-center space-x-4">
              <h2 class="text-lg font-semibold">{{ currentPageTitle }}</h2>
            </div>
            <div class="flex items-center space-x-4">
              <!-- 通知图标 -->
              <button class="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                <svg class="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
                </svg>
              </button>
              <!-- 用户菜单 -->
              <div class="relative">
                <button 
                  @click="toggleUserMenu"
                  class="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  <div class="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                    <span class="text-sm font-medium">{{ userInitials }}</span>
                  </div>
                  <span class="text-sm font-medium">{{ userName }}</span>
                  <svg class="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </button>
                
                <!-- 下拉菜单 -->
                <div 
                  v-if="isUserMenuOpen" 
                  class="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl py-1 z-50 ring-1 ring-black ring-opacity-5 focus:outline-none"
                  @click.outside="isUserMenuOpen = false"
                >
                  <button 
                    @click="showChangePasswordModal = true; isUserMenuOpen = false"
                    class="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150"
                  >
                    <div class="flex items-center space-x-2">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                      </svg>
                      <span>更改密码</span>
                    </div>
                  </button>
                  <button 
                    @click="handleLogout; isUserMenuOpen = false"
                    class="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150"
                  >
                    <div class="flex items-center space-x-2">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                      </svg>
                      <span>退出登录</span>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        <!-- 页面内容 -->
        <main class="p-6">
          <router-view />
        </main>
      </div>
    </div>

    <!-- 更改密码模态框 -->
    <div v-if="showChangePasswordModal" class="fixed inset-0 bg-black bg-opacity-50 dark:bg-black/70 flex items-center justify-center p-4 z-50">
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full animate-fadeIn">
        <div class="p-6">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              更改密码
            </h3>
            <button
              @click="showChangePasswordModal = false"
              class="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400 transition-colors duration-150"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          
          <div class="space-y-4">
            <div>
              <label for="currentPassword" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                当前密码
              </label>
              <input
                id="currentPassword"
                type="password"
                v-model="changePasswordForm.currentPassword"
                required
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="请输入当前密码"
              />
            </div>
            
            <div>
              <label for="newPassword" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                新密码
              </label>
              <input
                id="newPassword"
                type="password"
                v-model="changePasswordForm.newPassword"
                required
                minlength="6"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="请输入新密码（至少6位）"
              />
            </div>
            
            <div>
              <label for="confirmPassword" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                确认新密码
              </label>
              <input
                id="confirmPassword"
                type="password"
                v-model="changePasswordForm.confirmPassword"
                required
                minlength="6"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="请再次输入新密码"
              />
            </div>
          </div>
          
          <!-- 错误提示 -->
          <div v-if="changePasswordError" class="mt-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
            <p class="text-sm text-red-600 dark:text-red-300">{{ changePasswordError }}</p>
          </div>
          
          <!-- 成功提示 -->
          <div v-if="changePasswordSuccess" class="mt-4 p-3 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg">
            <p class="text-sm text-green-600 dark:text-green-300">{{ changePasswordSuccess }}</p>
          </div>
          
          <div class="mt-6 flex justify-end space-x-3">
            <button
              @click="showChangePasswordModal = false"
              class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150"
            >
              取消
            </button>
            <button
              @click="handleChangePassword"
              :disabled="isChangingPassword"
              class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <span v-if="!isChangingPassword">保存更改</span>
              <span v-else class="flex items-center">
                <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                保存中...
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from './utils/api'

const route = useRoute()
const router = useRouter()
const isSidebarOpen = ref(false)
const isDesktop = ref(window.innerWidth >= 1024)

// 用户菜单相关
const isUserMenuOpen = ref(false)
const showChangePasswordModal = ref(false)
const isChangingPassword = ref(false)
const changePasswordError = ref('')
const changePasswordSuccess = ref('')

// 更改密码表单
const changePasswordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 判断当前页面是否需要认证
const requiresAuth = computed(() => {
  // 从路由元信息中获取requiresAuth属性，如果没有设置则默认为true
  return route.meta.requiresAuth !== false
})

// 获取当前用户信息
const currentUser = computed(() => {
  const userStr = localStorage.getItem('user')
  return userStr ? JSON.parse(userStr) : null
})

// 用户名
const userName = computed(() => {
  return currentUser.value?.name || '用户'
})

// 用户首字母
const userInitials = computed(() => {
  if (currentUser.value?.name) {
    return currentUser.value.name.charAt(0).toUpperCase()
  }
  return 'U'
})

// 切换用户菜单
const toggleUserMenu = () => {
  isUserMenuOpen.value = !isUserMenuOpen.value
}

// 处理密码更改
const handleChangePassword = async () => {
  // 验证表单
  if (changePasswordForm.value.newPassword !== changePasswordForm.value.confirmPassword) {
    changePasswordError.value = '新密码和确认密码不匹配'
    return
  }
  
  if (changePasswordForm.value.newPassword.length < 6) {
    changePasswordError.value = '新密码长度至少为6位'
    return
  }
  
  isChangingPassword.value = true
  changePasswordError.value = ''
  changePasswordSuccess.value = ''
  
  try {
    await axios.put('/auth/change-password', {
      currentPassword: changePasswordForm.value.currentPassword,
      newPassword: changePasswordForm.value.newPassword
    })
    
    changePasswordSuccess.value = '密码更改成功'
    
    // 清空表单
    changePasswordForm.value = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
    
    // 3秒后关闭模态框
    setTimeout(() => {
      showChangePasswordModal.value = false
    }, 3000)
  } catch (error: any) {
    console.error('Change password failed:', error)
    changePasswordError.value = error.response?.data?.message || '密码更改失败，请检查当前密码是否正确'
  } finally {
    isChangingPassword.value = false
  }
}

// 处理退出登录
const handleLogout = async () => {
  try {
    // 可选：调用后端退出接口
    await axios.post('/auth/logout')
  } catch (error) {
    console.error('Logout failed:', error)
  } finally {
    // 清除本地存储的认证信息
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    
    // 跳转到登录页面
    router.push('/login')
  }
}

// 菜单项配置
const menuItems = [
  {
    path: '/',
    label: '需求分析',
    icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z'
  },
  {
    path: '/requirements',
    label: '需求管理',
    icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4'
  },
  {
    path: '/llm-config',
    label: 'AI配置',
    icon: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
  },
  {
    path: '/users',
    label: '用户管理',
    icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z'
  },
  {
    path: '/roles',
    label: '角色管理',
    icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
  },
  {
    path: '/organizations',
    label: '组织管理',
    icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4'
  }
]

// 当前页面标题
const currentPageTitle = computed(() => {
  const currentItem = menuItems.find(item => item.path === route.path)
  return currentItem ? currentItem.label : 'OOPS-AI'
})

// 切换侧边栏
const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value
}

// 监听窗口大小变化
const handleResize = () => {
  isDesktop.value = window.innerWidth >= 1024
  if (isDesktop.value) {
    isSidebarOpen.value = true
  }
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
  handleResize() // 初始化
})

// 清理事件监听器
const cleanup = () => {
  window.removeEventListener('resize', handleResize)
}

// 组件卸载时清理
import { onUnmounted } from 'vue'
onUnmounted(cleanup)
</script>