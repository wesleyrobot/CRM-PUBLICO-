import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Counter, Histogram, register } from 'prom-client';

// Criamos as métricas uma vez no nível do módulo
const httpRequestsTotal = new Counter({
  name: 'crm_http_requests_total',
  help: 'Total de requisições HTTP',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register],
});

const httpRequestDuration = new Histogram({
  name: 'crm_http_request_duration_seconds',
  help: 'Duração das requisições HTTP em segundos',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1, 2, 5],
  registers: [register],
});

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const { method, route } = request;
    const path = route?.path || request.url;

    const startTime = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = (Date.now() - startTime) / 1000;
          const statusCode = response.statusCode;

          // Incrementa contador de requisições
          httpRequestsTotal.labels(method, path, statusCode.toString()).inc();

          // Registra duração
          httpRequestDuration
            .labels(method, path, statusCode.toString())
            .observe(duration);
        },
        error: (error) => {
          const duration = (Date.now() - startTime) / 1000;
          const statusCode = error.status || 500;

          // Incrementa contador de requisições (incluindo erros)
          httpRequestsTotal.labels(method, path, statusCode.toString()).inc();

          // Registra duração (incluindo erros)
          httpRequestDuration
            .labels(method, path, statusCode.toString())
            .observe(duration);
        },
      }),
    );
  }
}
