<template>
  <div class="space-y-8 p-4">
    <div
      class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-100 p-8 hover:shadow-md transition-all duration-300">
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div>
          <h2
            class="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-500 dark:from-white dark:to-slate-400 tracking-tight">
            项目中心
          </h2>
          <p class="text-sm text-slate-500 mt-1 font-medium">管理并跟踪您的所有研发项目</p>
        </div>
        <div class="flex items-center gap-3">
          <el-button @click="router.push('/project-calendar')"
            class="!rounded-xl px-5 h-11 !font-bold !bg-emerald-50 !text-emerald-700 !border-emerald-100 hover:!bg-emerald-100 transition-all">
            <el-icon class="mr-1.5">
              <Calendar />
            </el-icon>
            挂历视图
          </el-button>
          <el-button @click="router.push('/projects/new')" type="primary"
            class="!rounded-xl px-6 h-11 !font-bold bg-gradient-to-r from-indigo-600 to-purple-600 border-none shadow-lg shadow-indigo-100 hover:shadow-indigo-200 hover:-translate-y-0.5 transition-all active:scale-95">
            <el-icon class="mr-1.5">
              <Plus />
            </el-icon>
            新建项目
          </el-button>
        </div>
      </div>

      <!-- 项目卡片网格 -->
      <div v-if="projects.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div v-for="project in projects" :key="project.id"
          class="group bg-white rounded-3xl shadow-sm border border-slate-100 p-7 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-500 hover:-translate-y-2 relative overflow-hidden">
          <!-- 装饰元素 -->
          <div
            class="absolute -top-10 -right-10 w-32 h-32 bg-indigo-50/50 rounded-full blur-3xl group-hover:bg-indigo-100/50 transition-colors">
          </div>

          <div class="flex justify-between items-start mb-6 shrink-0 relative z-10">
            <div>
              <el-tag effect="plain"
                class="!rounded-lg !border-indigo-100 !text-indigo-500 px-3 font-black text-[10px] uppercase tracking-wider mb-3">
                {{ project.key }}
              </el-tag>
              <h3
                class="font-black text-xl text-slate-900 leading-tight group-hover:text-indigo-600 transition-colors capitalize">
                {{ project.name }}</h3>
            </div>
          </div>

          <div class="relative z-10">
            <p class="text-[14px] text-slate-500 mb-8 line-clamp-2 h-10 leading-relaxed font-medium">
              {{ project.description || '该项目暂无详细描述信息。可通过编辑按钮完善项目背景及目标。' }}
            </p>

            <div class="flex items-center gap-4 mb-8">
              <div class="flex -space-x-3 overflow-hidden">
                <div v-for="(member, idx) in project.members ? project.members.slice(0, 3) : []" :key="idx"
                  class="inline-flex items-center justify-center w-9 h-9 border-2 border-white rounded-full bg-slate-100 text-slate-400 text-[10px] font-bold ring-1 ring-slate-100">
                  {{ member.user?.name?.charAt(0) || 'U' }}
                </div>
                <div v-if="project.members && project.members.length > 3"
                  class="inline-flex items-center justify-center w-9 h-9 border-2 border-white rounded-full bg-indigo-600 text-white text-[10px] font-bold">
                  +{{ project.members.length - 3 }}
                </div>
                <div v-if="!project.members || project.members.length === 0"
                  class="inline-flex items-center justify-center w-9 h-9 border-2 border-dashed border-slate-200 rounded-full text-slate-300">
                  <el-icon>
                    <User />
                  </el-icon>
                </div>
              </div>
              <span class="text-xs font-bold text-slate-400 tracking-tight italic">{{ formatDate(project.createdAt)
              }}</span>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <el-button @click="manageMembers(project)"
                class="!rounded-xl !h-10 !text-xs !font-bold !bg-slate-50 !border-slate-100 !text-slate-600 hover:!bg-indigo-50 hover:!text-indigo-600 transition-all">
                管理成员
              </el-button>
              <div class="flex gap-2">
                <el-button @click="router.push(`/projects/${project.id}/edit`)" plain
                  class="!rounded-xl !h-10 px-0 flex-1 !text-xs !font-bold hover:!shadow-inner transition-all">
                  编辑
                </el-button>
                <el-button @click="deleteProject(project.id)" type="danger" plain
                  class="!rounded-xl !h-10 px-0 flex-1 !text-xs !font-bold hover:!bg-red-500 hover:!text-white transition-all">
                  删除
                </el-button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="text-center py-24">
        <el-empty description="暂无活跃项目" :image-size="220">
          <template #extra>
            <el-button type="primary" @click="router.push('/projects/new')" plain
              class="!rounded-2xl px-10 !h-12 !font-bold">
              立即启动项目
            </el-button>
          </template>
        </el-empty>
      </div>
    </div>



    <!-- 成员管理侧边抽屉 -->
    <el-drawer v-model="showMembersDrawer" title="" size="650px" direction="rtl" :with-header="false"
      class="modern-drawer">
      <div class="p-6">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-xl font-bold text-gray-900">
            成员管理 - {{ selectedProject?.name }}
          </h3>
          <el-button @click="closeMembersDrawer" size="small" text :icon="CircleClose"
            class="text-gray-500 hover:text-gray-700" />
        </div>

        <!-- 添加成员表单 -->
        <div class="bg-slate-50 p-6 rounded-2xl border border-slate-100 mb-8">
          <h4 class="text-sm font-black text-slate-800 uppercase tracking-wider mb-4">录入新成员</h4>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <el-select v-model="newMember.userId" placeholder="选择用户" class="rounded-lg" size="large">
              <el-option label="选择用户" value="" />
              <el-option v-for="user in users" :key="user.id" :label="user.name || user.email" :value="user.id" />
            </el-select>
            <el-select v-model="newMember.role" placeholder="选择角色" class="rounded-lg" size="large">
              <el-option label="开发工程师" value="developer" />
              <el-option label="测试工程师" value="tester" />
              <el-option label="产品经理" value="product_manager" />
              <el-option label="项目经理" value="project_manager" />
            </el-select>
            <el-button @click="addProjectMember" :disabled="!newMember.userId || !newMember.role" type="primary"
              class="rounded-lg h-11">
              添加
            </el-button>
          </div>
        </div>

        <!-- 成员列表 -->
        <div v-if="selectedProject?.members && selectedProject.members.length > 0" class="space-y-4">
          <div v-for="member in selectedProject.members" :key="member.userId"
            class="bg-white rounded-lg shadow-sm border border-gray-100 p-4 hover:shadow-md transition-all duration-200">
            <div class="flex justify-between items-center">
              <div>
                <div class="font-medium text-gray-900">{{ member.user.name || '未知用户' }}</div>
                <div class="text-sm text-gray-500">{{ member.user.email }}</div>
              </div>
              <div class="flex items-center space-x-3">
                <el-select v-model="member.role" @change="updateProjectMember(member)" size="small"
                  class="w-36 rounded-lg" style="width:100px">
                  <el-option label="开发工程师" value="developer" />
                  <el-option label="测试工程师" value="tester" />
                  <el-option label="产品经理" value="product_manager" />
                  <el-option label="项目经理" value="project_manager" />
                </el-select>
                <el-button @click="removeProjectMember(member.userId)" type="danger" size="small" class="rounded-lg">
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
    <div v-if="actionFeedback.show" :class="[
      'fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg p-4 z-40 transform transition-transform duration-300',
      actionFeedback.show ? 'translate-y-0' : 'translate-y-full'
    ]">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <el-icon :class="actionFeedback.type === 'success' ? 'text-green-500' : 'text-red-500'">
            <Check v-if="actionFeedback.type === 'success'" />
            <CircleClose v-else />
          </el-icon>
          <span class="text-gray-700 dark:text-gray-300">{{ actionFeedback.message }}</span>
        </div>
        <el-button v-if="actionFeedback.undoable" type="text" @click="handleUndo"
          class="text-primary-600 dark:text-primary-400">
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
  Calendar,
  Edit,
  Delete,
  User,
  ArrowRight
} from '@element-plus/icons-vue'

