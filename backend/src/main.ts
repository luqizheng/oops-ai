import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ValidationPipe } from '@nestjs/common'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { GlobalExceptionFilter } from './common/exception.filter'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  app.useGlobalPipes(new ValidationPipe())
  app.useGlobalFilters(new GlobalExceptionFilter())

  const config = new DocumentBuilder()
    .setTitle('OOPS-AI API')
    .setDescription('软件团队专属需求智能体 API 文档')
    .setVersion('1.0')
    .addBearerAuth()
    .build()

  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api-docs', app, document)

  app.enableCors({
    origin: 'http://localhost:3000',
    credentials: true,
  })

  await app.listen(3001)
  console.log(`Application is running on: ${await app.getUrl()}`)
  console.log(`Swagger docs available at: ${await app.getUrl()}/api-docs`)
}
bootstrap()