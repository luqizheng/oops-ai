<template>
  <div class="space-y-6">
    <div class="bg-white rounded-lg shadow p-6">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold">项目管理</h2>
        <div class="flex space-x-3">
          <router-link
            to="/project-calendar"
            class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            项目挂历
          </router-link>
          <button
            @click="showCreateModal = true"
            class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            添加新项目
          </button>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                项目名称
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                关键字
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                描述
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                成员数
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
            <tr v-for="project in projects" :key="project.id">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">{{ project.name }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-500">{{ project.key }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-500">{{ project.description || '-' }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-500">{{ project.members?.length || 0 }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-500">{{ formatDate(project.createdAt) }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  @click="manageMembers(project)"
                  class="text-green-600 hover:text-green-900 mr-4"
                >
                  成员管理
                </button>
                <button
                  @click="editProject(project)"
                  class="text-blue-600 hover:text-blue-900 mr-4"
                >
                  编辑
                </button>
                <button
                  @click="deleteProject(project.id)"
                  class="text-red-600 hover:text-red-900"
                >
                  删除
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="projects.length === 0" class="text-center py-12">
        <p class="text-gray-500">暂无项目</p>
        <p class="text-sm text-gray-400 mt-2">点击"添加新项目"按钮开始创建</p>
      </div>
    </div>

    <!-- 创建/编辑模态框 -->
    <div v-if="showCreateModal || showEditModal" class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div class="p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">
            {{ showEditModal ? '编辑项目' : '添加新项目' }}
          </h3>
          
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                项目名称 *
              </label>
              <input
                v-model="currentProject.name"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="请输入项目名称"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                项目关键字 *
              </label>
              <input
                v-model="currentProject.key"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="请输入项目关键字（如OPS）"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                描述
              </label>
              <textarea
                v-model="currentProject.description"
                rows="3"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="请输入项目描述"
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
              @click="saveProject"
              :disabled="!currentProject.name || !currentProject.key"
              class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {{ showEditModal ? '更新' : '创建' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 成员管理模态框 -->
    <div v-if="showMembersModal" class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full">
        <div class="p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">
            成员管理 - {{ selectedProject?.name }}
          </h3>

          <!-- 添加成员表单 -->
          <div class="bg-blue-50 p-4 rounded-md mb-6">
            <h4 class="text-sm font-medium text-gray-700 mb-3">添加新成员</h4>
            <div class="grid grid-cols-3 gap-3">
              <select
                v-model="newMember.userId"
                class="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">选择用户</option>
                <option v-for="user in users" :key="user.id" :value="user.id">
                  {{ user.name || user.email }}
                </option>
              </select>
              <select
                v-model="newMember.role"
                class="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="developer">开发工程师</option>
                <option value="tester">测试工程师</option>
                <option value="product_manager">产品经理</option>
                <option value="project_manager">项目经理</option>
              </select>
              <button
                @click="addProjectMember"
                :disabled="!newMember.userId || !newMember.role"
                class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                添加
              </button>
            </div>
          </div>

          <!-- 成员列表 -->
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    用户名
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    邮箱
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    角色
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    加入时间
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="member in selectedProject?.members" :key="member.userId">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">{{ member.user.name || '未知' }}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-500">{{ member.user.email }}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <select
                      v-model="member.role"
                      @change="updateProjectMember(member)"
                      class="px-3 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="developer">开发工程师</option>
                      <option value="tester">测试工程师</option>
                      <option value="product_manager">产品经理</option>
                      <option value="project_manager">项目经理</option>
                    </select>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-500">{{ formatDate(member.joinedAt) }}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      @click="removeProjectMember(member.userId)"
                      class="text-red-600 hover:text-red-900"
                    >
                      移除
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div v-if="!selectedProject?.members || selectedProject.members.length === 0" class="text-center py-12">
            <p class="text-gray-500">暂无成员</p>
            <p class="text-sm text-gray-400 mt-2">使用上方表单添加成员</p>
          </div>

          <div class="mt-6 flex justify-end">
            <button
              @click="closeMembersModal"
              class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              关闭
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

const projects = ref<Project[]>([])
const users = ref<User[]>([])
const showCreateModal = ref(false)
const showEditModal = ref(false)
const showMembersModal = ref(false)
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

const fetchProjects = async () => {
  try {
    const response = await axios.get('/projects')
    projects.value = response.data
  } catch (error) {
    console.error('Error fetching projects:', error)
    projects.value = []
  }
}

const createProject = async () => {
  try {
    // Prepare project data
    const projectData = { ...currentProject.value }
    
    await axios.post('/projects', projectData)
    closeModal()
    fetchProjects()
    resetCurrentProject()
  } catch (error) {
    console.error('Error creating project:', error)
    // 获取详细错误信息
    const errorMessage = error.response?.data?.message || 
                        error.response?.data?.error || 
                        '创建项目失败，请重试'
    alert(`创建项目失败：${errorMessage}`)
  }
}

const updateProject = async () => {
  if (!currentProject.value.id) return

  try {
    // Prepare project data
    const projectData = { ...currentProject.value }
    
    await axios.put(`/projects/${currentProject.value.id}`, projectData)
    closeModal()
    fetchProjects()
    resetCurrentProject()
  } catch (error) {
    console.error('Error updating project:', error)
    // 获取详细错误信息
    const errorMessage = error.response?.data?.message || 
                        error.response?.data?.error || 
                        '更新项目失败，请重试'
    alert(`更新项目失败：${errorMessage}`)
  }
}

const deleteProject = async (id: string) => {
  if (!confirm('确定要删除这个项目吗？')) return

  try {
    await axios.delete(`/projects/${id}`)
    fetchProjects()
  } catch (error) {
    console.error('Error deleting project:', error)
    // 获取详细错误信息
    const errorMessage = error.response?.data?.message || 
                        error.response?.data?.error || 
                        '删除项目失败，请重试'
    alert(`删除项目失败：${errorMessage}`)
  }
}

const editProject = (project: Project) => {
  currentProject.value = { 
    ...project
  }
  showEditModal.value = true
}

const saveProject = () => {
  if (showEditModal.value) {
    updateProject()
  } else {
    createProject()
  }
}

const closeModal = () => {
  showCreateModal.value = false
  showEditModal.value = false
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
    showMembersModal.value = true
    await fetchUsers()
  } catch (error) {
    console.error('Error fetching project members:', error)
    alert('获取成员信息失败，请重试')
  }
}

const closeMembersModal = () => {
  showMembersModal.value = false
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
  } catch (error) {
    console.error('Error adding project member:', error)
    // 获取详细错误信息
    const errorMessage = error.response?.data?.message || 
                        error.response?.data?.error || 
                        '添加成员失败，请重试'
    alert(`添加成员失败：${errorMessage}`)
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
  } catch (error) {
    console.error('Error updating project member:', error)
    // 获取详细错误信息
    const errorMessage = error.response?.data?.message || 
                        error.response?.data?.error || 
                        '更新成员角色失败，请重试'
    alert(`更新成员角色失败：${errorMessage}`)
  }
}

const removeProjectMember = async (userId: string) => {
  if (!selectedProject.value) return

  if (!confirm('确定要移除这个成员吗？')) return

  try {
    await axios.delete(`/projects/${selectedProject.value.id}/members/${userId}`)
    // 重新获取项目详情以更新成员列表
    const response = await axios.get(`/projects/${selectedProject.value.id}`)
    selectedProject.value = response.data
  } catch (error) {
    console.error('Error removing project member:', error)
    // 获取详细错误信息
    const errorMessage = error.response?.data?.message || 
                        error.response?.data?.error || 
                        '移除成员失败，请重试'
    alert(`移除成员失败：${errorMessage}`)
  }
}

onMounted(async () => {
  await fetchProjects()
})

</script>