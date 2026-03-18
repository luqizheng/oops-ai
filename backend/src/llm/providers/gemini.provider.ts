import { Injectable } from '@nestjs/common'
import { BaseLLMProvider } from './base.provider'
import { ChatMessage, LLMProviderConfig } from '../types/llm.types'

@Injectable()
export class GeminiProvider extends BaseLLMProvider {
  private endpoint: string

  getProviderName(): string {
    return 'gemini'
  }

  getSupportedModels(): string[] {
    return [
      'gemini-pro',
      'gemini-pro-vision',
      'gemini-ultra',
      'gemini-nano',
      'text-bison-001',
      'chat-bison-001',
    ]
  }

  getProviderConfig(): LLMProviderConfig {
    return {
      name: 'gemini',
      displayName: 'Gemini (Google)',
      description: 'Google Gemini系列模型',
      supportedModels: this.getSupportedModels(),
      defaultEndpoint: 'https://generativelanguage.googleapis.com/v1beta',
      requiresApiKey: true,
      supportsStreaming: true,
      supportsChat: true,
      supportsFunctions: true,
    }
  }

  protected async initializeClient(): Promise<void> {
    if (!this.config.apiKey) {
      throw new Error('Gemini API key is required')
    }

    this.endpoint = this.config.apiEndpoint || 'https://generativelanguage.googleapis.com/v1beta'
  }

  protected async _generateCompletion(prompt: string, options?: any): Promise<string> {
    try {
      const mergedOptions = this.mergeOptions(options)
      const endpoint = `${this.endpoint}/models/${this.config.modelName}:generateContent?key=${this.config.apiKey}`

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: mergedOptions.temperature,
            maxOutputTokens: mergedOptions.max_tokens,
            ...options,
          },
        }),
      })

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.statusText}`)
      }

      const data = await response.json()
      return data.candidates?.[0]?.content?.parts?.[0]?.text || ''
    } catch (error) {
      throw new Error(`Gemini API error: ${error.message}`)
    }
  }

  protected async _generateChatCompletion(messages: ChatMessage[], options?: any): Promise<string> {
    try {
      const mergedOptions = this.mergeOptions(options)
      const endpoint = `${this.endpoint}/models/${this.config.modelName}:generateContent?key=${this.config.apiKey}`

      // 转换消息格式为Gemini格式
      const contents = messages.map((msg) => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [
          {
            text: msg.content,
          },
        ],
      }))

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents,
          generationConfig: {
            temperature: mergedOptions.temperature,
            maxOutputTokens: mergedOptions.max_tokens,
            ...options,
          },
        }),
      })

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.statusText}`)
      }

      const data = await response.json()
      return data.candidates?.[0]?.content?.parts?.[0]?.text || ''
    } catch (error) {
      throw new Error(`Gemini API error: ${error.message}`)
    }
  }

  protected async _generateCompletionStream(
    prompt: string,
    options?: any,
    onChunk?: (chunk: string) => void,
  ): Promise<string> {
    try {
      const mergedOptions = this.mergeOptions(options)
      const endpoint = `${this.endpoint}/models/${this.config.modelName}:streamGenerateContent?key=${this.config.apiKey}`

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: mergedOptions.temperature,
            maxOutputTokens: mergedOptions.max_tokens,
            ...options,
          },
        }),
      })

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.statusText}`)
      }

      return await this.processGeminiStream(response, onChunk)
    } catch (error) {
      throw new Error(`Gemini API error: ${error.message}`)
    }
  }

  protected async _generateChatCompletionStream(
    messages: ChatMessage[],
    options?: any,
    onChunk?: (chunk: string) => void,
  ): Promise<string> {
    try {
      const mergedOptions = this.mergeOptions(options)
      const endpoint = `${this.endpoint}/models/${this.config.modelName}:streamGenerateContent?key=${this.config.apiKey}`

      // 转换消息格式为Gemini格式
      const contents = messages.map((msg) => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [
          {
            text: msg.content,
          },
        ],
      }))

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents,
          generationConfig: {
            temperature: mergedOptions.temperature,
            maxOutputTokens: mergedOptions.max_tokens,
            ...options,
          },
        }),
      })

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.statusText}`)
      }

      return await this.processGeminiStream(response, onChunk)
    } catch (error) {
      throw new Error(`Gemini API error: ${error.message}`)
    }
  }

  private async processGeminiStream(
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

              if (data.candidates && data.candidates[0]) {
                const content = data.candidates[0].content?.parts?.[0]?.text || ''
                if (content) {
                  fullResponse += content
                  if (onChunk) {
                    onChunk(content)
                  }
                }
              }
            }
          } catch (parseError) {
            console.debug('解析Gemini流响应行失败，跳过该行:', line)
          }
        }
      }
    } finally {
      reader.releaseLock()
    }

    return fullResponse
  }
}
