import { IsOptional, IsEnum, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export enum DashboardPeriod {
  TODAY = 'today',
  WEEK = 'week',
  MONTH = 'month',
  QUARTER = 'quarter',
  YEAR = 'year',
  ALL = 'all',
}

export class DashboardQueryDto {
  @ApiPropertyOptional({
    description: 'Período para análise',
    enum: DashboardPeriod,
    default: DashboardPeriod.MONTH,
  })
  @IsOptional()
  @IsEnum(DashboardPeriod)
  period?: DashboardPeriod = DashboardPeriod.MONTH;

  @ApiPropertyOptional({
    description: 'Data inicial (ISO 8601)',
    example: '2024-01-01',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'Data final (ISO 8601)',
    example: '2024-12-31',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}

export interface DashboardStats {
  totals: {
    leads: number;
    clientes: number;
    empresas: number;
    usuarios: number;
  };
  growth: {
    leads: number;
    clientes: number;
    empresas: number;
  };
  conversion: {
    rate: number;
    qualified: number;
    lost: number;
  };
}

export interface DashboardTimeline {
  labels: string[];
  leads: number[];
  clientes: number[];
}

export interface DashboardByStatus {
  status: string;
  count: number;
  percentage: number;
}

export interface DashboardBySegment {
  segmento: string;
  leads: number;
  clientes: number;
  empresas: number;
}

export interface DashboardResponse {
  stats: DashboardStats;
  timeline: DashboardTimeline;
  byStatus: DashboardByStatus[];
  bySegment: DashboardBySegment[];
  topUsers: {
    id: string;
    nome: string;
    leads: number;
    clientes: number;
    conversion: number;
  }[];
  lastRefresh: Date;
}
