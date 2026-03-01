import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import type { Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const isHttpException = exception instanceof HttpException;
    const status = isHttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    const fallbackMessage = 'Ocurrió un error inesperado';
    let message: string | string[] = fallbackMessage;
    let errorLabel = isHttpException ? 'HttpException' : 'InternalServerError';

    if (isHttpException) {
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object' && exceptionResponse) {
        const payload = exceptionResponse as {
          message?: string | string[];
          error?: string;
        };

        if (payload.message) {
          message = payload.message;
        } else {
          message = exception.message || fallbackMessage;
        }

        if (payload.error) {
          errorLabel = payload.error;
        }
      } else {
        message = exception.message || fallbackMessage;
      }
    }

    response.status(status).json({
      message,
      error: errorLabel,
      status,
    });
  }
}
