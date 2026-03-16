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
                描述
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                组织
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
                <div class="text-sm text-gray-500">{{ project.description || '-' }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-500">
                  {{ project.organizations && project.organizations.length > 0 
                      ? project.organizations.map(asso => asso.organization?.name).filter(Boolean).join(', ') 
                      : '-' }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-500">{{ formatDate(project.createdAt) }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
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
                描述
              </label>
              <textarea
                v-model="currentProject.description"
                rows="3"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="请输入项目描述"
              ></textarea>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                组织ID (多个ID用逗号分隔)
              </label>
              <input
                v-model="currentProject.organizationIds"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="请输入组织ID，多个ID用逗号分隔"
              />
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
              :disabled="!currentProject.name"
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
}

interface ProjectSettings {
  id: string
  projectId: string
  workflowConfig: any
}

interface OrganizationProject {
  id: string
  organizationId: string
  projectId: string
  organization: Organization | null
}

interface Project {
  id: string
  name: string
  description: string | null
  organizations: OrganizationProject[]
  projectSettings: ProjectSettings | null
  createdAt: string
  updatedAt: string
}

const projects = ref<Project[]>([])
const showCreateModal = ref(false)
const showEditModal = ref(false)
const currentProject = ref<Partial<Project> & { organizationIds?: string }>({
  name: '',
  description: '',
  organizationIds: ''
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
    
    // Convert comma-separated organization IDs to array
    if (projectData.organizationIds) {
      projectData.organizationIds = projectData.organizationIds
        .split(',')
        .map(id => id.trim())
        .filter(id => id)
    }
    
    await axios.post('/projects', projectData)
    closeModal()
    fetchProjects()
    resetCurrentProject()
  } catch (error) {
    console.error('Error creating project:', error)
    alert('创建项目失败，请重试')
  }
}

const updateProject = async () => {
  if (!currentProject.value.id) return

  try {
    // Prepare project data
    const projectData = { ...currentProject.value }
    
    // Convert comma-separated organization IDs to array if provided
    if (projectData.organizationIds) {
      projectData.organizationIds = projectData.organizationIds
        .split(',')
        .map(id => id.trim())
        .filter(id => id)
    }
    
    await axios.put(`/projects/${currentProject.value.id}`, projectData)
    closeModal()
    fetchProjects()
    resetCurrentProject()
  } catch (error) {
    console.error('Error updating project:', error)
    alert('更新项目失败，请重试')
  }
}

const deleteProject = async (id: string) => {
  if (!confirm('确定要删除这个项目吗？')) return

  try {
    await axios.delete(`/projects/${id}`)
    fetchProjects()
  } catch (error) {
    console.error('Error deleting project:', error)
    alert('删除项目失败，请重试')
  }
}

const editProject = (project: Project) => {
  // Convert organization IDs to comma-separated string for editing
  const organizationIds = project.organizations 
    ? project.organizations.map(asso => asso.organizationId).join(', ')
    : ''
    
  currentProject.value = { 
    ...project,
    organizationIds
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
    description: '',
    organizationIds: ''
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
  fetchProjects()
})
</script>