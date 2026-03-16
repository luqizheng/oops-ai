<template>
  <div class="space-y-6 p-4">
    <!-- 页面标题和操作按钮 -->
    <el-card shadow="hover">
      <div class="flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
        <div>
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white">用户管理</h2>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">管理系统用户账号</p>
        </div>
        <el-button
          type="primary"
          :icon="Plus"
          @click="showCreateModal = true"
        >
          添加新用户
        </el-button>
      </div>
    </el-card>

    <!-- 数据表格 -->
    <el-card shadow="hover">
      <div class="mb-4">
        <el-input
          v-model="searchQuery"
          placeholder="搜索用户名或邮箱..."
          :prefix-icon="Search"
          clearable
        />
      </div>

      <el-table
        v-loading="loading"
        :data="filteredUsers"
        stripe
        style="width: 100%"
      >
        <el-table-column
          prop="name"
          label="用户名"
          width="200"
        >
          <template #default="scope">
            <div class="flex items-center">
              <div class="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                <span class="text-sm font-medium text-blue-800">{{ scope.row.name?.charAt(0) || 'U' }}</span>
              </div>
              <span>{{ scope.row.name || '-' }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column
          prop="email"
          label="电子邮件"
          width="250"
        />
        <el-table-column
          prop="role.name"
          label="角色"
          width="150"
        >
          <template #default="scope">
            <el-tag type="primary">{{ scope.row.role.name }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="createdAt"
          label="创建时间"
          width="200"
        >
          <template #default="scope">
            {{ formatDate(scope.row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column
          label="操作"
          width="180"
          fixed="right"
        >
          <template #default="scope">
            <el-button
              type="primary"
              size="small"
              :icon="Edit"
              @click.stop="editUser(scope.row)"
              class="mr-2"
            >
              编辑
            </el-button>
            <el-button
              type="danger"
              size="small"
              :icon="Delete"
              @click.stop="deleteUser(scope.row.id)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 空状态 -->
      <el-empty
        v-if="filteredUsers.length === 0"
        description="暂无用户数据"
      />

      <!-- 分页 -->
      <div v-if="filteredUsers.length > 0" class="mt-4 flex justify-center">
        <el-pagination
          background
          layout="prev, pager, next"
          :total="filteredUsers.length"
          :page-size="10"
          :current-page="currentPage"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 创建/编辑模态框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="showEditModal ? '编辑用户' : '添加新用户'"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="userFormRef"
        :model="currentUser"
        label-position="top"
      >
        <el-form-item
          label="用户名"
        >
          <el-input
            v-model="currentUser.name"
            placeholder="请输入用户名"
          />
        </el-form-item>
        
        <el-form-item
          label="电子邮件"
        >
          <el-input
            v-model="currentUser.email"
            type="email"
            placeholder="请输入电子邮件"
          />
        </el-form-item>
        
        <el-form-item
          v-if="!showEditModal"
          label="密码"
        >
          <el-input
            v-model="currentUser.password"
            type="password"
            placeholder="请输入密码（至少6位）"
            show-password
          />
        </el-form-item>
        
        <el-form-item
          label="角色"
        >
          <el-select
            v-model="currentUser.roleId"
            placeholder="请选择角色"
          >
            <el-option
              v-for="role in roles"
              :key="role.id"
              :label="role.name"
              :value="role.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="closeModal">取消</el-button>
          <el-button
            type="primary"
            @click="saveUser"
            :disabled="!currentUser.name || !currentUser.email || !currentUser.roleId || (!showEditModal && !currentUser.password)"
          >
            {{ showEditModal ? '更新' : '创建' }}
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import axios from '../utils/api'
import { 
  ElTable, 
  ElTableColumn, 
  ElButton, 
  ElInput, 
  ElDialog, 
  ElForm, 
  ElFormItem, 
  ElSelect, 
  ElOption, 
  ElPagination, 
  ElEmpty, 
  ElTag
} from 'element-plus'
import { 
  Plus, 
  Edit, 
  Delete, 
  Search
} from '@element-plus/icons-vue'

interface Role {
  id: string
  name: string
}

interface User {
  id: string
  email: string
  name: string | null
  roleId: string
  role: { name: string }
  createdAt: string
  updatedAt: string
}

const users = ref<User[]>([])
const roles = ref<Role[]>([])
const showCreateModal = ref(false)
const showEditModal = ref(false)
const searchQuery = ref('')
const loading = ref(false)
const currentPage = ref(1)
const userFormRef = ref()

const currentUser = ref<Partial<User>>({
})

// 计算属性：控制对话框显示
const dialogVisible = computed(() => {
  return showCreateModal.value || showEditModal.value
})

// 搜索过滤
const filteredUsers = computed(() => {
  if (!searchQuery.value) return users.value
  const query = searchQuery.value.toLowerCase()
  return users.value.filter(user => 
    (user.name?.toLowerCase().includes(query) || false) || 
    user.email.toLowerCase().includes(query)
  )
})

const fetchUsers = async () => {
  loading.value = true
  try {
    const response = await axios.get('/users')
    users.value = response.data
  } catch (error) {
    console.error('Error fetching users:', error)
    users.value = []
  } finally {
    loading.value = false
  }
}

const fetchRoles = async () => {
  try {
    const response = await axios.get('/roles')
    roles.value = response.data
  } catch (error) {
    console.error('Error fetching roles:', error)
    roles.value = []
  }
}

const createUser = async () => {
  try {
    await axios.post('/users', currentUser.value)
    closeModal()
    fetchUsers()
    resetCurrentUser()
  } catch (error) {
    console.error('Error creating user:', error)
    alert('创建用户失败，请重试')
  }
}

const updateUser = async () => {
  if (!currentUser.value.id) return

  try {
    await axios.put(`/users/${currentUser.value.id}`, currentUser.value)
    closeModal()
    fetchUsers()
    resetCurrentUser()
  } catch (error) {
    console.error('Error updating user:', error)
    alert('更新用户失败，请重试')
  }
}

const deleteUser = async (id: string) => {
  if (!confirm('确定要删除这个用户吗？')) return

  try {
    await axios.delete(`/users/${id}`)
    fetchUsers()
  } catch (error) {
    console.error('Error deleting user:', error)
    alert('删除用户失败，请重试')
  }
}

const editUser = (user: User) => {
  currentUser.value = { ...user }
  showEditModal.value = true
}

const saveUser = () => {
  if (showEditModal.value) {
    updateUser()
  } else {
    createUser()
  }
}

const closeModal = () => {
  showCreateModal.value = false
  showEditModal.value = false
  resetCurrentUser()
}

const resetCurrentUser = () => {
  currentUser.value = {
    name: '',
    email: '',
    password: '',
    roleId: ''
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

const handleCurrentChange = (val: number) => {
  currentPage.value = val
}

onMounted(async () => {
  await fetchRoles()
  await fetchUsers()
})
</script>