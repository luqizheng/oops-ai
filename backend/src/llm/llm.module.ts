import { Module } from '@nestjs/common'
import { LLMService } from './llm.service'
import { LLMController } from './llm.controller'
import { AuthModule } from '../auth/auth.module'
import { PromptTemplateService } from './prompt-templates/prompt-template.service'
import { PromptTemplateController } from './prompt-templates/prompt-template.controller'
import { PromptTemplateInitService } from './prompt-templates/prompt-template-init.service'
import { LLMProviderFactory } from './providers/provider.factory'
import { OpenAIProvider } from './providers/openai.provider'
import { OllamaProvider } from './providers/ollama.provider'
import { DeepSeekProvider } from './providers/deepseek.provider'
import { QwenProvider } from './providers/qwen.provider'
import { LocalProvider } from './providers/local.provider'

@Module({
  imports: [AuthModule],
  controllers: [LLMController, PromptTemplateController],
  providers: [
    LLMService,
    PromptTemplateService,
    PromptTemplateInitService,
    LLMProviderFactory,
    OpenAIProvider,
    OllamaProvider,
    DeepSeekProvider,
    QwenProvider,
    LocalProvider,
  ],
  exports: [LLMService, PromptTemplateService, LLMProviderFactory],
})
export class LLMModuleV2 {}
