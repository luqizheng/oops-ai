<template>
  <div class="space-y-6">
    <!-- 页面标题和操作按钮 -->
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
      <div class="flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
        <div>
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white">用户管理</h2>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">管理系统用户账号</p>
        </div>
        <button
          @click="showCreateModal = true"
          class="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center space-x-2"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
          </svg>
          <span>添加新用户</span>
        </button>
      </div>
    </div>

    <!-- 数据表格 -->
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
      <div class="p-4 border-b border-gray-200 dark:border-gray-700">
        <div class="relative">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="搜索用户名或邮箱..."
            class="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          />
          <svg class="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                用户名
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                电子邮件
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                角色
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                创建时间
              </th>
              <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                操作
              </th>
            </tr>
          </thead>
          <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-for="user in filteredUsers" :key="user.id" class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center space-x-3">
                  <div class="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                    <span class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ user.name?.charAt(0) || 'U' }}</span>
                  </div>
                  <div>
                    <div class="text-sm font-medium text-gray-900 dark:text-white">{{ user.name || '-' }}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-500 dark:text-gray-400">{{ user.email }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  {{ user.role.name }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-500 dark:text-gray-400">{{ formatDate(user.createdAt) }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                <button
                  @click="editUser(user)"
                  class="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 transition-colors duration-150 px-3 py-1 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/30"
                >
                  编辑
                </button>
                <button
                  @click="deleteUser(user.id)"
                  class="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 transition-colors duration-150 px-3 py-1 rounded-md hover:bg-red-50 dark:hover:bg-red-900/30"
                >
                  删除
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 空状态 -->
      <div v-if="filteredUsers.length === 0" class="text-center py-12 px-4">
        <svg class="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
        </svg>
        <p class="text-gray-500 dark:text-gray-400 mt-4 text-lg font-medium">暂无用户</p>
        <p class="text-sm text-gray-400 dark:text-gray-500 mt-1">点击"添加新用户"按钮开始创建</p>
      </div>

      <!-- 分页 -->
      <div v-if="filteredUsers.length > 0" class="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <div class="text-sm text-gray-500 dark:text-gray-400">
          共 {{ filteredUsers.length }} 条记录
        </div>
        <div class="flex items-center space-x-2">
          <button class="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed" disabled>
            上一页
          </button>
          <button class="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed" disabled>
            下一页
          </button>
        </div>
      </div>
    </div>

    <!-- 创建/编辑模态框 -->
    <div v-if="showCreateModal || showEditModal" class="fixed inset-0 bg-black bg-opacity-50 dark:bg-black/70 flex items-center justify-center p-4 z-50">
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full animate-fadeIn">
        <div class="p-6">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              {{ showEditModal ? '编辑用户' : '添加新用户' }}
            </h3>
            <button
              @click="closeModal"
              class="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400 transition-colors duration-150"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                用户名 *
              </label>
              <input
                v-model="currentUser.name"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="请输入用户名"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                电子邮件 *
              </label>
              <input
                v-model="currentUser.email"
                type="email"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="请输入电子邮件"
              />
            </div>
            
            <div v-if="!showEditModal">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                密码 *
              </label>
              <input
                v-model="currentUser.password"
                type="password"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="请输入密码（至少6位）"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                角色 *
              </label>
              <select
                v-model="currentUser.roleId"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="">请选择角色</option>
                <option v-for="role in roles" :key="role.id" :value="role.id">
                  {{ role.name }}
                </option>
              </select>
            </div>
          </div>
          
          <div class="mt-6 flex justify-end space-x-3">
            <button
              @click="closeModal"
              class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150"
            >
              取消
            </button>
            <button
              @click="saveUser"
              :disabled="!currentUser.name || !currentUser.email || !currentUser.roleId || (!showEditModal && !currentUser.password)"
              class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
            >
              {{ showEditModal ? '更新' : '创建' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import axios from '../utils/api'

interface Role {
  id: string
  name: string
}

interface User {
  id: string
  email: string
  name: string | null
  roleId: string
  role: { name: string }
  createdAt: string
  updatedAt: string
}

const users = ref<User[]>([])
const roles = ref<Role[]>([])
const showCreateModal = ref(false)
const showEditModal = ref(false)
const searchQuery = ref('')
const currentUser = ref<Partial<User>>({
})

// 搜索过滤
const filteredUsers = computed(() => {
  if (!searchQuery.value) return users.value
  const query = searchQuery.value.toLowerCase()
  return users.value.filter(user => 
    (user.name?.toLowerCase().includes(query) || false) || 
    user.email.toLowerCase().includes(query)
  )
})

const fetchUsers = async () => {
  try {
    const response = await axios.get('/users')
    users.value = response.data
  } catch (error) {
    console.error('Error fetching users:', error)
    users.value = []
  }
}

const fetchRoles = async () => {
  try {
    const response = await axios.get('/roles')
    roles.value = response.data
  } catch (error) {
    console.error('Error fetching roles:', error)
    roles.value = []
  }
}

const createUser = async () => {
  try {
    await axios.post('/users', currentUser.value)
    closeModal()
    fetchUsers()
    resetCurrentUser()
  } catch (error) {
    console.error('Error creating user:', error)
    alert('创建用户失败，请重试')
  }
}

const updateUser = async () => {
  if (!currentUser.value.id) return

  try {
    await axios.put(`/users/${currentUser.value.id}`, currentUser.value)
    closeModal()
    fetchUsers()
    resetCurrentUser()
  } catch (error) {
    console.error('Error updating user:', error)
    alert('更新用户失败，请重试')
  }
}

const deleteUser = async (id: string) => {
  if (!confirm('确定要删除这个用户吗？')) return

  try {
    await axios.delete(`/users/${id}`)
    fetchUsers()
  } catch (error) {
    console.error('Error deleting user:', error)
    alert('删除用户失败，请重试')
  }
}

const editUser = (user: User) => {
  currentUser.value = { ...user }
  showEditModal.value = true
}

const saveUser = () => {
  if (showEditModal.value) {
    updateUser()
  } else {
    createUser()
  }
}

const closeModal = () => {
  showCreateModal.value = false
  showEditModal.value = false
  resetCurrentUser()
}

const resetCurrentUser = () => {
  currentUser.value = {
    name: '',
    email: '',
    password: '',
    roleId: ''
  }
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(async () => {
  await fetchRoles()
  await fetchUsers()
})
</script>
