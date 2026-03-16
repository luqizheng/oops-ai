<template>
  <div class="space-y-6">
    <div class="bg-white rounded-lg shadow p-6">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold">组织管理</h2>
        <button
          @click="showCreateModal = true"
          class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          添加新组织
        </button>
      </div>

      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                组织名称
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
            <tr v-for="org in organizations" :key="org.id">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">{{ org.name }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-500">{{ org.description || '-' }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-500">{{ formatDate(org.createdAt) }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  @click="editOrganization(org)"
                  class="text-blue-600 hover:text-blue-900 mr-4"
                >
                  编辑
                </button>
                <button
                  @click="deleteOrganization(org.id)"
                  class="text-red-600 hover:text-red-900"
                >
                  删除
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="organizations.length === 0" class="text-center py-12">
        <p class="text-gray-500">暂无组织</p>
        <p class="text-sm text-gray-400 mt-2">点击"添加新组织"按钮开始创建</p>
      </div>
    </div>

    <!-- 创建/编辑模态框 -->
    <div v-if="showCreateModal || showEditModal" class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div class="p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">
            {{ showEditModal ? '编辑组织' : '添加新组织' }}
          </h3>
          
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                组织名称 *
              </label>
              <input
                v-model="currentOrg.name"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="请输入组织名称"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                描述
              </label>
              <textarea
                v-model="currentOrg.description"
                rows="3"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="请输入组织描述"
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
              @click="saveOrganization"
              :disabled="!currentOrg.name"
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

interface Organization {
  id: string
  name: string
  description: string | null
  createdAt: string
  updatedAt: string
}

const organizations = ref<Organization[]>([])
const showCreateModal = ref(false)
const showEditModal = ref(false)
const currentOrg = ref<Partial<Organization>>({
  name: '',
  description: ''
})

const fetchOrganizations = async () => {
  try {
    const response = await axios.get('/organizations')
    organizations.value = response.data
  } catch (error) {
    console.error('Error fetching organizations:', error)
    organizations.value = []
  }
}

const createOrganization = async () => {
  try {
    await axios.post('/organizations', currentOrg.value)
    closeModal()
    fetchOrganizations()
    resetCurrentOrg()
  } catch (error) {
    console.error('Error creating organization:', error)
    alert('创建组织失败，请重试')
  }
}

const updateOrganization = async () => {
  if (!currentOrg.value.id) return

  try {
    await axios.put(`/organizations/${currentOrg.value.id}`, currentOrg.value)
    closeModal()
    fetchOrganizations()
    resetCurrentOrg()
  } catch (error) {
    console.error('Error updating organization:', error)
    alert('更新组织失败，请重试')
  }
}

const deleteOrganization = async (id: string) => {
  if (!confirm('确定要删除这个组织吗？')) return

  try {
    await axios.delete(`/organizations/${id}`)
    fetchOrganizations()
  } catch (error) {
    console.error('Error deleting organization:', error)
    alert('删除组织失败，请重试')
  }
}

const editOrganization = (org: Organization) => {
  currentOrg.value = { ...org }
  showEditModal.value = true
}

const saveOrganization = () => {
  if (showEditModal.value) {
    updateOrganization()
  } else {
    createOrganization()
  }
}

const closeModal = () => {
  showCreateModal.value = false
  showEditModal.value = false
  resetCurrentOrg()
}

const resetCurrentOrg = () => {
  currentOrg.value = {
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
  fetchOrganizations()
})
</script>
