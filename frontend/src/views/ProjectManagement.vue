<template>
  <div class="space-y-8">
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200">
      <div class="flex flex-wrap justify-between items-center gap-4 mb-6">
        <h2 class="text-2xl font-bold text-gray-900">项目管理</h2>
        <div class="flex space-x-3">
          <router-link
            to="/project-calendar"
            class="rounded-lg px-5 py-2 h-10 text-sm bg-green-600 text-white hover:bg-green-700"
          >
            项目挂历
          </router-link>
          <el-button
            @click="showDrawer = true"
            type="primary"
            class="rounded-lg px-5 py-2 h-10 text-sm"
          >
            添加新项目
          </el-button>
        </div>
      </div>

      <!-- 项目卡片网格 -->
      <div v-if="projects.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="project in projects"
          :key="project.id"
          class="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-all duration-200 hover:-translate-y-1"
        >
          <div class="flex justify-between items-start mb-3">
            <div>
              <h3 class="font-semibold text-lg text-gray-900">{{ project.name }}</h3>
              <div class="flex items-center mt-2">
                <span class="px-3 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded-full">
                  {{ project.key }}
                </span>
              </div>
            </div>
          </div>

          <div class="mt-4">
            <p class="text-sm text-gray-600 mb-4 line-clamp-3">
              {{ project.description || '暂无描述' }}
            </p>
            
            <div class="flex justify-between items-center text-sm text-gray-500 mb-4">
              <span>成员: {{ project.members?.length || 0 }}</span>
              <span>{{ formatDate(project.createdAt) }}</span>
            </div>

            <div class="flex space-x-3">
              <el-button
                @click="manageMembers(project)"
                type="primary"
                size="small"
                class="flex-1 rounded-lg h-9 text-xs"
              >
                成员管理
              </el-button>
              <el-button
                @click="editProject(project)"
                type="default"
                size="small"
                class="flex-1 rounded-lg h-9 text-xs"
              >
                编辑
              </el-button>
              <el-button
                @click="deleteProject(project.id)"
                type="danger"
                size="small"
                class="flex-1 rounded-lg h-9 text-xs"
              >
                删除
              </el-button>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="text-center py-12">
        <p class="text-gray-500">暂无项目</p>
        <p class="text-sm text-gray-400 mt-2">点击"添加新项目"按钮开始创建</p>
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
            {{ isEditing ? '编辑项目' : '添加新项目' }}
          </h3>
          <el-button
            @click="closeDrawer"
            size="small"
            text
            :icon="CircleClose"
            class="text-gray-500 hover:text-gray-700"
          />
        </div>
        
        <el-form :model="currentProject" label-width="80px" class="space-y-5">
          <el-form-item label="项目名称" required>
            <el-input
              v-model="currentProject.name"
              placeholder="请输入项目名称"
              class="rounded-lg"
              size="large"
            />
          </el-form-item>
          
          <el-form-item label="项目关键字" required>
            <el-input
              v-model="currentProject.key"
              placeholder="请输入项目关键字（如OPS）"
              class="rounded-lg"
              size="large"
            />
          </el-form-item>
          
          <el-form-item label="描述">
            <el-input
              v-model="currentProject.description"
              type="textarea"
              rows="3"
              placeholder="请输入项目描述"
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
            @click="saveProject"
            :disabled="!currentProject.name || !currentProject.key"
            type="primary"
            class="rounded-lg"
          >
            {{ isEditing ? '更新' : '创建' }}
          </el-button>
        </div>
      </div>
    </el-drawer>

    <!-- 成员管理侧边抽屉 -->
    <el-drawer
      v-model="showMembersDrawer"
      title=""
      size="600px"
      direction="rtl"
      :with-header="false"
    >
      <div class="p-6">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-xl font-bold text-gray-900">
            成员管理 - {{ selectedProject?.name }}
          </h3>
          <el-button
            @click="closeMembersDrawer"
            size="small"
            text
            :icon="CircleClose"
            class="text-gray-500 hover:text-gray-700"
          />
        </div>

        <!-- 添加成员表单 -->
        <div class="bg-blue-50 p-5 rounded-lg border border-blue-100 mb-6">
          <h4 class="text-sm font-medium text-gray-700 mb-3">添加新成员</h4>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <el-select
              v-model="newMember.userId"
              placeholder="选择用户"
              class="rounded-lg"
              size="large"
            >
              <el-option label="选择用户" value="" />
              <el-option
                v-for="user in users"
                :key="user.id"
                :label="user.name || user.email"
                :value="user.id"
              />
            </el-select>
            <el-select
              v-model="newMember.role"
              placeholder="选择角色"
              class="rounded-lg"
              size="large"
            >
              <el-option label="开发工程师" value="developer" />
              <el-option label="测试工程师" value="tester" />
              <el-option label="产品经理" value="product_manager" />
              <el-option label="项目经理" value="project_manager" />
            </el-select>
            <el-button
              @click="addProjectMember"
              :disabled="!newMember.userId || !newMember.role"
              type="primary"
              class="rounded-lg h-11"
            >
              添加
            </el-button>
          </div>
        </div>

        <!-- 成员列表 -->
        <div v-if="selectedProject?.members && selectedProject.members.length > 0" class="space-y-4">
          <div
            v-for="member in selectedProject.members"
            :key="member.userId"
            class="bg-white rounded-lg shadow-sm border border-gray-100 p-4 hover:shadow-md transition-all duration-200"
          >
            <div class="flex justify-between items-center">
              <div>
                <div class="font-medium text-gray-900">{{ member.user.name || '未知用户' }}</div>
                <div class="text-sm text-gray-500">{{ member.user.email }}</div>
              </div>
              <div class="flex items-center space-x-3">
                <el-select
                  v-model="member.role"
                  @change="updateProjectMember(member)"
                  size="small"
                  class="w-36 rounded-lg"
                >
                  <el-option label="开发工程师" value="developer" />
                  <el-option label="测试工程师" value="tester" />
                  <el-option label="产品经理" value="product_manager" />
                  <el-option label="项目经理" value="project_manager" />
                </el-select>
                <el-button
                  @click="removeProjectMember(member.userId)"
                  type="danger"
                  size="small"
                  class="rounded-lg"
                >
                  移除
                </el-button>
              </div>
            </div>
            <div class="text-xs text-gray-400 mt-2">
              加入时间: {{ formatDate(member.joinedAt) }}
            </div>
          </div>
        </div>

        <div v-else class="text-center py-12">
          <p class="text-gray-500">暂无成员</p>
          <p class="text-sm text-gray-400 mt-2">使用上方表单添加成员</p>
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

