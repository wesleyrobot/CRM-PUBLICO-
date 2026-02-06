import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { SentryConfig } from './config/sentry.config';
import { SentryInterceptor } from './common/interceptors/sentry.interceptor';
import { MetricsInterceptor } from './common/interceptors/metrics.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Inicializar Sentry
  const configService = app.get(ConfigService);
  const sentryConfig = new SentryConfig(configService);
  sentryConfig.init();

  // Usar Winston como logger padrão
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));

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

  // Habilita CORS
  app.enableCors();

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
    .setDescription(`
      API completa de CRM com automação de marketing e gestão de vendas

      **Versionamento:**
      - Todas as rotas seguem o padrão /api/v{version}/{resource}
      - Versão atual: v1
      - Versão padrão: v1 (aplicada automaticamente se não especificada)

      **Estratégia de Deprecação:**
      - Versões antigas mantidas por 6 meses após nova versão
      - Breaking changes sempre exigem nova versão
      - Novos recursos podem ser adicionados à versão existente
    `)
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

  console.log(`🚀 Aplicação rodando em: http://localhost:${port}`);
  console.log(`📚 API v1 disponível em: http://localhost:${port}/api/v1`);
  console.log(`📖 Documentação Swagger: http://localhost:${port}/api/docs`);
  console.log(`📊 Logs estruturados: logs/combined.log`);
  console.log(`📈 Métricas Prometheus: http://localhost:${port}/metrics`);
}
bootstrap();
