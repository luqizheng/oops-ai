export enum LLMProvider {
  OPENAI = 'openai',
  OLLAMA = 'ollama',
  DEEPSEEK = 'deepseek',
  QWEN = 'qwen',
  LOCAL = 'local'
}

export interface LLMConfigListItem {
  id: string;
  provider: LLMProvider;
  modelName: string;
  apiEndpoint?: string;
  apiKey?: string;
  temperature: number;
  maxTokens: number;
  isDefault: boolean;
  isActive: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface LLMConfigViewModel extends LLMConfigListItem {}

export interface CreateLLMConfigResult extends LLMConfigViewModel {}

export interface UpdateLLMConfigResult extends LLMConfigViewModel {}

export interface DeleteLLMConfigResult {
  success: boolean;
  message?: string;
}

export interface TestConnectionResult {
  success: boolean;
  message: string;
}

export interface CreateLLMConfigSubmit {
  provider: string;
  modelName: string;
  apiEndpoint?: string;
  apiKey?: string;
  temperature?: number;
  maxTokens?: number;
  isDefault?: boolean;
  isActive?: boolean;
}

export interface UpdateLLMConfigSubmit {
  modelName?: string;
  apiEndpoint?: string;
  apiKey?: string;
  temperature?: number;
  maxTokens?: number;
  isDefault?: boolean;
  isActive?: boolean;
}
