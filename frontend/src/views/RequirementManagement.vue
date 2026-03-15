<template>
  <div class="space-y-6">
    <div class="bg-white rounded-lg shadow p-6">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold">需求管理</h2>
        <button
          @click="showCreateModal = true"
          class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          创建新需求
        </button>
      </div>

      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                标题
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                描述
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                质量评分
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                创建时间
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                操作
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="requirement in requirements" :key="requirement.id">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="font-medium text-gray-900">{{ requirement.title }}</div>
              </td>
              <td class="px-6 py-4">
                <div class="text-sm text-gray-900 max-w-xs truncate">{{ requirement.description || '-' }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div v-if="requirement.qualityScore" class="flex items-center">
                  <div class="w-16 bg-gray-200 rounded-full h-2 mr-2">
                    <div
                      class="bg-green-600 h-2 rounded-full"
                      :style="{ width: `${(requirement.qualityScore.totalScore || 0) * 10}%` }"
                    ></div>
                  </div>
                  <span class="text-sm font-medium">{{ requirement.qualityScore.totalScore || 0 }}/10</span>
                </div>
                <span v-else class="text-gray-400">未评分</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ formatDate(requirement.createdAt) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button
                  @click="editRequirement(requirement)"
                  class="text-blue-600 hover:text-blue-900 mr-3"
                >
                  编辑
                </button>
                <button
                  @click="deleteRequirement(requirement.id)"
                  class="text-red-600 hover:text-red-900"
                >
                  删除
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="requirements.length === 0" class="text-center py-12">
        <p class="text-gray-500">暂无需求记录</p>
      </div>
    </div>

    <!-- 创建/编辑模态框 -->
    <div v-if="showCreateModal || showEditModal" class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div class="p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">
            {{ showEditModal ? '编辑需求' : '创建新需求' }}
          </h3>
          
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                标题 *
              </label>
              <input
                v-model="currentRequirement.title"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="请输入需求标题"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                描述
              </label>
              <textarea
                v-model="currentRequirement.description"
                rows="4"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="请输入需求详细描述"
              ></textarea>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                原始输入
              </label>
              <textarea
                v-model="currentRequirement.rawInput"
                rows="3"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="请输入原始需求输入（可选）"
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
              @click="saveRequirement"
              :disabled="!currentRequirement.title"
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

interface QualityScore {
  clarity: number
  testability: number
  completeness: number
  totalScore: number
  suggestions: string[]
}

interface Requirement {
  id: string
  title: string
  description?: string
  rawInput?: string
  structuredData?: any
  qualityScore?: QualityScore
  vectorEmbedding?: string
  createdAt: string
  updatedAt: string
}

const requirements = ref<Requirement[]>([])
const showCreateModal = ref(false)
const showEditModal = ref(false)
const currentRequirement = ref<Partial<Requirement>>({
  title: '',
  description: '',
  rawInput: ''
})

const fetchRequirements = async () => {
  try {
    const response = await axios.get('/api/requirements')
    requirements.value = response.data
  } catch (error) {
    console.error('Error fetching requirements:', error)
    requirements.value = []
  }
}

const createRequirement = async () => {
  try {
    await axios.post('/api/requirements', currentRequirement.value)
    closeModal()
    fetchRequirements()
    resetCurrentRequirement()
  } catch (error) {
    console.error('Error creating requirement:', error)
    alert('创建需求失败，请重试')
  }
}

const updateRequirement = async () => {
  if (!currentRequirement.value.id) return

  try {
    await axios.put(`/api/requirements/${currentRequirement.value.id}`, currentRequirement.value)
    closeModal()
    fetchRequirements()
    resetCurrentRequirement()
  } catch (error) {
    console.error('Error updating requirement:', error)
    alert('更新需求失败，请重试')
  }
}

const deleteRequirement = async (id: string) => {
  if (!confirm('确定要删除这个需求吗？')) return

  try {
    await axios.delete(`/api/requirements/${id}`)
    fetchRequirements()
  } catch (error) {
    console.error('Error deleting requirement:', error)
    alert('删除需求失败，请重试')
  }
}

const editRequirement = (requirement: Requirement) => {
  currentRequirement.value = { ...requirement }
  showEditModal.value = true
}

const saveRequirement = () => {
  if (showEditModal.value) {
    updateRequirement()
  } else {
    createRequirement()
  }
}

const closeModal = () => {
  showCreateModal.value = false
  showEditModal.value = false
  resetCurrentRequirement()
}

const resetCurrentRequirement = () => {
  currentRequirement.value = {
    title: '',
    description: '',
    rawInput: ''
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
  fetchRequirements()
})
</script>