interface ProjectSettings {
  id: string
  projectId: string
  workflowConfig: any
}

interface ProjectMember {
  projectId: string
  userId: string
  role: string
  joinedAt: string
  user: {
    id: string
    name: string | null
    email: string
  }
}

interface User {
  id: string
  name: string | null
  email: string
}

interface Project {
  id: string
  name: string
  description: string | null
  key: string
  projectSettings: ProjectSettings | null
  members: ProjectMember[]
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

const projects = ref<Project[]>([])
const users = ref<User[]>([])
const showDrawer = ref(false)
const isEditing = ref(false)
const showMembersDrawer = ref(false)
const currentProject = ref<Partial<Project>>({
  name: '',
  key: '',
  description: ''
})
const selectedProject = ref<Project | null>(null)
const newMember = ref({
  userId: '',
  role: 'developer'
})

const actionFeedback = ref<ActionFeedback>({
  show: false,
  message: '',
  type: 'success',
  undoable: false,
  undoAction: null
})

// 用于撤销删除的临时存储
const deletedProjectBackup = ref<Project | null>(null)

const fetchProjects = async () => {
  try {
    const response = await axios.get('/projects')
    projects.value = response.data
  } catch (error) {
    console.error('Error fetching projects:', error)
    projects.value = []
    showFeedback('获取项目列表失败', 'error')
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

const createProject = async () => {
  try {
    // Prepare project data
    const projectData = { ...currentProject.value }
    
    await axios.post('/projects', projectData)
    closeDrawer()
    fetchProjects()
    resetCurrentProject()
    showFeedback('项目创建成功', 'success')
  } catch (error) {
    console.error('Error creating project:', error)
    // 获取详细错误信息
    const errorMessage = error.response?.data?.message || 
                        error.response?.data?.error || 
                        '创建项目失败，请重试'
    showFeedback(`创建项目失败：${errorMessage}`, 'error')
  }
}

const updateProject = async () => {
  if (!currentProject.value.id) return

  try {
    // Prepare project data
    const projectData = { ...currentProject.value }
    
    await axios.put(`/projects/${currentProject.value.id}`, projectData)
    closeDrawer()
    fetchProjects()
    resetCurrentProject()
    showFeedback('项目更新成功', 'success')
  } catch (error) {
    console.error('Error updating project:', error)
    // 获取详细错误信息
    const errorMessage = error.response?.data?.message || 
                        error.response?.data?.error || 
                        '更新项目失败，请重试'
    showFeedback(`更新项目失败：${errorMessage}`, 'error')
  }
}

const deleteProject = async (id: string) => {
  // 先备份要删除的项目，用于撤销操作
  const projectToDelete = projects.value.find(project => project.id === id)
  if (!projectToDelete) return
  
  // 乐观更新UI
  const index = projects.value.findIndex(project => project.id === id)
  if (index > -1) {
    projects.value.splice(index, 1)
  }
  
  try {
    await axios.delete(`/projects/${id}`)
    
    // 显示反馈和撤销选项
    showFeedback('项目已删除', 'success', true, async () => {
      try {
        // 重新创建项目
        await axios.post('/projects', projectToDelete)
        await fetchProjects()
        showFeedback('删除已撤销', 'success')
      } catch (error) {
        console.error('Error undoing delete:', error)
        showFeedback('撤销删除失败', 'error')
        // 恢复UI
        if (index > -1) {
          projects.value.splice(index, 0, projectToDelete)
        }
      }
    })
  } catch (error) {
    console.error('Error deleting project:', error)
    // 获取详细错误信息
    const errorMessage = error.response?.data?.message || 
                        error.response?.data?.error || 
                        '删除项目失败，请重试'
    showFeedback(`删除项目失败：${errorMessage}`, 'error')
    // 恢复UI
    if (index > -1) {
      projects.value.splice(index, 0, projectToDelete)
    }
  }
}

const editProject = (project: Project) => {
  currentProject.value = { 
    ...project
  }
  isEditing.value = true
  showDrawer.value = true
}

const saveProject = () => {
  if (isEditing.value) {
    updateProject()
  } else {
    createProject()
  }
}

const closeDrawer = () => {
  showDrawer.value = false
  isEditing.value = false
  resetCurrentProject()
}

const resetCurrentProject = () => {
  currentProject.value = {
    name: '',
    key: '',
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

// 用户相关函数
const fetchUsers = async () => {
  try {
    const response = await axios.get('/users')
    users.value = response.data
  } catch (error) {
    console.error('Error fetching users:', error)
    users.value = []
  }
}

// 成员管理相关函数
const manageMembers = async (project: Project) => {
  try {
    // 获取完整的项目数据，包括成员信息
    const response = await axios.get(`/projects/${project.id}`)
    selectedProject.value = response.data
    showMembersDrawer.value = true
    await fetchUsers()
  } catch (error) {
    console.error('Error fetching project members:', error)
    showFeedback('获取成员信息失败，请重试', 'error')
  }
}

const closeMembersDrawer = () => {
  showMembersDrawer.value = false
  selectedProject.value = null
  newMember.value = {
    userId: '',
    role: 'developer'
  }
}

const addProjectMember = async () => {
  if (!selectedProject.value || !newMember.value.userId || !newMember.value.role) return

  try {
    await axios.post(`/projects/${selectedProject.value.id}/members`, newMember.value)
    // 重新获取项目详情以更新成员列表
    const response = await axios.get(`/projects/${selectedProject.value.id}`)
    selectedProject.value = response.data
    // 重置表单
    newMember.value = {
      userId: '',
      role: 'developer'
    }
    showFeedback('成员添加成功', 'success')
  } catch (error) {
    console.error('Error adding project member:', error)
    // 获取详细错误信息
    const errorMessage = error.response?.data?.message || 
                        error.response?.data?.error || 
                        '添加成员失败，请重试'
    showFeedback(`添加成员失败：${errorMessage}`, 'error')
  }
}

const updateProjectMember = async (member: ProjectMember) => {
  if (!selectedProject.value) return

  try {
    await axios.put(
      `/projects/${selectedProject.value.id}/members/${member.userId}`,
      { role: member.role }
    )
    // 重新获取项目详情以更新成员列表
    const response = await axios.get(`/projects/${selectedProject.value.id}`)
    selectedProject.value = response.data
    showFeedback('成员角色更新成功', 'success')
  } catch (error) {
    console.error('Error updating project member:', error)
    // 获取详细错误信息
    const errorMessage = error.response?.data?.message || 
                        error.response?.data?.error || 
                        '更新成员角色失败，请重试'
    showFeedback(`更新成员角色失败：${errorMessage}`, 'error')
  }
}

const removeProjectMember = async (userId: string) => {
  if (!selectedProject.value) return

  // 先备份要移除的成员信息，用于撤销操作
  const memberToRemove = selectedProject.value.members.find(member => member.userId === userId)
  if (!memberToRemove) return
  
  // 乐观更新UI
  const index = selectedProject.value.members.findIndex(member => member.userId === userId)
  if (index > -1) {
    selectedProject.value.members.splice(index, 1)
  }
  
  try {
    await axios.delete(`/projects/${selectedProject.value.id}/members/${userId}`)
    
    // 显示反馈和撤销选项
    showFeedback('成员已移除', 'success', true, async () => {
      try {
        // 重新添加成员
        await axios.post(`/projects/${selectedProject.value.id}/members`, {
          userId: memberToRemove.userId,
          role: memberToRemove.role
        })
        // 重新获取项目详情以更新成员列表
        const response = await axios.get(`/projects/${selectedProject.value.id}`)
        selectedProject.value = response.data
        showFeedback('移除已撤销', 'success')
      } catch (error) {
        console.error('Error undoing remove:', error)
        showFeedback('撤销移除失败', 'error')
        // 恢复UI
        if (index > -1) {
          selectedProject.value.members.splice(index, 0, memberToRemove)
        }
      }
    })
  } catch (error) {
    console.error('Error removing project member:', error)
    // 获取详细错误信息
    const errorMessage = error.response?.data?.message || 
                        error.response?.data?.error || 
                        '移除成员失败，请重试'
    showFeedback(`移除成员失败：${errorMessage}`, 'error')
    // 恢复UI
    if (index > -1) {
      selectedProject.value.members.splice(index, 0, memberToRemove)
    }
  }
}

onMounted(async () => {
  await fetchProjects()
})

</script>