const router = useRouter()

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
const showMembersDrawer = ref(false)
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
  } catch (err: any) {
    console.error('Error fetching projects:', err)
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
      } catch (err: any) {
        console.error('Error undoing delete:', err)
        showFeedback('撤销删除失败', 'error')
        // 恢复UI
        if (index > -1) {
          projects.value.splice(index, 0, projectToDelete)
        }
      }
    })
  } catch (err: any) {
    console.error('Error deleting project:', err)
    // 获取详细错误信息
    const errorMessage = err.response?.data?.message ||
      err.response?.data?.error ||
      '删除项目失败，请重试'
    showFeedback(`删除项目失败：${errorMessage}`, 'error')
    // 恢复UI
    if (index > -1) {
      projects.value.splice(index, 0, projectToDelete)
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

// 用户相关函数
const fetchUsers = async () => {
  try {
    const response = await axios.get('/users')
    users.value = response.data
  } catch (err: any) {
    console.error('Error fetching users:', err)
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
  } catch (err: any) {
    console.error('Error fetching project members:', err)
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
  } catch (err: any) {
    console.error('Error adding project member:', err)
    // 获取详细错误信息
    const errorMessage = err.response?.data?.message ||
      err.response?.data?.error ||
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
  } catch (err: any) {
    console.error('Error updating project member:', err)
    // 获取详细错误信息
    const errorMessage = err.response?.data?.message ||
      err.response?.data?.error ||
      '更新成员角色失败，请重试'
    showFeedback(`更新成员角色失败：${errorMessage}`, 'error')
  }
}

const removeProjectMember = async (userId: string) => {
  if (!selectedProject.value) return
  const projectId = selectedProject.value.id

  // 先备份要移除的成员信息，用于撤销操作
  const memberToRemove = selectedProject.value.members.find(member => member.userId === userId)
  if (!memberToRemove) return

  // 乐观更新UI
  const index = selectedProject.value.members.findIndex(member => member.userId === userId)
  if (index > -1) {
    selectedProject.value.members.splice(index, 1)
  }

  try {
    await axios.delete(`/projects/${projectId}/members/${userId}`)

    // 显示反馈和撤销选项
    showFeedback('成员已移除', 'success', true, async () => {
      try {
        // 重新添加成员
        await axios.post(`/projects/${projectId}/members`, {
          userId: memberToRemove.userId,
          role: memberToRemove.role
        })
        // 重新获取项目详情以更新成员列表
        const response = await axios.get(`/projects/${projectId}`)
        if (selectedProject.value && selectedProject.value.id === projectId) {
          selectedProject.value = response.data
        }
        showFeedback('移除已撤销', 'success')
      } catch (err: any) {
        console.error('Error undoing remove:', err)
        showFeedback('撤销移除失败', 'error')
        // 恢复UI
        if (index > -1 && selectedProject.value) {
          selectedProject.value.members.splice(index, 0, memberToRemove)
        }
      }
    })
  } catch (err: any) {
    console.error('Error removing project member:', err)
    // 获取详细错误信息
    const errorMessage = err.response?.data?.message ||
      err.response?.data?.error ||
      '移除成员失败，请重试'
    showFeedback(`移除成员失败：${errorMessage}`, 'error')
    // 恢复UI
    if (index > -1 && selectedProject.value) {
      selectedProject.value.members.splice(index, 0, memberToRemove)
    }
  }
}

onMounted(async () => {
  await fetchProjects()
})

</script>