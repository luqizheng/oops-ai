<template>
  <div class="space-y-6">
    <!-- 面包屑和顶部区域 -->
    <div class="flex items-center space-x-4 mb-2">
      <el-button
        @click="goBack"
        :icon="Back"
        circle
        class="border-gray-200 hover:border-indigo-300 hover:text-indigo-600 shadow-sm"
      />
      <div>
        <el-breadcrumb separator="/">
          <el-breadcrumb-item :to="{ path: '/users' }">用户管理</el-breadcrumb-item>
          <el-breadcrumb-item>{{ isEditing ? '编辑用户' : '新建用户' }}</el-breadcrumb-item>
        </el-breadcrumb>
        <h2 class="text-2xl font-bold text-gray-900 mt-2">
          {{ isEditing ? '编辑用户' : '创建新用户' }}
        </h2>
      </div>
    </div>

    <!-- 表单卡片 -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
      <div v-if="loading" class="py-12 flex justify-center">
        <el-icon class="is-loading text-4xl text-indigo-500"><Loading /></el-icon>
      </div>
      
      <el-form
        v-else
        ref="userFormRef"
        :model="user"
        :rules="rules"
        label-position="top"
        class="max-w-2xl"
      >
        <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
          <!-- 用户名 -->
          <el-form-item label="用户名" prop="name" class="md:col-span-1">
            <el-input
              v-model="user.name"
              placeholder="请输入用户名"
              size="large"
              class="rounded-lg shadow-sm"
            >
              <template #prefix>
                <el-icon><User /></el-icon>
              </template>
            </el-input>
          </el-form-item>

          <!-- 电子邮件 -->
          <el-form-item label="电子邮件" prop="email" class="md:col-span-1">
            <el-input
              v-model="user.email"
              type="email"
              placeholder="如: user@example.com"
              size="large"
              class="rounded-lg shadow-sm"
            >
              <template #prefix>
                <el-icon><Message /></el-icon>
              </template>
            </el-input>
          </el-form-item>

          <!-- 密码 (仅新建时必填) -->
          <el-form-item 
            :label="isEditing ? '新密码 (留空则不修改)' : '密码'" 
            prop="password" 
            class="md:col-span-2"
          >
            <el-input
              v-model="user.password"
              type="password"
              placeholder="请输入至少6位密码"
              show-password
              size="large"
              class="rounded-lg shadow-sm"
            >
              <template #prefix>
                <el-icon><Lock /></el-icon>
              </template>
            </el-input>
          </el-form-item>

          <!-- 角色选择 -->
          <el-form-item label="分配角色" prop="roleId" class="md:col-span-2">
            <el-select
              v-model="user.roleId"
              placeholder="请选择相应的系统角色"
              size="large"
              class="rounded-lg shadow-sm w-full"
            >
              <el-option
                v-for="role in roles"
                :key="role.id"
                :label="role.name"
                :value="role.id"
              >
                <div class="flex items-center justify-between">
                  <span>{{ role.name }}</span>
                  <span class="text-xs text-gray-400">{{ role.description }}</span>
                </div>
              </el-option>
            </el-select>
          </el-form-item>
        </div>

        <div class="mt-8 pt-6 border-t border-gray-100 flex justify-end space-x-4">
          <el-button 
            @click="goBack" 
            size="large"
            class="rounded-xl px-6"
          >
            取消
          </el-button>
          <el-button
            type="primary"
            @click="handleSubmit"
            :loading="submitting"
            size="large"
            class="rounded-xl px-8 bg-gradient-to-r from-indigo-500 to-purple-500 border-none shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all text-white font-medium"
          >
            {{ isEditing ? '保存修改' : '确认创建' }}
          </el-button>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import axios from '../utils/api'
import {
  Back,
  User,
  Message,
  Lock,
  Loading
} from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()

const isEditing = computed(() => route.path.includes('/edit'))
const userId = computed(() => route.params.id as string)

const userFormRef = ref<FormInstance>()
const loading = ref(false)
const submitting = ref(false)
const roles = ref<any[]>([])

const user = ref({
  name: '',
  email: '',
  password: '',
  roleId: ''
})

const rules = computed<FormRules>(() => ({
  name: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur', 'change'] }
  ],
  password: [
    { required: !isEditing.value, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能小于6位', trigger: 'blur' }
  ],
  roleId: [
    { required: true, message: '请选择角色', trigger: 'change' }
  ]
}))

const fetchRoles = async () => {
  try {
    const response = await axios.get('/roles')
    roles.value = response.data
  } catch (error) {
    ElMessage.error('获取角色列表失败')
  }
}

const fetchUser = async () => {
  if (!isEditing.value) return
  
  loading.value = true
  try {
    const response = await axios.get(`/users/${userId.value}`)
    const data = response.data
    user.value = {
      name: data.name || '',
      email: data.email || '',
      password: '', // 编辑时不显示原密码
      roleId: data.roleId || ''
    }
  } catch (error) {
    ElMessage.error('获取用户信息失败')
    goBack()
  } finally {
    loading.value = false
  }
}

const goBack = () => {
  router.push('/users')
}

const handleSubmit = async () => {
  if (!userFormRef.value) return
  
  await userFormRef.value.validate(async (valid) => {
    if (valid) {
      submitting.value = true
      try {
        if (isEditing.value) {
          // 编辑时如果密码为空则剔除密码字段
          const payload = { ...user.value }
          if (!payload.password) {
            delete payload.password
          }
          await axios.put(`/users/${userId.value}`, payload)
          ElMessage.success('用户更新成功')
        } else {
          await axios.post('/users', user.value)
          ElMessage.success('用户创建成功')
        }
        goBack()
      } catch (error: any) {
        const msg = error.response?.data?.message || error.response?.data?.error || '操作失败'
        ElMessage.error(msg)
      } finally {
        submitting.value = false
      }
    }
  })
}

onMounted(async () => {
  await fetchRoles()
  await fetchUser()
})
</script>
