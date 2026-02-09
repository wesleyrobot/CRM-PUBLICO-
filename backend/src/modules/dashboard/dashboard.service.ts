import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import {
  DashboardQueryDto,
  DashboardPeriod,
  DashboardStats,
  DashboardTimeline,
  DashboardByStatus,
  DashboardBySegment,
  DashboardResponse,
} from './dto/dashboard.dto';

@Injectable()
export class DashboardService {
  constructor(private readonly dataSource: DataSource) {}

  async getDashboard(query: DashboardQueryDto): Promise<DashboardResponse> {
    const dateFilter = this.buildDateFilter(query);

    const [stats, timeline, byStatus, bySegment, topUsers] = await Promise.all([
      this.getStats(dateFilter),
      this.getTimeline(query.period),
      this.getByStatus(dateFilter),
      this.getBySegment(dateFilter),
      this.getTopUsers(dateFilter),
    ]);

    return {
      stats,
      timeline,
      byStatus,
      bySegment,
      topUsers,
      lastRefresh: new Date(),
    };
  }

  async getStats(dateFilter: string): Promise<DashboardStats> {
    // Usa a view materializada para totais rápidos
    const [mvStats] = await this.dataSource.query(`
      SELECT * FROM mv_dashboard_stats
    `);

    // Calcula crescimento comparando com período anterior
    const growthQuery = `
      WITH current_period AS (
        SELECT
          (SELECT COUNT(*) FROM leads WHERE deletado_em IS NULL ${dateFilter ? `AND criado_em ${dateFilter}` : ''}) as leads,
          (SELECT COUNT(*) FROM clientes WHERE deletado_em IS NULL ${dateFilter ? `AND criado_em ${dateFilter}` : ''}) as clientes,
          (SELECT COUNT(*) FROM empresas WHERE deletado_em IS NULL ${dateFilter ? `AND criado_em ${dateFilter}` : ''}) as empresas
      ),
      previous_period AS (
        SELECT
          (SELECT COUNT(*) FROM leads WHERE deletado_em IS NULL ${dateFilter ? `AND criado_em ${this.getPreviousPeriodFilter(dateFilter)}` : ''}) as leads,
          (SELECT COUNT(*) FROM clientes WHERE deletado_em IS NULL ${dateFilter ? `AND criado_em ${this.getPreviousPeriodFilter(dateFilter)}` : ''}) as clientes,
          (SELECT COUNT(*) FROM empresas WHERE deletado_em IS NULL ${dateFilter ? `AND criado_em ${this.getPreviousPeriodFilter(dateFilter)}` : ''}) as empresas
      )
      SELECT
        c.leads as current_leads,
        c.clientes as current_clientes,
        c.empresas as current_empresas,
        COALESCE(ROUND(((c.leads - p.leads)::numeric / NULLIF(p.leads, 0)) * 100, 1), 0) as growth_leads,
        COALESCE(ROUND(((c.clientes - p.clientes)::numeric / NULLIF(p.clientes, 0)) * 100, 1), 0) as growth_clientes,
        COALESCE(ROUND(((c.empresas - p.empresas)::numeric / NULLIF(p.empresas, 0)) * 100, 1), 0) as growth_empresas
      FROM current_period c, previous_period p
    `;

    const [growth] = await this.dataSource.query(growthQuery);

    // Taxa de conversão
    const [conversion] = await this.dataSource.query(`
      SELECT
        COUNT(*) FILTER (WHERE status = 'qualificado') as qualified,
        COUNT(*) FILTER (WHERE status = 'perdido') as lost,
        COALESCE(ROUND(
          (COUNT(*) FILTER (WHERE status = 'qualificado')::numeric / NULLIF(COUNT(*), 0)) * 100, 1
        ), 0) as rate
      FROM leads
      WHERE deletado_em IS NULL
    `);

    // Conta usuários ativos
    const [usuarios] = await this.dataSource.query(`
      SELECT COUNT(*) as total FROM usuarios WHERE deletado_em IS NULL AND ativo = true
    `);

    return {
      totals: {
        leads: parseInt(mvStats?.total_leads || '0'),
        clientes: parseInt(mvStats?.total_clientes || '0'),
        empresas: parseInt(mvStats?.total_empresas || '0'),
        usuarios: parseInt(usuarios?.total || '0'),
      },
      growth: {
        leads: parseFloat(growth?.growth_leads || '0'),
        clientes: parseFloat(growth?.growth_clientes || '0'),
        empresas: parseFloat(growth?.growth_empresas || '0'),
      },
      conversion: {
        rate: parseFloat(conversion?.rate || '0'),
        qualified: parseInt(conversion?.qualified || '0'),
        lost: parseInt(conversion?.lost || '0'),
      },
    };
  }

