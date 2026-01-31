import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('analytics')
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Public()
  @Get('companies-with-leads')
  @ApiOperation({ 
    summary: 'Empresas com contagem de leads (JOIN + COUNT)',
    description: 'Query avançada usando LEFT JOIN e agregação COUNT'
  })
  async getCompaniesWithLeadsCount() {
    return this.analyticsService.getCompaniesWithLeadsCount();
  }

  @Public()
  @Get('user-performance')
  @ApiOperation({ 
    summary: 'Relatório de performance de usuários (múltiplos JOINs + agregações)',
    description: 'Query com múltiplos LEFT JOINs, COUNT, SUM e COALESCE'
  })
  async getUserPerformanceReport() {
    return this.analyticsService.getUserPerformanceReport();
  }

  @Public()
  @Get('leads-by-status')
  @ApiOperation({ 
    summary: 'Leads por status com info da empresa (CTE com WITH)',
    description: 'Query avançada usando Common Table Expression (CTE)'
  })
  async getLeadsByStatusWithCompanyInfo() {
    return this.analyticsService.getLeadsByStatusWithCompanyInfo();
  }

  @Public()
  @Get('top-companies')
  @ApiOperation({ 
    summary: 'Top empresas por performance (subquery + agregações complexas)',
    description: 'Query com subquery, múltiplas agregações e cálculo de taxa de conversão'
  })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  async getTopPerformingCompanies(@Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.analyticsService.getTopPerformingCompanies(limitNum);
  }

  @Public()
  @Get('lead-distribution')
  @ApiOperation({ 
    summary: 'Análise de distribuição de leads (CASE + window functions)',
    description: 'Query usando CASE para categorização e window functions para percentuais'
  })
  async getLeadDistributionAnalysis() {
    return this.analyticsService.getLeadDistributionAnalysis();
  }

  @Public()
  @Get('monthly-trend')
  @ApiOperation({ 
    summary: 'Tendência mensal de leads (CTE + window functions)',
    description: 'Query usando CTE, DATE_TRUNC e window functions para análise temporal'
  })
  async getMonthlyLeadTrend() {
    return this.analyticsService.getMonthlyLeadTrend();
  }
}
