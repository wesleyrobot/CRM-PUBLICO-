import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import * as Sentry from '@sentry/node';

@Injectable()
export class SentryInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, user } = request;

    // Define contexto do usuário (se autenticado)
    if (user) {
      Sentry.setUser({
        id: user.id,
        username: user.nome,
      });
    }

    // Define contexto da requisição
    Sentry.setContext('request', {
      method,
      url,
      headers: this.sanitizeHeaders(request.headers),
    });

    // Adiciona breadcrumb para rastreamento
    Sentry.addBreadcrumb({
      category: 'http',
      message: `${method} ${url}`,
      level: 'info',
    });

    return next.handle().pipe(
      tap(() => {
        // Requisição bem-sucedida - nada a fazer
      }),
      catchError((error) => {
        // Captura e reporta erro ao Sentry
        if (this.shouldReportError(error)) {
          Sentry.captureException(error, {
            tags: {
              endpoint: url,
              method,
            },
            extra: {
              statusCode: error.status || 500,
              message: error.message,
              stack: error.stack,
            },
          });
        }

        return throwError(() => error);
      }),
    );
  }

  /**
   * Remove headers sensíveis antes de enviar ao Sentry
   */
  private sanitizeHeaders(headers: any): any {
    const sanitized = { ...headers };
    delete sanitized.authorization;
    delete sanitized.cookie;
    delete sanitized['x-api-key'];
    return sanitized;
  }

  /**
   * Determina se o erro deve ser reportado ao Sentry
   */
  private shouldReportError(error: any): boolean {
    // Não reporta erros HTTP esperados (4xx)
    if (error instanceof HttpException) {
      const status = error.getStatus();
      return status >= 500; // Apenas erros 5xx
    }

    // Reporta todos os outros erros
    return true;
  }
}
