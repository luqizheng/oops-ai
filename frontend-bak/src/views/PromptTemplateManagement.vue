<template>
  <div class="prompt-template-management">
    <el-card class="header-card">
      <div class="header-content">
        <h2>提示词模板管理</h2>
        <div class="header-actions">
          <el-button type="primary" @click="handleCreate">
            <el-icon><Plus /></el-icon>
            新建模板
          </el-button>
          <el-button @click="refreshTemplates">
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>
        </div>
      </div>
    </el-card>

    <el-card class="filter-card">
      <div class="filter-content">
        <el-form :inline="true" :model="filterForm">
          <el-form-item label="类别">
            <el-select v-model="filterForm.category" placeholder="选择类别" clearable>
              <el-option label="原始需求转需求" value="raw-to-requirement" />
              <el-option label="需求转用户故事" value="requirement-to-story" />
              <el-option label="用户故事转用例" value="story-to-use-case" />
              <el-option label="生成验收标准" value="generate-acceptance" />
              <el-option label="识别模糊词汇" value="identify-ambiguity" />
              <el-option label="生成追问" value="generate-questions" />
              <el-option label="质量评估" value="quality-assessment" />
            </el-select>
          </el-form-item>
          <el-form-item label="提供商">
            <el-select v-model="filterForm.provider" placeholder="选择提供商" clearable>
              <el-option label="通用" value="" />
              <el-option label="OpenAI" value="openai" />
              <el-option label="DeepSeek" value="deepseek" />
              <el-option label="Ollama" value="ollama" />
              <el-option label="Qwen" value="qwen" />
            </el-select>
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="filterForm.isActive" placeholder="选择状态" clearable>
              <el-option label="启用" :value="true" />
              <el-option label="禁用" :value="false" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleFilter">筛选</el-button>
            <el-button @click="resetFilter">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-card>

    <el-card class="content-card">
      <el-table :data="filteredTemplates" v-loading="loading" style="width: 100%">
        <el-table-column prop="name" label="模板名称" width="200" />
        <el-table-column prop="description" label="描述" width="300" />
        <el-table-column prop="category" label="类别" width="150">
          <template #default="{ row }">
            <el-tag :type="getCategoryTagType(row.category)">
              {{ getCategoryLabel(row.category) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="provider" label="提供商" width="120">
          <template #default="{ row }">
            <el-tag v-if="row.provider" :type="getProviderTagType(row.provider)">
              {{ getProviderLabel(row.provider) }}
            </el-tag>
            <span v-else>通用</span>
          </template>
        </el-table-column>
        <el-table-column prop="modelName" label="模型" width="150">
          <template #default="{ row }">
            {{ row.modelName || '通用' }}
          </template>
        </el-table-column>
        <el-table-column prop="isDefault" label="默认" width="80">
          <template #default="{ row }">
            <el-tag v-if="row.isDefault" type="success">是</el-tag>
            <el-tag v-else type="info">否</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="isActive" label="状态" width="80">
          <template #default="{ row }">
            <el-tag v-if="row.isActive" type="success">启用</el-tag>
            <el-tag v-else type="danger">禁用</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="250" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button size="small" @click="handlePreview(row)">预览</el-button>
            <el-button v-if="!row.isDefault" size="small" type="primary" @click="handleSetDefault(row)">
              设默认
            </el-button>
            <el-button size="small" type="danger" @click="handleDelete(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 创建/编辑对话框 -->
    <el-dialog
      v-model="showEditDialog"
      :title="editDialogTitle"
      width="800px"
      @close="handleDialogClose"
    >
      <el-form ref="editFormRef" :model="editForm" :rules="editRules" label-width="120px">
        <el-form-item label="模板名称" prop="name">
          <el-input v-model="editForm.name" placeholder="请输入模板名称" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input
            v-model="editForm.description"
            type="textarea"
            :rows="2"
            placeholder="请输入模板描述"
          />
        </el-form-item>
        <el-form-item label="类别" prop="category">
          <el-select v-model="editForm.category" placeholder="请选择类别">
            <el-option label="原始需求转需求" value="raw-to-requirement" />
            <el-option label="需求转用户故事" value="requirement-to-story" />
            <el-option label="用户故事转用例" value="story-to-use-case" />
            <el-option label="生成验收标准" value="generate-acceptance" />
            <el-option label="识别模糊词汇" value="identify-ambiguity" />
            <el-option label="生成追问" value="generate-questions" />
            <el-option label="质量评估" value="quality-assessment" />
          </el-select>
        </el-form-item>
        <el-form-item label="提供商" prop="provider">
          <el-select v-model="editForm.provider" placeholder="请选择提供商" clearable>
            <el-option label="通用" value="" />
            <el-option label="OpenAI" value="openai" />
            <el-option label="DeepSeek" value="deepseek" />
            <el-option label="Ollama" value="ollama" />
            <el-option label="Qwen" value="qwen" />
          </el-select>
        </el-form-item>
        <el-form-item label="模型名称" prop="modelName">
          <el-input
            v-model="editForm.modelName"
            placeholder="请输入模型名称（可选）"
            clearable
          />
        </el-form-item>
        <el-form-item label="模板内容" prop="template">
          <el-input
            v-model="editForm.template"
            type="textarea"
            :rows="8"
            placeholder="请输入模板内容，使用 {{变量名}} 格式定义变量"
            @input="extractVariables"
          />
        </el-form-item>
        <el-form-item label="变量列表" prop="variables">
          <el-select
            v-model="editForm.variables"
            multiple
            filterable
            allow-create
            placeholder="请输入变量名称，按回车添加"
            style="width: 100%"
          />
          <div class="variable-tips">
            <span>已检测到变量: {{ detectedVariables.join(', ') || '无' }}</span>
            <el-button v-if="detectedVariables.length > 0" size="small" type="text" @click="applyDetectedVariables">
              应用检测到的变量
            </el-button>
          </div>
        </el-form-item>
        <el-form-item label="默认模板" prop="isDefault">
          <el-switch v-model="editForm.isDefault" />
          <span class="form-tip">设置为默认模板后，同类别同配置的其他模板将取消默认状态</span>
        </el-form-item>
        <el-form-item label="启用状态" prop="isActive">
          <el-switch v-model="editForm.isActive" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showEditDialog = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit" :loading="submitting">
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 预览对话框 -->
    <el-dialog v-model="showPreviewDialog" title="模板预览" width="800px">
      <div v-if="previewTemplate">
        <div class="preview-header">
          <h3>{{ previewTemplate.name }}</h3>
          <div class="preview-meta">
            <el-tag :type="getCategoryTagType(previewTemplate.category)">
              {{ getCategoryLabel(previewTemplate.category) }}
            </el-tag>
            <el-tag v-if="previewTemplate.provider" :type="getProviderTagType(previewTemplate.provider)">
              {{ getProviderLabel(previewTemplate.provider) }}
            </el-tag>
            <el-tag v-if="previewTemplate.modelName">{{ previewTemplate.modelName }}</el-tag>
          </div>
        </div>
        <div class="preview-description">
          <p>{{ previewTemplate.description }}</p>
        </div>
        <div class="preview-variables">
          <h4>变量列表</h4>
          <div class="variables-list">
            <el-tag
              v-for="variable in previewTemplate.variables"
              :key="variable"
              class="variable-tag"
            >
              {{ variable }}
            </el-tag>
          </div>
        </div>
        <div class="preview-content">
          <h4>模板内容</h4>
          <pre class="template-content">{{ previewTemplate.template }}</pre>
        </div>
        <div class="preview-test">
          <h4>测试渲染</h4>
          <el-form :inline="true" :model="testForm">
            <div v-for="variable in previewTemplate.variables" :key="variable" class="test-input">
              <el-form-item :label="variable">
                <el-input
                  v-model="testForm[variable]"
                  :placeholder="`请输入 ${variable}`"
                  style="width: 200px"
                />
              </el-form-item>
            </div>
          </el-form>
          <el-button type="primary" @click="handleTestRender" :loading="testing">
            测试渲染
          </el-button>
          <div v-if="testResult" class="test-result">
            <h5>渲染结果</h5>
            <pre class="rendered-content">{{ testResult }}</pre>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { Plus, Refresh } from '@element-plus/icons-vue'
import api from '@/utils/api'

interface PromptTemplate {
  id: string
  name: string
  description: string
  template: string
  category: string
  provider: string | null
  modelName: string | null
  isDefault: boolean
  isActive: boolean
  variables: string[]
  createdAt: string
  updatedAt: string
}

interface FilterForm {
  category: string
  provider: string
  isActive: boolean | null
}

interface EditForm {
  id?: string
  name: string
  description: string
  template: string
  category: string
  provider: string
  modelName: string
  isDefault: boolean
  isActive: boolean
  variables: string[]
}

interface TestForm {
  [key: string]: string
}

// 响应式数据
const loading = ref(false)
const templates = ref<PromptTemplate[]>([])
const filterForm = ref<FilterForm>({
  category: '',
  provider: '',
  isActive: null,
})
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 对话框相关
const showEditDialog = ref(false)
const showPreviewDialog = ref(false)
const submitting = ref(false)
const testing = ref(false)

// 表单相关
const editFormRef = ref<FormInstance>()
const editForm = ref<EditForm>({
  name: '',
  description: '',
  template: '',
  category: '',
  provider: '',
  modelName: '',
  isDefault: false,
  isActive: true,
  variables: [],
})
const previewTemplate = ref<PromptTemplate | null>(null)
const testForm = ref<TestForm>({})
const testResult = ref('')
const detectedVariables = ref<string[]>([])

// 表单验证规则
const editRules: FormRules = {
  name: [
    { required: true, message: '请输入模板名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' },
  ],
  description: [
    { required: true, message: '请输入模板描述', trigger: 'blur' },
    { max: 500, message: '描述不能超过 500 个字符', trigger: 'blur' },
  ],
  category: [
    { required: true, message: '请选择类别', trigger: 'change' },
  ],
  template: [
    { required: true, message: '请输入模板内容', trigger: 'blur' },
  ],
}

// 计算属性
const filteredTemplates = computed(() => {
  let filtered = templates.value

  if (filterForm.value.category) {
    filtered = filtered.filter(t => t.category === filterForm.value.category)
  }

  if (filterForm.value.provider) {
    if (filterForm.value.provider === '') {
      filtered = filtered.filter(t => !t.provider)
    } else {
      filtered = filtered.filter(t => t.provider === filterForm.value.provider)
    }
  }

  if (filterForm.value.isActive !== null) {
    filtered = filtered.filter(t => t.isActive === filterForm.value.isActive)
  }

  total.value = filtered.length
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filtered.slice(start, end)
})

const editDialogTitle = computed(() => {
  return editForm.value.id ? '编辑模板' : '新建模板'
})

// 类别标签类型和标签
const getCategoryTagType = (category: string) => {
  const types: Record<string, string> = {
    'raw-to-requirement': 'primary',
    'requirement-to-story': 'success',
    'story-to-use-case': 'warning',
    'generate-acceptance': 'info',
    'identify-ambiguity': 'danger',
    'generate-questions': '',
    'quality-assessment': 'success',
  }
  return types[category] || ''
}

const getCategoryLabel = (category: string) => {
  const labels: Record<string, string> = {
    'raw-to-requirement': '原始需求转需求',
    'requirement-to-story': '需求转用户故事',
    'story-to-use-case': '用户故事转用例',
    'generate-acceptance': '生成验收标准',
    'identify-ambiguity': '识别模糊词汇',
    'generate-questions': '生成追问',
    'quality-assessment': '质量评估',
  }
  return labels[category] || category
}

// 提供商标签类型和标签
const getProviderTagType = (provider: string) => {
  const types: Record<string, string> = {
    'openai': 'success',
    'deepseek': 'primary',
    'ollama': 'warning',
    'qwen': 'danger',
  }
  return types[provider] || ''
}

const getProviderLabel = (provider: string) => {
  const labels: Record<string, string> = {
    'openai': 'OpenAI',
    'deepseek': 'DeepSeek',
    'ollama': 'Ollama',
    'qwen': 'Qwen',
  }
  return labels[provider] || provider
}

// 日期格式化
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN')
}

// 方法
const fetchTemplates = async () => {
  loading.value = true
  try {
    const response = await api.get('/prompt-templates')
    templates.value = response.data
  } catch (error) {
    console.error('获取模板失败:', error)
    ElMessage.error('获取模板失败')
  } finally {
    loading.value = false
  }
}

const refreshTemplates = () => {
  currentPage.value = 1
  fetchTemplates()
}

const handleFilter = () => {
  currentPage.value = 1
}

const resetFilter = () => {
  filterForm.value = {
    category: '',
    provider: '',
    isActive: null,
  }
  currentPage.value = 1
}

const handleSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1
}

