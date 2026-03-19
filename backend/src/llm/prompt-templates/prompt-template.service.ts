import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { LLMService } from '../llm.service'

export interface PromptTemplate {
  id: string
  name: string
  description?: string
  template: string
  category: string
  provider?: string
  modelName?: string
  isDefault: boolean
  isActive: boolean
  variables: string[]
  createdAt: Date
  updatedAt: Date
}

export interface PromptTemplateCreateInput {
  name: string
  description?: string
  template: string
  category: string
  provider?: string
  modelName?: string
  isDefault?: boolean
  isActive?: boolean
  variables?: string[]
}

export interface PromptTemplateUpdateInput {
  name?: string
  description?: string
  template?: string
  category?: string
  provider?: string
  modelName?: string
  isDefault?: boolean
  isActive?: boolean
  variables?: string[]
}

@Injectable()
export class PromptTemplateService {
  constructor(private prisma: PrismaService) {}

  async findAll(params?: {
    category?: string
    provider?: string
    modelName?: string
    isActive?: boolean
  }): Promise<PromptTemplate[]> {
    const where: any = {}

    if (params?.category) {
      where.category = params.category
    }

    if (params?.provider !== undefined) {
      // 处理 provider 为 null 或 "" 的情况
      if (params.provider === null || params.provider === '') {
        where.OR = where.OR || []
        where.OR.push(...[{ provider: null }, { provider: '' }])
      } else {
        where.provider = params.provider
      }
    }

    if (params?.modelName !== undefined) {
      // 处理 modelName 为 null 或 "" 的情况
      if (params.modelName === null || params.modelName === '') {
        where.OR = where.OR || []
        where.OR.push(...[{ modelName: null }, { modelName: '' }])
      } else {
        where.modelName = params.modelName
      }
    }

    if (params?.isActive !== undefined) {
      where.isActive = params.isActive
    }

    const templates = await this.prisma.promptTemplate.findMany({
      where,
      orderBy: [{ isDefault: 'desc' }, { category: 'asc' }, { name: 'asc' }],
    })

    return templates.map(this.mapToPromptTemplate)
  }

  async findById(id: string): Promise<PromptTemplate> {
    const template = await this.prisma.promptTemplate.findUnique({
      where: { id },
    })

    if (!template) {
      throw new NotFoundException(`Prompt template with ID ${id} not found`)
    }

    return this.mapToPromptTemplate(template)
  }

  async findBestMatch(
    category: string,
    provider?: string,
    modelName?: string,
  ): Promise<PromptTemplate | null> {
    // 处理空字符串为 null
    const processedProvider = provider === '' ? null : provider
    const processedModelName = modelName === '' ? null : modelName

    // 查找优先级：特定模型 > 特定供应商 > 默认配置
    const templates = await this.prisma.promptTemplate.findMany({
      where: {
        category,
        isActive: true,
        OR: [
          // 1. 完全匹配：特定模型
          { provider: processedProvider, modelName: processedModelName },
          // 2. 供应商匹配：特定供应商的默认模板 (modelName 和 provider 为 null 或 "")
          {
            OR: [
              { provider: processedProvider },
              { provider: '' },
              { modelName: null },
              { modelName: '' },
            ],
          },
          // 3. 通用默认：不指定供应商和模型 (modelName 和 provider 为 null 或 "")
          {
            OR: [{ provider: null }, { provider: '' }, { modelName: null }, { modelName: '' }],
          },
        ],
      },
      orderBy: [
        // 优先级：完全匹配 > 供应商匹配 > 通用默认
        { modelName: 'desc' },
        { provider: 'desc' },
        { isDefault: 'desc' },
      ],
    })

    console.debug('----------------------', templates)

    if (templates.length === 0) {
      return null
    }

    return this.mapToPromptTemplate(templates[0])
  }

  async create(data: PromptTemplateCreateInput): Promise<PromptTemplate> {
    // 如果设置为默认，先将同类别同配置的其他模板的默认标志设为false
    if (data.isDefault) {
      await this.prisma.promptTemplate.updateMany({
        where: {
          category: data.category,
          provider: data.provider || null,
          modelName: data.modelName || null,
          isDefault: true,
        },
        data: { isDefault: false },
      })
    }

    const template = await this.prisma.promptTemplate.create({
      data: {
        name: data.name,
        description: data.description,
        template: data.template,
        category: data.category,
        provider: data.provider,
        modelName: data.modelName,
        isDefault: data.isDefault || false,
        isActive: data.isActive !== false,
        variables: data.variables || [],
      },
    })

    return this.mapToPromptTemplate(template)
  }

