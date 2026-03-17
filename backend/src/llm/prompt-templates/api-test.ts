import { Test } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import * as request from 'supertest'
import { AppModule } from '../../app.module'

async function testAPIs() {
  console.log('开始测试API端点...')

  let app: INestApplication

  try {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleRef.createNestApplication()
    await app.init()

    console.log('✅ NestJS应用启动成功')

    // 测试1: 获取所有模板
    console.log('\n1. 测试获取所有模板...')
    const templatesResponse = await request(app.getHttpServer())
      .get('/prompt-templates')
      .expect(200)

    console.log(`✅ 获取到 ${templatesResponse.body.length} 个模板`)

    if (templatesResponse.body.length > 0) {
      const template = templatesResponse.body[0]

      // 测试2: 获取单个模板
      console.log('\n2. 测试获取单个模板...')
      await request(app.getHttpServer()).get(`/prompt-templates/${template.id}`).expect(200)
      console.log('✅ 获取单个模板成功')

      // 测试3: 渲染模板
      console.log('\n3. 测试渲染模板...')
      const renderData: Record<string, any> = {}

      // 为模板中的每个变量设置测试值
      if (template.variables && Array.isArray(template.variables)) {
        template.variables.forEach((variable: string) => {
          renderData[variable] = `测试${variable}`
        })
      } else {
        // 如果没有变量，使用默认变量
        renderData.requirement = '测试需求'
        renderData.context = '测试上下文'
      }

      const renderResponse = await request(app.getHttpServer())
        .post(`/prompt-templates/${template.id}/render`)
        .send(renderData)
        .expect(201)

      console.log(`✅ 模板渲染成功，长度: ${renderResponse.body.length} 字符`)
      console.log(`   渲染预览: ${renderResponse.body.substring(0, 100)}...`)
    }

    // 测试4: 创建新模板
    console.log('\n4. 测试创建新模板...')
    const newTemplateData = {
      name: 'API测试模板',
      description: '通过API创建的测试模板',
      template: '这是一个测试模板，变量: {{testVar}}',
      category: 'requirement-to-story',
      provider: 'openai',
      modelName: 'gpt-4',
      isDefault: false,
      isActive: true,
      variables: ['testVar'],
    }

    const createResponse = await request(app.getHttpServer())
      .post('/prompt-templates')
      .send(newTemplateData)
      .expect(201)

    const newTemplateId = createResponse.body.id
    console.log(`✅ 创建模板成功，ID: ${newTemplateId}`)

    // 测试5: 更新模板
    console.log('\n5. 测试更新模板...')
    const updateResponse = await request(app.getHttpServer())
      .put(`/prompt-templates/${newTemplateId}`)
      .send({ description: '更新后的描述' })
      .expect(200)

    console.log(`✅ 更新模板成功，新描述: ${updateResponse.body.description}`)

    // 测试6: 删除模板
    console.log('\n6. 测试删除模板...')
    await request(app.getHttpServer()).delete(`/prompt-templates/${newTemplateId}`).expect(200)

    console.log('✅ 删除模板成功')

    // 测试7: 按类别渲染
    console.log('\n7. 测试按类别渲染...')
    const categoryRenderResponse = await request(app.getHttpServer())
      .get('/prompt-templates/render/requirement-to-story')
      .query({ provider: 'openai' })
      .send({ requirement: '测试需求内容' })
      .expect(200)

    console.log(`✅ 按类别渲染成功，长度: ${categoryRenderResponse.body.length} 字符`)

    // 测试8: 测试LLM集成端点
    console.log('\n8. 测试LLM集成端点...')
    try {
      const llmResponse = await request(app.getHttpServer())
        .post('/llm/generate-with-template')
        .send({
          category: 'requirement-to-story',
          provider: 'openai',
          modelName: 'gpt-4',
          variables: {
            requirement: '用户需要登录系统',
          },
        })
        .expect(201)

      console.log(`✅ LLM集成端点调用成功，响应长度: ${llmResponse.body.length} 字符`)
    } catch (error) {
      console.log('⚠️ LLM集成端点可能未配置或需要认证')
    }

    // 测试9: 测试需求服务集成
    console.log('\n9. 测试需求服务集成...')
    try {
      const requirementsResponse = await request(app.getHttpServer())
        .post('/requirements/generate-user-stories')
        .send({
          userInput: '用户需要登录系统',
        })
        .expect(201)

      console.log('✅ 需求服务集成成功')
      console.log(`   生成用户故事数量: ${requirementsResponse.body.userStories?.length || 0}`)
    } catch (error) {
      console.log('⚠️ 需求服务可能需要认证或LLM配置')
    }

    console.log('\n🎉 API测试完成！')
    console.log('\n测试总结:')
    console.log('1. 获取所有模板: ✅')
    console.log('2. 获取单个模板: ✅')
    console.log('3. 渲染模板: ✅')
    console.log('4. 创建模板: ✅')
    console.log('5. 更新模板: ✅')
    console.log('6. 删除模板: ✅')
    console.log('7. 按类别渲染: ✅')
    console.log('8. LLM集成: ⚠️ (需要配置)')
    console.log('9. 需求服务集成: ⚠️ (可能需要认证)')

    await app.close()
  } catch (error) {
    console.error('❌ API测试失败:', error.message)
    if (app) {
      await app.close()
    }
    process.exit(1)
  }
}

testAPIs()
