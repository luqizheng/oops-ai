<template>
  <div id="app">
    <!-- 对于不需要认证的页面（登录、注册），直接渲染内容 -->
    <router-view v-if="!requiresAuth" />
    
    <!-- 对于需要认证的页面，渲染完整的后台布局 -->
    <div v-else class="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <!-- 移动端侧边栏触发器 -->
      <el-button
        v-if="!isSidebarOpen && !isDesktop"
        @click="toggleSidebar"
        class="fixed top-4 left-4 z-50"
        size="small"
        type="primary"
        circle
        :icon="Menu"
      />

      <!-- 侧边栏导航 -->
      <el-aside
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
          <el-button
            v-if="!isDesktop"
            @click="toggleSidebar"
            size="small"
            text
            :icon="CircleClose"
          />
        </div>

        <!-- 导航菜单 -->
        <el-menu
          :default-active="$route.path"
          router
          class="el-menu-vertical-demo"
          background-color="#ffffff"
          text-color="#303133"
          active-text-color="#409EFF"
          dark-background-color="#1f2937"
          dark-text-color="#ffffff"
          dark-active-text-color="#60a5fa"
        >
          <el-menu-item
            v-for="item in menuItems"
            :key="item.path"
            :index="item.path"
            @click="!isDesktop && toggleSidebar"
          >
            <span slot="title">
              <i class="el-icon-ep-document-copy"></i>
              <span>{{ item.label }}</span>
            </span>
          </el-menu-item>
        </el-menu>
      </el-aside>

      <!-- 遮罩层 -->
      <div
        v-if="isSidebarOpen && !isDesktop"
        @click="toggleSidebar"
        class="fixed inset-0 z-30 bg-black bg-opacity-50"
      ></div>

      <!-- 主内容区 -->
      <div :class="['transition-all duration-300', isDesktop ? 'ml-64' : 'ml-0']">
        <!-- 顶部导航栏 -->
        <el-header class="sticky top-0 z-30 bg-white dark:bg-gray-800 shadow-sm">
          <div class="px-6 py-4 flex items-center justify-between">
            <div class="flex items-center space-x-4">
              <h2 class="text-lg font-semibold">{{ currentPageTitle }}</h2>
            </div>
            <div class="flex items-center space-x-4">
              <!-- 通知图标 -->
              <el-button
                type="text"
                :icon="Bell"
                circle
              />
              <!-- 用户菜单 -->
              <el-dropdown @command="handleDropdownCommand">
                <span class="el-dropdown-link">
                  <div class="flex items-center space-x-2">
                    <el-avatar>{{ userInitials }}</el-avatar>
                    <span class="text-sm font-medium">{{ userName }}</span>
                    <el-icon class="el-icon--right"><ArrowDown /></el-icon>
                  </div>
                </span>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="changePassword">
                      <el-icon><Lock /></el-icon>
                      更改密码
                    </el-dropdown-item>
                    <el-dropdown-item command="logout">
                      <el-icon><SwitchButton /></el-icon>
                      退出登录
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </div>
        </el-header>

        <!-- 页面内容 -->
        <el-main class="p-6">
          <router-view />
        </el-main>
      </div>
    </div>

    <!-- 更改密码模态框 -->
    <el-dialog
      v-model="showChangePasswordModal"
      title="更改密码"
      width="500px"
    >
      <el-form :model="changePasswordForm" label-width="80px">
        <el-form-item label="当前密码" prop="currentPassword">
          <el-input
            type="password"
            v-model="changePasswordForm.currentPassword"
            placeholder="请输入当前密码"
            show-password
          />
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input
            type="password"
            v-model="changePasswordForm.newPassword"
            placeholder="请输入新密码（至少6位）"
            minlength="6"
            show-password
          />
        </el-form-item>
        <el-form-item label="确认新密码" prop="confirmPassword">
          <el-input
            type="password"
            v-model="changePasswordForm.confirmPassword"
            placeholder="请再次输入新密码"
            minlength="6"
            show-password
          />
        </el-form-item>
        <!-- 错误提示 -->
        <el-alert
          v-if="changePasswordError"
          :title="changePasswordError"
          type="error"
          show-icon
          class="mt-4"
        />
        <!-- 成功提示 -->
        <el-alert
          v-if="changePasswordSuccess"
          :title="changePasswordSuccess"
          type="success"
          show-icon
          class="mt-4"
        />
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showChangePasswordModal = false">取消</el-button>
          <el-button type="primary" @click="handleChangePassword" :loading="isChangingPassword">
            保存更改
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from './utils/api'
import { Menu, CircleClose, Bell, ArrowDown, Lock, SwitchButton } from '@element-plus/icons-vue'

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

// 处理下拉菜单命令
const handleDropdownCommand = (command: string) => {
  if (command === 'changePassword') {
    showChangePasswordModal.value = true
  } else if (command === 'logout') {
    handleLogout()
  }
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
    // 调用后端退出接口
    await axios.post('/auth/logout')
  } catch (error) {
    console.error('Logout failed:', error)
  } finally {
    // 清除本地存储的认证信息
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    
    // 强制跳转到登录页面，确保路由变化
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
  {    path: '/organizations',    label: '组织管理',    icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4'  },
  {
    path: '/projects',
    label: '项目管理',
    icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z'
  },
  {
    path: '/project-calendar',
    label: '项目日历',
    icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
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