  async getTimeline(period: DashboardPeriod): Promise<DashboardTimeline> {
    const { interval, format, limit } = this.getTimelineConfig(period);

    const query = `
      WITH dates AS (
        SELECT generate_series(
          DATE_TRUNC('${interval}', NOW() - INTERVAL '${limit}'),
          DATE_TRUNC('${interval}', NOW()),
          INTERVAL '1 ${interval}'
        ) as date
      )
      SELECT
        TO_CHAR(d.date, '${format}') as label,
        COALESCE(COUNT(l.id), 0) as leads,
        COALESCE(COUNT(c.id), 0) as clientes
      FROM dates d
      LEFT JOIN leads l ON DATE_TRUNC('${interval}', l.criado_em) = d.date AND l.deletado_em IS NULL
      LEFT JOIN clientes c ON DATE_TRUNC('${interval}', c.criado_em) = d.date AND c.deletado_em IS NULL
      GROUP BY d.date
      ORDER BY d.date
    `;

    const results = await this.dataSource.query(query);

    return {
      labels: results.map((r: any) => r.label),
      leads: results.map((r: any) => parseInt(r.leads)),
      clientes: results.map((r: any) => parseInt(r.clientes)),
    };
  }

  async getByStatus(dateFilter: string): Promise<DashboardByStatus[]> {
    const query = `
      SELECT
        status,
        COUNT(*) as count,
        ROUND((COUNT(*)::numeric / NULLIF(SUM(COUNT(*)) OVER(), 0)) * 100, 1) as percentage
      FROM leads
      WHERE deletado_em IS NULL ${dateFilter ? `AND criado_em ${dateFilter}` : ''}
      GROUP BY status
      ORDER BY count DESC
    `;

    const results = await this.dataSource.query(query);

    return results.map((r: any) => ({
      status: r.status,
      count: parseInt(r.count),
      percentage: parseFloat(r.percentage || '0'),
    }));
  }

  async getBySegment(dateFilter: string): Promise<DashboardBySegment[]> {
    const query = `
      SELECT
        COALESCE(e.segmento, 'Não informado') as segmento,
        COUNT(DISTINCT l.id) as leads,
        COUNT(DISTINCT c.id) as clientes,
        COUNT(DISTINCT e.id) as empresas
      FROM empresas e
      LEFT JOIN leads l ON e.id = l.empresa_id AND l.deletado_em IS NULL ${dateFilter ? `AND l.criado_em ${dateFilter}` : ''}
      LEFT JOIN clientes c ON e.id = c.empresa_id AND c.deletado_em IS NULL ${dateFilter ? `AND c.criado_em ${dateFilter}` : ''}
      WHERE e.deletado_em IS NULL
      GROUP BY e.segmento
      ORDER BY leads DESC
      LIMIT 10
    `;

    const results = await this.dataSource.query(query);

    return results.map((r: any) => ({
      segmento: r.segmento,
      leads: parseInt(r.leads || '0'),
      clientes: parseInt(r.clientes || '0'),
      empresas: parseInt(r.empresas || '0'),
    }));
  }

  async getTopUsers(dateFilter: string): Promise<any[]> {
    const query = `
      SELECT
        u.id,
        u.nome,
        COUNT(DISTINCT l.id) as leads,
        COUNT(DISTINCT c.id) as clientes,
        COALESCE(ROUND(
          (COUNT(DISTINCT c.id)::numeric / NULLIF(COUNT(DISTINCT l.id), 0)) * 100, 1
        ), 0) as conversion
      FROM usuarios u
      LEFT JOIN leads l ON u.id = l.responsavel_id AND l.deletado_em IS NULL ${dateFilter ? `AND l.criado_em ${dateFilter}` : ''}
      LEFT JOIN clientes c ON u.id = c.responsavel_id AND c.deletado_em IS NULL ${dateFilter ? `AND c.criado_em ${dateFilter}` : ''}
      WHERE u.deletado_em IS NULL AND u.ativo = true
      GROUP BY u.id, u.nome
      HAVING COUNT(DISTINCT l.id) > 0
      ORDER BY clientes DESC, conversion DESC
      LIMIT 5
    `;

    const results = await this.dataSource.query(query);

    return results.map((r: any) => ({
      id: r.id,
      nome: r.nome,
      leads: parseInt(r.leads || '0'),
      clientes: parseInt(r.clientes || '0'),
      conversion: parseFloat(r.conversion || '0'),
    }));
  }

  async refreshMaterializedView(): Promise<{ success: boolean; refreshedAt: Date }> {
    await this.dataSource.query('REFRESH MATERIALIZED VIEW mv_dashboard_stats');
    return {
      success: true,
      refreshedAt: new Date(),
    };
  }

