import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PrismaService } from '../prisma/prisma.service'
import OpenAI from 'openai'

interface LLMConfig {
  provider: 'openai' | 'ollama' | 'deepseek' | 'qwen' | 'local'
  modelName: string
  apiEndpoint?: string
  apiKey?: string
  temperature: number
  maxTokens: number
  isDefault: boolean
}

@Injectable()
export class LLMService {
  private openai: OpenAI | null = null

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    this.initializeOpenAI()
  }

  private initializeOpenAI() {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY')
    if (apiKey) {
      this.openai = new OpenAI({ apiKey })
    }
  }

  async generateCompletion(prompt: string, options?: any): Promise<string> {
    const defaultConfig = await this.getDefaultConfig()
    
    if (!defaultConfig) {
      throw new BadRequestException('No default LLM configuration found')
    }

    switch (defaultConfig.provider) {
      case 'openai':
        return this.generateOpenAICompletion(prompt, defaultConfig, options)
      case 'ollama':
        return this.generateOllamaCompletion(prompt, defaultConfig, options)
      case 'deepseek':
        return this.generateDeepSeekCompletion(prompt, defaultConfig, options)
      case 'qwen':
        return this.generateQwenCompletion(prompt, defaultConfig, options)
      case 'local':
        return this.generateLocalCompletion(prompt, defaultConfig, options)
      default:
        throw new BadRequestException(`Unsupported LLM provider: ${defaultConfig.provider}`)
    }
  }

  private async generateOpenAICompletion(
    prompt: string,
    config: LLMConfig,
    options?: any,
  ): Promise<string> {
    if (!this.openai) {
      throw new BadRequestException('OpenAI API key not configured')
    }

    try {
      const completion = await this.openai.chat.completions.create({
        model: config.modelName,
        messages: [{ role: 'user', content: prompt }],
        temperature: config.temperature,
        max_tokens: config.maxTokens,
        ...options,
      })

      return completion.choices[0]?.message?.content || ''
    } catch (error) {
      throw new BadRequestException(`OpenAI API error: ${error.message}`)
    }
  }

  private async generateOllamaCompletion(
    prompt: string,
    config: LLMConfig,
    options?: any,
  ): Promise<string> {
    const endpoint = config.apiEndpoint || 'http://localhost:11434/api/generate'
    
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: config.modelName,
          prompt,
          options: {
            temperature: config.temperature,
            num_predict: config.maxTokens,
          },
          ...options,
        }),
      })

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.statusText}`)
      }

      const data = await response.json()
      return data.response || ''
    } catch (error) {
      throw new BadRequestException(`Ollama API error: ${error.message}`)
    }
  }

  private async generateDeepSeekCompletion(
    prompt: string,
    config: LLMConfig,
    options?: any,
  ): Promise<string> {
    const endpoint = config.apiEndpoint || 'https://api.deepseek.com/v1/chat/completions'
    const apiKey = config.apiKey || this.configService.get<string>('DEEPSEEK_API_KEY')
    
    if (!apiKey) {
      throw new BadRequestException('DeepSeek API key not configured')
    }

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: config.modelName,
          messages: [{ role: 'user', content: prompt }],
          temperature: config.temperature,
          max_tokens: config.maxTokens,
          ...options,
        }),
      })

      if (!response.ok) {
        throw new Error(`DeepSeek API error: ${response.statusText}`)
      }

      const data = await response.json()
      return data.choices[0]?.message?.content || ''
    } catch (error) {
      throw new BadRequestException(`DeepSeek API error: ${error.message}`)
    }
  }

  private async generateQwenCompletion(
    prompt: string,
    config: LLMConfig,
    options?: any,
  ): Promise<string> {
    const endpoint = config.apiEndpoint || 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions'
    const apiKey = config.apiKey || this.configService.get<string>('QIANWEN_API_KEY')
    
    if (!apiKey) {
      throw new BadRequestException('Qwen API key not configured')
    }

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: config.modelName,
          messages: [{ role: 'user', content: prompt }],
          temperature: config.temperature,
          max_tokens: config.maxTokens,
          ...options,
        }),
      })

      if (!response.ok) {
        throw new Error(`Qwen API error: ${response.statusText}`)
      }

      const data = await response.json()
      return data.choices[0]?.message?.content || ''
    } catch (error) {
      throw new BadRequestException(`Qwen API error: ${error.message}`)
    }
  }

  private async generateLocalCompletion(
    prompt: string,
    config: LLMConfig,
    options?: any,
  ): Promise<string> {
    const endpoint = config.apiEndpoint || 'http://localhost:8080/v1/completions'
    
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          temperature: config.temperature,
          max_tokens: config.maxTokens,
          ...options,
        }),
      })

      if (!response.ok) {
        throw new Error(`Local model API error: ${response.statusText}`)
      }

      const data = await response.json()
      return data.choices?.[0]?.text || data.text || ''
    } catch (error) {
      throw new BadRequestException(`Local model API error: ${error.message}`)
    }
  }

  async getDefaultConfig(): Promise<LLMConfig | null> {
    const config = await this.prisma.lLMConfiguration.findFirst({
      where: { isDefault: true, isActive: true },
    })

    if (!config) {
      return null
    }

    return {
      provider: config.provider as any,
      modelName: config.modelName,
      apiEndpoint: config.apiEndpoint || undefined,
      apiKey: config.apiKey || undefined,
      temperature: config.temperature,
      maxTokens: config.maxTokens,
      isDefault: config.isDefault,
    }
  }

  async testConnection(config: LLMConfig): Promise<boolean> {
    try {
      const testPrompt = 'Hello, please respond with "OK" if you can hear me.'
      const response = await this.generateCompletion(testPrompt, config)
      return response.includes('OK') || response.trim().length > 0
    } catch {
      return false
    }
  }

  async getAllConfigurations() {
    return this.prisma.lLMConfiguration.findMany({
      orderBy: { createdAt: 'desc' },
    })
  }

  async createConfiguration(data: any) {
    // 如果设置为默认，先将其他配置的默认标志设为false
    if (data.isDefault) {
      await this.prisma.lLMConfiguration.updateMany({
        where: { isDefault: true },
        data: { isDefault: false },
      })
    }

    return this.prisma.lLMConfiguration.create({
      data,
    })
  }

  async updateConfiguration(id: string, data: any) {
    // 检查配置是否存在
    const existingConfig = await this.prisma.lLMConfiguration.findUnique({
      where: { id },
    })

    if (!existingConfig) {
      throw new NotFoundException(`Configuration with ID ${id} not found`)
    }

    // 如果设置为默认，先将其他配置的默认标志设为false
    if (data.isDefault) {
      await this.prisma.lLMConfiguration.updateMany({
        where: { isDefault: true, NOT: { id } },
        data: { isDefault: false },
      })
    }

    return this.prisma.lLMConfiguration.update({
      where: { id },
      data,
    })
  }

  async deleteConfiguration(id: string) {
    // 检查配置是否存在
    const existingConfig = await this.prisma.lLMConfiguration.findUnique({
      where: { id },
    })

    if (!existingConfig) {
      throw new NotFoundException(`Configuration with ID ${id} not found`)
    }

    return this.prisma.lLMConfiguration.delete({
      where: { id },
    })
  }

  async setDefaultConfiguration(id: string) {
    // 检查配置是否存在
    const existingConfig = await this.prisma.lLMConfiguration.findUnique({
      where: { id },
    })

    if (!existingConfig) {
      throw new NotFoundException(`Configuration with ID ${id} not found`)
    }

    // 将所有配置的默认标志设为false
    await this.prisma.lLMConfiguration.updateMany({
      where: { isDefault: true },
      data: { isDefault: false },
    })

    // 设置当前配置为默认
    return this.prisma.lLMConfiguration.update({
      where: { id },
      data: { isDefault: true },
    })
  }

  async testConfigurationById(id: string): Promise<boolean> {
    const config = await this.prisma.lLMConfiguration.findUnique({
      where: { id },
    })

    if (!config) {
      throw new NotFoundException(`Configuration with ID ${id} not found`)
    }

    const llmConfig: LLMConfig = {
      provider: config.provider as any,
      modelName: config.modelName,
      apiEndpoint: config.apiEndpoint || undefined,
      apiKey: config.apiKey || undefined,
      temperature: config.temperature,
      maxTokens: config.maxTokens,
      isDefault: config.isDefault,
    }

    return this.testConnection(llmConfig)
  }
}