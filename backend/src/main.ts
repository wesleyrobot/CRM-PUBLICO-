import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { SentryConfig } from './config/sentry.config';
import { SentryInterceptor } from './common/interceptors/sentry.interceptor';
import { MetricsInterceptor } from './common/interceptors/metrics.interceptor';
import { RequestIdMiddleware } from './common/middleware/request-id.middleware';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Inicializar Sentry
  const configService = app.get(ConfigService);
  const sentryConfig = new SentryConfig(configService);
  sentryConfig.init();

  // Security: Validar JWT_SECRET em produção
  if (
    configService.get('NODE_ENV') === 'production' &&
    !configService.get('JWT_SECRET')
  ) {
    throw new Error(
      'JWT_SECRET must be defined in production environment',
    );
  }

  // Usar Winston como logger padrão
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));

  // Security: HTTP headers com Helmet
  app.use(
    helmet({
      contentSecurityPolicy:
        configService.get('NODE_ENV') === 'production' ? undefined : false,
      crossOriginEmbedderPolicy: false,
    }),
  );

  // Security: CORS restritivo
  app.enableCors({
    origin: configService.get<string>('CORS_ORIGIN', '*'),
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id'],
    credentials: true,
    maxAge: 3600,
  });

  // Request ID tracking middleware
  const requestIdMiddleware = new RequestIdMiddleware();
  app.use(requestIdMiddleware.use.bind(requestIdMiddleware));

  // Adiciona interceptores globais
  app.useGlobalInterceptors(
    new MetricsInterceptor(),
    new SentryInterceptor(),
  );

  // Habilita validação global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Prefixo global para API
  app.setGlobalPrefix('api');

  // Habilita versionamento de API (URI-based)
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  // Configuração do Swagger
  const config = new DocumentBuilder()
    .setTitle('CRM Automation Platform API')
    .setDescription(
      `
      API completa de CRM com automação de marketing e gestão de vendas

      **Versionamento:**
      - Todas as rotas seguem o padrão /api/v{version}/{resource}
      - Versão atual: v1
      - Versão padrão: v1 (aplicada automaticamente se não especificada)

      **Estratégia de Deprecação:**
      - Versões antigas mantidas por 6 meses após nova versão
      - Breaking changes sempre exigem nova versão
      - Novos recursos podem ser adicionados à versão existente
    `,
    )
    .setVersion('1.0')
    .addTag('auth', 'Autenticação e autorização')
    .addTag('users', 'Gestão de usuários')
    .addTag('companies', 'Gestão de empresas')
    .addTag('leads', 'Gestão de leads')
    .addTag('clients', 'Gestão de clientes')
    .addTag('Dashboard', 'Dashboard e analytics')
    .addTag('Search', 'Busca full-text')
    .addTag('Audit', 'Auditoria de ações')
    .addTag('Scheduler', 'Tarefas agendadas')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);

  // Graceful shutdown hooks (SIGTERM, SIGINT)
  app.enableShutdownHooks();

  console.log(`🚀 Aplicação rodando em: http://localhost:${port}`);
  console.log(`📚 API v1 disponível em: http://localhost:${port}/api/v1`);
  console.log(`📖 Documentação Swagger: http://localhost:${port}/api/docs`);
  console.log(`📊 Logs estruturados: logs/combined.log`);
  console.log(`📈 Métricas Prometheus: http://localhost:${port}/metrics`);
}
bootstrap();