  private buildDateFilter(query: DashboardQueryDto): string {
    if (query.startDate && query.endDate) {
      return `>= '${query.startDate}' AND criado_em <= '${query.endDate}'`;
    }

    switch (query.period) {
      case DashboardPeriod.TODAY:
        return ">= CURRENT_DATE";
      case DashboardPeriod.WEEK:
        return ">= DATE_TRUNC('week', NOW())";
      case DashboardPeriod.MONTH:
        return ">= DATE_TRUNC('month', NOW())";
      case DashboardPeriod.QUARTER:
        return ">= DATE_TRUNC('quarter', NOW())";
      case DashboardPeriod.YEAR:
        return ">= DATE_TRUNC('year', NOW())";
      default:
        return '';
    }
  }

  private getPreviousPeriodFilter(currentFilter: string): string {
    if (currentFilter.includes('CURRENT_DATE')) {
      return ">= CURRENT_DATE - INTERVAL '1 day' AND criado_em < CURRENT_DATE";
    }
    if (currentFilter.includes("'week'")) {
      return ">= DATE_TRUNC('week', NOW()) - INTERVAL '1 week' AND criado_em < DATE_TRUNC('week', NOW())";
    }
    if (currentFilter.includes("'month'")) {
      return ">= DATE_TRUNC('month', NOW()) - INTERVAL '1 month' AND criado_em < DATE_TRUNC('month', NOW())";
    }
    if (currentFilter.includes("'quarter'")) {
      return ">= DATE_TRUNC('quarter', NOW()) - INTERVAL '3 months' AND criado_em < DATE_TRUNC('quarter', NOW())";
    }
    if (currentFilter.includes("'year'")) {
      return ">= DATE_TRUNC('year', NOW()) - INTERVAL '1 year' AND criado_em < DATE_TRUNC('year', NOW())";
    }
    return '';
  }

  private getTimelineConfig(period: DashboardPeriod): {
    interval: string;
    format: string;
    limit: string;
  } {
    switch (period) {
      case DashboardPeriod.TODAY:
        return { interval: 'hour', format: 'HH24:00', limit: '24 hours' };
      case DashboardPeriod.WEEK:
        return { interval: 'day', format: 'DD/MM', limit: '7 days' };
      case DashboardPeriod.MONTH:
        return { interval: 'day', format: 'DD/MM', limit: '30 days' };
      case DashboardPeriod.QUARTER:
        return { interval: 'week', format: 'DD/MM', limit: '12 weeks' };
      case DashboardPeriod.YEAR:
        return { interval: 'month', format: 'Mon', limit: '12 months' };
      default:
        return { interval: 'month', format: 'Mon/YY', limit: '24 months' };
    }
  }

  async getDetailedDataForExport(dateFilter: string): Promise<{
    leads: any[];
    clients: any[];
    companies: any[];
  }> {
    // Query detalhada de leads para export
    const leadsQuery = `
      SELECT
        l.id,
        l.nome,
        l.email,
        l.telefone,
        l.status,
        l.origem,
        l.valor_estimado,
        l.criado_em,
        l.atualizado_em,
        e.nome as empresa,
        e.segmento,
        u.nome as responsavel
      FROM leads l
      LEFT JOIN empresas e ON l.empresa_id = e.id
      LEFT JOIN usuarios u ON l.responsavel_id = u.id
      WHERE l.deletado_em IS NULL ${dateFilter ? `AND l.criado_em ${dateFilter}` : ''}
      ORDER BY l.criado_em DESC
      LIMIT 1000
    `;

    // Query detalhada de clientes para export
    const clientsQuery = `
      SELECT
        c.id,
        c.nome,
        c.email,
        c.telefone,
        c.cargo,
        c.ativo,
        c.criado_em,
        c.atualizado_em,
        e.nome as empresa,
        e.segmento,
        u.nome as responsavel
      FROM clientes c
      LEFT JOIN empresas e ON c.empresa_id = e.id
      LEFT JOIN usuarios u ON c.responsavel_id = u.id
      WHERE c.deletado_em IS NULL ${dateFilter ? `AND c.criado_em ${dateFilter}` : ''}
      ORDER BY c.criado_em DESC
      LIMIT 1000
    `;

    // Query detalhada de empresas para export
    const companiesQuery = `
      SELECT
        id,
        nome,
        cnpj,
        segmento,
        ativo,
        telefone,
        email,
        site,
        criado_em,
        atualizado_em,
        (SELECT COUNT(*) FROM leads WHERE empresa_id = empresas.id AND deletado_em IS NULL) as total_leads,
        (SELECT COUNT(*) FROM clientes WHERE empresa_id = empresas.id AND deletado_em IS NULL) as total_clientes
      FROM empresas
      WHERE deletado_em IS NULL ${dateFilter ? `AND criado_em ${dateFilter}` : ''}
      ORDER BY criado_em DESC
      LIMIT 1000
    `;

    const [leads, clients, companies] = await Promise.all([
      this.dataSource.query(leadsQuery),
      this.dataSource.query(clientsQuery),
      this.dataSource.query(companiesQuery),
    ]);

    return {
      leads,
      clients,
      companies,
    };
  }
}
