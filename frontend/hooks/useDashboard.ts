import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import * as XLSX from 'xlsx';

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

export interface DashboardTopUser {
  id: string;
  nome: string;
  leads: number;
  clientes: number;
  conversion: number;
}

export interface DashboardData {
  stats: DashboardStats;
  timeline: DashboardTimeline;
  byStatus: DashboardByStatus[];
  bySegment: DashboardBySegment[];
  topUsers: DashboardTopUser[];
  lastRefresh: string;
}

type Period = 'today' | 'week' | 'month' | 'quarter' | 'year' | 'all';

interface UseDashboardOptions {
  period?: Period;
  autoRefresh?: boolean;
  refreshInterval?: number; // in milliseconds
}

interface UseDashboardReturn {
  data: DashboardData | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  exportData: () => Promise<void>;
  isExporting: boolean;
}

export function useDashboard(options: UseDashboardOptions = {}): UseDashboardReturn {
  const {
    period = 'month',
    autoRefresh = false,
    refreshInterval = 60000, // 1 minute default
  } = options;

  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await api.get('/dashboard', {
        params: { period },
      });

      setData(response.data);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Erro ao carregar dashboard';
      setError(errorMessage);
      console.error('Dashboard fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [period]);

  const exportData = useCallback(async () => {
    try {
      setIsExporting(true);
      setError(null);

      const response = await api.get('/dashboard/export', {
        params: { period },
      });

      const exportInfo = response.data?.export;
      const stats = response.data?.stats;
      const wb = XLSX.utils.book_new();

      // Sheet 1: Resumo
      const resumoData = [
        ['Relatório CRM - Dashboard Export'],
        ['Período', exportInfo?.period || period],
        ['Exportado em', new Date().toLocaleString('pt-BR')],
        [],
        ['Totais'],
        ['Leads', stats?.totals?.leads || 0],
        ['Clientes', stats?.totals?.clientes || 0],
        ['Empresas', stats?.totals?.empresas || 0],
        ['Usuários', stats?.totals?.usuarios || 0],
        [],
        ['Conversão'],
        ['Taxa de Conversão (%)', stats?.conversion?.rate || 0],
        ['Qualificados', stats?.conversion?.qualified || 0],
        ['Perdidos', stats?.conversion?.lost || 0],
      ];
      const wsResumo = XLSX.utils.aoa_to_sheet(resumoData);
      wsResumo['!cols'] = [{ wch: 25 }, { wch: 20 }];
      XLSX.utils.book_append_sheet(wb, wsResumo, 'Resumo');

      // Sheet 2: Leads
      if (exportInfo?.leads?.length) {
        const leadsFormatted = exportInfo.leads.map((l: any) => ({
          'Nome': l.nome,
          'Email': l.email,
          'Telefone': l.telefone,
          'Status': l.status,
          'Origem': l.origem,
          'Pontuação': l.pontuacao,
          'Empresa': l.empresa,
          'Segmento': l.segmento,
          'Responsável': l.responsavel,
          'Criado em': l.criado_em ? new Date(l.criado_em).toLocaleDateString('pt-BR') : '',
        }));
        const wsLeads = XLSX.utils.json_to_sheet(leadsFormatted);
        wsLeads['!cols'] = [
          { wch: 25 }, { wch: 30 }, { wch: 15 }, { wch: 15 },
          { wch: 15 }, { wch: 12 }, { wch: 25 }, { wch: 20 },
          { wch: 20 }, { wch: 12 },
        ];
        XLSX.utils.book_append_sheet(wb, wsLeads, 'Leads');
      }

      // Sheet 3: Clientes
      if (exportInfo?.clients?.length) {
        const clientsFormatted = exportInfo.clients.map((c: any) => ({
          'Nome': c.nome,
          'Email': c.email,
          'Telefone': c.telefone,
          'Empresa': c.empresa,
          'Segmento': c.segmento,
          'Responsável': c.responsavel,
          'Ativo': c.ativo ? 'Sim' : 'Não',
          'Cliente desde': c.criado_em ? new Date(c.criado_em).toLocaleDateString('pt-BR') : '',
        }));
        const wsClients = XLSX.utils.json_to_sheet(clientsFormatted);
        wsClients['!cols'] = [
          { wch: 25 }, { wch: 30 }, { wch: 15 }, { wch: 25 },
          { wch: 20 }, { wch: 20 }, { wch: 8 }, { wch: 15 },
        ];
        XLSX.utils.book_append_sheet(wb, wsClients, 'Clientes');
      }

      // Sheet 4: Empresas
      if (exportInfo?.companies?.length) {
        const companiesFormatted = exportInfo.companies.map((e: any) => ({
          'Nome': e.nome,
          'CNPJ': e.cnpj,
          'Segmento': e.segmento,
          'Telefone': e.telefone,
          'Website': e.website,
          'Ativo': e.ativo ? 'Sim' : 'Não',
          'Total Leads': e.total_leads,
          'Total Clientes': e.total_clients,
          'Cadastro': e.criado_em ? new Date(e.criado_em).toLocaleDateString('pt-BR') : '',
        }));
        const wsCompanies = XLSX.utils.json_to_sheet(companiesFormatted);
        wsCompanies['!cols'] = [
          { wch: 30 }, { wch: 20 }, { wch: 20 }, { wch: 15 },
          { wch: 25 }, { wch: 8 }, { wch: 12 }, { wch: 14 }, { wch: 12 },
        ];
        XLSX.utils.book_append_sheet(wb, wsCompanies, 'Empresas');
      }

      // Generate and download
      const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `crm_relatorio_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Erro ao exportar dados';
      setError(errorMessage);
      console.error('Dashboard export error:', err);
    } finally {
      setIsExporting(false);
    }
  }, [period]);

  // Initial fetch
  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  // Auto refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchDashboard();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchDashboard]);

  return {
    data,
    isLoading,
    error,
    refresh: fetchDashboard,
    exportData,
    isExporting,
  };
}
