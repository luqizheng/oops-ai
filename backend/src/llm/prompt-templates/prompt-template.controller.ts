import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger'
import { PromptTemplateService } from './prompt-template.service'
import { PromptTemplateCreateInput, PromptTemplateUpdateInput } from './prompt-template.service'

@ApiTags('prompt-templates')
@Controller('prompt-templates')
@UseGuards(AuthGuard())
export class PromptTemplateController {
  constructor(private readonly promptTemplateService: PromptTemplateService) {}

  @Get()
  @ApiOperation({ summary: '获取所有提示词模板' })
  async findAll(
    @Query('category') category?: string,
    @Query('provider') provider?: string,
    @Query('modelName') modelName?: string,
    @Query('isActive') isActive?: boolean,
  ) {
    return this.promptTemplateService.findAll({
      category,
      provider,
      modelName,
      isActive,
    })
  }

  @Get(':id')
  @ApiOperation({ summary: '根据ID获取提示词模板' })
  async findById(@Param('id') id: string) {
    return this.promptTemplateService.findById(id)
  }

  @Get('render/:category')
  @ApiOperation({ summary: '渲染指定类别的提示词模板' })
  async renderTemplateByCategory(
    @Param('category') category: string,
    @Query('provider') provider?: string,
    @Query('modelName') modelName?: string,
    @Body() variables?: Record<string, any>,
  ) {
    return this.promptTemplateService.renderTemplate(category, variables || {}, provider, modelName)
  }

  @Post(':id/render')
  @ApiOperation({ summary: '渲染指定ID的提示词模板' })
  async renderTemplateById(@Param('id') id: string, @Body() variables: Record<string, any>) {
    return this.promptTemplateService.renderTemplate(id, variables)
  }

  @Post()
  @ApiOperation({ summary: '创建新的提示词模板' })
  async create(@Body() data: PromptTemplateCreateInput) {
    return this.promptTemplateService.create(data)
  }

  @Put(':id')
  @ApiOperation({ summary: '更新提示词模板' })
  async update(@Param('id') id: string, @Body() data: PromptTemplateUpdateInput) {
    return this.promptTemplateService.update(id, data)
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除提示词模板' })
  async delete(@Param('id') id: string) {
    await this.promptTemplateService.delete(id)
    return { message: 'Prompt template deleted successfully' }
  }

  @Put(':id/default')
  @ApiOperation({ summary: '设置为默认模板' })
  async setDefault(@Param('id') id: string) {
    return this.promptTemplateService.setDefault(id)
  }
}
