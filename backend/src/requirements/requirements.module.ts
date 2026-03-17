import { Module } from '@nestjs/common'
import { RequirementsController } from './requirements.controller'
import { RequirementsService } from './requirements.service'
import { LLMModule } from '../llm/llm.module'
import { VectorService } from '../vector/vector.service'
import { AuthModule } from '../auth/auth.module'

@Module({
  imports: [AuthModule, LLMModule],
  controllers: [RequirementsController],
  providers: [RequirementsService, VectorService],
  exports: [RequirementsService],
})
export class RequirementsModule {}