const handleCurrentChange = (page: number) => {
  currentPage.value = page
}

const handleCreate = () => {
  editForm.value = {
    name: '',
    description: '',
    template: '',
    category: '',
    provider: '',
    modelName: '',
    isDefault: false,
    isActive: true,
    variables: [],
  }
  showEditDialog.value = true
}

const handleEdit = (template: PromptTemplate) => {
  editForm.value = {
    id: template.id,
    name: template.name,
    description: template.description,
    template: template.template,
    category: template.category,
    provider: template.provider || '',
    modelName: template.modelName || '',
    isDefault: template.isDefault,
    isActive: template.isActive,
    variables: [...template.variables],
  }
  showEditDialog.value = true
}

const handlePreview = (template: PromptTemplate) => {
  previewTemplate.value = template
  testForm.value = {}
  testResult.value = ''
  showPreviewDialog.value = true
}

const handleSetDefault = async (template: PromptTemplate) => {
  try {
    await ElMessageBox.confirm(
      `确定要将模板 "${template.name}" 设置为默认模板吗？`,
      '确认设置默认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'info',
      }
    )

    await api.put(`/prompt-templates/${template.id}/default`)
    ElMessage.success('设置默认模板成功')
    refreshTemplates()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('设置默认模板失败:', error)
      ElMessage.error('设置默认模板失败')
    }
  }
}

