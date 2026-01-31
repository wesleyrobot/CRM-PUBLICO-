import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { InjectConnection } from '@nestjs/typeorm';
import { Connection } from 'typeorm';
import { AppService } from './app.service';
import { Public } from './common/decorators/public.decorator';

@ApiTags('App')
@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    @InjectConnection() private readonly connection: Connection,
  ) {}

  @Public()
  @Get('api')
  @ApiOperation({ summary: 'Rota raiz da API' })
  @ApiResponse({ status: 200, description: 'API funcionando' })
  getRoot() {
    return {
      message: 'CRM API v1.0',
      docs: '/api/docs',
      health: '/api/health',
    };
  }

  @Public()
  @Get('api/health')
  @ApiOperation({ summary: 'Health check completo da aplicação' })
  @ApiResponse({ status: 200, description: 'Aplicação saudável' })
  async getHealth() {
    const startTime = Date.now();
    
    // Testar conexão com banco
    let databaseStatus = 'unhealthy';
    let databaseResponseTime = 0;
    try {
      const dbStartTime = Date.now();
      await this.connection.query('SELECT 1');
      databaseResponseTime = Date.now() - dbStartTime;
      databaseStatus = 'healthy';
    } catch (error) {
      databaseStatus = 'unhealthy';
    }

    const memoryUsage = process.memoryUsage();
    const uptime = process.uptime();

    return {
      status: databaseStatus === 'healthy' ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      uptime: `${Math.floor(uptime / 60)} minutes`,
      database: {
        status: databaseStatus,
        responseTime: `${databaseResponseTime}ms`,
      },
      memory: {
        rss: `${Math.round(memoryUsage.rss / 1024 / 1024)}MB`,
        heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
        heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
        external: `${Math.round(memoryUsage.external / 1024 / 1024)}MB`,
      },
      environment: process.env.NODE_ENV || 'development',
      nodeVersion: process.version,
      responseTime: `${Date.now() - startTime}ms`,
    };
  }
}
