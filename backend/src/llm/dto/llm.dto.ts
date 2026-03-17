import { IsString, IsNumber, IsBoolean, IsOptional, IsEnum } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class CreateLLMConfigDto {
  @ApiProperty({
    description: 'LLM供应商',
    enum: ['openai', 'ollama', 'deepseek', 'qwen', 'local'],
  })
  @IsEnum(['openai', 'ollama', 'deepseek', 'qwen', 'local'])
  provider: string

  @ApiProperty({ description: '模型名称' })
  @IsString()
  modelName: string

  @ApiProperty({ description: 'API端点', required: false })
  @IsOptional()
  @IsString()
  apiEndpoint?: string

  @ApiProperty({ description: 'API密钥', required: false })
  @IsOptional()
  @IsString()
  apiKey?: string

  @ApiProperty({ description: '温度参数', default: 0.7 })
  @IsOptional()
  @IsNumber()
  temperature?: number = 0.7

  @ApiProperty({ description: '最大token数', default: 2000 })
  @IsOptional()
  @IsNumber()
  maxTokens?: number = 2000

  @ApiProperty({ description: '是否默认', default: false })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean = false

  @ApiProperty({ description: '是否激活', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true
}

export class UpdateLLMConfigDto {
  @ApiProperty({ description: '模型名称', required: false })
  @IsOptional()
  @IsString()
  modelName?: string

  @ApiProperty({ description: 'API端点', required: false })
  @IsOptional()
  @IsString()
  apiEndpoint?: string

  @ApiProperty({ description: 'API密钥', required: false })
  @IsOptional()
  @IsString()
  apiKey?: string

  @ApiProperty({ description: '温度参数', required: false })
  @IsOptional()
  @IsNumber()
  temperature?: number

  @ApiProperty({ description: '最大token数', required: false })
  @IsOptional()
  @IsNumber()
  maxTokens?: number

  @ApiProperty({ description: '是否默认', required: false })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean

  @ApiProperty({ description: '是否激活', required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean
}

export class TestConnectionDto {
  @ApiProperty({ description: '测试提示词', default: 'Hello, please respond with "OK"' })
  @IsOptional()
  @IsString()
  testPrompt?: string = 'Hello, please respond with "OK"'
}
