<template>
  <div class="space-y-6">
    <div class="bg-white rounded-lg shadow p-6">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold">角色管理</h2>
        <button
          @click="showCreateModal = true"
          class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          添加新角色
        </button>
      </div>

      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                角色名称
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                描述
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                创建时间
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                操作
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="role in roles" :key="role.id">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">{{ role.name }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-500">{{ role.description || '-' }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-500">{{ formatDate(role.createdAt) }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  @click="editRole(role)"
                  class="text-blue-600 hover:text-blue-900 mr-4"
                >
                  编辑
                </button>
                <button
                  @click="deleteRole(role.id)"
                  class="text-red-600 hover:text-red-900"
                >
                  删除
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="roles.length === 0" class="text-center py-12">
        <p class="text-gray-500">暂无角色</p>
        <p class="text-sm text-gray-400 mt-2">点击"添加新角色"按钮开始创建</p>
      </div>
    </div>

    <!-- 创建/编辑模态框 -->
    <div v-if="showCreateModal || showEditModal" class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div class="p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">
            {{ showEditModal ? '编辑角色' : '添加新角色' }}
          </h3>
          
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                角色名称 *
              </label>
              <input
                v-model="currentRole.name"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="请输入角色名称"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                描述
              </label>
              <textarea
                v-model="currentRole.description"
                rows="3"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="请输入角色描述"
              ></textarea>
            </div>
          </div>
          
          <div class="mt-6 flex justify-end space-x-3">
            <button
              @click="closeModal"
              class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              取消
            </button>
            <button
              @click="saveRole"
              :disabled="!currentRole.name"
              class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
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
import { ref, onMounted } from 'vue'
import axios from '../utils/api'

interface Role {
  id: string
  name: string
  description: string | null
  createdAt: string
  updatedAt: string
}

const roles = ref<Role[]>([])
const showCreateModal = ref(false)
const showEditModal = ref(false)
const currentRole = ref<Partial<Role>>({
  name: '',
  description: ''
})

const fetchRoles = async () => {
  try {
    const response = await axios.get('/roles')
    roles.value = response.data
  } catch (error) {
    console.error('Error fetching roles:', error)
    roles.value = []
  }
}

const createRole = async () => {
  try {
    await axios.post('/roles', currentRole.value)
    closeModal()
    fetchRoles()
    resetCurrentRole()
  } catch (error) {
    console.error('Error creating role:', error)
    alert('创建角色失败，请重试')
  }
}

const updateRole = async () => {
  if (!currentRole.value.id) return

  try {
    await axios.put(`/roles/${currentRole.value.id}`, currentRole.value)
    closeModal()
    fetchRoles()
    resetCurrentRole()
  } catch (error) {
    console.error('Error updating role:', error)
    alert('更新角色失败，请重试')
  }
}

const deleteRole = async (id: string) => {
  if (!confirm('确定要删除这个角色吗？')) return

  try {
    await axios.delete(`/roles/${id}`)
    fetchRoles()
  } catch (error) {
    console.error('Error deleting role:', error)
    alert('删除角色失败，请重试')
  }
}

const editRole = (role: Role) => {
  currentRole.value = { ...role }
  showEditModal.value = true
}

const saveRole = () => {
  if (showEditModal.value) {
    updateRole()
  } else {
    createRole()
  }
}

const closeModal = () => {
  showCreateModal.value = false
  showEditModal.value = false
  resetCurrentRole()
}

const resetCurrentRole = () => {
  currentRole.value = {
    name: '',
    description: ''
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

onMounted(() => {
  fetchRoles()
})
</script>
