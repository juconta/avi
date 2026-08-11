import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common'
import { Response } from 'express'

export interface ApiErrorResponse {
  statusCode: number
  message: string | string[]
  error: string
  path: string
  timestamp: string
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name)

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const request = ctx.getRequest()

    let status = HttpStatus.INTERNAL_SERVER_ERROR
    let message: string | string[] = 'Error interno del servidor'
    let error = 'Internal Server Error'

    if (exception instanceof HttpException) {
      status = exception.getStatus()
      const body = exception.getResponse()
      if (typeof body === 'string') {
        message = body
      } else {
        const b = body as { message?: string | string[]; error?: string }
        message = b.message ?? exception.message
        error = b.error ?? exception.message
      }
    } else if (exception instanceof Error) {
      message = exception.message
    }

    if (status === HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(exception instanceof Error ? exception.stack : exception)
    }

    const body: ApiErrorResponse = {
      statusCode: status,
      message,
      error,
      path: request.url,
      timestamp: new Date().toISOString(),
    }

    response.status(status).json(body)
  }
}
