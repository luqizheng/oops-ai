<template>
  <div class="space-y-8">
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200">
      <div class="flex flex-wrap justify-between items-center gap-4 mb-6">
        <h2 class="text-2xl font-bold text-gray-900">AI模型配置</h2>
        <el-button
          @click="showDrawer = true"
          type="primary"
          class="rounded-lg px-5 py-2 h-10 text-sm"
        >
          添加新配置
        </el-button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="config in configurations"
          :key="config.id"
          class="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-all duration-200 hover:-translate-y-1"
          :class="{ 'ring-2 ring-primary-500': config.isDefault }"
        >
          <div class="flex justify-between items-start mb-3">
            <div>
              <h3 class="font-semibold text-lg text-gray-900">{{ config.modelName }}</h3>
              <div class="flex items-center mt-2 flex-wrap gap-2">
                <span class="px-3 py-1 text-xs font-semibold rounded-full"
                      :class="getProviderClass(config.provider)">
                  {{ getProviderText(config.provider) }}
                </span>
                <span v-if="config.isDefault" class="px-3 py-1 text-xs font-semibold bg-green-100 text-green-800 rounded-full">
                  默认
                </span>
              </div>
            </div>
            <div class="flex space-x-2">
              <el-button
                @click="editConfig(config)"
                type="text"
                size="small"
                class="text-primary-600 hover:text-primary-700"
                title="编辑"
              >
                ✏️
              </el-button>
              <el-button
                @click="deleteConfig(config.id)"
                type="text"
                size="small"
                class="text-red-600 hover:text-red-700"
                title="删除"
              >
                🗑️
              </el-button>
            </div>
          </div>

          <div class="space-y-2 text-sm text-gray-600 mt-4">
            <div v-if="config.apiEndpoint" class="truncate">
              <span class="font-medium">端点:</span> {{ config.apiEndpoint }}
            </div>
            <div>
              <span class="font-medium">温度:</span> {{ config.temperature }}
            </div>
            <div>
              <span class="font-medium">最大Token:</span> {{ config.maxTokens }}
            </div>
            <div>
              <span class="font-medium">状态:</span>
              <span :class="config.isActive ? 'text-green-600' : 'text-red-600'">
                {{ config.isActive ? '激活' : '禁用' }}
              </span>
            </div>
          </div>

          <div class="mt-5 flex space-x-3">
            <el-button
              @click="testConnection(config)"
              :loading="testingConfigId === config.id"
              type="default"
              size="small"
              class="flex-1 rounded-lg h-9 text-xs"
            >
              {{ testingConfigId === config.id ? '测试中...' : '测试连接' }}
            </el-button>
            <el-button
              v-if="!config.isDefault"
              @click="setAsDefault(config.id)"
              type="primary"
              size="small"
              class="flex-1 rounded-lg h-9 text-xs"
            >
              设为默认
            </el-button>
          </div>
        </div>
      </div>

      <div v-if="configurations.length === 0" class="text-center py-12">
        <p class="text-gray-500">暂无AI模型配置</p>
        <p class="text-sm text-gray-400 mt-2">点击"添加新配置"按钮开始配置</p>
      </div>
    </div>

    <!-- 创建/编辑侧边抽屉 -->
    <el-drawer
      v-model="showDrawer"
      title=""
      size="600px"
      direction="rtl"
      :with-header="false"
    >
      <div class="p-6">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-xl font-bold text-gray-900">
            {{ isEditing ? '编辑配置' : '添加新配置' }}
          </h3>
          <el-button
            @click="closeDrawer"
            size="small"
            text
            :icon="CircleClose"
            class="text-gray-500 hover:text-gray-700"
          />
        </div>
        
        <el-form :model="currentConfig" label-width="80px" class="space-y-5">
          <el-form-item label="供应商" required>
            <el-select
              v-model="currentConfig.provider"
              placeholder="选择供应商"
              class="rounded-lg"
              size="large"
            >
              <el-option label="OpenAI" value="openai" />
              <el-option label="Ollama" value="ollama" />
              <el-option label="DeepSeek" value="deepseek" />
              <el-option label="通义千问 (Qwen)" value="qwen" />
              <el-option label="本地模型" value="local" />
            </el-select>
          </el-form-item>
          
          <el-form-item label="模型名称" required>
            <el-input
              v-model="currentConfig.modelName"
              placeholder="例如: gpt-4, llama3, deepseek-chat"
              class="rounded-lg"
              size="large"
            />
          </el-form-item>
          
          <el-form-item label="API端点">
            <el-input
              v-model="currentConfig.apiEndpoint"
              :placeholder="getEndpointPlaceholder(currentConfig.provider || 'openai')"
              class="rounded-lg"
              size="large"
            />
          </el-form-item>
          
          <el-form-item label="API密钥" v-if="currentConfig.provider !== 'local'">
            <el-input
              v-model="currentConfig.apiKey"
              type="password"
              placeholder="请输入API密钥"
              class="rounded-lg"
              size="large"
            />
          </el-form-item>
          
          <div class="grid grid-cols-2 gap-5">
            <el-form-item label="温度 (0-1)">
              <el-input-number
                v-model="currentConfig.temperature"
                :min="0"
                :max="1"
                :step="0.1"
                class="w-full"
                size="large"
              />
            </el-form-item>
            
            <el-form-item label="最大Token数">
              <el-input-number
                v-model="currentConfig.maxTokens"
                :min="100"
                :max="10000"
                :step="100"
                class="w-full"
                size="large"
              />
            </el-form-item>
          </div>
          
          <div class="flex items-center space-x-6">
            <el-checkbox v-model="currentConfig.isDefault">设为默认配置</el-checkbox>
            <el-checkbox v-model="currentConfig.isActive">激活配置</el-checkbox>
          </div>
        </el-form>
        
        <div class="mt-8 flex justify-end space-x-3">
          <el-button
            @click="closeDrawer"
            class="rounded-lg"
          >
            取消
          </el-button>
          <el-button
            @click="testCurrentConfig"
            :loading="testingCurrentConfig"
            type="default"
            class="rounded-lg"
          >
            {{ testingCurrentConfig ? '测试中...' : '测试连接' }}
          </el-button>
          <el-button
            @click="saveConfig"
            :disabled="!currentConfig.modelName || !currentConfig.provider"
            type="primary"
            class="rounded-lg"
          >
            {{ isEditing ? '更新' : '创建' }}
          </el-button>
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

