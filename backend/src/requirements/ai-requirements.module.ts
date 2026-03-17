import { Module } from '@nestjs/common'
import { AIRequirementsController } from './ai-requirements.controller'
import { AIRequirementsService } from './ai-requirements.service'
import { LLMModule } from '../llm/llm.module'
import { AuthModule } from '../auth/auth.module'

@Module({
  imports: [AuthModule, LLMModule],
  controllers: [AIRequirementsController],
  providers: [AIRequirementsService],
  exports: [AIRequirementsService],
})
export class AIRequirementsModule {}
