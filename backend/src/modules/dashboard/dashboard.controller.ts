import { Controller, Get, Post, Query, UseGuards, Inject } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { DashboardService } from './dashboard.service';
import { DashboardQueryDto, DashboardResponse } from './dto/dashboard.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Dashboard')
@Controller('dashboard')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DashboardController {
  constructor(
    private readonly dashboardService: DashboardService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Dashboard principal',
    description: `
      Retorna todos os dados do dashboard em uma única chamada otimizada.

      **Inclui:**
      - Totais (leads, clientes, empresas, usuários)
      - Crescimento comparado ao período anterior
      - Taxa de conversão
      - Timeline de criação
      - Distribuição por status
      - Distribuição por segmento
      - Top 5 usuários

      **Períodos disponíveis:**
      - today: Hoje
      - week: Semana atual
      - month: Mês atual (padrão)
      - quarter: Trimestre atual
      - year: Ano atual
      - all: Todo o período

      **Performance:** Usa view materializada para dados frequentes.
    `,
  })
  @ApiResponse({
    status: 200,
    description: 'Dados do dashboard',
    schema: {
      example: {
        stats: {
          totals: { leads: 150, clientes: 45, empresas: 30, usuarios: 10 },
          growth: { leads: 12.5, clientes: 8.3, empresas: 5.0 },
          conversion: { rate: 30.0, qualified: 45, lost: 20 },
        },
        timeline: {
          labels: ['01/01', '02/01', '03/01'],
          leads: [10, 15, 20],
          clientes: [3, 5, 7],
        },
        byStatus: [
          { status: 'novo', count: 50, percentage: 33.3 },
          { status: 'qualificado', count: 45, percentage: 30.0 },
        ],
        bySegment: [
          { segmento: 'Tecnologia', leads: 40, clientes: 15, empresas: 10 },
        ],
        topUsers: [
          { id: 'uuid', nome: 'João', leads: 30, clientes: 12, conversion: 40.0 },
        ],
        lastRefresh: '2024-01-15T10:30:00Z',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  async getDashboard(@Query() query: DashboardQueryDto): Promise<DashboardResponse> {
    return this.dashboardService.getDashboard(query);
  }

  @Get('stats')
  @ApiOperation({
    summary: 'Apenas estatísticas rápidas',
    description: 'Retorna apenas os totais e métricas de crescimento (mais leve).',
  })
  @ApiResponse({ status: 200, description: 'Estatísticas rápidas' })
  async getStats(@Query() query: DashboardQueryDto) {
    const dateFilter = this.buildDateFilter(query);
    return this.dashboardService.getStats(dateFilter);
  }

  @Get('timeline')
  @ApiOperation({
    summary: 'Timeline de criação',
    description: 'Retorna dados para gráfico de linha temporal.',
  })
  @ApiResponse({ status: 200, description: 'Dados da timeline' })
  async getTimeline(@Query() query: DashboardQueryDto) {
    return this.dashboardService.getTimeline(query.period);
  }

  @Post('refresh')
  @Roles('admin')
  @UseGuards(RolesGuard)
  @ApiOperation({
    summary: 'Atualizar view materializada',
    description: 'Força atualização da view materializada mv_dashboard_stats. Cache expira automaticamente (TTL 15min). Requer role admin.',
  })
  @ApiResponse({
    status: 200,
    description: 'View atualizada',
    schema: {
      example: {
        success: true,
        refreshedAt: '2024-01-15T10:30:00Z',
      },
    },
  })
  @ApiResponse({ status: 403, description: 'Acesso negado - requer role admin' })
  async refreshView() {
    const result = await this.dashboardService.refreshMaterializedView();

    // Clear all cached dashboard data
    await this.cacheManager.reset();

    return result;
  }

  @Get('export')
  @ApiOperation({
    summary: 'Exportar dados do dashboard',
    description: 'Retorna todos os dados do dashboard em formato JSON para processamento externo (ex: geração de Excel via Python).',
  })
  @ApiResponse({
    status: 200,
    description: 'Dados exportados em formato JSON',
  })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  async exportDashboard(@Query() query: DashboardQueryDto) {
    const data = await this.dashboardService.getDashboard(query);

    // Adiciona dados detalhados de leads e clientes para export
    const dateFilter = this.buildDateFilter(query);
    const detailedData = await this.dashboardService.getDetailedDataForExport(dateFilter);

    return {
      ...data,
      export: {
        leads: detailedData.leads,
        clients: detailedData.clients,
        companies: detailedData.companies,
        exportedAt: new Date().toISOString(),
        period: query.period || 'month',
      },
    };
  }

  private buildDateFilter(query: DashboardQueryDto): string {
    if (query.startDate && query.endDate) {
      return `>= '${query.startDate}' AND criado_em <= '${query.endDate}'`;
    }

    switch (query.period) {
      case 'today':
        return '>= CURRENT_DATE';
      case 'week':
        return ">= DATE_TRUNC('week', NOW())";
      case 'month':
        return ">= DATE_TRUNC('month', NOW())";
      case 'quarter':
        return ">= DATE_TRUNC('quarter', NOW())";
      case 'year':
        return ">= DATE_TRUNC('year', NOW())";
      default:
        return '';
    }
  }
}
