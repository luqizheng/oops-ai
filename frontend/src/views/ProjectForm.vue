<template>
  <div class="space-y-8 p-4 max-w-4xl mx-auto">
    <!-- 面包屑导航 -->
    <div class="flex items-center space-x-2 text-sm text-gray-400 mb-4 px-2">
      <router-link to="/projects" class="hover:text-indigo-500 transition-colors">项目管理</router-link>
      <el-icon><ArrowRight /></el-icon>
      <span class="text-gray-900 font-bold">{{ isEditing ? '编辑项目' : '新建项目' }}</span>
    </div>

    <div class="bg-white/80 backdrop-blur-md rounded-2xl shadow-sm border border-gray-100 p-8">
      <div class="flex items-center space-x-3 mb-8">
        <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-100">
          <el-icon size="24" color="white"><Collection /></el-icon>
        </div>
        <div>
          <h2 class="text-2xl font-black text-gray-900 tracking-tight">{{ isEditing ? '编辑项目' : '创建新项目' }}</h2>
          <p class="text-sm text-gray-500">完善项目信息以开启协作</p>
        </div>
      </div>

      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-position="top"
        class="space-y-6"
      >
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <el-form-item label="项目名称" prop="name">
            <el-input
              v-model="form.name"
              placeholder="例如：智能供应链系统"
              size="large"
              class="modern-input"
            />
          </el-form-item>

          <el-form-item label="项目关键字" prop="key">
            <el-input
              v-model="form.key"
              placeholder="例如：SCM"
              size="large"
              class="modern-input"
              :disabled="isEditing"
            />
          </el-form-item>
        </div>

        <el-form-item label="项目描述" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="4"
            placeholder="简要描述项目的目标和背景..."
            class="modern-input"
          />
        </el-form-item>

        <div class="pt-8 border-t border-gray-50 flex items-center justify-end gap-4">
          <el-button @click="router.back()" class="!rounded-xl px-8 !h-11 !font-bold">
            取消
          </el-button>
          <el-button
            type="primary"
            :loading="submitting"
            @click="handleSubmit"
            class="!rounded-xl px-10 !h-11 !font-bold bg-gradient-to-r from-indigo-600 to-purple-600 border-none shadow-lg shadow-indigo-100"
          >
            {{ isEditing ? '保存修改' : '立即创建' }}
          </el-button>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowRight, Collection } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import axios from '../utils/api'

const route = useRoute()
const router = useRouter()
const formRef = ref()
const submitting = ref(false)

const isEditing = computed(() => !!route.params.id)

const form = ref({
  name: '',
  key: '',
  description: ''
})

const rules = {
  name: [{ required: true, message: '请输入项目名称', trigger: 'blur' }],
  key: [
    { required: true, message: '请输入项目关键字', trigger: 'blur' },
    { min: 2, max: 10, message: '长度在 2 到 10 个字符', trigger: 'blur' }
  ]
}

const fetchProject = async (id: string) => {
  try {
    const response = await axios.get(`/projects/${id}`)
    const { name, key, description } = response.data
    form.value = { name, key, description: description || '' }
  } catch (error) {
    console.error('Failed to fetch project:', error)
    ElMessage.error('获取项目详情失败')
    router.push('/projects')
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid: boolean) => {
    if (valid) {
      submitting.value = true
      try {
        if (isEditing.value) {
          await axios.put(`/projects/${route.params.id}`, form.value)
          ElMessage.success('项目更新成功')
        } else {
          await axios.post('/projects', form.value)
          ElMessage.success('项目创建成功')
        }
        router.push('/projects')
      } catch (error: any) {
        console.error('Submit failed:', error)
        ElMessage.error(error.response?.data?.message || '操作失败，请重试')
      } finally {
        submitting.value = false
      }
    }
  })
}

onMounted(() => {
  if (isEditing.value) {
    fetchProject(route.params.id as string)
  }
})
</script>

<style scoped>
:deep(.modern-input .el-input__wrapper),
:deep(.modern-input .el-textarea__inner) {
  @apply !rounded-xl !shadow-none !border-gray-200 !bg-gray-50/50 !p-3 focus:!bg-white focus:!border-indigo-500 focus:!ring-4 focus:!ring-indigo-500/10 transition-all duration-300;
}

:deep(.el-form-item__label) {
  @apply !text-gray-700 !font-bold !pb-2;
}
</style>
