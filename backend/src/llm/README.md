# LLM抽象接口架构

## 概述

本项目实现了一个统一的LLM（大型语言模型）抽象接口架构，用于统一不同LLM提供商的调用方式。该架构提供了可扩展的接口设计，支持多种LLM提供商，并保留了各自的特性和配置选项。

## 架构设计

### 核心组件

1. **接口层** (`interfaces/llm.interface.ts`)
   - `ILLMProvider`: LLM提供商接口
   - `ILLMService`: LLM服务接口

2. **类型定义** (`types/llm.types.ts`)
   - 统一的类型定义和配置接口

3. **基础抽象类** (`providers/base.provider.ts`)
   - `BaseLLMProvider`: 所有LLM提供商的基类

4. **具体提供商实现** (`providers/`)
   - `openai.provider.ts`: OpenAI提供商
   - `ollama.provider.ts`: Ollama提供商
   - `deepseek.provider.ts`: DeepSeek提供商
   - `qwen.provider.ts`: 通义千问提供商
   - `local.provider.ts`: 本地模型提供商
   - `claude.provider.ts`: Claude提供商
   - `gemini.provider.ts`: Gemini提供商

5. **工厂模式** (`providers/provider.factory.ts`)
   - `LLMProviderFactory`: 提供商工厂，负责创建和管理提供商实例

6. **服务层** (`llm.service.new.ts`)
   - `LLMServiceNew`: 新的LLM服务实现，使用抽象接口

## 使用方法

### 1. 基本使用

```typescript
import { LLMServiceNew } from './llm.service.new'
import { LLMProviderFactory } from './providers/provider.factory'

// 通过工厂创建提供商
const factory = new LLMProviderFactory()
const config = {
  provider: 'openai',
  modelName: 'gpt-3.5-turbo',
  apiKey: 'your-api-key',
  temperature: 0.7,
  maxTokens: 2000,
  isDefault: true
}

const provider = await factory.createProvider(config)
const response = await provider.generateCompletion('Hello, world!')
```

### 2. 使用LLM服务

```typescript
// 使用LLM服务（推荐）
const llmService = new LLMServiceNew()

// 使用默认配置生成文本
const response = await llmService.generateCompletionWithDefault('Hello, world!')

// 使用指定配置生成文本
const customConfig = {
  provider: 'deepseek',
  modelName: 'deepseek-chat',
  apiKey: 'your-deepseek-key',
  temperature: 0.8,
  maxTokens: 1000,
  isDefault: false
}

const customResponse = await llmService.generateCompletion('Hello, world!', customConfig)
```

### 3. 对话模式

```typescript
const messages = [
  { role: 'system', content: 'You are a helpful assistant.' },
  { role: 'user', content: 'What is the weather like today?' }
]

const chatResponse = await llmService.generateChatCompletion(messages)
```

### 4. 流式响应

```typescript
// 流式生成文本
const streamResponse = await llmService.generateCompletionStream(
  'Write a short story about a cat',
  undefined,
  (chunk) => {
    console.log('Received chunk:', chunk)
  }
)

// 流式对话
const chatStreamResponse = await llmService.generateChatCompletionStream(
  messages,
  undefined,
  (chunk) => {
    console.log('Received chat chunk:', chunk)
  }
)
```

## 扩展新的LLM提供商

### 步骤1: 创建新的提供商类

```typescript
import { Injectable } from '@nestjs/common'
import { BaseLLMProvider } from './base.provider'
import { LLMConfig, ChatMessage, LLMProviderConfig } from '../types/llm.types'

@Injectable()
export class NewProvider extends BaseLLMProvider {
  getProviderName(): string {
    return 'new-provider'
  }

  getSupportedModels(): string[] {
    return ['model-1', 'model-2', 'model-3']
  }

  getProviderConfig(): LLMProviderConfig {
    return {
      name: 'new-provider',
      displayName: 'New Provider',
      description: 'Description of new provider',
      supportedModels: this.getSupportedModels(),
      defaultEndpoint: 'https://api.newprovider.com/v1',
      requiresApiKey: true,
      supportsStreaming: true,
      supportsChat: true,
      supportsFunctions: false,
    }
  }

  protected async initializeClient(): Promise<void> {
    // 初始化客户端
  }

  protected async _generateCompletion(prompt: string, options?: any): Promise<string> {
    // 实现文本生成逻辑
  }

  protected async _generateChatCompletion(messages: ChatMessage[], options?: any): Promise<string> {
    // 实现对话生成逻辑
  }

  // 可选：实现流式方法
  protected async _generateCompletionStream(
    prompt: string,
    options?: any,
    onChunk?: (chunk: string) => void,
  ): Promise<string> {
    // 实现流式文本生成
  }
}
```

