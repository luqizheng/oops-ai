<template>
  <div class="space-y-8 p-4">
    <!-- 页面标题和操作区域 -->
    <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-100 p-8 hover:shadow-md transition-all duration-300">
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-6">
        <div>
          <h2 class="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-500 dark:from-white dark:to-slate-400 tracking-tight">
            {{ isEditing ? '编辑需求' : '新增需求' }}
          </h2>
          <p class="text-sm text-slate-500 mt-1 font-medium">
            通过AI辅助分析，将原始需求拆解为结构化需求
          </p>
          <div v-if="projectName" class="mt-2">
            <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
              <el-icon class="mr-1"><Collection /></el-icon>
              项目：{{ projectName }}
            </span>
          </div>
        </div>
        <div class="flex items-center space-x-2 text-sm text-gray-400">
          <router-link to="/projects" class="hover:text-indigo-500 transition-colors">项目管理</router-link>
          <el-icon>
            <ArrowRight />
          </el-icon>
          <router-link v-if="projectName" :to="`/projects/${projectId}`" class="hover:text-indigo-500 transition-colors">{{ projectName }}</router-link>
          <el-icon v-if="projectName">
            <ArrowRight />
          </el-icon>
          <router-link to="/requirements" class="hover:text-indigo-500 transition-colors">需求中心</router-link>
          <el-icon>
            <ArrowRight />
          </el-icon>
          <span class="text-gray-900 font-bold">{{ isEditing ? '编辑需求' : '新增需求' }}</span>
        </div>
      </div>
    </div>

    <!-- 主内容区域 -->
    <div class="space-y-8">
      <!-- 原始需求输入区和AI分析结果预览区 -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- 左侧：原始需求输入区 -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200">
          <RequirementInputArea ref="inputAreaRef" @input="handleOriginalInput" @upload-audio="handleUploadAudio"
            @import-email="handleImportEmail" />
        </div>

        <!-- 右侧：AI分析结果预览区 -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200">
          <AIAnalysisPreview ref="analysisPreviewRef" :analysis-results="aiAnalysisResults" :questions="aiQuestions"
            @confirm="confirmAnalysis" @reanalyze="reanalyze" />
        </div>
      </div>

      <!-- 需求详细配置区 -->
      <RequirementList ref="requirementListRef" :requirements="decomposedRequirements"
        @update:requirements="handleRequirementsUpdate" @add-custom-requirement="addCustomRequirement"
        @edit="handleEditRequirement" @generate-test-cases="handleGenerateTestCases"
        @view-dependencies="handleViewDependencies" />

      <!-- 底部操作按钮 -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200">
        <div class="flex items-center justify-end gap-4 pt-4 border-t border-gray-100">
          <el-button @click="saveDraft" class="rounded-xl px-6">
            保存草稿
          </el-button>
          <el-button type="primary" @click="submitForReview" 
            class="rounded-xl px-8 bg-gradient-to-r from-indigo-500 to-purple-500 border-none shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all text-white font-medium">
            提交评审
          </el-button>
          <el-button @click="cancel" class="rounded-xl px-6">
            取消
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowRight, Collection } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import axios from '../utils/api'

// 导入子组件
import RequirementInputArea from './components/RequirementInputArea.vue'
import AIAnalysisPreview from './components/AIAnalysisPreview.vue'
import RequirementList from './components/RequirementList.vue'

interface Requirement {
  id: number
  title: string
  selected: boolean
  priority: 'high' | 'medium' | 'low'
  type: string
  acceptanceCriteria: string
  dependencies: string[]
}

const route = useRoute()
const router = useRouter()
const isEditing = computed(() => !!route.params.id)

// 项目名称
const projectName = ref('')
const projectId = ref('')

// 子组件引用
const inputAreaRef = ref<InstanceType<typeof RequirementInputArea>>()
const analysisPreviewRef = ref<InstanceType<typeof AIAnalysisPreview>>()
const requirementListRef = ref<InstanceType<typeof RequirementList>>()

// AI分析结果
const aiAnalysisResults = ref<string[]>([])

// AI追问
const aiQuestions = ref<string[]>([])

// 拆解后的需求列表
const decomposedRequirements = ref<Requirement[]>([])

// 处理原始需求输入
const handleOriginalInput = (value: string) => {
  // 这里可以添加防抖逻辑，避免频繁调用AI分析
  if (value.trim().length > 10) {
    // 调用AI分析
    analyzeRequirement()
  }
}

