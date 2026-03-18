import { Injectable } from '@nestjs/common'
import { BaseLLMProvider } from './base.provider'
import { ChatMessage, LLMProviderConfig } from '../types/llm.types'

@Injectable()
export class QwenProvider extends BaseLLMProvider {
  private endpoint: string

  getProviderName(): string {
    return 'qwen'
  }

  getSupportedModels(): string[] {
    return [
      'qwen-turbo',
      'qwen-plus',
      'qwen-max',
      'qwen-max-longcontext',
      'qwen-7b-chat',
      'qwen-14b-chat',
      'qwen-72b-chat',
      'qwen-coder',
      'qwen-math',
    ]
  }

  getProviderConfig(): LLMProviderConfig {
    return {
      name: 'qwen',
      displayName: '通义千问',
      description: '阿里云通义千问系列模型',
      supportedModels: this.getSupportedModels(),
      defaultEndpoint: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
      requiresApiKey: true,
      supportsStreaming: true,
      supportsChat: true,
      supportsFunctions: false,
    }
  }

  protected async initializeClient(): Promise<void> {
    if (!this.config.apiKey) {
      throw new Error('Qwen API key is required')
    }

    this.endpoint = this.config.apiEndpoint || 'https://dashscope.aliyuncs.com/compatible-mode/v1'
  }

  protected async _generateCompletion(prompt: string, options?: any): Promise<string> {
    try {
      const mergedOptions = this.mergeOptions(options)
      const endpoint = `${this.endpoint}/chat/completions`

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify({
          model: this.config.modelName,
          messages: this.createChatMessages(prompt),
          temperature: mergedOptions.temperature,
          max_tokens: mergedOptions.max_tokens,
          ...options,
        }),
      })

      if (!response.ok) {
        throw new Error(`Qwen API error: ${response.statusText}`)
      }

      const data = await response.json()
      return data.choices[0]?.message?.content || ''
    } catch (error) {
      throw new Error(`Qwen API error: ${error.message}`)
    }
  }

  protected async _generateChatCompletion(messages: ChatMessage[], options?: any): Promise<string> {
    try {
      const mergedOptions = this.mergeOptions(options)
      const endpoint = `${this.endpoint}/chat/completions`

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify({
          model: this.config.modelName,
          messages,
          temperature: mergedOptions.temperature,
          max_tokens: mergedOptions.max_tokens,
          ...options,
        }),
      })

      if (!response.ok) {
        throw new Error(`Qwen API error: ${response.statusText}`)
      }

      const data = await response.json()
      return data.choices[0]?.message?.content || ''
    } catch (error) {
      throw new Error(`Qwen API error: ${error.message}`)
    }
  }

  protected async _generateCompletionStream(
    prompt: string,
    options?: any,
    onChunk?: (chunk: string) => void,
  ): Promise<string> {
    try {
      const mergedOptions = this.mergeOptions(options)
      const endpoint = `${this.endpoint}/chat/completions`

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify({
          model: this.config.modelName,
          messages: this.createChatMessages(prompt),
          temperature: mergedOptions.temperature,
          max_tokens: mergedOptions.max_tokens,
          stream: true,
          ...options,
        }),
      })

      if (!response.ok) {
        throw new Error(`Qwen API error: ${response.statusText}`)
      }

      return await this.processQwenStream(response, onChunk)
    } catch (error) {
      throw new Error(`Qwen API error: ${error.message}`)
    }
  }

  protected async _generateChatCompletionStream(
    messages: ChatMessage[],
    options?: any,
    onChunk?: (chunk: string) => void,
  ): Promise<string> {
    try {
      const mergedOptions = this.mergeOptions(options)
      const endpoint = `${this.endpoint}/chat/completions`

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify({
          model: this.config.modelName,
          messages,
          temperature: mergedOptions.temperature,
          max_tokens: mergedOptions.max_tokens,
          stream: true,
          ...options,
        }),
      })

      if (!response.ok) {
        throw new Error(`Qwen API error: ${response.statusText}`)
      }

      return await this.processQwenStream(response, onChunk)
    } catch (error) {
      throw new Error(`Qwen API error: ${error.message}`)
    }
  }

  private async processQwenStream(
    response: Response,
    onChunk?: (chunk: string) => void,
  ): Promise<string> {
    const reader = response.body?.getReader()
    if (!reader) {
      throw new Error('Failed to get stream reader')
    }

    let fullResponse = ''
    const decoder = new TextDecoder()

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n').filter((line) => line.trim() !== '')

        for (const line of lines) {
          try {
            if (line.startsWith('data: ')) {
              const jsonLine = line.slice(6).trim()
              if (!jsonLine) continue

              const data = JSON.parse(jsonLine)

              if (data.choices && data.choices[0] && data.choices[0].delta) {
                const content = data.choices[0].delta.content || ''
                if (content) {
                  fullResponse += content
                  if (onChunk) {
                    onChunk(content)
                  }
                }
              }
            }
          } catch (parseError) {
            console.debug('解析Qwen流响应行失败，跳过该行:', line)
          }
        }
      }
    } finally {
      reader.releaseLock()
    }

    return fullResponse
  }
}
