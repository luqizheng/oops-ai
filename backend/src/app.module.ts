import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { PrismaModule } from './prisma/prisma.module'
import { RequirementsModule } from './requirements/requirements.module'
import { LLMModule } from './llm/llm.module'
import { VectorModule } from './vector/vector.module'
import { AuthModule } from './auth/auth.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    RequirementsModule,
    LLMModule,
    VectorModule,
  ],
})
export class AppModule {}