interface LLMConfig {
  id: string
  provider: 'openai' | 'ollama' | 'deepseek' | 'qwen' | 'local'
  modelName: string
  apiEndpoint?: string
  apiKey?: string
  temperature: number
  maxTokens: number
  isDefault: boolean
  isActive: boolean
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

const configurations = ref<LLMConfig[]>([])
const showDrawer = ref(false)
const isEditing = ref(false)
const testingConfigId = ref<string | null>(null)
const testingCurrentConfig = ref(false)
const currentConfig = ref<Partial<LLMConfig>>({
  provider: 'openai',
  modelName: '',
  apiEndpoint: '',
  apiKey: '',
  temperature: 0.7,
  maxTokens: 2000,
  isDefault: false,
  isActive: true
})

const actionFeedback = ref<ActionFeedback>({
  show: false,
  message: '',
  type: 'success',
  undoable: false,
  undoAction: null
})

// 用于撤销删除的临时存储
const deletedConfigBackup = ref<LLMConfig | null>(null)

const fetchConfigurations = async () => {
  try {
    const response = await axios.get('/llm/configurations')
    configurations.value = response.data
  } catch (error) {
    console.error('Error fetching configurations:', error)
    configurations.value = []
    showFeedback('获取配置失败', 'error')
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

const createConfig = async () => {
  try {
    await axios.post('/llm/configurations', currentConfig.value)
    closeDrawer()
    fetchConfigurations()
    resetCurrentConfig()
    showFeedback('配置创建成功', 'success')
  } catch (error) {
    console.error('Error creating config:', error)
    showFeedback('创建配置失败，请重试', 'error')
  }
}

const updateConfig = async () => {
  if (!currentConfig.value.id) return

  try {
    await axios.put(`/llm/configurations/${currentConfig.value.id}`, currentConfig.value)
    closeDrawer()
    fetchConfigurations()
    resetCurrentConfig()
    showFeedback('配置更新成功', 'success')
  } catch (error) {
    console.error('Error updating config:', error)
    showFeedback('更新配置失败，请重试', 'error')
  }
}

const deleteConfig = async (id: string) => {
  // 先备份要删除的配置，用于撤销操作
  const configToDelete = configurations.value.find(config => config.id === id)
  if (!configToDelete) return
  
  // 乐观更新UI
  const index = configurations.value.findIndex(config => config.id === id)
  if (index > -1) {
    configurations.value.splice(index, 1)
  }
  
  try {
    await axios.delete(`/llm/configurations/${id}`)
    
    // 显示反馈和撤销选项
    showFeedback('配置已删除', 'success', true, async () => {
      try {
        // 重新创建配置
        await axios.post('/llm/configurations', configToDelete)
        await fetchConfigurations()
        showFeedback('删除已撤销', 'success')
      } catch (error) {
        console.error('Error undoing delete:', error)
        showFeedback('撤销删除失败', 'error')
        // 恢复UI
        if (index > -1) {
          configurations.value.splice(index, 0, configToDelete)
        }
      }
    })
  } catch (error) {
    console.error('Error deleting config:', error)
    showFeedback('删除配置失败，请重试', 'error')
    // 恢复UI
    if (index > -1) {
      configurations.value.splice(index, 0, configToDelete)
    }
  }
}

const testConnection = async (config: LLMConfig) => {
  testingConfigId.value = config.id

  try {
    const response = await axios.post(`/llm/configurations/${config.id}/test`, {
      testPrompt: 'Hello, please respond with "OK"'
    })
    
    if (response.data.success) {
      showFeedback('连接测试成功！', 'success')
    } else {
      showFeedback('连接测试失败：' + (response.data.message || '未知错误'), 'error')
    }
  } catch (error) {
    console.error('Error testing connection:', error)
    showFeedback('连接测试失败，请检查配置', 'error')
  } finally {
    testingConfigId.value = null
  }
}

const testCurrentConfig = async () => {
  testingCurrentConfig.value = true

  try {
    const response = await axios.post('/llm/configurations/test', {
      config: currentConfig.value,
      testPrompt: 'Hello, please respond with "OK"'
    })
    
    if (response.data.success) {
      showFeedback('连接测试成功！', 'success')
    } else {
      showFeedback('连接测试失败：' + (response.data.message || '未知错误'), 'error')
    }
  } catch (error) {
    console.error('Error testing connection:', error)
    showFeedback('连接测试失败，请检查配置', 'error')
  } finally {
    testingCurrentConfig.value = false
  }
}

const setAsDefault = async (id: string) => {
  try {
    await axios.put(`/llm/configurations/${id}/default`)
    fetchConfigurations()
    showFeedback('已设置为默认配置', 'success')
  } catch (error) {
    console.error('Error setting default config:', error)
    showFeedback('设置默认配置失败，请重试', 'error')
  }
}

const editConfig = (config: LLMConfig) => {
  currentConfig.value = { ...config }
  isEditing.value = true
  showDrawer.value = true
}

const saveConfig = () => {
  if (isEditing.value) {
    updateConfig()
  } else {
    createConfig()
  }
}

const closeDrawer = () => {
  showDrawer.value = false
  isEditing.value = false
  resetCurrentConfig()
}

const resetCurrentConfig = () => {
  currentConfig.value = {
    provider: 'openai',
    modelName: '',
    apiEndpoint: '',
    apiKey: '',
    temperature: 0.7,
    maxTokens: 2000,
    isDefault: false,
    isActive: true
  }
}

const getProviderClass = (provider: string) => {
  switch (provider) {
    case 'openai':
      return 'bg-green-100 text-green-800'
    case 'ollama':
      return 'bg-blue-100 text-blue-800'
    case 'deepseek':
      return 'bg-purple-100 text-purple-800'
    case 'qwen':
      return 'bg-red-100 text-red-800'
    case 'local':
      return 'bg-gray-100 text-gray-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const getProviderText = (provider: string) => {
  switch (provider) {
    case 'openai':
      return 'OpenAI'
    case 'ollama':
      return 'Ollama'
    case 'deepseek':
      return 'DeepSeek'
    case 'qwen':
      return '通义千问'
    case 'local':
      return '本地模型'
    default:
      return provider
  }
}

const getEndpointPlaceholder = (provider: string) => {
  switch (provider) {
    case 'openai':
      return 'https://api.openai.com/v1 (默认)'
    case 'ollama':
      return 'http://localhost:11434/api (默认)'
    case 'deepseek':
      return 'https://api.deepseek.com/v1 (默认)'
    case 'qwen':
      return 'https://dashscope.aliyuncs.com/compatible-mode/v1 (默认)'
    case 'local':
      return 'http://localhost:8080/v1 (默认)'
    default:
      return '请输入API端点'
  }
}

onMounted(() => {
  fetchConfigurations()
})
</script>