// 处理上传录音
const handleUploadAudio = () => {
  ElMessage.info('上传录音功能开发中...')
}

// 处理导入邮件
const handleImportEmail = () => {
  ElMessage.info('导入邮件功能开发中...')
}

// AI分析需求
const analyzeRequirement = async () => {
  if (!inputAreaRef.value) {
    ElMessage.warning('请输入需求内容')
    return
  }

  const requirementText = inputAreaRef.value.getValue()
  if (!requirementText.trim()) {
    ElMessage.warning('请输入需求内容')
    return
  }

  try {
    ElMessage.info('AI分析中，请稍候...')
    
    const response = await axios.post('/requirements/analyze/requirement', {
      requirementText: requirementText
    })

    aiAnalysisResults.value = response.data.analysisResults || []
    aiQuestions.value = response.data.questions || []

    // 更新子组件
    if (analysisPreviewRef.value) {
      analysisPreviewRef.value.setAnalysisResults(aiAnalysisResults.value)
      analysisPreviewRef.value.setQuestions(aiQuestions.value)
    }

    ElMessage.success('AI分析完成')
  } catch (error) {
    console.error('AI分析失败:', error)
    ElMessage.error('AI分析失败，请重试')
    
    // 失败时使用模拟数据作为fallback
    const mockResults = [
      '登录速度优化',
      '微信登录支持',
      '忘记密码找回',
      '登录失败锁定'
    ]

    const mockQuestions = [
      '"更快"具体指多少秒？',
      '需要支持哪些登录方式？'
    ]

    aiAnalysisResults.value = mockResults
    aiQuestions.value = mockQuestions

    if (analysisPreviewRef.value) {
      analysisPreviewRef.value.setAnalysisResults(mockResults)
      analysisPreviewRef.value.setQuestions(mockQuestions)
    }
  }
}

// 确认分析结果
const confirmAnalysis = () => {
  // 将AI分析结果转换为拆解后的需求
  const newRequirements: Requirement[] = aiAnalysisResults.value.map((item, index) => ({
    id: index + 1,
    title: `需求${index + 1}: ${item}`,
    selected: true,
    priority: (index === 0 || index === 3 ? 'high' : 'medium') as 'high' | 'medium' | 'low',
    type: getTypeFromAnalysis(item),
    acceptanceCriteria: getAcceptanceCriteria(item),
    dependencies: []
  }))

  decomposedRequirements.value = newRequirements
  ElMessage.success('需求拆分确认成功')
}

// 重新分析
const reanalyze = () => {
  analyzeRequirement()
}

// 处理需求列表更新
const handleRequirementsUpdate = (requirements: any[]) => {
  decomposedRequirements.value = requirements
}

// 处理编辑需求
const handleEditRequirement = (id: number) => {
  const requirement = decomposedRequirements.value.find(req => req.id === id)
  if (requirement) {
    ElMessage.info(`编辑需求: ${requirement.title}`)
    // 这里应该打开编辑对话框
  }
}

// 处理生成测试用例
const handleGenerateTestCases = (id: number) => {
  const requirement = decomposedRequirements.value.find(req => req.id === id)
  if (requirement) {
    ElMessage.success(`正在为"${requirement.title}"生成测试用例...`)
    // 这里应该调用后端API生成测试用例
  }
}

// 处理查看依赖
const handleViewDependencies = (id: number) => {
  const requirement = decomposedRequirements.value.find(req => req.id === id)
  if (requirement) {
    ElMessage.info(`查看"${requirement.title}"的依赖关系`)
    // 这里应该打开依赖关系对话框
  }
}

// 添加自定义需求
const addCustomRequirement = () => {
  const newId = decomposedRequirements.value.length > 0
    ? Math.max(...decomposedRequirements.value.map(r => r.id)) + 1
    : 1

  decomposedRequirements.value.push({
    id: newId,
    title: `需求${newId}: 自定义需求`,
    selected: true,
    priority: 'medium' as 'high' | 'medium' | 'low',
    type: 'custom',
    acceptanceCriteria: '请填写验收标准',
    dependencies: []
  })

  ElMessage.success('已添加自定义需求')
}

