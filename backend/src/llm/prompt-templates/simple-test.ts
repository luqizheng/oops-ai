import { Test } from '@nestjs/testing'
import { LLMModule } from '../llm.module'
import { PromptTemplateService } from './prompt-template.service'
import { PrismaModule } from '../../prisma/prisma.module'
import { AuthModule } from '../../auth/auth.module'
import { ConfigModule } from '@nestjs/config'

async function simpleTest() {
  console.log('开始简单测试...')

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
    console.log('✅ PromptTemplateService 成功注入')

    const templates = await promptTemplateService.findAll()
    console.log(`✅ 成功获取模板，数量: ${templates.length}`)

    if (templates.length > 0) {
      const template = templates[0]
      console.log(`✅ 第一个模板: ${template.name}`)
      
      const rendered = await promptTemplateService.renderTemplate(template.id, {
        requirement: '测试需求',
        context: '测试上下文',
      })
      console.log(`✅ 模板渲染成功，长度: ${rendered.length}`)
    }

    await app.close()
    console.log('✅ 所有测试通过！')
  } catch (error) {
    console.error('❌ 测试失败:', error)
    console.error('错误堆栈:', error.stack)
  }
}

simpleTest()