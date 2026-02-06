import * as Sentry from '@sentry/node';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SentryConfig {
  constructor(private configService: ConfigService) {}

  init() {
    const dsn = this.configService.get<string>('SENTRY_DSN');
    const environment = this.configService.get<string>('NODE_ENV', 'development');

    // Só inicializa Sentry se DSN estiver configurado
    if (!dsn) {
      console.log('⚠️  Sentry DSN not configured, skipping initialization');
      return;
    }

    Sentry.init({
      dsn,
      environment,
      // Performance Monitoring
      tracesSampleRate: environment === 'production' ? 0.1 : 1.0,
      // Antes de enviar, filtra dados sensíveis
      beforeSend(event) {
        // Remove dados sensíveis
        if (event.request) {
          delete event.request.cookies;
          if (event.request.headers) {
            delete event.request.headers.authorization;
            delete event.request.headers.cookie;
          }
        }

        // Remove dados sensíveis do contexto
        if (event.contexts?.user) {
          delete event.contexts.user.email;
          delete event.contexts.user.ip_address;
        }

        return event;
      },
      // Ignora erros conhecidos/esperados
      ignoreErrors: [
        'ValidationError',
        'BadRequestException',
        'UnauthorizedException',
        'NotFoundException',
      ],
      // Configurações de release (para deploy)
      release: this.configService.get<string>('APP_VERSION', '1.0.0'),
    });

    console.log('✅ Sentry initialized successfully');
  }
}
