import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PrismaService } from '../prisma/prisma.service'
import { PromptTemplateService } from './prompt-templates/prompt-template.service'
import { ILLMService } from './interfaces/llm.interface'
import { LLMConfig, ChatMessage } from './types/llm.types'
import { LLMProviderFactory } from './providers/provider.factory'

@Injectable()
export class LLMService implements ILLMService {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
    private promptTemplateService: PromptTemplateService,
    private providerFactory: LLMProviderFactory,
  ) {}

  async generateCompletion(prompt: string, config?: LLMConfig, options?: any): Promise<string> {
    const finalConfig = config || (await this.getDefaultConfig())

    if (!finalConfig) {
      throw new BadRequestException('No default LLM configuration found')
    }

    try {
      const provider = await this.providerFactory.createProvider(finalConfig)
      return provider.generateCompletion(prompt, options)
    } catch (error) {
      throw new BadRequestException(`LLM generation error: ${error.message}`)
    }
  }

  async generateCompletionWithDefault(prompt: string, options?: any): Promise<string> {
    const defaultConfig = await this.getDefaultConfig()
    if (!defaultConfig) {
      throw new BadRequestException('No default LLM configuration found')
    }

    return this.generateCompletion(prompt, defaultConfig, options)
  }

  async generateChatCompletion(
    messages: ChatMessage[],
    config?: LLMConfig,
    options?: any,
  ): Promise<string> {
    const finalConfig = config || (await this.getDefaultConfig())

    if (!finalConfig) {
      throw new BadRequestException('No default LLM configuration found')
    }

    try {
      const provider = await this.providerFactory.createProvider(finalConfig)
      return provider.generateChatCompletion(messages, options)
    } catch (error) {
      throw new BadRequestException(`LLM chat generation error: ${error.message}`)
    }
  }

  async generateChatCompletionWithDefault(messages: ChatMessage[], options?: any): Promise<string> {
    const defaultConfig = await this.getDefaultConfig()
    if (!defaultConfig) {
      throw new BadRequestException('No default LLM configuration found')
    }

    return this.generateChatCompletion(messages, defaultConfig, options)
  }

  async generateCompletionWithTemplate(
    category: string,
    variables: Record<string, any>,
    config?: LLMConfig,
    options?: any,
  ): Promise<string> {
    const finalConfig = config || (await this.getDefaultConfig())

    if (!finalConfig) {
      throw new BadRequestException('No default LLM configuration found')
    }

    const prompt = await this.promptTemplateService.renderTemplate(
      category,
      variables,
      finalConfig.provider,
      finalConfig.modelName,
    )

    return this.generateCompletion(prompt, finalConfig, options)
  }

  async generateChatCompletionWithTemplate(
    category: string,
    variables: Record<string, any>,
    config?: LLMConfig,
    options?: any,
  ): Promise<string> {
    const finalConfig = config || (await this.getDefaultConfig())

    if (!finalConfig) {
      throw new BadRequestException('No default LLM configuration found')
    }

    const prompt = await this.promptTemplateService.renderTemplate(
      category,
      variables,
      finalConfig.provider,
      finalConfig.modelName,
    )

    const messages: ChatMessage[] = [{ role: 'user', content: prompt }]
    return this.generateChatCompletion(messages, finalConfig, options)
  }

  async testConnection(config: LLMConfig): Promise<boolean> {
    try {
      const provider = await this.providerFactory.createProvider(config)
      return provider.testConnection()
    } catch {
      return false
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
      isActive: config.isActive,
    }
  }

  async getAllConfigurations() {
    return this.prisma.lLMConfiguration.findMany({
      orderBy: { createdAt: 'desc' },
    })
  }

  async createConfiguration(data: any) {
    if (data.isDefault) {
      await this.prisma.lLMConfiguration.updateMany({
        where: { isDefault: true },
        data: { isDefault: false },
      })
    }

    const config = await this.prisma.lLMConfiguration.create({
      data,
    })

    this.providerFactory.clearProviderCache(data.provider)

    return config
  }

  async updateConfiguration(id: string, data: any) {
    const existingConfig = await this.prisma.lLMConfiguration.findUnique({
      where: { id },
    })

    if (!existingConfig) {
      throw new NotFoundException(`Configuration with ID ${id} not found`)
    }

    if (data.isDefault) {
      await this.prisma.lLMConfiguration.updateMany({
        where: { isDefault: true, NOT: { id } },
        data: { isDefault: false },
      })
    }

    const updatedConfig = await this.prisma.lLMConfiguration.update({
      where: { id },
      data,
    })

    this.providerFactory.clearProviderCache(existingConfig.provider)

    return updatedConfig
  }

  async deleteConfiguration(id: string) {
    const existingConfig = await this.prisma.lLMConfiguration.findUnique({
      where: { id },
    })

    if (!existingConfig) {
      throw new NotFoundException(`Configuration with ID ${id} not found`)
    }

    const deletedConfig = await this.prisma.lLMConfiguration.delete({
      where: { id },
    })

    this.providerFactory.clearProviderCache(existingConfig.provider)

    return deletedConfig
  }

  async setDefaultConfiguration(id: string) {
    const existingConfig = await this.prisma.lLMConfiguration.findUnique({
      where: { id },
    })

    if (!existingConfig) {
      throw new NotFoundException(`Configuration with ID ${id} not found`)
    }

    await this.prisma.lLMConfiguration.updateMany({
      where: { isDefault: true },
      data: { isDefault: false },
    })

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
      isActive: config.isActive,
    }

    return this.testConnection(llmConfig)
  }

  async getProviderConfigs() {
    return this.providerFactory.getAllProviderConfigs()
  }

  async getAvailableProviders() {
    return this.providerFactory.getAvailableProviders()
  }
}
