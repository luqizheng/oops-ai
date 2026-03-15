<template>
  <div class="space-y-6">
    <div class="bg-white rounded-lg shadow p-6">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold">AI模型配置</h2>
        <button
          @click="showCreateModal = true"
          class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          添加新配置
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="config in configurations"
          :key="config.id"
          class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          :class="{ 'ring-2 ring-blue-500': config.isDefault }"
        >
          <div class="flex justify-between items-start mb-3">
            <div>
              <h3 class="font-bold text-lg">{{ config.modelName }}</h3>
              <div class="flex items-center mt-1">
                <span class="px-2 py-1 text-xs font-semibold rounded"
                      :class="getProviderClass(config.provider)">
                  {{ getProviderText(config.provider) }}
                </span>
                <span v-if="config.isDefault" class="ml-2 px-2 py-1 text-xs font-semibold bg-green-100 text-green-800 rounded">
                  默认
                </span>
              </div>
            </div>
            <div class="flex space-x-2">
              <button
                @click="editConfig(config)"
                class="text-blue-600 hover:text-blue-800"
                title="编辑"
              >
                ✏️
              </button>
              <button
                @click="deleteConfig(config.id)"
                class="text-red-600 hover:text-red-800"
                title="删除"
              >
                🗑️
              </button>
            </div>
          </div>

          <div class="space-y-2 text-sm text-gray-600">
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

          <div class="mt-4 flex space-x-2">
            <button
              @click="testConnection(config)"
              :disabled="testingConfigId === config.id"
              class="flex-1 px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-50"
            >
              {{ testingConfigId === config.id ? '测试中...' : '测试连接' }}
            </button>
            <button
              v-if="!config.isDefault"
              @click="setAsDefault(config.id)"
              class="flex-1 px-3 py-1.5 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
            >
              设为默认
            </button>
          </div>
        </div>
      </div>

      <div v-if="configurations.length === 0" class="text-center py-12">
        <p class="text-gray-500">暂无AI模型配置</p>
        <p class="text-sm text-gray-400 mt-2">点击"添加新配置"按钮开始配置</p>
      </div>
    </div>

    <!-- 创建/编辑模态框 -->
    <div v-if="showCreateModal || showEditModal" class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div class="p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">
            {{ showEditModal ? '编辑配置' : '添加新配置' }}
          </h3>
          
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                供应商 *
              </label>
              <select
                v-model="currentConfig.provider"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="openai">OpenAI</option>
                <option value="ollama">Ollama</option>
                <option value="deepseek">DeepSeek</option>
                <option value="qwen">通义千问 (Qwen)</option>
                <option value="local">本地模型</option>
              </select>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                模型名称 *
              </label>
              <input
                v-model="currentConfig.modelName"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="例如: gpt-4, llama3, deepseek-chat"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                API端点
              </label>
              <input
                v-model="currentConfig.apiEndpoint"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                :placeholder="getEndpointPlaceholder(currentConfig.provider)"
              />
            </div>
            
            <div v-if="currentConfig.provider !== 'local'">
              <label class="block text-sm font-medium text-gray-700 mb-1">
                API密钥
              </label>
              <input
                v-model="currentConfig.apiKey"
                type="password"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="请输入API密钥"
              />
            </div>
            
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  温度 (0-1)
                </label>
                <input
                  v-model="currentConfig.temperature"
                  type="number"
                  min="0"
                  max="1"
                  step="0.1"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  最大Token数
                </label>
                <input
                  v-model="currentConfig.maxTokens"
                  type="number"
                  min="100"
                  max="10000"
                  step="100"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            <div class="flex items-center space-x-4">
              <div class="flex items-center">
                <input
                  v-model="currentConfig.isDefault"
                  type="checkbox"
                  id="isDefault"
                  class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label for="isDefault" class="ml-2 block text-sm text-gray-700">
                  设为默认配置
                </label>
              </div>
              
              <div class="flex items-center">
                <input
                  v-model="currentConfig.isActive"
                  type="checkbox"
                  id="isActive"
                  class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label for="isActive" class="ml-2 block text-sm text-gray-700">
                  激活配置
                </label>
              </div>
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
              @click="testCurrentConfig"
              :disabled="testingCurrentConfig"
              class="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:bg-gray-300"
            >
              {{ testingCurrentConfig ? '测试中...' : '测试连接' }}
            </button>
            <button
              @click="saveConfig"
              :disabled="!currentConfig.modelName || !currentConfig.provider"
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
import axios from 'axios'

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

const configurations = ref<LLMConfig[]>([])
const showCreateModal = ref(false)
const showEditModal = ref(false)
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

const fetchConfigurations = async () => {
  try {
    const response = await axios.get('/api/llm/configurations')
    configurations.value = response.data
  } catch (error) {
    console.error('Error fetching configurations:', error)
    configurations.value = []
  }
}

const createConfig = async () => {
  try {
    await axios.post('/api/llm/configurations', currentConfig.value)
    closeModal()
    fetchConfigurations()
    resetCurrentConfig()
  } catch (error) {
    console.error('Error creating config:', error)
    alert('创建配置失败，请重试')
  }
}

const updateConfig = async () => {
  if (!currentConfig.value.id) return

  try {
    await axios.put(`/api/llm/configurations/${currentConfig.value.id}`, currentConfig.value)
    closeModal()
    fetchConfigurations()
    resetCurrentConfig()
  } catch (error) {
    console.error('Error updating config:', error)
    alert('更新配置失败，请重试')
  }
}

const deleteConfig = async (id: string) => {
  if (!confirm('确定要删除这个配置吗？')) return

  try {
    await axios.delete(`/api/llm/configurations/${id}`)
    fetchConfigurations()
  } catch (error) {
    console.error('Error deleting config:', error)
    alert('删除配置失败，请重试')
  }
}

const testConnection = async (config: LLMConfig) => {
  testingConfigId.value = config.id

  try {
    const response = await axios.post(`/api/llm/configurations/${config.id}/test`, {
      testPrompt: 'Hello, please respond with "OK"'
    })
    
    if (response.data.success) {
      alert('连接测试成功！')
    } else {
      alert('连接测试失败：' + (response.data.message || '未知错误'))
    }
  } catch (error) {
    console.error('Error testing connection:', error)
    alert('连接测试失败，请检查配置')
  } finally {
    testingConfigId.value = null
  }
}

const testCurrentConfig = async () => {
  testingCurrentConfig.value = true

  try {
    const response = await axios.post('/api/llm/configurations/test', {
      config: currentConfig.value,
      testPrompt: 'Hello, please respond with "OK"'
    })
    
    if (response.data.success) {
      alert('连接测试成功！')
    } else {
      alert('连接测试失败：' + (response.data.message || '未知错误'))
    }
  } catch (error) {
    console.error('Error testing connection:', error)
    alert('连接测试失败，请检查配置')
  } finally {
    testingCurrentConfig.value = false
  }
}

const setAsDefault = async (id: string) => {
  try {
    await axios.put(`/api/llm/configurations/${id}/default`)
    fetchConfigurations()
    alert('已设置为默认配置')
  } catch (error) {
    console.error('Error setting default config:', error)
    alert('设置默认配置失败，请重试')
  }
}

const editConfig = (config: LLMConfig) => {
  currentConfig.value = { ...config }
  showEditModal.value = true
}

const saveConfig = () => {
  if (showEditModal.value) {
    updateConfig()
  } else {
    createConfig()
  }
}

const closeModal = () => {
  showCreateModal.value = false
  showEditModal.value = false
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