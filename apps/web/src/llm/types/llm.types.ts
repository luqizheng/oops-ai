export type LLMProvider = 'openai' | 'ollama' | 'deepseek' | 'qwen' | 'local' | 'claude' | 'gemini'

export interface LLMConfig {
  provider: LLMProvider
  modelName: string
  apiEndpoint?: string
  apiKey?: string
  temperature: number
  maxTokens: number
  isDefault: boolean
  isActive?: boolean
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant' | 'function'
  content: string
  name?: string
  function_call?: {
    name: string
    arguments: string
  }
}

export interface CompletionOptions {
  temperature?: number
  maxTokens?: number
  topP?: number
  frequencyPenalty?: number
  presencePenalty?: number
  stop?: string[]
  stream?: boolean
  n?: number
  logprobs?: number
  echo?: boolean
  bestOf?: number
  logitBias?: Record<string, number>
}

export interface ChatCompletionOptions extends CompletionOptions {
  functions?: Array<{
    name: string
    description?: string
    parameters: any
  }>
  function_call?: 'auto' | 'none' | { name: string }
}

export interface LLMResponse {
  content: string
  model: string
  provider: string
  usage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
  finishReason?: string
  choices?: Array<{
    message?: ChatMessage
    text?: string
    index: number
    finishReason: string
  }>
}

export interface StreamChunk {
  content: string
  done: boolean
  model?: string
  provider?: string
}

export interface LLMProviderConfig {
  name: string
  displayName: string
  description: string
  supportedModels: string[]
  defaultEndpoint?: string
  requiresApiKey: boolean
  supportsStreaming: boolean
  supportsChat: boolean
  supportsFunctions: boolean
}

export interface LLMProviderFactory {
  createProvider(config: LLMConfig): Promise<any>
  getProviderConfig(): LLMProviderConfig
}