### 步骤2: 在工厂中注册新提供商

更新 `provider.factory.ts`:

```typescript
import { NewProvider } from './new.provider'

// 在createProvider方法中添加case
case 'new-provider':
  provider = new NewProvider()
  break

// 在getProviderConfig方法中添加case
case 'new-provider':
  return new NewProvider().getProviderConfig()

// 在getAllProviderConfigs和getAvailableProviders方法中添加'new-provider'
```

### 步骤3: 更新类型定义

更新 `llm.types.ts`:

```typescript
export type LLMProvider = 'openai' | 'ollama' | 'deepseek' | 'qwen' | 'local' | 'claude' | 'gemini' | 'new-provider'
```

## 配置管理

### 数据库配置

LLM配置存储在 `LLMConfiguration` 表中，包含以下字段：
- `provider`: 提供商名称
- `modelName`: 模型名称
- `apiEndpoint`: API端点（可选）
- `apiKey`: API密钥（可选，加密存储）
- `temperature`: 温度参数
- `maxTokens`: 最大token数
- `isDefault`: 是否默认配置
- `isActive`: 是否激活

### API端点

- `GET /llm/configurations`: 获取所有配置
- `POST /llm/configurations`: 创建新配置
- `PUT /llm/configurations/:id`: 更新配置
- `DELETE /llm/configurations/:id`: 删除配置
- `POST /llm/configurations/:id/test`: 测试连接
- `PUT /llm/configurations/:id/default`: 设置为默认配置

## 特性

### 1. 统一接口
- 所有LLM提供商实现相同的接口
- 一致的调用方式和参数

### 2. 可扩展性
- 易于添加新的LLM提供商
- 支持自定义配置和选项

### 3. 缓存机制
- 提供商实例缓存，提高性能
- 支持按配置清除缓存

### 4. 错误处理
- 统一的错误处理机制
- 详细的错误信息和日志

### 5. 类型安全
- 完整的TypeScript类型定义
- 编译时类型检查

## 最佳实践

### 1. 配置管理
- 使用数据库存储配置
- 支持多个配置和默认配置
- 加密存储敏感信息

### 2. 错误处理
- 使用try-catch包装LLM调用
- 提供有意义的错误信息
- 记录详细的错误日志

### 3. 性能优化
- 使用提供商实例缓存
- 合理设置超时时间
- 监控API调用性能

### 4. 安全性
- 加密存储API密钥
- 验证输入参数
- 限制API调用频率

## 迁移指南

### 从旧版本迁移

1. **更新导入路径**
   ```typescript
   // 旧版本
   import { LLMService } from './llm.service'
   
   // 新版本
   import { LLMServiceNew } from './llm.service.new'
   ```

2. **更新方法调用**
   ```typescript
   // 旧版本
   const response = await llmService.generateCompletion(prompt, config)
   
   // 新版本
   const response = await llmServiceNew.generateCompletion(prompt, config)
   ```

3. **更新模块配置**
   ```typescript
   // 旧版本
   imports: [LLMModule]
   
   // 新版本
   imports: [LLMModuleV2]
   ```

## 故障排除

### 常见问题

1. **连接测试失败**
   - 检查API密钥是否正确
   - 检查网络连接
   - 检查API端点是否可达

2. **响应速度慢**
   - 检查网络延迟
   - 调整超时设置
   - 考虑使用缓存

3. **内存泄漏**
   - 定期清理提供商缓存
   - 监控内存使用情况
   - 使用连接池管理

### 调试技巧

1. **启用详细日志**
   ```typescript
   // 在提供商实现中添加调试日志
   console.log('API请求:', request)
   console.log('API响应:', response)
   ```

2. **监控API调用**
   - 记录调用次数和响应时间
   - 监控错误率
   - 设置告警阈值

3. **性能分析**
   - 使用性能分析工具
   - 优化高频调用
   - 考虑批量处理