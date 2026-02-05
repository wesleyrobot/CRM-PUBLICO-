import { Controller, Get, Post, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { SchedulerService } from './scheduler.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Scheduler')
@Controller('scheduler')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@ApiBearerAuth()
export class SchedulerController {
  constructor(private readonly schedulerService: SchedulerService) {}

  @Get('jobs')
  @ApiOperation({
    summary: 'Listar cron jobs',
    description: 'Retorna todos os cron jobs registrados e próxima execução.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de cron jobs',
    schema: {
      example: [
        { name: 'refresh-dashboard-view', nextRun: '2024-01-15T10:30:00Z' },
        { name: 'update-search-vectors', nextRun: '2024-01-15T11:00:00Z' },
        { name: 'cleanup-old-audit-logs', nextRun: '2024-01-16T00:00:00Z' },
        { name: 'vacuum-analyze', nextRun: '2024-01-21T03:00:00Z' },
      ],
    },
  })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 403, description: 'Acesso negado - requer role admin' })
  getJobs() {
    return this.schedulerService.getJobs();
  }

  @Post('run/:jobName')
  @ApiOperation({
    summary: 'Executar job manualmente',
    description: `
      Executa um cron job manualmente.

      **Jobs disponíveis:**
      - refresh-dashboard-view: Atualiza view materializada
      - update-search-vectors: Atualiza Full-Text Search
      - cleanup-old-audit-logs: Remove logs > 90 dias
      - vacuum-analyze: Otimiza tabelas
    `,
  })
  @ApiParam({
    name: 'jobName',
    description: 'Nome do job a executar',
    enum: ['refresh-dashboard-view', 'update-search-vectors', 'cleanup-old-audit-logs', 'vacuum-analyze'],
  })
  @ApiResponse({
    status: 200,
    description: 'Job executado',
    schema: {
      example: { success: true, message: 'Dashboard view atualizada' },
    },
  })
  @ApiResponse({ status: 403, description: 'Acesso negado - requer role admin' })
  async runJob(@Param('jobName') jobName: string) {
    return this.schedulerService.runJob(jobName);
  }
}
