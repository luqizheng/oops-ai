<template>
  <div class="space-y-8">
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold text-gray-900">角色管理</h2>
        <el-button
          @click="showDrawer = true"
          type="primary"
          class="rounded-lg px-5 py-2 h-10 text-sm"
        >
          添加新角色
        </el-button>
      </div>

      <!-- 角色卡片列表 -->
      <div v-if="roles.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="role in roles"
          :key="role.id"
          class="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-all duration-200 hover:-translate-y-1"
        >
          <div class="flex justify-between items-start mb-3">
            <div>
              <h3 class="font-semibold text-lg text-gray-900">{{ role.name }}</h3>
            </div>
            <div class="flex space-x-2">
              <el-button
                @click="editRole(role)"
                type="primary"
                size="small"
                class="rounded-lg h-9 text-xs"
              >
                编辑
              </el-button>
              <el-button
                @click="deleteRole(role.id)"
                type="danger"
                size="small"
                class="rounded-lg h-9 text-xs"
              >
                删除
              </el-button>
            </div>
          </div>

          <div class="mt-4">
            <p class="text-sm text-gray-600 mb-4">
              {{ role.description || '暂无描述' }}
            </p>
            
            <div class="text-xs text-gray-500">
              创建时间: {{ formatDate(role.createdAt) }}
            </div>
          </div>
        </div>
      </div>

      <div v-else class="text-center py-12">
        <p class="text-gray-500">暂无角色</p>
        <p class="text-sm text-gray-400 mt-2">点击"添加新角色"按钮开始创建</p>
      </div>
    </div>

    <!-- 创建/编辑侧边抽屉 -->
    <el-drawer
      v-model="showDrawer"
      title=""
      size="480px"
      direction="rtl"
      :with-header="false"
    >
      <div class="p-6">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-xl font-bold text-gray-900">
            {{ isEditing ? '编辑角色' : '添加新角色' }}
          </h3>
          <el-button
            @click="closeDrawer"
            size="small"
            text
            :icon="CircleClose"
            class="text-gray-500 hover:text-gray-700"
          />
        </div>
        
        <el-form :model="currentRole" label-width="80px" class="space-y-5">
          <el-form-item label="角色名称" required>
            <el-input
              v-model="currentRole.name"
              placeholder="请输入角色名称"
              class="rounded-lg"
              size="large"
            />
          </el-form-item>
          
          <el-form-item label="描述">
            <el-input
              v-model="currentRole.description"
              type="textarea"
              rows="3"
              placeholder="请输入角色描述"
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
            @click="saveRole"
            :disabled="!currentRole.name"
            type="primary"
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
import { 
  ElButton, 
  ElInput, 
  ElForm, 
  ElFormItem,
  ElDrawer
} from 'element-plus'
import { 
  CircleClose, 
  Check
} from '@element-plus/icons-vue'

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
const showDrawer = ref(false)
const isEditing = ref(false)
const currentRole = ref<Partial<Role>>({
  name: '',
  description: ''
})

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
  } catch (error) {
    console.error('Error fetching roles:', error)
    roles.value = []
    showFeedback('获取角色列表失败', 'error')
  }
}

const createRole = async () => {
  try {
    await axios.post('/roles', currentRole.value)
    closeDrawer()
    fetchRoles()
    resetCurrentRole()
    showFeedback('角色创建成功', 'success')
  } catch (error) {
    console.error('Error creating role:', error)
    // 获取详细错误信息
    const errorMessage = error.response?.data?.message || 
                        error.response?.data?.error || 
                        '创建角色失败，请重试'
    showFeedback(`创建角色失败：${errorMessage}`, 'error')
  }
}

const updateRole = async () => {
  if (!currentRole.value.id) return

  try {
    await axios.put(`/roles/${currentRole.value.id}`, currentRole.value)
    closeDrawer()
    fetchRoles()
    resetCurrentRole()
    showFeedback('角色更新成功', 'success')
  } catch (error) {
    console.error('Error updating role:', error)
    // 获取详细错误信息
    const errorMessage = error.response?.data?.message || 
                        error.response?.data?.error || 
                        '更新角色失败，请重试'
    showFeedback(`更新角色失败：${errorMessage}`, 'error')
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
      } catch (error) {
        console.error('Error undoing delete:', error)
        showFeedback('撤销删除失败', 'error')
        // 恢复UI
        if (index > -1) {
          roles.value.splice(index, 0, roleToDelete)
        }
      }
    })
  } catch (error) {
    console.error('Error deleting role:', error)
    // 获取详细错误信息
    const errorMessage = error.response?.data?.message || 
                        error.response?.data?.error || 
                        '删除角色失败，请重试'
    showFeedback(`删除角色失败：${errorMessage}`, 'error')
    // 恢复UI
    if (index > -1) {
      roles.value.splice(index, 0, roleToDelete)
    }
  }
}

const editRole = (role: Role) => {
  currentRole.value = { ...role }
  isEditing.value = true
  showDrawer.value = true
}

const saveRole = () => {
  if (isEditing.value) {
    updateRole()
  } else {
    createRole()
  }
}

const closeDrawer = () => {
  showDrawer.value = false
  isEditing.value = false
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
