import { Module } from '@nestjs/common'
import { LLMService } from './llm.service'
import { LLMController } from './llm.controller'
import { AuthModule } from '../auth/auth.module'
import { PromptTemplateService } from './prompt-templates/prompt-template.service'
import { PromptTemplateController } from './prompt-templates/prompt-template.controller'
import { PromptTemplateInitService } from './prompt-templates/prompt-template-init.service'

@Module({
  imports: [AuthModule],
  controllers: [LLMController, PromptTemplateController],
  providers: [LLMService, PromptTemplateService, PromptTemplateInitService],
  exports: [LLMService, PromptTemplateService],
})
export class LLMModule {}
