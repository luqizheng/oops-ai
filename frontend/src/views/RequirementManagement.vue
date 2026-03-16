<template>
  <div class="space-y-8">
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200">
      <div class="flex flex-wrap justify-between items-center gap-4 mb-6">
        <h2 class="text-2xl font-bold text-gray-900">需求管理</h2>
        <el-button
          @click="showCreateDrawer = true"
          type="primary"
          class="rounded-lg px-5 py-2 h-10 text-sm"
        >
          创建新需求
        </el-button>
      </div>

      <!-- 需求卡片列表 -->
      <div v-if="requirements.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="requirement in requirements"
          :key="requirement.id"
          class="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-all duration-200 hover:-translate-y-1"
        >
          <div class="flex justify-between items-start mb-3">
            <h3 class="text-lg font-semibold text-gray-900 truncate w-2/3">{{ requirement.title }}</h3>
            <div class="flex space-x-2">
              <el-button
                @click="editRequirement(requirement)"
                type="text"
                size="small"
                class="text-primary-600 hover:text-primary-700"
              >
                编辑
              </el-button>
              <el-button
                @click="deleteRequirement(requirement.id)"
                type="text"
                size="small"
                class="text-red-600 hover:text-red-700"
              >
                删除
              </el-button>
            </div>
          </div>
          
          <div class="mb-4">
            <p class="text-sm text-gray-600 line-clamp-3">{{ requirement.description || '无描述' }}</p>
          </div>
          
          <div class="flex justify-between items-center mb-3">
            <div v-if="requirement.qualityScore" class="flex items-center">
              <div class="w-20 bg-gray-200 rounded-full h-2 mr-2">
                <div
                  class="bg-primary-500 h-2 rounded-full"
                  :style="{ width: `${(requirement.qualityScore.totalScore || 0) * 10}%` }"
                ></div>
              </div>
              <span class="text-xs font-medium text-gray-700">{{ requirement.qualityScore.totalScore || 0 }}/10</span>
            </div>
            <span v-else class="text-xs text-gray-400">未评分</span>
          </div>
          
          <div class="text-xs text-gray-500">
            创建时间: {{ formatDate(requirement.createdAt) }}
          </div>
        </div>
      </div>

      <div v-else class="text-center py-12">
        <p class="text-gray-500">暂无需求记录</p>
      </div>
    </div>

    <!-- 创建/编辑侧边抽屉 -->
    <el-drawer
      v-model="showDrawer"
      title=""
      size="600px"
      direction="rtl"
      :with-header="false"
    >
      <div class="p-6">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-xl font-bold text-gray-900">
            {{ isEditing ? '编辑需求' : '创建新需求' }}
          </h3>
          <el-button
            @click="closeDrawer"
            size="small"
            text
            :icon="CircleClose"
            class="text-gray-500 hover:text-gray-700"
          />
        </div>
        
        <el-form :model="currentRequirement" label-width="80px" class="space-y-5">
          <el-form-item label="标题" required>
            <el-input
              v-model="currentRequirement.title"
              placeholder="请输入需求标题"
              class="rounded-lg"
              size="large"
            />
          </el-form-item>
          
          <el-form-item label="描述">
            <el-input
              v-model="currentRequirement.description"
              type="textarea"
              rows="4"
              placeholder="请输入需求详细描述"
              class="rounded-lg"
              size="large"
            />
          </el-form-item>
          
          <el-form-item label="原始输入">
            <el-input
              v-model="currentRequirement.rawInput"
              type="textarea"
              rows="3"
              placeholder="请输入原始需求输入（可选）"
              class="rounded-lg"
              size="large"
            />
          </el-form-item>
        </el-form>
        
        <div class="mt-8 flex justify-end space-x-3">
          <el-button
            @click="closeDrawer"
            class="rounded-lg"
          >
            取消
          </el-button>
          <el-button
            @click="saveRequirement"
            type="primary"
            :disabled="!currentRequirement.title"
            class="rounded-lg"
          >
            {{ isEditing ? '更新' : '创建' }}
          </el-button>
        </div>
      </div>
    </el-drawer>
    
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
        <el-button
          v-if="actionFeedback.undoable"
          type="text"
          @click="handleUndo"
          class="text-primary-600 dark:text-primary-400"
        >
          撤销
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from '../utils/api'
import { CircleClose, Check } from '@element-plus/icons-vue'

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

