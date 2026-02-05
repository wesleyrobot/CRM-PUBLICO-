import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression, SchedulerRegistry } from '@nestjs/schedule';
import { DataSource } from 'typeorm';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(
    private readonly dataSource: DataSource,
    private readonly schedulerRegistry: SchedulerRegistry,
  ) {}

  /**
   * Atualiza a view materializada mv_dashboard_stats
   * Executa a cada 15 minutos
   */
  @Cron('0 */15 * * * *', {
    name: 'refresh-dashboard-view',
  })
  async refreshDashboardView(): Promise<void> {
    this.logger.log('Iniciando refresh da view mv_dashboard_stats...');
    const startTime = Date.now();

    try {
      await this.dataSource.query('REFRESH MATERIALIZED VIEW mv_dashboard_stats');
      const duration = Date.now() - startTime;
      this.logger.log(`View mv_dashboard_stats atualizada em ${duration}ms`);
    } catch (error) {
      this.logger.error(`Erro ao atualizar mv_dashboard_stats: ${error.message}`);
    }
  }

  /**
   * Atualiza os search_vectors para Full-Text Search
   * Executa a cada hora
   */
  @Cron(CronExpression.EVERY_HOUR, {
    name: 'update-search-vectors',
  })
  async updateSearchVectors(): Promise<void> {
    this.logger.log('Iniciando atualização dos search_vectors...');
    const startTime = Date.now();

    try {
      // Atualiza leads
      await this.dataSource.query(`
        UPDATE leads
        SET search_vector = to_tsvector('portuguese',
          COALESCE(nome, '') || ' ' ||
          COALESCE(email, '') || ' ' ||
          COALESCE(observacoes, '')
        )
        WHERE search_vector IS NULL AND deletado_em IS NULL
      `);

      // Atualiza clientes
      await this.dataSource.query(`
        UPDATE clientes
        SET search_vector = to_tsvector('portuguese',
          COALESCE(nome, '') || ' ' ||
          COALESCE(email, '') || ' ' ||
          COALESCE(observacoes, '')
        )
        WHERE search_vector IS NULL AND deletado_em IS NULL
      `);

      // Atualiza empresas
      await this.dataSource.query(`
        UPDATE empresas
        SET search_vector = to_tsvector('portuguese',
          COALESCE(razao_social, '') || ' ' ||
          COALESCE(nome_fantasia, '') || ' ' ||
          COALESCE(segmento, '')
        )
        WHERE search_vector IS NULL AND deletado_em IS NULL
      `);

      const duration = Date.now() - startTime;
      this.logger.log(`Search vectors atualizados em ${duration}ms`);
    } catch (error) {
      this.logger.error(`Erro ao atualizar search_vectors: ${error.message}`);
    }
  }

  /**
   * Limpa registros de auditoria antigos (mais de 90 dias)
   * Executa todo dia à meia-noite
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, {
    name: 'cleanup-old-audit-logs',
  })
  async cleanupOldAuditLogs(): Promise<void> {
    this.logger.log('Iniciando limpeza de logs de auditoria antigos...');

    try {
      const result = await this.dataSource.query(`
        DELETE FROM auditoria
        WHERE criado_em < NOW() - INTERVAL '90 days'
      `);

      this.logger.log(`Logs de auditoria removidos: ${result[1] || 0} registros`);
    } catch (error) {
      this.logger.error(`Erro ao limpar logs de auditoria: ${error.message}`);
    }
  }

  /**
   * Executa VACUUM ANALYZE para otimizar tabelas
   * Executa todo domingo às 3h da manhã
   */
  @Cron('0 3 * * 0', {
    name: 'vacuum-analyze',
  })
  async vacuumAnalyze(): Promise<void> {
    this.logger.log('Iniciando VACUUM ANALYZE nas tabelas principais...');

    const tables = ['leads', 'clientes', 'empresas', 'usuarios', 'auditoria'];

    for (const table of tables) {
      try {
        await this.dataSource.query(`VACUUM ANALYZE ${table}`);
        this.logger.log(`VACUUM ANALYZE concluído para ${table}`);
      } catch (error) {
        this.logger.error(`Erro no VACUUM ANALYZE de ${table}: ${error.message}`);
      }
    }
  }

  /**
   * Lista todos os cron jobs registrados
   */
  getJobs(): { name: string; nextRun: Date | null }[] {
    const jobs = this.schedulerRegistry.getCronJobs();
    const jobList: { name: string; nextRun: Date | null }[] = [];

    jobs.forEach((job, name) => {
      const nextDate = job.nextDate();
      jobList.push({
        name,
        nextRun: nextDate ? nextDate.toJSDate() : null,
      });
    });

    return jobList;
  }

  /**
   * Executa um job manualmente
   */
  async runJob(jobName: string): Promise<{ success: boolean; message: string }> {
    switch (jobName) {
      case 'refresh-dashboard-view':
        await this.refreshDashboardView();
        return { success: true, message: 'Dashboard view atualizada' };

      case 'update-search-vectors':
        await this.updateSearchVectors();
        return { success: true, message: 'Search vectors atualizados' };

      case 'cleanup-old-audit-logs':
        await this.cleanupOldAuditLogs();
        return { success: true, message: 'Logs antigos removidos' };

      case 'vacuum-analyze':
        await this.vacuumAnalyze();
        return { success: true, message: 'VACUUM ANALYZE executado' };

      default:
        return { success: false, message: `Job '${jobName}' não encontrado` };
    }
  }
}