  async update(id: string, data: PromptTemplateUpdateInput): Promise<PromptTemplate> {
    const existingTemplate = await this.prisma.promptTemplate.findUnique({
      where: { id },
    })

    if (!existingTemplate) {
      throw new NotFoundException(`Prompt template with ID ${id} not found`)
    }

    // 处理空字符串为 null
    const processedProvider = data.provider === '' ? null : data.provider
    const processedModelName = data.modelName === '' ? null : data.modelName

    // 如果设置为默认，先将同类别同配置的其他模板的默认标志设为false
    if (data.isDefault) {
      await this.prisma.promptTemplate.updateMany({
        where: {
          category: data.category || existingTemplate.category,
          provider: data.provider !== undefined ? processedProvider : existingTemplate.provider,
          modelName: data.modelName !== undefined ? processedModelName : existingTemplate.modelName,
          isDefault: true,
          NOT: { id },
        },
        data: { isDefault: false },
      })
    }

    const template = await this.prisma.promptTemplate.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        template: data.template,
        category: data.category,
        provider: processedProvider,
        modelName: processedModelName,
        isDefault: data.isDefault,
        isActive: data.isActive,
        variables: data.variables,
      },
    })

    return this.mapToPromptTemplate(template)
  }

  async delete(id: string): Promise<void> {
    const existingTemplate = await this.prisma.promptTemplate.findUnique({
      where: { id },
    })

    if (!existingTemplate) {
      throw new NotFoundException(`Prompt template with ID ${id} not found`)
    }

    await this.prisma.promptTemplate.delete({
      where: { id },
    })
  }

  async setDefault(id: string): Promise<PromptTemplate> {
    const template = await this.prisma.promptTemplate.findUnique({
      where: { id },
    })

    if (!template) {
      throw new NotFoundException(`Prompt template with ID ${id} not found`)
    }

    // 先将同类别同配置的其他模板的默认标志设为false
    await this.prisma.promptTemplate.updateMany({
      where: {
        category: template.category,
        AND: [
          {
            OR: [
              { provider: template.provider },
              // 处理 provider 为 null 或 "" 的情况
              ...(template.provider === null ? [{ provider: '' }] : []),
              ...(template.provider === '' ? [{ provider: null }] : []),
            ],
          },
          {
            OR: [
              { modelName: template.modelName },
              // 处理 modelName 为 null 或 "" 的情况
              ...(template.modelName === null ? [{ modelName: '' }] : []),
              ...(template.modelName === '' ? [{ modelName: null }] : []),
            ],
          },
        ],
        isDefault: true,
        NOT: { id },
      },
      data: { isDefault: false },
    })

    const updatedTemplate = await this.prisma.promptTemplate.update({
      where: { id },
      data: { isDefault: true },
    })

    return this.mapToPromptTemplate(updatedTemplate)
  }

  async renderTemplate(
    categoryOrId: string,
    variables: Record<string, any>,
    llmService?: LLMService,
    provider?: string,
    modelName?: string,
  ): Promise<string> {
    let template: PromptTemplate | null

    // 如果没有提供provider和modelName，尝试获取默认LLM配置
    if (!provider || !modelName) {
      try {
        const defaultConfig = await llmService.getDefaultConfig()
        if (defaultConfig) {
          provider = provider || defaultConfig.provider
          modelName = modelName || defaultConfig.modelName
        }
      } catch (error) {
        console.warn('Failed to get default LLM config:', error.message)
      }
    }

    // 判断是ID还是类别
    if (categoryOrId.includes('-') && !categoryOrId.includes('_')) {
      // 看起来像UUID，尝试按ID查找
      try {
        template = await this.findById(categoryOrId)
      } catch (error) {
        // 如果不是有效的ID，按类别处理
        template = await this.findBestMatch(categoryOrId, provider, modelName)
      }
    } else {
      // 按类别查找
      template = await this.findBestMatch(categoryOrId, provider, modelName)
    }

    if (!template) {
      console.error('无法通过类别或ID找到匹配的categoryOrId:', categoryOrId, provider, modelName)
      throw new NotFoundException(`No prompt template found for: ${categoryOrId}`)
    }
    const contents = this.render(template.template, variables)
    return contents
  }

  private render(template: string, variables: Record<string, any>): string {
    let result = template

    // 替换所有变量占位符
    for (const [key, value] of Object.entries(variables)) {
      const placeholder = `{{${key}}}`
      result = result.replace(new RegExp(placeholder, 'g'), String(value))
    }

    return result
  }

  private mapToPromptTemplate(template: any): PromptTemplate {
    return {
      id: template.id,
      name: template.name,
      description: template.description || undefined,
      template: template.template,
      category: template.category,
      provider: template.provider || undefined,
      modelName: template.modelName || undefined,
      isDefault: template.isDefault,
      isActive: template.isActive,
      variables: template.variables || [],
      createdAt: template.createdAt,
      updatedAt: template.updatedAt,
    }
  }
}
