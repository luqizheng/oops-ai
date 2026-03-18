import { Injectable } from '@nestjs/common'
import { BaseLLMProvider } from './base.provider'
import { ChatMessage, LLMProviderConfig } from '../types/llm.types'

@Injectable()
export class LocalProvider extends BaseLLMProvider {
  private endpoint: string

  getProviderName(): string {
    return 'local'
  }

  getSupportedModels(): string[] {
    return [
      'local-llama',
      'local-mistral',
      'local-codellama',
      'local-phi',
      'local-gemma',
      'custom-model',
    ]
  }

  getProviderConfig(): LLMProviderConfig {
    return {
      name: 'local',
      displayName: '本地模型',
      description: '本地部署的各类开源模型',
      supportedModels: this.getSupportedModels(),
      defaultEndpoint: 'http://localhost:8080/v1',
      requiresApiKey: false,
      supportsStreaming: true,
      supportsChat: true,
      supportsFunctions: false,
    }
  }

  protected async initializeClient(): Promise<void> {
    this.endpoint = this.config.apiEndpoint || 'http://localhost:8080/v1'
  }

  protected async _generateCompletion(prompt: string, options?: any): Promise<string> {
    try {
      const mergedOptions = this.mergeOptions(options)
      const endpoint = `${this.endpoint}/completions`

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          temperature: mergedOptions.temperature,
          max_tokens: mergedOptions.max_tokens,
          ...options,
        }),
      })

      if (!response.ok) {
        throw new Error(`Local model API error: ${response.statusText}`)
      }

      const data = await response.json()
      return data.choices?.[0]?.text || data.text || ''
    } catch (error) {
      throw new Error(`Local model API error: ${error.message}`)
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
        },
        body: JSON.stringify({
          messages,
          temperature: mergedOptions.temperature,
          max_tokens: mergedOptions.max_tokens,
          ...options,
        }),
      })

      if (!response.ok) {
        throw new Error(`Local model API error: ${response.statusText}`)
      }

      const data = await response.json()
      return data.choices?.[0]?.message?.content || data.text || ''
    } catch (error) {
      throw new Error(`Local model API error: ${error.message}`)
    }
  }

  protected async _generateCompletionStream(
    prompt: string,
    options?: any,
    onChunk?: (chunk: string) => void,
  ): Promise<string> {
    try {
      const mergedOptions = this.mergeOptions(options)
      const endpoint = `${this.endpoint}/completions`

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          temperature: mergedOptions.temperature,
          max_tokens: mergedOptions.max_tokens,
          stream: true,
          ...options,
        }),
      })

      if (!response.ok) {
        throw new Error(`Local model API error: ${response.statusText}`)
      }

      return await this.processLocalStream(response, onChunk)
    } catch (error) {
      throw new Error(`Local model API error: ${error.message}`)
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
        },
        body: JSON.stringify({
          messages,
          temperature: mergedOptions.temperature,
          max_tokens: mergedOptions.max_tokens,
          stream: true,
          ...options,
        }),
      })

      if (!response.ok) {
        throw new Error(`Local model API error: ${response.statusText}`)
      }

      return await this.processLocalStream(response, onChunk)
    } catch (error) {
      throw new Error(`Local model API error: ${error.message}`)
    }
  }

  private async processLocalStream(
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

              if (data.choices && data.choices[0]) {
                const content = data.choices[0].text || data.choices[0].delta?.content || ''
                if (content) {
                  fullResponse += content
                  if (onChunk) {
                    onChunk(content)
                  }
                }
              }
            }
          } catch (parseError) {
            console.debug('解析本地模型流响应行失败，跳过该行:', line)
          }
        }
      }
    } finally {
      reader.releaseLock()
    }

    return fullResponse
  }
}
