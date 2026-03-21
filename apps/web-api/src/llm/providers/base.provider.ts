import { Injectable } from '@nestjs/common'
import { ILLMProvider } from '../interfaces/llm.interface'
import { LLMConfig, ChatMessage, LLMProviderConfig } from '../types/llm.types'

@Injectable()
export abstract class BaseLLMProvider implements ILLMProvider {
  protected config: LLMConfig
  protected initialized: boolean = false

  abstract getProviderName(): string
  abstract getSupportedModels(): string[]
  abstract getProviderConfig(): LLMProviderConfig

  async initialize(config: LLMConfig): Promise<void> {
    this.validateConfig(config)
    this.config = config
    await this.initializeClient()
    this.initialized = true
  }

  protected abstract initializeClient(): Promise<void>

  async generateCompletion(prompt: string, options?: any): Promise<string> {
    this.ensureInitialized()
    return this._generateCompletion(prompt, options)
  }

  protected abstract _generateCompletion(prompt: string, options?: any): Promise<string>

  async generateChatCompletion(messages: ChatMessage[], options?: any): Promise<string> {
    this.ensureInitialized()
    return this._generateChatCompletion(messages, options)
  }

  protected abstract _generateChatCompletion(
    messages: ChatMessage[],
    options?: any,
  ): Promise<string>

  async generateCompletionStream(
    prompt: string,
    options?: any,
    onChunk?: (chunk: string) => void,
  ): Promise<string> {
    this.ensureInitialized()
    return this._generateCompletionStream(prompt, options, onChunk)
  }

  protected abstract _generateCompletionStream(
    prompt: string,
    options?: any,
    onChunk?: (chunk: string) => void,
  ): Promise<string>

  async generateChatCompletionStream(
    messages: ChatMessage[],
    options?: any,
    onChunk?: (chunk: string) => void,
  ): Promise<string> {
    this.ensureInitialized()
    return this._generateChatCompletionStream(messages, options, onChunk)
  }

  protected abstract _generateChatCompletionStream(
    messages: ChatMessage[],
    options?: any,
    onChunk?: (chunk: string) => void,
  ): Promise<string>

  async testConnection(): Promise<boolean> {
    try {
      const testPrompt = 'Hello, please respond with "OK" if you can hear me.'
      const response = await this.generateCompletion(testPrompt)
      return response.includes('OK') || response.trim().length > 0
    } catch {
      return false
    }
  }

  validateConfig(config: LLMConfig): boolean {
    if (!config.provider) {
      throw new Error('Provider is required')
    }

    if (!config.modelName) {
      throw new Error('Model name is required')
    }

    if (config.temperature < 0 || config.temperature > 2) {
      throw new Error('Temperature must be between 0 and 2')
    }

    if (config.maxTokens <= 0) {
      throw new Error('Max tokens must be greater than 0')
    }

    const supportedModels = this.getSupportedModels()
    if (supportedModels.length > 0 && !supportedModels.includes(config.modelName)) {
      console.warn(
        `Model ${config.modelName} is not in the supported models list: ${supportedModels.join(', ')}`,
      )
    }

    return true
  }

  protected ensureInitialized(): void {
    if (!this.initialized) {
      throw new Error('Provider not initialized. Call initialize() first.')
    }
  }

  protected mergeOptions(options?: any): any {
    const baseOptions = {
      temperature: this.config.temperature,
      max_tokens: this.config.maxTokens,
    }

    return { ...baseOptions, ...options }
  }

  protected createChatMessages(prompt: string): ChatMessage[] {
    return [{ role: 'user', content: prompt }]
  }

  protected parseStreamResponse(
    data: any,
    contentField: string = 'content',
    doneField: string = 'done',
  ): { content: string; done: boolean } {
    if (data[contentField] !== undefined) {
      return { content: data[contentField], done: data[doneField] || false }
    }

    if (data.choices && data.choices[0] && data.choices[0].delta) {
      return { content: data.choices[0].delta.content || '', done: false }
    }

    if (data.choices && data.choices[0] && data.choices[0].text) {
      return { content: data.choices[0].text, done: false }
    }

    return { content: '', done: true }
  }
}
