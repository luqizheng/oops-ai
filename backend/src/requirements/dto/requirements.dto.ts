import {
  IsString,
  IsOptional,
  IsNumber,
  IsArray,
  ValidateNested,
  IsEnum,
} from 'class-validator'
import { Type } from 'class-transformer'
import { ApiProperty } from '@nestjs/swagger'

export class CreateRequirementDto {
  @ApiProperty({ description: '需求标题' })
  @IsString()
  title: string

  @ApiProperty({ description: '需求描述', required: false })
  @IsOptional()
  @IsString()
  description?: string

  @ApiProperty({ description: '原始输入', required: false })
  @IsOptional()
  @IsString()
  rawInput?: string

  @ApiProperty({ description: '项目ID' })
  @IsString()
  projectId: string

  @ApiProperty({ description: '状态', required: false, default: 'draft' })
  @IsOptional()
  @IsString()
  status?: string

  @ApiProperty({ description: '优先级', required: false, default: 'medium' })
  @IsOptional()
  @IsString()
  priority?: string

  @ApiProperty({ description: '故事点', required: false })
  @IsOptional()
  @IsNumber()
  storyPoints?: number

  @ApiProperty({ description: '负责人ID', required: false })
  @IsOptional()
  @IsString()
  assigneeId?: string
}

export class UpdateRequirementDto {
  @ApiProperty({ description: '需求标题', required: false })
  @IsOptional()
  @IsString()
  title?: string

  @ApiProperty({ description: '需求描述', required: false })
  @IsOptional()
  @IsString()
  description?: string

  @ApiProperty({ description: '结构化数据', required: false })
  @IsOptional()
  structuredData?: any

  @ApiProperty({ description: '质量评分', required: false })
  @IsOptional()
  qualityScore?: any

  @ApiProperty({ description: '状态', required: false })
  @IsOptional()
  @IsString()
  status?: string

  @ApiProperty({ description: '优先级', required: false })
  @IsOptional()
  @IsString()
  priority?: string

  @ApiProperty({ description: '故事点', required: false })
  @IsOptional()
  @IsNumber()
  storyPoints?: number

  @ApiProperty({ description: '负责人ID', required: false })
  @IsOptional()
  @IsString()
  assigneeId?: string

  @ApiProperty({ description: '截止日期', required: false })
  @IsOptional()
  dueDate?: Date
}

export class AnalyzeFuzzyWordsDto {
  @ApiProperty({ description: '要分析的文本' })
  @IsString()
  text: string
}

export class GenerateQuestionsDto {
  @ApiProperty({ description: '需求类型' })
  @IsString()
  requirementType: string

  @ApiProperty({ description: '需求内容' })
  @IsString()
  requirementContent: string
}

export class GenerateUserStoriesDto {
  @ApiProperty({ description: '用户输入的一句话需求' })
  @IsString()
  userInput: string
}

export class GenerateAcceptanceCriteriaDto {
  @ApiProperty({ description: '需求内容' })
  @IsString()
  requirementContent: string
}

export class QualityScoreDto {
  @ApiProperty({ description: '需求文本' })
  @IsString()
  text: string
}

export class FuzzyWordAnalysis {
  @ApiProperty({ description: '原始文本' })
  text: string

  @ApiProperty({ description: '模糊词列表', type: [Object] })
  fuzzyWords: Array<{
    word: string
    positions: Array<{
      start: number
      end: number
    }>
  }>

  @ApiProperty({ description: '改进建议' })
  suggestion: string
}

export class QuestionItem {
  @ApiProperty({ description: '问题内容' })
  question: string

  @ApiProperty({ description: '问题类型' })
  type: string
}

export class UserStory {
  @ApiProperty({ description: '角色' })
  role: string

  @ApiProperty({ description: '功能' })
  feature: string

  @ApiProperty({ description: '价值' })
  value: string

  @ApiProperty({ description: '故事点估算', required: false })
  storyPoints?: number
}

export class AcceptanceCriterion {
  @ApiProperty({ description: 'Given部分' })
  given: string

  @ApiProperty({ description: 'When部分' })
  when: string

  @ApiProperty({ description: 'Then部分' })
  then: string

  @ApiProperty({ description: '场景类型' })
  scenarioType: 'normal' | 'exception' | 'boundary'
}

export class QualityScore {
  @ApiProperty({ description: '清晰度评分' })
  clarity: number

  @ApiProperty({ description: '可测试性评分' })
  testability: number

  @ApiProperty({ description: '完整性评分' })
  completeness: number

  @ApiProperty({ description: '总分' })
  totalScore: number

  @ApiProperty({ description: '改进建议', type: [String] })
  suggestions: string[]
}