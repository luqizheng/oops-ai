import { NestFactory } from '@nestjs/core'
import { AppModule } from '../../app.module'
import { PromptTemplateService } from './prompt-template.service'

async function testPromptTemplates() {
  const app = await NestFactory.createApplicationContext(AppModule)
  const promptTemplateService = app.get(PromptTemplateService)

  console.log('=== 测试提示词模板系统 ===\n')

  try {
    // 1. 获取所有模板
    console.log('1. 获取所有模板:')
    const allTemplates = await promptTemplateService.findAll()
    console.log(`   找到 ${allTemplates.length} 个模板`)
    
    // 2. 测试模板渲染
    console.log('\n2. 测试模板渲染:')
    
    // 测试需求转用户故事模板
    const renderedPrompt = await promptTemplateService.renderTemplate(
      'requirement-to-story',
      { requirement: '用户需要能够登录系统' },
      'deepseek',
      'deepseek-chat'
    )
    
    console.log('   渲染后的提示词:')
    console.log('   ---')
    console.log(renderedPrompt)
    console.log('   ---\n')
    
    // 3. 测试最佳匹配
    console.log('3. 测试最佳匹配:')
    
    const bestMatch = await promptTemplateService.findBestMatch(
      'requirement-to-story',
      'deepseek',
      'deepseek-chat'
    )
    
    if (bestMatch) {
      console.log(`   找到最佳匹配: ${bestMatch.name}`)
      console.log(`   类别: ${bestMatch.category}`)
      console.log(`   供应商: ${bestMatch.provider || '通用'}`)
      console.log(`   模型: ${bestMatch.modelName || '通用'}`)
    } else {
      console.log('   未找到匹配的模板')
    }
    
    // 4. 测试创建新模板
    console.log('\n4. 测试创建新模板:')
    
    const newTemplate = await promptTemplateService.create({
      name: '测试模板 - 需求分析',
      description: '用于测试的需求分析模板',
      category: 'quality-assessment',
      template: '请分析以下需求的质量：{{requirement}}',
      variables: ['requirement'],
      isDefault: false,
      isActive: true,
    })
    
    console.log(`   创建成功: ${newTemplate.name}`)
    console.log(`   ID: ${newTemplate.id}`)
    
    // 5. 测试更新模板
    console.log('\n5. 测试更新模板:')
    
    const updatedTemplate = await promptTemplateService.update(newTemplate.id, {
      description: '更新后的测试模板描述',
      isActive: false,
    })
    
    console.log(`   更新成功: ${updatedTemplate.name}`)
    console.log(`   描述: ${updatedTemplate.description}`)
    console.log(`   状态: ${updatedTemplate.isActive ? '激活' : '停用'}`)
    
    // 6. 测试删除模板
    console.log('\n6. 测试删除模板:')
    
    await promptTemplateService.delete(newTemplate.id)
    console.log('   删除成功')
    
    console.log('\n=== 所有测试通过 ===')
    
  } catch (error) {
    console.error('测试失败:', error)
  } finally {
    await app.close()
  }
}

// 运行测试
testPromptTemplates().catch(console.error)