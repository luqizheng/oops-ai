import { Injectable } from '@nestjs/common'
import { BaseLLMProvider } from './base.provider'
import { ChatMessage, LLMProviderConfig } from '../types/llm.types'

@Injectable()
export class OllamaProvider extends BaseLLMProvider {
  private endpoint: string

  getProviderName(): string {
    return 'ollama'
  }

  getSupportedModels(): string[] {
    return [
      'llama3',
      'llama3:8b',
      'llama3:70b',
      'mistral',
      'mixtral',
      'codellama',
      'phi',
      'neural-chat',
      'starling-lm',
      'orca-mini',
      'vicuna',
      'gemma',
      'gemma2',
      'deepseek-r1:8b',
    ]
  }

  getProviderConfig(): LLMProviderConfig {
    return {
      name: 'ollama',
      displayName: 'Ollama',
      description: '本地部署的Ollama服务，支持多种开源模型',
      supportedModels: this.getSupportedModels(),
      defaultEndpoint: 'http://localhost:11434/api',
      requiresApiKey: false,
      supportsStreaming: true,
      supportsChat: true,
      supportsFunctions: false,
    }
  }

  protected async initializeClient(): Promise<void> {
    this.endpoint = this.config.apiEndpoint || 'http://localhost:11434/api'
  }

  protected async _generateCompletion(prompt: string, options?: any): Promise<string> {
    try {
      const mergedOptions = this.mergeOptions(options)
      const endpoint = `${this.endpoint}/generate`

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.config.modelName,
          prompt,
          options: {
            temperature: mergedOptions.temperature,
            num_predict: mergedOptions.max_tokens,
          },
          ...options,
        }),
      })

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.statusText}`)
      }

      const content = await response.text()
      return this.parseOllamaResponse(content)
    } catch (error) {
      throw new Error(`Ollama API error: ${error.message}`)
    }
  }

  protected async _generateChatCompletion(messages: ChatMessage[], options?: any): Promise<string> {
    try {
      const mergedOptions = this.mergeOptions(options)
      const endpoint = `${this.endpoint}/chat`

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.config.modelName,
          messages,
          options: {
            temperature: mergedOptions.temperature,
            num_predict: mergedOptions.max_tokens,
          },
          ...options,
        }),
      })

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.statusText}`)
      }

      const content = await response.text()
      return this.parseOllamaResponse(content)
    } catch (error) {
      throw new Error(`Ollama API error: ${error.message}`)
    }
  }

  protected async _generateCompletionStream(
    prompt: string,
    options?: any,
    onChunk?: (chunk: string) => void,
  ): Promise<string> {
    try {
      const mergedOptions = this.mergeOptions(options)
      const endpoint = `${this.endpoint}/generate`

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.config.modelName,
          prompt,
          stream: true,
          options: {
            temperature: mergedOptions.temperature,
            num_predict: mergedOptions.max_tokens,
          },
          ...options,
        }),
      })

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.statusText}`)
      }

      return await this.processOllamaStream(response, onChunk)
    } catch (error) {
      throw new Error(`Ollama API error: ${error.message}`)
    }
  }

  protected async _generateChatCompletionStream(
    messages: ChatMessage[],
    options?: any,
    onChunk?: (chunk: string) => void,
  ): Promise<string> {
    try {
      const mergedOptions = this.mergeOptions(options)
      const endpoint = `${this.endpoint}/chat`

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.config.modelName,
          messages,
          stream: true,
          options: {
            temperature: mergedOptions.temperature,
            num_predict: mergedOptions.max_tokens,
          },
          ...options,
        }),
      })

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.statusText}`)
      }

      return await this.processOllamaStream(response, onChunk)
    } catch (error) {
      throw new Error(`Ollama API error: ${error.message}`)
    }
  }

  private parseOllamaResponse(content: string): string {
    const lines = content.split('\n').filter((line) => line.trim() !== '')
    let fullResponse = ''

    for (const line of lines) {
      try {
        const jsonLine = line.startsWith('data: ') ? line.slice(6).trim() : line.trim()
        if (!jsonLine) continue

        const data = JSON.parse(jsonLine)

        if (data.response) {
          fullResponse += data.response
        }

        if (data.done) {
          break
        }
      } catch (parseError) {
        console.debug('解析Ollama响应行失败，跳过该行:', line)
      }
    }

    return fullResponse
  }

  private async processOllamaStream(
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
            const jsonLine = line.startsWith('data: ') ? line.slice(6).trim() : line.trim()
            if (!jsonLine) continue

            const data = JSON.parse(jsonLine)

            if (data.response) {
              fullResponse += data.response
              if (onChunk) {
                onChunk(data.response)
              }
            }

            if (data.done) {
              return fullResponse
            }
          } catch (parseError) {
            console.debug('解析Ollama流响应行失败，跳过该行:', line)
          }
        }
      }
    } finally {
      reader.releaseLock()
    }

    return fullResponse
  }
}
