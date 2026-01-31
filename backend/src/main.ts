import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Usar Winston como logger padrão
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));
  
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

  // Configuração do Swagger
  const config = new DocumentBuilder()
    .setTitle('CRM Automation Platform API')
    .setDescription('API completa de CRM com automação de marketing e gestão de vendas')
    .setVersion('1.0')
    .addTag('auth', 'Autenticação e autorização')
    .addTag('users', 'Gestão de usuários')
    .addTag('companies', 'Gestão de empresas')
    .addTag('leads', 'Gestão de leads')
    .addTag('clients', 'Gestão de clientes')
    .addBearerAuth()
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  
  console.log(`🚀 Aplicação rodando em: http://localhost:${port}`);
  console.log(`📚 API disponível em: http://localhost:${port}/api`);
  console.log(`📖 Documentação Swagger: http://localhost:${port}/api/docs`);
  console.log(`📊 Logs estruturados: logs/combined.log`);
}
bootstrap();
