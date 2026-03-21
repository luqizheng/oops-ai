import { IsString, IsBoolean, IsOptional, IsArray, IsEnum } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'
import { ICreatePromptTemplateSubmit, IUpdatePromptTemplateSubmit } from '@oops-ai/shared'

export class CreatePromptTemplateDto implements ICreatePromptTemplateSubmit {
  @ApiProperty({ description: '模板名称' })
  @IsString()
  name: string

  @ApiProperty({ description: '模板描述', required: false })
  @IsOptional()
  @IsString()
  description?: string

  @ApiProperty({ description: '模板内容' })
  @IsString()
  template: string

  @ApiProperty({
    description: '模板类别',
    enum: [
      'raw-to-requirement', // 原始需求->需求
      'requirement-to-story', // 需求->用户故事
      'story-to-use-case', // 用户故事->用例
      'generate-acceptance', // 生成验收标准
      'identify-ambiguity', // 识别模糊词汇
      'generate-questions', // 生成追问
      'quality-assessment', // 质量评估
      'code-analysis', // 代码分析
      'test-generation', // 测试生成
      'other', // 其他
    ],
  })
  @IsEnum([
    'raw-to-requirement',
    'requirement-to-story',
    'story-to-use-case',
    'generate-acceptance',
    'identify-ambiguity',
    'generate-questions',
    'quality-assessment',
    'code-analysis',
    'test-generation',
    'other',
  ])
  category: string

  @ApiProperty({
    description: 'LLM供应商',
    enum: ['openai', 'ollama', 'deepseek', 'qwen', 'local'],
    required: false,
  })
  @IsOptional()
  @IsEnum(['openai', 'ollama', 'deepseek', 'qwen', 'local'])
  provider?: string

  @ApiProperty({ description: '模型名称', required: false })
  @IsOptional()
  @IsString()
  modelName?: string

  @ApiProperty({ description: '是否默认', default: false })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean = false

  @ApiProperty({ description: '是否激活', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true

  @ApiProperty({ description: '模板变量列表', type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  variables?: string[]
}

export class UpdatePromptTemplateDto implements IUpdatePromptTemplateSubmit {
  @ApiProperty({ description: '模板名称', required: false })
  @IsOptional()
  @IsString()
  name?: string

  @ApiProperty({ description: '模板描述', required: false })
  @IsOptional()
  @IsString()
  description?: string

  @ApiProperty({ description: '模板内容', required: false })
  @IsOptional()
  @IsString()
  template?: string

  @ApiProperty({
    description: '模板类别',
    enum: [
      'raw-to-requirement',
      'requirement-to-story',
      'story-to-use-case',
      'generate-acceptance',
      'identify-ambiguity',
      'generate-questions',
      'quality-assessment',
      'code-analysis',
      'test-generation',
      'other',
    ],
    required: false,
  })
  @IsOptional()
  @IsEnum([
    'raw-to-requirement',
    'requirement-to-story',
    'story-to-use-case',
    'generate-acceptance',
    'identify-ambiguity',
    'generate-questions',
    'quality-assessment',
    'code-analysis',
    'test-generation',
    'other',
  ])
  category?: string

  @ApiProperty({
    description: 'LLM供应商',
    enum: ['openai', 'ollama', 'deepseek', 'qwen', 'local'],
    required: false,
  })
  @IsOptional()
  @IsEnum(['openai', 'ollama', 'deepseek', 'qwen', 'local'])
  provider?: string

  @ApiProperty({ description: '模型名称', required: false })
  @IsOptional()
  @IsString()
  modelName?: string

  @ApiProperty({ description: '是否默认', required: false })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean

  @ApiProperty({ description: '是否激活', required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean

  @ApiProperty({ description: '模板变量列表', type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  variables?: string[]
}

export class RenderTemplateDto {
  @ApiProperty({ description: '模板变量', type: Object, required: false })
  @IsOptional()
  variables?: Record<string, any>

  @ApiProperty({ description: 'LLM供应商', required: false })
  @IsOptional()
  @IsString()
  provider?: string

  @ApiProperty({ description: '模型名称', required: false })
  @IsOptional()
  @IsString()
  modelName?: string
}
