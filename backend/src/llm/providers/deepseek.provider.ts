import { Injectable } from '@nestjs/common'
import OpenAI from 'openai'
import { BaseLLMProvider } from './base.provider'
import { ChatMessage, LLMProviderConfig } from '../types/llm.types'

@Injectable()
export class DeepSeekProvider extends BaseLLMProvider {
  private client: OpenAI | null = null

  getProviderName(): string {
    return 'deepseek'
  }

  getSupportedModels(): string[] {
    return [
      'deepseek-chat',
      'deepseek-coder',
      'deepseek-reasoner',
      'deepseek-v2',
      'deepseek-v2-lite',
    ]
  }

  getProviderConfig(): LLMProviderConfig {
    return {
      name: 'deepseek',
      displayName: 'DeepSeek',
      description: '深度求索AI模型，支持对话和代码生成',
      supportedModels: this.getSupportedModels(),
      defaultEndpoint: 'https://api.deepseek.com/v1',
      requiresApiKey: true,
      supportsStreaming: true,
      supportsChat: true,
      supportsFunctions: false,
    }
  }

  protected async initializeClient(): Promise<void> {
    if (!this.config.apiKey) {
      throw new Error('DeepSeek API key is required')
    }

    this.client = new OpenAI({
      apiKey: this.config.apiKey,
      baseURL: this.config.apiEndpoint || 'https://api.deepseek.com/v1',
    })
  }

  protected async _generateCompletion(prompt: string, options?: any): Promise<string> {
    if (!this.client) {
      throw new Error('DeepSeek client not initialized')
    }

    try {
      console.log('使用DeepSeek请求内容:', prompt)
      const mergedOptions = this.mergeOptions(options)

      const completion = await this.client.chat.completions.create({
        model: this.config.modelName,
        messages: this.createChatMessages(prompt),
        ...mergedOptions,
      })

      const response = completion.choices[0]?.message?.content || ''
      console.log('使用DeepSeek响应内容:', response)

      return response
    } catch (error) {
      throw new Error(`DeepSeek API error: ${error.message}`)
    }
  }

  protected async _generateChatCompletion(messages: ChatMessage[], options?: any): Promise<string> {
    if (!this.client) {
      throw new Error('DeepSeek client not initialized')
    }

    try {
      const mergedOptions = this.mergeOptions(options)

      const completion = await this.client.chat.completions.create({
        model: this.config.modelName,
        messages,
        ...mergedOptions,
      })

      return completion.choices[0]?.message?.content || ''
    } catch (error) {
      throw new Error(`DeepSeek API error: ${error.message}`)
    }
  }

  protected async _generateCompletionStream(
    prompt: string,
    options?: any,
    onChunk?: (chunk: string) => void,
  ): Promise<string> {
    if (!this.client) {
      throw new Error('DeepSeek client not initialized')
    }

    try {
      const mergedOptions = this.mergeOptions(options)
      let fullResponse = ''

      const stream = await this.client.chat.completions.create({
        model: this.config.modelName,
        messages: this.createChatMessages(prompt),
        stream: true,
        ...mergedOptions,
      })

      // 使用类型断言处理流式响应
      const asyncStream = stream as unknown as AsyncIterable<any>
      for await (const chunk of asyncStream) {
        const content = chunk.choices[0]?.delta?.content || ''
        if (content) {
          fullResponse += content
          if (onChunk) {
            onChunk(content)
          }
        }
      }

      return fullResponse
    } catch (error) {
      throw new Error(`DeepSeek API error: ${error.message}`)
    }
  }

  protected async _generateChatCompletionStream(
    messages: ChatMessage[],
    options?: any,
    onChunk?: (chunk: string) => void,
  ): Promise<string> {
    if (!this.client) {
      throw new Error('DeepSeek client not initialized')
    }

    try {
      const mergedOptions = this.mergeOptions(options)
      let fullResponse = ''

      const stream = await this.client.chat.completions.create({
        model: this.config.modelName,
        messages,
        stream: true,
        ...mergedOptions,
      })

      // 使用类型断言处理流式响应
      const asyncStream = stream as unknown as AsyncIterable<any>
      for await (const chunk of asyncStream) {
        const content = chunk.choices[0]?.delta?.content || ''
        if (content) {
          fullResponse += content
          if (onChunk) {
            onChunk(content)
          }
        }
      }

      return fullResponse
    } catch (error) {
      throw new Error(`DeepSeek API error: ${error.message}`)
    }
  }
}
