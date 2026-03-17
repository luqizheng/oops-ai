import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common'
import { Request, Response } from 'express'

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const request = ctx.getRequest<Request>()

    let status: number
    let message: string
    let details: any

    if (exception instanceof HttpException) {
      status = exception.getStatus()
      const exceptionResponse = exception.getResponse()

      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        message = (exceptionResponse as any).message || exception.message
        details = (exceptionResponse as any).error || exceptionResponse
      } else {
        message = exception.message
        details = exceptionResponse
      }
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR
      message = '服务器内部错误'
      details = exception instanceof Error ? exception.stack : exception

      // 记录详细错误日志
      console.error('Unhandled exception:', exception)
    }

    // 构建统一的错误响应格式
    const errorResponse = {
      statusCode: status,
      message,
      details,
      path: request.url,
      method: request.method,
      timestamp: new Date().toISOString(),
    }

    // 发送响应
    response.status(status).json(errorResponse)
  }
}
