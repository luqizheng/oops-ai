import { Injectable, OnModuleInit } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { defaultPromptTemplates } from './default-templates'

@Injectable()
export class PromptTemplateInitService implements OnModuleInit {
  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    await this.initializeDefaultTemplates()
  }

  async initializeDefaultTemplates() {
    try {
      const existingCount = await this.prisma.promptTemplate.count()
      
      if (existingCount === 0) {
        console.log('正在初始化默认提示词模板...')
        
        for (const template of defaultPromptTemplates) {
          await this.prisma.promptTemplate.create({
            data: {
              name: template.name,
              description: template.description,
              template: template.template,
              category: template.category,
              provider: template.provider || null,
              modelName: null, // 默认不绑定特定模型
              isDefault: template.isDefault,
              isActive: template.isActive,
              variables: template.variables,
            },
          })
        }
        
        console.log(`成功初始化 ${defaultPromptTemplates.length} 个默认提示词模板`)
      }
    } catch (error) {
      console.error('初始化提示词模板失败:', error)
    }
  }
}