<template>
  <div class="space-y-8 p-4 max-w-4xl mx-auto">
    <!-- 面包屑导航 -->
    <div class="flex items-center space-x-2 text-sm text-gray-400 mb-4 px-2">
      <router-link to="/requirements" class="hover:text-indigo-500 transition-colors">需求中心</router-link>
      <el-icon><ArrowRight /></el-icon>
      <span class="text-gray-900 font-bold">{{ isEditing ? '编辑需求' : '录入新需求' }}</span>
    </div>

    <div class="bg-white/80 backdrop-blur-md rounded-2xl shadow-sm border border-gray-100 p-8">
      <div class="flex items-center space-x-3 mb-8">
        <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-100">
          <el-icon size="24" color="white"><DocumentAdd /></el-icon>
        </div>
        <div>
          <h2 class="text-2xl font-black text-gray-900 tracking-tight">{{ isEditing ? '编辑需求内容' : '开启新的需求分析' }}</h2>
          <p class="text-sm text-gray-500">通过结构化录入提升需求的清晰度</p>
        </div>
      </div>

      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-position="top"
        class="space-y-6"
      >
        <el-form-item label="需求标题" prop="title">
          <el-input
            v-model="form.title"
            placeholder="简明扼要地描述需求，例如：移动端登录支持生物识别"
            size="large"
            class="modern-input"
          />
        </el-form-item>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <el-form-item label="所属项目" prop="projectId">
            <el-select
              v-model="form.projectId"
              placeholder="请选择关联项目"
              size="large"
              class="w-full modern-input"
            >
              <el-option
                v-for="project in projects"
                :key="project.id"
                :label="project.name"
                :value="project.id"
              />
            </el-select>
          </el-form-item>

          <el-form-item label="需求类型" prop="requirementType">
            <el-select
              v-model="form.requirementType"
              placeholder="请选择类型"
              size="large"
              class="w-full modern-input"
            >
              <el-option label="功能需求" value="functional" />
              <el-option label="非功能需求" value="non-functional" />
              <el-option label="技术改进" value="technical" />
              <el-option label="缺陷修复" value="bug" />
            </el-select>
          </el-form-item>
        </div>

        <el-form-item label="需求描述" prop="requirementContent">
          <el-input
            v-model="form.requirementContent"
            type="textarea"
            :rows="8"
            placeholder="请详细描述具体的业务逻辑、交互细节和期望结果..."
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
            {{ isEditing ? '保存更新' : '提交分析' }}
          </el-button>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowRight, DocumentAdd } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import axios from '../utils/api'

const route = useRoute()
const router = useRouter()
const formRef = ref()
const submitting = ref(false)
const projects = ref<any[]>([])

const isEditing = computed(() => !!route.params.id)

const form = ref({
  title: '',
  projectId: '',
  requirementType: 'functional',
  requirementContent: ''
})

const rules = {
  title: [{ required: true, message: '请输入需求标题', trigger: 'blur' }],
  projectId: [{ required: true, message: '请选择所属项目', trigger: 'change' }],
  requirementContent: [{ required: true, message: '请输入需求内容', trigger: 'blur' }]
}

const fetchProjects = async () => {
  try {
    const response = await axios.get('/projects')
    projects.value = response.data
  } catch (error) {
    console.error('Failed to fetch projects:', error)
  }
}

const fetchRequirement = async (id: string) => {
  try {
    const response = await axios.get(`/requirements/${id}`)
    const { title, projectId, requirementType, requirementContent } = response.data
    form.value = { title, projectId, requirementType, requirementContent }
  } catch (error) {
    console.error('Failed to fetch requirement:', error)
    ElMessage.error('获取需求详情失败')
    router.push('/requirements')
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid: boolean) => {
    if (valid) {
      submitting.value = true
      try {
        if (isEditing.value) {
          await axios.put(`/requirements/${route.params.id}`, form.value)
          ElMessage.success('需求更新成功')
        } else {
          await axios.post('/requirements', form.value)
          ElMessage.success('需求录入成功')
        }
        router.push('/requirements')
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
  fetchProjects()
  if (isEditing.value) {
    fetchRequirement(route.params.id as string)
  }
})
</script>

<style scoped>
:deep(.modern-input .el-input__wrapper),
:deep(.modern-input .el-textarea__inner),
:deep(.modern-input .el-select__wrapper) {
  @apply !rounded-xl !shadow-none !border-gray-200 !bg-gray-50/50 !p-3 focus:!bg-white focus:!border-indigo-500 focus:!ring-4 focus:!ring-indigo-500/10 transition-all duration-300;
}

:deep(.el-form-item__label) {
  @apply !text-gray-700 !font-bold !pb-2;
}
</style>
