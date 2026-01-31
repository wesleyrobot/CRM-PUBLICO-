import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Company } from '../companies/entities/company.entity';
import { Lead } from '../leads/entities/lead.entity';
import { Client } from '../clients/entities/client.entity';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
    @InjectRepository(Lead)
    private readonly leadsRepository: Repository<Lead>,
    @InjectRepository(Client)
    private readonly clientsRepository: Repository<Client>,
  ) {}

  // 1. LEFT JOIN + COUNT + GROUP BY
  async getCompaniesWithLeadsCount() {
    return await this.companyRepository
      .createQueryBuilder('company')
      .leftJoin('company.leads', 'lead')
      .select('company.id', 'companyId')
      .addSelect('company.razaoSocial', 'companyName')
      .addSelect('COUNT(lead.id)', 'totalLeads')
      .groupBy('company.id')
      .addGroupBy('company.razaoSocial')
      .orderBy('COUNT(lead.id)', 'DESC')
      .getRawMany();
  }

  // 2. Múltiplos JOINs + Agregações
  async getUserPerformanceReport() {
    return await this.userRepository
      .createQueryBuilder('user')
      .leftJoin('user.leads', 'lead')
      .leftJoin('user.clients', 'client')
      .select('user.id', 'userId')
      .addSelect('user.nome', 'userName')
      .addSelect('user.email', 'userEmail')
      .addSelect('COUNT(DISTINCT lead.id)', 'totalLeads')
      .addSelect('COUNT(DISTINCT client.id)', 'totalClients')
      .groupBy('user.id')
      .addGroupBy('user.nome')
      .addGroupBy('user.email')
      .orderBy('COUNT(DISTINCT lead.id)', 'DESC')
      .getRawMany();
  }

  // 3. CTE (Common Table Expression com WITH)
  async getLeadsByStatusWithCompanyInfo() {
    return await this.leadsRepository.query(`
      WITH lead_stats AS (
        SELECT 
          empresa_id,
          status,
          COUNT(*) as total,
          ROUND(AVG(pontuacao)::numeric, 2) as avg_score
        FROM leads
        GROUP BY empresa_id, status
      )
      SELECT 
        e.id as company_id,
        e.razao_social as company_name,
        ls.status,
        ls.total as leads_count,
        ls.avg_score as average_score
      FROM empresas e
      LEFT JOIN lead_stats ls ON e.id = ls.empresa_id
      ORDER BY e.razao_social, ls.status;
    `);
  }

  // 4. Subquery + Agregações Complexas
  async getTopPerformingCompanies(limit: number = 10) {
    return await this.companyRepository.query(
      `
      SELECT 
        e.id,
        e.razao_social as company_name,
        e.segmento,
        COUNT(DISTINCT l.id) as total_leads,
        COUNT(DISTINCT c.id) as total_clients,
        ROUND((COUNT(DISTINCT c.id)::numeric / NULLIF(COUNT(DISTINCT l.id), 0)) * 100, 2) as conversion_rate
      FROM empresas e
      LEFT JOIN leads l ON e.id = l.empresa_id
      LEFT JOIN clientes c ON e.id = c.empresa_id
      GROUP BY e.id, e.razao_social, e.segmento
      HAVING COUNT(DISTINCT l.id) > 0
      ORDER BY total_clients DESC, conversion_rate DESC
      LIMIT $1;
    `,
      [limit],
    );
  }

  // 5. CASE + Window Functions
  async getLeadDistributionAnalysis() {
    return await this.leadsRepository.query(`
      SELECT
        CASE
          WHEN l.pontuacao >= 80 THEN 'Hot'
          WHEN l.pontuacao >= 50 THEN 'Warm'
          WHEN l.pontuacao >= 20 THEN 'Cold'
          ELSE 'Inactive'
        END as lead_category,
        l.status,
        COUNT(*) as count,
        ROUND(AVG(l.pontuacao)::numeric, 2) as avg_score,
        MIN(l.criado_em) as oldest_lead,
        MAX(l.criado_em) as newest_lead,
        COUNT(*) * 100.0 / SUM(COUNT(*)) OVER() as percentage
      FROM leads l
      GROUP BY 
        CASE
          WHEN l.pontuacao >= 80 THEN 'Hot'
          WHEN l.pontuacao >= 50 THEN 'Warm'
          WHEN l.pontuacao >= 20 THEN 'Cold'
          ELSE 'Inactive'
        END,
        l.status
      ORDER BY
        CASE
          WHEN CASE
            WHEN l.pontuacao >= 80 THEN 'Hot'
            WHEN l.pontuacao >= 50 THEN 'Warm'
            WHEN l.pontuacao >= 20 THEN 'Cold'
            ELSE 'Inactive'
          END = 'Hot' THEN 1
          WHEN CASE
            WHEN l.pontuacao >= 80 THEN 'Hot'
            WHEN l.pontuacao >= 50 THEN 'Warm'
            WHEN l.pontuacao >= 20 THEN 'Cold'
            ELSE 'Inactive'
          END = 'Warm' THEN 2
          WHEN CASE
            WHEN l.pontuacao >= 80 THEN 'Hot'
            WHEN l.pontuacao >= 50 THEN 'Warm'
            WHEN l.pontuacao >= 20 THEN 'Cold'
            ELSE 'Inactive'
          END = 'Cold' THEN 3
          ELSE 4
        END,
        l.status;
    `);
  }

  // 6. CTE + Window Functions + DATE_TRUNC
  async getMonthlyLeadTrend() {
    return await this.leadsRepository.query(`
      WITH monthly_data AS (
        SELECT 
          DATE_TRUNC('month', criado_em) as month,
          COUNT(*) as leads_created,
          COUNT(*) FILTER (WHERE status = 'qualificado') as leads_converted
        FROM leads
        WHERE criado_em >= NOW() - INTERVAL '12 months'
        GROUP BY DATE_TRUNC('month', criado_em)
      )
      SELECT 
        TO_CHAR(month, 'YYYY-MM') as month,
        leads_created,
        leads_converted,
        ROUND((leads_converted::numeric / NULLIF(leads_created, 0)) * 100, 2) as conversion_rate,
        SUM(leads_created) OVER (ORDER BY month) as cumulative_leads
      FROM monthly_data
      ORDER BY month DESC;
    `);
  }
}
