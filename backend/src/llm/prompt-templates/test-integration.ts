import { Test } from '@nestjs/testing'
import { LLMModule } from '../llm.module'
import { LLMService } from '../llm.service'
import { PromptTemplateService } from './prompt-template.service'
import { ConfigModule } from '@nestjs/config'
import { PrismaModule } from '../../prisma/prisma.module'
import { AuthModule } from '../../auth/auth.module'

async function testPromptTemplateIntegration() {
  console.log('开始测试提示词模板系统集成...')

  const moduleRef = await Test.createTestingModule({
    imports: [
      ConfigModule.forRoot({
        isGlobal: true,
      }),
      PrismaModule,
      AuthModule,
      LLMModule,
    ],
  }).compile()

  const app = moduleRef.createNestApplication()
  await app.init()

  const llmService = app.get(LLMService)
  const promptTemplateService = app.get(PromptTemplateService)

  console.log('1. 测试获取所有模板...')
  const allTemplates = await promptTemplateService.findAll()
  console.log(`找到 ${allTemplates.length} 个模板`)

  console.log('2. 测试查找最佳匹配模板...')
  const bestMatch = await promptTemplateService.findBestMatch({
    category: 'requirement_to_user_story',
    provider: 'openai',
    modelName: 'gpt-4',
  })
  console.log('最佳匹配模板:', bestMatch ? bestMatch.name : '未找到')

  console.log('3. 测试渲染模板...')
  if (bestMatch) {
    const rendered = await promptTemplateService.renderTemplate(bestMatch.id, {
      requirement: '用户需要登录系统',
      context: '这是一个电商系统',
    })
    console.log('渲染结果:', rendered.substring(0, 200) + '...')
  }

  console.log('4. 测试使用模板生成内容...')
  try {
    const result = await llmService.generateCompletionWithTemplate({
      category: 'requirement_to_user_story',
      provider: 'openai',
      modelName: 'gpt-4',
      variables: {
        requirement: '用户需要登录系统',
        context: '这是一个电商系统',
      },
    })
    console.log('生成结果:', result.substring(0, 200) + '...')
  } catch (error) {
    console.log('生成内容失败（可能是API配置问题）:', error.message)
  }

  console.log('5. 测试创建新模板...')
  const newTemplate = await promptTemplateService.create({
    name: '测试模板',
    description: '用于集成测试的模板',
    template: '根据需求 {{requirement}} 和上下文 {{context}} 生成用户故事。',
    category: 'requirement_to_user_story',
    provider: 'test',
    modelName: 'test-model',
    isDefault: false,
    isActive: true,
    variables: ['requirement', 'context'],
  })
  console.log('创建的新模板ID:', newTemplate.id)

  console.log('6. 测试更新模板...')
  const updatedTemplate = await promptTemplateService.update(newTemplate.id, {
    description: '更新后的测试模板描述',
  })
  console.log('更新后的模板描述:', updatedTemplate.description)

  console.log('7. 测试删除模板...')
  await promptTemplateService.delete(newTemplate.id)
  console.log('模板删除成功')

  console.log('8. 测试默认模板初始化...')
  const defaultTemplates = allTemplates.filter(t => t.isDefault)
  console.log(`系统中有 ${defaultTemplates.length} 个默认模板`)

  console.log('集成测试完成！')
  await app.close()
}

testPromptTemplateIntegration().catch(console.error)