import { LLMConfig } from '../types/llm.types'

export interface ILLMProvider {
  /**
   * 初始化LLM提供商
   */
  initialize(config: LLMConfig): Promise<void>

  /**
   * 生成文本补全
   * @param prompt 提示词
   * @param options 额外选项
   */
  generateCompletion(prompt: string, options?: any): Promise<string>

  /**
   * 生成对话补全
   * @param messages 消息数组
   * @param options 额外选项
   */
  generateChatCompletion(messages: Array<any>, options?: any): Promise<string>

  /**
   * 流式生成文本补全
   * @param prompt 提示词
   * @param options 额外选项
   * @param onChunk 分块回调函数
   */
  generateCompletionStream(
    prompt: string,
    options?: any,
    onChunk?: (chunk: string) => void,
  ): Promise<string>

  /**
   * 流式生成对话补全
   * @param messages 消息数组
   * @param options 额外选项
   * @param onChunk 分块回调函数
   */
  generateChatCompletionStream(
    messages: Array<any>,
    options?: any,
    onChunk?: (chunk: string) => void,
  ): Promise<string>

  /**
   * 测试连接
   */
  testConnection(): Promise<boolean>

  /**
   * 获取提供商名称
   */
  getProviderName(): string

  /**
   * 获取支持的模型列表
   */
  getSupportedModels(): string[]

  /**
   * 验证配置
   */
  validateConfig(config: LLMConfig): boolean
}

export interface ILLMService {
  /**
   * 使用指定配置生成文本补全
   * @param prompt 提示词
   * @param config LLM配置
   * @param options 额外选项
   */
  generateCompletion(prompt: string, config?: LLMConfig, options?: any): Promise<string>

  /**
   * 使用默认配置生成文本补全
   * @param prompt 提示词
   * @param options 额外选项
   */
  generateCompletionWithDefault(prompt: string, options?: any): Promise<string>

  /**
   * 使用指定配置生成对话补全
   * @param messages 消息数组
   * @param config LLM配置
   * @param options 额外选项
   */
  generateChatCompletion(messages: Array<any>, config?: LLMConfig, options?: any): Promise<string>

  /**
   * 使用默认配置生成对话补全
   * @param messages 消息数组
   * @param options 额外选项
   */
  generateChatCompletionWithDefault(messages: Array<any>, options?: any): Promise<string>

  /**
   * 使用模板生成文本补全
   * @param category 模板类别
   * @param variables 模板变量
   * @param config LLM配置
   * @param options 额外选项
   */
  generateCompletionWithTemplate(
    category: string,
    variables: Record<string, any>,
    config?: LLMConfig,
    options?: any,
  ): Promise<string>

  /**
   * 使用模板生成对话补全
   * @param category 模板类别
   * @param variables 模板变量
   * @param config LLM配置
   * @param options 额外选项
   */
  generateChatCompletionWithTemplate(
    category: string,
    variables: Record<string, any>,
    config?: LLMConfig,
    options?: any,
  ): Promise<string>

  /**
   * 测试指定配置的连接
   * @param config LLM配置
   */
  testConnection(config: LLMConfig): Promise<boolean>

  /**
   * 获取默认配置
   */
  getDefaultConfig(): Promise<LLMConfig | null>

  /**
   * 获取所有配置
   */
  getAllConfigurations(): Promise<any[]>

  /**
   * 创建配置
   */
  createConfiguration(data: any): Promise<any>

  /**
   * 更新配置
   */
  updateConfiguration(id: string, data: any): Promise<any>

  /**
   * 删除配置
   */
  deleteConfiguration(id: string): Promise<any>

  /**
   * 设置默认配置
   */
  setDefaultConfiguration(id: string): Promise<any>

  /**
   * 测试指定ID的配置
   */
  testConfigurationById(id: string): Promise<boolean>
}