const handleDelete = async (template: PromptTemplate) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除模板 "${template.name}" 吗？`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )

    await api.delete(`/prompt-templates/${template.id}`)
    ElMessage.success('删除成功')
    refreshTemplates()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

const handleDialogClose = () => {
  editFormRef.value?.clearValidate()
}

const handleSubmit = async () => {
  if (!editFormRef.value) return

  const valid = await editFormRef.value.validate()
  if (!valid) return

  submitting.value = true
  try {
    if (editForm.value.id) {
      // 更新
      await api.put(`/prompt-templates/${editForm.value.id}`, editForm.value)
      ElMessage.success('更新成功')
    } else {
      // 创建
      await api.post('/prompt-templates', editForm.value)
      ElMessage.success('创建成功')
    }
    showEditDialog.value = false
    refreshTemplates()
  } catch (error) {
    console.error('保存失败:', error)
    ElMessage.error('保存失败')
  } finally {
    submitting.value = false
  }
}

// 提取模板中的变量
const extractVariables = () => {
  const template = editForm.value.template
  if (!template) {
    detectedVariables.value = []
    return
  }
  
  // 使用正则表达式匹配 {{变量名}} 格式的变量
  const variableRegex = /\{\{([^}]+)\}\}/g
  const matches = template.match(variableRegex)
  
  if (matches) {
    // 提取变量名，去除 {{ 和 }}
    const variables = matches.map(match => match.replace(/\{\{|\}\}/g, '').trim())
    // 去重
    detectedVariables.value = [...new Set(variables)]
  } else {
    detectedVariables.value = []
  }
}

// 应用检测到的变量
const applyDetectedVariables = () => {
  editForm.value.variables = [...detectedVariables.value]
  ElMessage.success('已应用检测到的变量')
}

const handleTestRender = async () => {
  if (!previewTemplate.value) return

  testing.value = true
  try {
    const response = await api.post(`/prompt-templates/${previewTemplate.value.id}/render`, testForm.value)
    testResult.value = response.data
  } catch (error) {
    console.error('渲染测试失败:', error)
    ElMessage.error('渲染测试失败')
  } finally {
    testing.value = false
  }
}

// 生命周期
onMounted(() => {
  fetchTemplates()
})
</script>

<style scoped>
.prompt-template-management {
  padding: 20px;
}

.header-card {
  margin-bottom: 20px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.filter-card {
  margin-bottom: 20px;
}

.filter-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.content-card {
  margin-bottom: 20px;
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.form-tip {
  margin-left: 10px;
  color: #999;
  font-size: 12px;
}

.variable-tips {
  margin-top: 8px;
  font-size: 12px;
  color: #666;
  display: flex;
  align-items: center;
  gap: 8px;
}

.variable-tips span {
  flex: 1;
}

.preview-header {
  margin-bottom: 20px;
}

.preview-header h3 {
  margin: 0 0 10px 0;
}

.preview-meta {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.preview-description {
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.preview-variables {
  margin-bottom: 20px;
}

.variables-list {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 10px;
}

.variable-tag {
  background-color: #e6f7ff;
  border-color: #91d5ff;
  color: #1890ff;
}

.preview-content {
  margin-bottom: 20px;
}

.template-content {
  padding: 15px;
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.5;
  white-space: pre-wrap;
  word-wrap: break-word;
  max-height: 300px;
  overflow-y: auto;
}

.preview-test {
  margin-top: 20px;
}

.test-input {
  margin-bottom: 10px;
}

.test-result {
  margin-top: 20px;
  padding: 15px;
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 4px;
}

.rendered-content {
  font-family: 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.5;
  white-space: pre-wrap;
  word-wrap: break-word;
  max-height: 300px;
  overflow-y: auto;
  margin: 0;
}
</style>