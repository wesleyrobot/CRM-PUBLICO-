'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Zap,
  Play,
  RefreshCw,
  Search as SearchIcon,
  Trash2,
  Database,
  Clock,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import {
  Button,
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui';
import { PageHeader } from '@/components/layout';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import type { SchedulerJob } from '@/types';

const jobDescriptions: Record<string, { description: string; schedule: string; icon: typeof RefreshCw }> = {
  'refresh-dashboard-view': {
    description: 'Atualiza a materialized view do dashboard com dados agregados recentes',
    schedule: 'A cada 15 minutos',
    icon: RefreshCw,
  },
  'update-search-vectors': {
    description: 'Recalcula os vetores de busca full-text para leads, clientes e empresas',
    schedule: 'A cada 1 hora',
    icon: SearchIcon,
  },
  'cleanup-old-audit-logs': {
    description: 'Remove registros de auditoria com mais de 90 dias para otimizar armazenamento',
    schedule: 'Diariamente à meia-noite',
    icon: Trash2,
  },
  'vacuum-analyze': {
    description: 'Executa VACUUM ANALYZE nas tabelas principais para otimizar performance do PostgreSQL',
    schedule: 'Domingos às 3h da manhã',
    icon: Database,
  },
};

export default function AutomacoesPage() {
  const { user } = useAuth();
  const isAdmin = user?.cargo === 'admin';
  const [jobs, setJobs] = useState<SchedulerJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [runningJob, setRunningJob] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, { success: boolean; message: string }>>({});

  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get<SchedulerJob[]>('/scheduler/jobs');
      setJobs(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Erro ao buscar jobs:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const runJob = async (jobName: string) => {
    try {
      setRunningJob(jobName);
      const response = await api.post(`/scheduler/run/${jobName}`);
      const data = response.data;
      setResults(prev => ({ ...prev, [jobName]: { success: true, message: data?.message || 'Executado com sucesso' } }));
      fetchJobs();
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Erro ao executar job';
      setResults(prev => ({ ...prev, [jobName]: { success: false, message: msg } }));
    } finally {
      setRunningJob(null);
    }
  };

  return (
    <div>
      <PageHeader
        title="Automações"
        subtitle="Gerencie as tarefas automáticas do sistema (CRON Jobs)"
        actions={
          <Button leftIcon={<RefreshCw className="h-4 w-4" />} variant="outline" onClick={fetchJobs}>
            Atualizar
          </Button>
        }
      />

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <Card>
          <CardContent>
            <div className="flex items-center gap-3">
              <Zap className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold text-foreground">{jobs.length}</p>
                <p className="text-xs text-muted-foreground">Jobs configurados</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <div className="flex items-center gap-3">
              <RefreshCw className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm font-bold text-foreground">15 min</p>
                <p className="text-xs text-muted-foreground">Dashboard Refresh</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <div className="flex items-center gap-3">
              <SearchIcon className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm font-bold text-foreground">1 hora</p>
                <p className="text-xs text-muted-foreground">Search Vectors</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <div className="flex items-center gap-3">
              <Database className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-sm font-bold text-foreground">Semanal</p>
                <p className="text-xs text-muted-foreground">VACUUM ANALYZE</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Jobs List */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <Card>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Zap className="h-12 w-12 mb-3 opacity-50" />
              <p>Nenhum job encontrado</p>
              <p className="text-xs mt-1">O módulo de scheduler pode não estar ativo</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => {
            const info = jobDescriptions[job.name] || {
              description: job.description || 'Job do sistema',
              schedule: 'Programado',
              icon: Zap,
            };
            const JobIcon = info.icon;
            const result = results[job.name];

            return (
              <Card key={job.name} className="overflow-hidden">
                <div className="flex items-center gap-4 p-5">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <JobIcon className="h-6 w-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-semibold text-foreground">{job.name}</h3>
                      <Badge variant="info">{info.schedule}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{info.description}</p>
                    {job.nextRun && (
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Próxima execução: {new Date(job.nextRun).toLocaleString('pt-BR')}
                      </p>
                    )}
                    {result && (
                      <div className={`flex items-center gap-1 mt-2 text-xs ${result.success ? 'text-green-500' : 'text-red-500'}`}>
                        {result.success ? <CheckCircle className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                        {result.message}
                      </div>
                    )}
                  </div>
                  {isAdmin && (
                    <Button
                      size="sm"
                      variant="outline"
                      leftIcon={<Play className="h-4 w-4" />}
                      onClick={() => runJob(job.name)}
                      loading={runningJob === job.name}
                    >
                      Executar
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {!isAdmin && (
        <p className="mt-6 text-xs text-muted-foreground text-center">
          Apenas administradores podem executar jobs manualmente.
        </p>
      )}
    </div>
  );
}
