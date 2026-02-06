import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiExcludeEndpoint } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Metrics')
@Controller('metrics')
export class MetricsController {
  constructor() {}

  @Public()
  @Get('health')
  @ApiOperation({
    summary: 'Health check com métricas básicas',
    description: 'Retorna status da aplicação com métricas de saúde',
  })
  @ApiResponse({
    status: 200,
    description: 'Aplicação saudável',
    schema: {
      example: {
        status: 'healthy',
        timestamp: '2024-01-15T10:30:00Z',
        uptime: '120 minutes',
        memory: {
          used: '150MB',
          total: '512MB',
          percentage: 29.3,
        },
        metrics: {
          endpoint: '/api/v1/metrics/health',
        },
      },
    },
  })
  getHealth() {
    const uptime = process.uptime();
    const memoryUsage = process.memoryUsage();
    const totalMemory = memoryUsage.heapTotal;
    const usedMemory = memoryUsage.heapUsed;

    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: `${Math.floor(uptime / 60)} minutes`,
      memory: {
        used: `${Math.round(usedMemory / 1024 / 1024)}MB`,
        total: `${Math.round(totalMemory / 1024 / 1024)}MB`,
        percentage: Number(((usedMemory / totalMemory) * 100).toFixed(1)),
      },
      metrics: {
        endpoint: '/api/v1/metrics',
      },
    };
  }

  @Public()
  @Get('stats')
  @ApiOperation({
    summary: 'Estatísticas da aplicação',
    description: 'Retorna estatísticas detalhadas de uso e performance',
  })
  @ApiResponse({
    status: 200,
    description: 'Estatísticas da aplicação',
    schema: {
      example: {
        process: {
          pid: 12345,
          uptime: '7200s',
          nodeVersion: 'v18.0.0',
        },
        memory: {
          rss: '200MB',
          heapTotal: '150MB',
          heapUsed: '100MB',
          external: '5MB',
        },
        cpu: {
          user: 1234567,
          system: 234567,
        },
      },
    },
  })
  getStats() {
    const memoryUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();

    return {
      process: {
        pid: process.pid,
        uptime: `${Math.floor(process.uptime())}s`,
        nodeVersion: process.version,
      },
      memory: {
        rss: `${Math.round(memoryUsage.rss / 1024 / 1024)}MB`,
        heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
        heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
        external: `${Math.round(memoryUsage.external / 1024 / 1024)}MB`,
      },
      cpu: {
        user: cpuUsage.user,
        system: cpuUsage.system,
      },
    };
  }

  // Endpoint do Prometheus (não documentado no Swagger)
  @Public()
  @ApiExcludeEndpoint()
  @Get()
  getMetrics() {
    // Este endpoint é servido automaticamente pelo PrometheusModule
    // mas mantemos aqui para documentação
    return {
      message: 'Use GET /metrics para obter métricas no formato Prometheus',
    };
  }
}