interface ActionFeedback {
  show: boolean
  message: string
  type: 'success' | 'error'
  undoable: boolean
  undoAction: (() => void) | null
}

const requirements = ref<Requirement[]>([])
const showDrawer = ref(false)
const isEditing = ref(false)
const currentRequirement = ref<Partial<Requirement>>({
  title: '',
  description: '',
  rawInput: ''
})

const actionFeedback = ref<ActionFeedback>({
  show: false,
  message: '',
  type: 'success',
  undoable: false,
  undoAction: null
})

// 用于撤销删除的临时存储
const deletedRequirementBackup = ref<Requirement | null>(null)

const fetchRequirements = async () => {
  try {
    const response = await axios.get('/api/requirements')
    requirements.value = response.data
  } catch (error) {
    console.error('Error fetching requirements:', error)
    requirements.value = []
    showFeedback('获取需求失败', 'error')
  }
}

// 显示操作反馈
const showFeedback = (message: string, type: 'success' | 'error' = 'success', undoable = false, undoAction: (() => void) | null = null) => {
  actionFeedback.value = {
    show: true,
    message,
    type,
    undoable,
    undoAction
  }
  
  // 5秒后自动隐藏
  setTimeout(() => {
    actionFeedback.value.show = false
  }, 5000)
}

// 处理撤销操作
const handleUndo = () => {
  if (actionFeedback.value.undoAction) {
    actionFeedback.value.undoAction()
  }
  actionFeedback.value.show = false
}

const createRequirement = async () => {
  try {
    const response = await axios.post('/api/requirements', currentRequirement.value)
    closeDrawer()
    fetchRequirements()
    resetCurrentRequirement()
    showFeedback('需求创建成功', 'success')
  } catch (error) {
    console.error('Error creating requirement:', error)
    showFeedback('创建需求失败，请重试', 'error')
  }
}

const updateRequirement = async () => {
  if (!currentRequirement.value.id) return

  try {
    await axios.put(`/api/requirements/${currentRequirement.value.id}`, currentRequirement.value)
    closeDrawer()
    fetchRequirements()
    resetCurrentRequirement()
    showFeedback('需求更新成功', 'success')
  } catch (error) {
    console.error('Error updating requirement:', error)
    showFeedback('更新需求失败，请重试', 'error')
  }
}

const deleteRequirement = async (id: string) => {
  // 先备份要删除的需求，用于撤销操作
  const requirementToDelete = requirements.value.find(req => req.id === id)
  
  try {
    await axios.delete(`/api/requirements/${id}`)
    
    // 从本地列表中移除
    const index = requirements.value.findIndex(req => req.id === id)
    if (index > -1) {
      requirements.value.splice(index, 1)
    }
    
    // 显示反馈和撤销选项
    showFeedback('需求已删除', 'success', true, async () => {
      if (requirementToDelete) {
        try {
          // 重新创建需求
          await axios.post('/api/requirements', requirementToDelete)
          await fetchRequirements()
          showFeedback('删除已撤销', 'success')
        } catch (error) {
          console.error('Error undoing delete:', error)
          showFeedback('撤销删除失败', 'error')
        }
      }
    })
  } catch (error) {
    console.error('Error deleting requirement:', error)
    showFeedback('删除需求失败，请重试', 'error')
  }
}

const editRequirement = (requirement: Requirement) => {
  currentRequirement.value = { ...requirement }
  isEditing.value = true
  showDrawer.value = true
}

const saveRequirement = () => {
  if (isEditing.value) {
    updateRequirement()
  } else {
    createRequirement()
  }
}

const closeDrawer = () => {
  showDrawer.value = false
  isEditing.value = false
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