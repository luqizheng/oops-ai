import { Injectable } from '@nestjs/common'
import { ILLMProvider } from '../interfaces/llm.interface'
import { LLMConfig, LLMProviderConfig } from '../types/llm.types'
import { OpenAIProvider } from './openai.provider'
import { OllamaProvider } from './ollama.provider'
import { DeepSeekProvider } from './deepseek.provider'
import { QwenProvider } from './qwen.provider'
import { LocalProvider } from './local.provider'
import { ClaudeProvider } from './claude.provider'
import { GeminiProvider } from './gemini.provider'

@Injectable()
export class LLMProviderFactory {
  private providerInstances: Map<string, ILLMProvider> = new Map()

  async createProvider(config: LLMConfig): Promise<ILLMProvider> {
    const cacheKey = this.getCacheKey(config)

    if (this.providerInstances.has(cacheKey)) {
      return this.providerInstances.get(cacheKey)!
    }

    let provider: ILLMProvider

    switch (config.provider) {
      case 'openai':
        provider = new OpenAIProvider()
        break
      case 'ollama':
        provider = new OllamaProvider()
        break
      case 'deepseek':
        provider = new DeepSeekProvider()
        break
      case 'qwen':
        provider = new QwenProvider()
        break
      case 'local':
        provider = new LocalProvider()
        break
      case 'claude':
        provider = new ClaudeProvider()
        break
      case 'gemini':
        provider = new GeminiProvider()
        break
      default:
        throw new Error(`Unsupported LLM provider: ${config.provider}`)
    }

    await provider.initialize(config)
    this.providerInstances.set(cacheKey, provider)

    return provider
  }

  getProviderConfig(providerName: string): LLMProviderConfig {
    switch (providerName) {
      case 'openai':
        return new OpenAIProvider().getProviderConfig()
      case 'ollama':
        return new OllamaProvider().getProviderConfig()
      case 'deepseek':
        return new DeepSeekProvider().getProviderConfig()
      case 'qwen':
        return new QwenProvider().getProviderConfig()
      case 'local':
        return new LocalProvider().getProviderConfig()
      case 'claude':
        return new ClaudeProvider().getProviderConfig()
      case 'gemini':
        return new GeminiProvider().getProviderConfig()
      default:
        throw new Error(`Unsupported LLM provider: ${providerName}`)
    }
  }

  getAllProviderConfigs(): LLMProviderConfig[] {
    return ['openai', 'ollama', 'deepseek', 'qwen', 'local', 'claude', 'gemini'].map((provider) =>
      this.getProviderConfig(provider),
    )
  }

  getAvailableProviders(): string[] {
    return ['openai', 'ollama', 'deepseek', 'qwen', 'local', 'claude', 'gemini']
  }

  clearCache(): void {
    this.providerInstances.clear()
  }

  clearProviderCache(providerName: string, config?: LLMConfig): void {
    if (config) {
      const cacheKey = this.getCacheKey(config)
      this.providerInstances.delete(cacheKey)
    } else {
      for (const [key] of this.providerInstances.entries()) {
        if (key.startsWith(`${providerName}:`)) {
          this.providerInstances.delete(key)
        }
      }
    }
  }

  private getCacheKey(config: LLMConfig): string {
    return `${config.provider}:${config.modelName}:${config.apiEndpoint || 'default'}`
  }
}
