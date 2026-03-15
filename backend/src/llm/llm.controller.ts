import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { LLMService } from './llm.service'
import {
  CreateLLMConfigDto,
  UpdateLLMConfigDto,
  TestConnectionDto,
} from './dto/llm.dto'
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger'

@ApiTags('llm')
@Controller('llm')
@UseGuards(AuthGuard())
export class LLMController {
  constructor(private readonly llmService: LLMService) {}

  @Get('configurations')
  @ApiOperation({ summary: '获取所有LLM配置' })
  async getConfigurations() {
    return this.llmService.getAllConfigurations()
  }

  @Post('configurations')
  @ApiOperation({ summary: '创建新的LLM配置' })
  async createConfiguration(@Body() createLLMConfigDto: CreateLLMConfigDto) {
    return this.llmService.createConfiguration(createLLMConfigDto)
  }

  @Put('configurations/:id')
  @ApiOperation({ summary: '更新LLM配置' })
  async updateConfiguration(
    @Param('id') id: string,
    @Body() updateLLMConfigDto: UpdateLLMConfigDto,
  ) {
    return this.llmService.updateConfiguration(id, updateLLMConfigDto)
  }

  @Delete('configurations/:id')
  @ApiOperation({ summary: '删除LLM配置' })
  async deleteConfiguration(@Param('id') id: string) {
    return this.llmService.deleteConfiguration(id)
  }

  @Post('configurations/:id/test')
  @ApiOperation({ summary: '测试LLM连接' })
  async testConnection(
    @Param('id') id: string,
    @Body() testConnectionDto: TestConnectionDto,
  ) {
    const success = await this.llmService.testConfigurationById(id)
    return { success, message: success ? 'Connection test successful' : 'Connection test failed' }
  }

  @Put('configurations/:id/default')
  @ApiOperation({ summary: '设置为默认配置' })
  async setDefaultConfiguration(@Param('id') id: string) {
    await this.llmService.setDefaultConfiguration(id)
    return { message: 'Configuration set as default' }
  }

  @Post('configurations/test')
  @ApiOperation({ summary: '测试当前配置' })
  async testCurrentConfig(@Body() body: any) {
    try {
      const success = await this.llmService.testConnection(body.config)
      return { success, message: success ? 'Connection test successful' : 'Connection test failed' }
    } catch (error) {
      return { success: false, message: 'Connection test failed: ' + error.message }
    }
  }
}