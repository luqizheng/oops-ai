<template>
  <div class="space-y-8 p-4">
    <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-100 p-8 hover:shadow-md transition-all duration-300">
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div>
          <h2 class="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-500 dark:from-white dark:to-slate-400 tracking-tight">
            需求中心
          </h2>
          <p class="text-sm text-slate-500 mt-1 font-medium">收录并跟踪业务需求，提升项目成功率</p>
        </div>
        <el-button
          @click="router.push('/requirements/new')"
          type="primary"
          class="!rounded-xl px-6 h-11 !font-bold bg-gradient-to-r from-indigo-600 to-purple-600 border-none shadow-lg shadow-indigo-100 hover:shadow-indigo-200 hover:-translate-y-0.5 transition-all active:scale-95"
        >
          <el-icon class="mr-1.5"><Plus /></el-icon>
          录入新需求
        </el-button>
      </div>

      <!-- 需求卡片网格 -->
      <div v-if="requirements.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div
          v-for="requirement in requirements"
          :key="requirement.id"
          class="group bg-white rounded-3xl shadow-sm border border-slate-100 p-7 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-500 hover:-translate-y-2 relative overflow-hidden"
        >
          <div class="flex justify-between items-start mb-4 shrink-0">
            <div class="flex-1 min-w-0">
              <h3 class="font-black text-xl text-slate-900 leading-tight group-hover:text-indigo-600 transition-colors truncate pr-4">
                {{ requirement.title }}
              </h3>
            </div>
            <div class="flex gap-1 shrink-0 px-2 py-1 bg-slate-50 rounded-lg group-hover:bg-indigo-50 transition-colors">
              <el-button
                @click="router.push(`/requirements/${requirement.id}/edit`)"
                type="primary"
                link
                class="!p-1 hover:!bg-indigo-100 !rounded-md transition-all"
              >
                <el-icon size="16"><Edit /></el-icon>
              </el-button>
              <el-button
                @click="deleteRequirement(requirement.id)"
                type="danger"
                link
                class="!p-1 hover:!bg-red-100 !rounded-md transition-all"
              >
                <el-icon size="16"><Delete /></el-icon>
              </el-button>
            </div>
          </div>
          
          <div class="mb-8 h-12">
            <p class="text-sm text-slate-500 line-clamp-2 leading-relaxed font-medium">
              {{ requirement.description || '该需求暂无详细说明。完善描述有助于 AI 更精准地进行分析并生成高质量的用户故事。' }}
            </p>
          </div>
          
          <div class="flex flex-col gap-4">
            <div v-if="requirement.qualityScore" class="bg-slate-50 group-hover:bg-white rounded-2xl p-4 border border-transparent group-hover:border-slate-100 transition-all">
              <div class="flex justify-between items-center mb-2">
                <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">AI 质量评分</span>
                <span class="text-xs font-black" :class="getScoreColor(requirement.qualityScore.totalScore)">
                  {{ requirement.qualityScore.totalScore || 0 }}/10
                </span>
              </div>
              <el-progress 
                :percentage="(requirement.qualityScore.totalScore || 0) * 10" 
                :show-text="false" 
                :stroke-width="6" 
                :color="getScoreProgressColor(requirement.qualityScore.totalScore)"
                class="!rounded-full shadow-inner"
              />
            </div>
            <div v-else class="bg-slate-50 rounded-2xl p-4 border border-dashed border-slate-200 text-center">
              <span class="text-[10px] font-bold text-slate-400 uppercase">尚未进行 AI 质量评估</span>
            </div>
            
            <div class="flex items-center justify-between mt-2 pt-4 border-t border-slate-50 shrink-0">
              <span class="text-[11px] font-bold text-slate-300 italic">{{ formatDate(requirement.createdAt) }}</span>
              <el-button 
                link 
                class="!text-[11px] !font-black !text-indigo-500 !uppercase !tracking-tighter hover:!bg-indigo-50 hover:px-2 !rounded-md transition-all"
                @click="router.push(`/requirements/${requirement.id}/edit`)"
              >
                详情分析
                <el-icon class="ml-1"><ArrowRight /></el-icon>
              </el-button>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="text-center py-24">
        <el-empty description="没有找到任何业务需求" :image-size="200">
          <template #extra>
            <el-button 
              type="primary" 
              @click="router.push('/requirements/new')" 
              plain 
              class="!rounded-2xl px-10 !h-12 !font-bold"
            >
              录入首个需求
            </el-button>
          </template>
        </el-empty>
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
import { useRouter } from 'vue-router'
import axios from '../utils/api'
import { 
  CircleClose, 
  Check, 
  Plus, 
  Edit, 
  Delete, 
  ArrowRight 
} from '@element-plus/icons-vue'

const router = useRouter()

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
    const response = await axios.get('/requirements')
    requirements.value = response.data
  } catch (err: any) {
    console.error('Error fetching requirements:', err)
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



const deleteRequirement = async (id: string) => {
  // 先备份要删除的需求，用于撤销操作
  const requirementToDelete = requirements.value.find(req => req.id === id)
  
  try {
    await axios.delete(`/requirements/${id}`)
    
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
          await axios.post('/requirements', requirementToDelete)
          await fetchRequirements()
          showFeedback('删除已撤销', 'success')
        } catch (err: any) {
          console.error('Error undoing delete:', err)
          showFeedback('撤销删除失败', 'error')
        }
      }
    })
  } catch (err: any) {
    console.error('Error deleting requirement:', err)
    showFeedback('删除需求失败，请重试', 'error')
  }
}



const getScoreColor = (score: number) => {
  if (score >= 8) return 'text-emerald-600'
  if (score >= 6) return 'text-amber-600'
  return 'text-rose-600'
}

const getScoreProgressColor = (score: number) => {
  if (score >= 8) return '#10b981'
  if (score >= 6) return '#f59e0b'
  return '#f43f5e'
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