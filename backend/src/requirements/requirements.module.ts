import { Module } from '@nestjs/common'
import { RequirementsController } from './requirements.controller'
import { RequirementsService } from './requirements.service'
import { LLMService } from '../llm/llm.service'
import { VectorService } from '../vector/vector.service'

@Module({
  controllers: [RequirementsController],
  providers: [RequirementsService, LLMService, VectorService],
  exports: [RequirementsService],
})
export class RequirementsModule {}