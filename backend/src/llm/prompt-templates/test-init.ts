import { Test } from '@nestjs/testing'
import { LLMModule } from '../llm.module'
import { PromptTemplateService } from './prompt-template.service'
import { PromptTemplateInitService } from './prompt-template-init.service'
import { PrismaModule } from '../../prisma/prisma.module'
import { AuthModule } from '../../auth/auth.module'
import { ConfigModule } from '@nestjs/config'

async function testInit() {
  console.log('测试默认模板初始化...')

  try {
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

    const promptTemplateService = app.get(PromptTemplateService)
    const initService = app.get(PromptTemplateInitService)

    console.log('1. 手动调用初始化方法...')
    await initService.initializeDefaultTemplates()
    console.log('✅ 初始化完成')

    console.log('2. 检查模板数量...')
    const templates = await promptTemplateService.findAll()
    console.log(`✅ 模板总数: ${templates.length}`)

    console.log('3. 检查默认模板...')
    const defaultTemplates = templates.filter(t => t.isDefault)
    console.log(`✅ 默认模板数量: ${defaultTemplates.length}`)

    console.log('4. 按类别分组统计...')
    const categories = {}
    templates.forEach(template => {
      categories[template.category] = (categories[template.category] || 0) + 1
    })
    console.log('类别分布:', categories)

    console.log('5. 检查不同提供商的模板...')
    const providers = {}
    templates.forEach(template => {
      providers[template.provider] = (providers[template.provider] || 0) + 1
    })
    console.log('提供商分布:', providers)

    console.log('6. 测试模板匹配...')
    const testCases = [
      { category: 'raw-to-requirement', provider: 'openai', modelName: 'gpt-4' },
      { category: 'requirement-to-story', provider: 'deepseek', modelName: 'deepseek-chat' },
      { category: 'story-to-use-case', provider: 'ollama', modelName: 'llama3' },
      { category: 'generate-acceptance', provider: 'qwen', modelName: 'qwen2.5' },
    ]

    for (const testCase of testCases) {
      const match = await promptTemplateService.findBestMatch(testCase.category, testCase.provider, testCase.modelName)
      console.log(`匹配 ${testCase.category} (${testCase.provider}/${testCase.modelName}): ${match ? match.name : '未找到'}`)
    }

    await app.close()
    console.log('✅ 初始化测试完成！')
  } catch (error) {
    console.error('❌ 测试失败:', error)
    console.error('错误堆栈:', error.stack)
  }
}

testInit()