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

  async generateCompletion(prompt: string, config?: LLMConfig, options?: any): Promise<string> {
    // Use provided config if available, otherwise get default
    const finalConfig = config || (await this.getDefaultConfig())

    if (!finalConfig) {
      throw new BadRequestException('No default LLM configuration found')
    }

    switch (finalConfig.provider) {
      case 'openai':
        return this.generateOpenAICompletion(prompt, finalConfig, options)
      case 'ollama':
        return this.generateOllamaCompletion(prompt, finalConfig, options)
      case 'deepseek':
        return this.generateDeepSeekCompletion(prompt, finalConfig, options)
      case 'qwen':
        return this.generateQwenCompletion(prompt, finalConfig, options)
      case 'local':
        return this.generateLocalCompletion(prompt, finalConfig, options)
      default:
        throw new BadRequestException(`Unsupported LLM provider: ${finalConfig.provider}`)
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

      const content = await response.text()
     
      // Ollama返回的是SSE流格式，需要逐行解析JSON
      const lines = content.split('\n').filter((line) => line.trim() !== '')
      let fullResponse = ''

      for (const line of lines) {
     
        try {
          // 处理标准SSE格式（如"data: {...}"）和普通JSON行
          const jsonLine = line.startsWith('data: ') ? line.slice(6).trim() : line.trim()
          if (!jsonLine) continue

          const data = JSON.parse(jsonLine)

          // 拼接响应内容
          if (data.response) {
            fullResponse += data.response
          }

          // 检查是否完成
          if (data.done) {
            break
          }
        } catch (parseError) {
          // 忽略无法解析的行，继续处理其他行
          console.debug('解析Ollama响应行失败，跳过该行:', line)
        }
      }
    
      // 如果没有找到完整响应，返回已解析的部分
      return fullResponse

      // const data = await response.json()
      // return data.response || ''
    } catch (error) {
      throw new BadRequestException(`Ollama API error: ${error.message}`)
    }
  }

  private async generateDeepSeekCompletion(
    prompt: string,
    config: LLMConfig,
    options?: any,
  ): Promise<string> {
    const apiKey = config.apiKey || this.configService.get<string>('DEEPSEEK_API_KEY')
    if (!apiKey) {
      throw new BadRequestException('DeepSeek API key not configured')
    }
    console.log('use deepseek  request content is:', prompt)
    try {
      const deepseek = new OpenAI({
        baseURL: config.apiEndpoint || 'https://api.deepseek.com/v1',
        apiKey: apiKey,
      })

      const completion = await deepseek.chat.completions.create({
        model: config.modelName,
        messages: [{ role: 'user', content: prompt }],
        temperature: config.temperature,
        max_tokens: config.maxTokens,
        ...options,
      })
      console.log(
        'use deepseek response content is:',
        completion.choices[0]?.message?.content || '',
      )

      return completion.choices[0]?.message?.content || ''
    } catch (error) {
      throw new BadRequestException(`DeepSeek API error: ${error.message}`)
    }
  }

  private async generateQwenCompletion(
    prompt: string,
    config: LLMConfig,
    options?: any,
  ): Promise<string> {
    const endpoint =
      config.apiEndpoint || 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions'
    const apiKey = config.apiKey || this.configService.get<string>('QIANWEN_API_KEY')

    if (!apiKey) {
      throw new BadRequestException('Qwen API key not configured')
    }

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
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