// 保存草稿
const saveDraft = async () => {
  if (!inputAreaRef.value) {
    ElMessage.warning('请输入需求内容')
    return
  }

  const requirementText = inputAreaRef.value.getValue()
  if (!requirementText.trim()) {
    ElMessage.warning('请输入需求内容')
    return
  }

  try {
    ElMessage.info('正在保存草稿...')
    
    // 创建草稿数据
    const draftData = {
      title: requirementText.substring(0, 100),
      description: requirementText,
      rawInput: requirementText,
      projectId: projectId.value || undefined,
      status: 'draft',
      priority: 'medium',
      structuredData: {
        decomposedRequirements: decomposedRequirements.value,
        aiAnalysisResults: aiAnalysisResults.value,
        aiQuestions: aiQuestions.value
      }
    }

    // 调用后端API保存草稿
    await axios.post('/requirements', draftData)
    
    ElMessage.success('草稿保存成功')
  } catch (error) {
    console.error('保存草稿失败:', error)
    ElMessage.error('保存草稿失败，请重试')
  }
}

// 提交评审
const submitForReview = async () => {
  const selectedRequirements = decomposedRequirements.value.filter(req => req.selected)
  if (selectedRequirements.length === 0) {
    ElMessage.warning('请至少选择一个需求')
    return
  }

  if (!inputAreaRef.value) {
    ElMessage.warning('请输入需求内容')
    return
  }

  const requirementText = inputAreaRef.value.getValue()
  if (!requirementText.trim()) {
    ElMessage.warning('请输入需求内容')
    return
  }

  try {
    ElMessage.info('正在提交需求...')
    
    // 创建需求数据
    const requirementData = {
      title: requirementText.substring(0, 100), // 取前100个字符作为标题
      description: requirementText,
      rawInput: requirementText,
      projectId: projectId.value || undefined,
      status: 'reviewing',
      priority: 'medium',
      storyPoints: selectedRequirements.length * 2, // 简单的故事点估算
      structuredData: {
        decomposedRequirements: selectedRequirements,
        aiAnalysisResults: aiAnalysisResults.value,
        aiQuestions: aiQuestions.value
      }
    }

    // 调用后端API创建需求
    const response = await axios.post('/requirements', requirementData)
    
    ElMessage.success(`已成功提交${selectedRequirements.length}个需求进行评审`)
    
    // 跳转到需求详情页
    if (response.data.id) {
      router.push(`/requirements/${response.data.id}`)
    }
  } catch (error) {
    console.error('提交需求失败:', error)
    ElMessage.error('提交需求失败，请重试')
  }
}

// 取消
const cancel = () => {
  router.back()
}

// 辅助函数：根据分析结果获取需求类型
const getTypeFromAnalysis = (item: string): string => {
  const typeMap: Record<string, string> = {
    '登录速度优化': 'non-functional-performance',
    '微信登录支持': 'functional-authentication',
    '忘记密码找回': 'functional-account-management',
    '登录失败锁定': 'security'
  }
  return typeMap[item] || 'custom'
}

// 辅助函数：根据分析结果获取验收标准
const getAcceptanceCriteria = (item: string): string => {
  const criteriaMap: Record<string, string> = {
    '登录速度优化': '95%请求<2秒，99%<3秒',
    '微信登录支持': '支持微信扫码、授权获取用户信息',
    '忘记密码找回': '手机验证码重置、邮件重置链接',
    '登录失败锁定': '5次失败锁定15分钟、通知用户'
  }
  return criteriaMap[item] || '请填写验收标准'
}

onMounted(() => {
  // 初始化时加载项目信息
  loadProjectInfo()
  
  // 如果是新增需求，设置示例文本
  if (!isEditing.value) {
    // 设置原始需求输入
    if (inputAreaRef.value) {
      inputAreaRef.value.setValue('我希望系统登录体验更好，要快一点，还要安全，最好能支持微信登录，忘记密码也要能方便找回')
    }
  }
})

// 加载项目信息
const loadProjectInfo = async () => {
  // 从URL参数或localStorage获取项目ID
  const urlParams = new URLSearchParams(window.location.search)
  const projectIdFromUrl = urlParams.get('projectId')
  
  if (projectIdFromUrl) {
    projectId.value = projectIdFromUrl
    try {
      const response = await axios.get(`/projects/${projectIdFromUrl}`)
      projectName.value = response.data.name || '未命名项目'
    } catch (error) {
      console.error('加载项目信息失败:', error)
      projectName.value = '项目加载失败'
    }
  } else {
    // 尝试从localStorage获取最近的项目
    const recentProject = localStorage.getItem('recentProject')
    if (recentProject) {
      try {
        const project = JSON.parse(recentProject)
        projectId.value = project.id
        projectName.value = project.name
      } catch (error) {
        console.error('解析最近项目失败:', error)
      }
    }
  }
}



</script>