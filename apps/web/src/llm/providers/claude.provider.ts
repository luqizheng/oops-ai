import { Injectable } from '@nestjs/common'
import { BaseLLMProvider } from './base.provider'
import { ChatMessage, LLMProviderConfig } from '../types/llm.types'

@Injectable()
export class ClaudeProvider extends BaseLLMProvider {
  private endpoint: string

  getProviderName(): string {
    return 'claude'
  }

  getSupportedModels(): string[] {
    return [
      'claude-3-opus',
      'claude-3-sonnet',
      'claude-3-haiku',
      'claude-2.1',
      'claude-2.0',
      'claude-instant',
    ]
  }

  getProviderConfig(): LLMProviderConfig {
    return {
      name: 'claude',
      displayName: 'Claude (Anthropic)',
      description: 'Anthropic Claude系列模型',
      supportedModels: this.getSupportedModels(),
      defaultEndpoint: 'https://api.anthropic.com/v1',
      requiresApiKey: true,
      supportsStreaming: true,
      supportsChat: true,
      supportsFunctions: false,
    }
  }

  protected async initializeClient(): Promise<void> {
    if (!this.config.apiKey) {
      throw new Error('Claude API key is required')
    }

    this.endpoint = this.config.apiEndpoint || 'https://api.anthropic.com/v1'
  }

  protected async _generateCompletion(prompt: string, options?: any): Promise<string> {
    try {
      const mergedOptions = this.mergeOptions(options)
      const endpoint = `${this.endpoint}/messages`

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.config.apiKey!,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: this.config.modelName,
          max_tokens: mergedOptions.max_tokens,
          temperature: mergedOptions.temperature,
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
          ...options,
        }),
      })

      if (!response.ok) {
        throw new Error(`Claude API error: ${response.statusText}`)
      }

      const data = await response.json()
      return data.content?.[0]?.text || ''
    } catch (error) {
      throw new Error(`Claude API error: ${error.message}`)
    }
  }

  protected async _generateChatCompletion(messages: ChatMessage[], options?: any): Promise<string> {
    try {
      const mergedOptions = this.mergeOptions(options)
      const endpoint = `${this.endpoint}/messages`

      // 转换消息格式为Claude格式
      const claudeMessages = messages.map((msg) => ({
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        content: msg.content,
      }))

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.config.apiKey!,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: this.config.modelName,
          max_tokens: mergedOptions.max_tokens,
          temperature: mergedOptions.temperature,
          messages: claudeMessages,
          ...options,
        }),
      })

      if (!response.ok) {
        throw new Error(`Claude API error: ${response.statusText}`)
      }

      const data = await response.json()
      return data.content?.[0]?.text || ''
    } catch (error) {
      throw new Error(`Claude API error: ${error.message}`)
    }
  }

  protected async _generateCompletionStream(
    prompt: string,
    options?: any,
    onChunk?: (chunk: string) => void,
  ): Promise<string> {
    try {
      const mergedOptions = this.mergeOptions(options)
      const endpoint = `${this.endpoint}/messages`

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.config.apiKey!,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: this.config.modelName,
          max_tokens: mergedOptions.max_tokens,
          temperature: mergedOptions.temperature,
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
          stream: true,
          ...options,
        }),
      })

      if (!response.ok) {
        throw new Error(`Claude API error: ${response.statusText}`)
      }

      return await this.processClaudeStream(response, onChunk)
    } catch (error) {
      throw new Error(`Claude API error: ${error.message}`)
    }
  }

  protected async _generateChatCompletionStream(
    messages: ChatMessage[],
    options?: any,
    onChunk?: (chunk: string) => void,
  ): Promise<string> {
    try {
      const mergedOptions = this.mergeOptions(options)
      const endpoint = `${this.endpoint}/messages`

      // 转换消息格式为Claude格式
      const claudeMessages = messages.map((msg) => ({
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        content: msg.content,
      }))

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.config.apiKey!,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: this.config.modelName,
          max_tokens: mergedOptions.max_tokens,
          temperature: mergedOptions.temperature,
          messages: claudeMessages,
          stream: true,
          ...options,
        }),
      })

      if (!response.ok) {
        throw new Error(`Claude API error: ${response.statusText}`)
      }

      return await this.processClaudeStream(response, onChunk)
    } catch (error) {
      throw new Error(`Claude API error: ${error.message}`)
    }
  }

  private async processClaudeStream(
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

              if (data.type === 'content_block_delta' && data.delta?.text) {
                const content = data.delta.text
                fullResponse += content
                if (onChunk) {
                  onChunk(content)
                }
              }

              if (data.type === 'message_stop') {
                return fullResponse
              }
            }
          } catch (parseError) {
            console.debug('解析Claude流响应行失败，跳过该行:', line)
          }
        }
      }
    } finally {
      reader.releaseLock()
    }

    return fullResponse
  }
}
