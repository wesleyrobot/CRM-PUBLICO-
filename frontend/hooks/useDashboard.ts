import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';

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

      // Convert to JSON and trigger download
      const jsonStr = JSON.stringify(response.data, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `dashboard_export_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      console.log('📊 Dados exportados com sucesso!');
      console.log('💡 Dica: Use o script Python para converter para Excel:');
      console.log(`   python export_to_excel.py --token YOUR_TOKEN --period ${period}`);
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
