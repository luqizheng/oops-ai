import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
} from '@nestjs/common'
import { LLMService } from './llm.service'
import {
  CreateLLMConfigDto,
  UpdateLLMConfigDto,
  TestConnectionDto,
} from './dto/llm.dto'
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger'

@ApiTags('llm')
@Controller('llm')
export class LLMController {
  constructor(private readonly llmService: LLMService) {}

  @Get('configurations')
  @ApiOperation({ summary: '获取所有LLM配置' })
  async getConfigurations() {
    // 这里需要从数据库获取配置
    return []
  }

  @Post('configurations')
  @ApiOperation({ summary: '创建新的LLM配置' })
  async createConfiguration(@Body() createLLMConfigDto: CreateLLMConfigDto) {
    // 这里需要实现创建逻辑
    return { message: 'Configuration created' }
  }

  @Put('configurations/:id')
  @ApiOperation({ summary: '更新LLM配置' })
  async updateConfiguration(
    @Param('id') id: string,
    @Body() updateLLMConfigDto: UpdateLLMConfigDto,
  ) {
    // 这里需要实现更新逻辑
    return { message: 'Configuration updated' }
  }

  @Delete('configurations/:id')
  @ApiOperation({ summary: '删除LLM配置' })
  async deleteConfiguration(@Param('id') id: string) {
    // 这里需要实现删除逻辑
    return { message: 'Configuration deleted' }
  }

  @Post('configurations/:id/test')
  @ApiOperation({ summary: '测试LLM连接' })
  async testConnection(
    @Param('id') id: string,
    @Body() testConnectionDto: TestConnectionDto,
  ) {
    // 这里需要实现测试连接逻辑
    return { success: true, message: 'Connection test successful' }
  }

  @Put('configurations/:id/default')
  @ApiOperation({ summary: '设置为默认配置' })
  async setDefaultConfiguration(@Param('id') id: string) {
    // 这里需要实现设置默认配置逻辑
    return { message: 'Configuration set as default' }
  }
}