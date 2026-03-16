import { Module } from '@nestjs/common'
import { LLMService } from './llm.service'
import { LLMController } from './llm.controller'
import { AuthModule } from '../auth/auth.module'

@Module({
  imports: [AuthModule],
  controllers: [LLMController],
  providers: [LLMService],
  exports: [LLMService],
})
export class LLMModule {}