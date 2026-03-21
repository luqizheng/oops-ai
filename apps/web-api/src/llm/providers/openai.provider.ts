import { Injectable } from '@nestjs/common'
import OpenAI from 'openai'
import { BaseLLMProvider } from './base.provider'
import { ChatMessage, LLMProviderConfig } from '../types/llm.types'

@Injectable()
export class OpenAIProvider extends BaseLLMProvider {
  private client: OpenAI | null = null

  getProviderName(): string {
    return 'openai'
  }

  getSupportedModels(): string[] {
    return [
      'gpt-4',
      'gpt-4-turbo-preview',
      'gpt-4-vision-preview',
      'gpt-4-32k',
      'gpt-3.5-turbo',
      'gpt-3.5-turbo-16k',
      'gpt-3.5-turbo-instruct',
      'text-davinci-003',
      'text-davinci-002',
      'code-davinci-002',
    ]
  }

  getProviderConfig(): LLMProviderConfig {
    return {
      name: 'openai',
      displayName: 'OpenAI',
      description: 'OpenAI官方API，支持GPT系列模型',
      supportedModels: this.getSupportedModels(),
      defaultEndpoint: 'https://api.openai.com/v1',
      requiresApiKey: true,
      supportsStreaming: true,
      supportsChat: true,
      supportsFunctions: true,
    }
  }

  protected async initializeClient(): Promise<void> {
    if (!this.config.apiKey) {
      throw new Error('OpenAI API key is required')
    }

    this.client = new OpenAI({
      apiKey: this.config.apiKey,
      baseURL: this.config.apiEndpoint || 'https://api.openai.com/v1',
    })
  }

  protected async _generateCompletion(prompt: string, options?: any): Promise<string> {
    if (!this.client) {
      throw new Error('OpenAI client not initialized')
    }

    try {
      const mergedOptions = this.mergeOptions(options)

      const completion = await this.client.chat.completions.create({
        model: this.config.modelName,
        messages: this.createChatMessages(prompt),
        ...mergedOptions,
      })

      return completion.choices[0]?.message?.content || ''
    } catch (error) {
      throw new Error(`OpenAI API error: ${error.message}`)
    }
  }

  protected async _generateChatCompletion(messages: ChatMessage[], options?: any): Promise<string> {
    if (!this.client) {
      throw new Error('OpenAI client not initialized')
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
      throw new Error(`OpenAI API error: ${error.message}`)
    }
  }

  protected async _generateCompletionStream(
    prompt: string,
    options?: any,
    onChunk?: (chunk: string) => void,
  ): Promise<string> {
    if (!this.client) {
      throw new Error('OpenAI client not initialized')
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
      throw new Error(`OpenAI API error: ${error.message}`)
    }
  }

  protected async _generateChatCompletionStream(
    messages: ChatMessage[],
    options?: any,
    onChunk?: (chunk: string) => void,
  ): Promise<string> {
    if (!this.client) {
      throw new Error('OpenAI client not initialized')
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
      throw new Error(`OpenAI API error: ${error.message}`)
    }
  }
}
