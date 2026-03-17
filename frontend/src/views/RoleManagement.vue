<template>
  <div class="space-y-8 p-4">
    <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-100 p-8 hover:shadow-md transition-all duration-300">
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h2 class="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
            角色管理
          </h2>
          <p class="text-sm text-gray-500 mt-1">定义权限组和职能分工</p>
        </div>
        <el-button
          @click="router.push('/roles/new')"
          type="primary"
          class="rounded-xl px-6 h-11 bg-gradient-to-r from-indigo-500 to-purple-500 border-none shadow-md shadow-indigo-200 hover:shadow-lg hover:-translate-y-0.5 transition-all active:scale-95"
        >
          <el-icon class="mr-1.5"><Plus /></el-icon>
          添加新角色
        </el-button>
      </div>

      <!-- 角色卡片列表 -->
      <div v-if="roles.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="role in roles"
          :key="role.id"
          class="group bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 hover:-translate-y-1 overflow-hidden relative"
        >
          <!-- 彩色装饰条 -->
          <div class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-400 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          
          <div class="flex justify-between items-start mb-5">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <el-icon size="20"><CollectionTag /></el-icon>
              </div>
              <h3 class="font-bold text-lg text-gray-900">{{ role.name }}</h3>
            </div>
            <div class="flex items-center gap-1.5">
              <el-tooltip content="编辑角色" placement="top">
                <el-button
                  @click="router.push(`/roles/${role.id}/edit`)"
                  type="primary"
                  circle
                  size="small"
                  class="!bg-indigo-50 !text-indigo-600 border-none hover:!bg-indigo-100"
                >
                  <el-icon><Edit /></el-icon>
                </el-button>
              </el-tooltip>
              <el-tooltip content="删除角色" placement="top">
                <el-button
                  @click="deleteRole(role.id)"
                  type="danger"
                  circle
                  size="small"
                  class="!bg-red-50 !text-red-600 border-none hover:!bg-red-100"
                >
                  <el-icon><Delete /></el-icon>
                </el-button>
              </el-tooltip>
            </div>
          </div>

          <div class="space-y-4">
            <p class="text-sm text-gray-600 leading-relaxed line-clamp-2 h-10">
              {{ role.description || '该角色暂无详细描述信息。' }}
            </p>
            
            <div class="pt-4 border-t border-gray-50 flex items-center justify-between">
              <div class="flex items-center text-[11px] text-gray-400 font-medium tracking-tight">
                <el-icon class="mr-1"><Calendar /></el-icon>
                {{ formatDate(role.createdAt) }}
              </div>
              <el-tag size="small" effect="plain" class="!border-indigo-100 !text-indigo-400 uppercase text-[10px] font-bold">
                Standard
              </el-tag>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="text-center py-20 px-4">
        <el-empty description="暂无角色数据" :image-size="200">
          <template #extra>
            <el-button type="primary" @click="router.push('/roles/new')" plain class="rounded-xl">
              立即创建一个
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
          link
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
  ElButton, 
  ElTooltip,
  ElEmpty,
  ElIcon,
  ElTag
} from 'element-plus'
import { 
  Plus, 
  Edit, 
  Delete, 
  CollectionTag, 
  Calendar, 
  CircleClose, 
  Check
} from '@element-plus/icons-vue'

const router = useRouter()

interface Role {
  id: string
  name: string
  description: string | null
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

const roles = ref<Role[]>([])


const actionFeedback = ref<ActionFeedback>({
  show: false,
  message: '',
  type: 'success',
  undoable: false,
  undoAction: null
})

// 用于撤销删除的临时存储
const deletedRoleBackup = ref<Role | null>(null)

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

const fetchRoles = async () => {
  try {
    const response = await axios.get('/roles')
    roles.value = response.data
  } catch (err: any) {
    console.error('Error fetching roles:', err)
    roles.value = []
    showFeedback('获取角色列表失败', 'error')
  }
}



const deleteRole = async (id: string) => {
  // 先备份要删除的角色，用于撤销操作
  const roleToDelete = roles.value.find(role => role.id === id)
  if (!roleToDelete) return
  
  // 乐观更新UI
  const index = roles.value.findIndex(role => role.id === id)
  if (index > -1) {
    roles.value.splice(index, 1)
  }
  
  try {
    await axios.delete(`/roles/${id}`)
    
    // 显示反馈和撤销选项
    showFeedback('角色已删除', 'success', true, async () => {
      try {
        // 重新创建角色
        await axios.post('/roles', {
          name: roleToDelete.name,
          description: roleToDelete.description
        })
        await fetchRoles()
        showFeedback('删除已撤销', 'success')
      } catch (err: any) {
        console.error('Error undoing delete:', err)
        showFeedback('撤销删除失败', 'error')
        // 恢复UI
        if (index > -1) {
          roles.value.splice(index, 0, roleToDelete)
        }
      }
    })
  } catch (err: any) {
    console.error('Error deleting role:', err)
    // 获取详细错误信息
    const errorMessage = err.response?.data?.message || 
                        err.response?.data?.error || 
                        '删除角色失败，请重试'
    showFeedback(`删除角色失败：${errorMessage}`, 'error')
    // 恢复UI
    if (index > -1) {
      roles.value.splice(index, 0, roleToDelete)
    }
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
