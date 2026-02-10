'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Activity,
  Plus,
  Pencil,
  Trash2,
  Filter,
  ChevronDown,
  ChevronUp,
  Database,
  Clock,
  BarChart3,
} from 'lucide-react';
import {
  Button,
  Input,
  Select,
  Badge,
  Pagination,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui';
import { PageHeader } from '@/components/layout';
import api from '@/lib/api';
import { formatDateTime } from '@/lib/utils';
import type { AuditLog, AuditStats, PaginatedResponse } from '@/types';

const actionLabels: Record<string, string> = {
  INSERT: 'Criação',
  UPDATE: 'Atualização',
  DELETE: 'Exclusão',
};

const actionVariants: Record<string, 'success' | 'warning' | 'error'> = {
  INSERT: 'success',
  UPDATE: 'warning',
  DELETE: 'error',
};

const actionIcons: Record<string, typeof Plus> = {
  INSERT: Plus,
  UPDATE: Pencil,
  DELETE: Trash2,
};

const tableLabels: Record<string, string> = {
  leads: 'Leads',
  clientes: 'Clientes',
  empresas: 'Empresas',
  usuarios: 'Usuários',
};

const tableOptions = [
  { value: '', label: 'Todas as tabelas' },
  { value: 'leads', label: 'Leads' },
  { value: 'clientes', label: 'Clientes' },
  { value: 'empresas', label: 'Empresas' },
  { value: 'usuarios', label: 'Usuários' },
];

const actionOptions = [
  { value: '', label: 'Todas as ações' },
  { value: 'INSERT', label: 'Criação' },
  { value: 'UPDATE', label: 'Atualização' },
  { value: 'DELETE', label: 'Exclusão' },
];

export default function AtividadesPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [stats, setStats] = useState<AuditStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [tableFilter, setTableFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const params: Record<string, string | number> = { page, limit: 15 };
      if (tableFilter) params.tabela = tableFilter;
      if (actionFilter) params.acao = actionFilter;

      const [logsRes, statsRes] = await Promise.all([
        api.get<PaginatedResponse<AuditLog>>('/audit', { params }),
        api.get<AuditStats>('/audit/stats'),
      ]);

      setLogs(logsRes.data.data);
      setTotalPages(logsRes.data.meta.totalPages);
      setTotal(logsRes.data.meta.total);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Erro ao buscar atividades:', error);
    } finally {
      setLoading(false);
    }
  }, [page, tableFilter, actionFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const renderJsonDiff = (before: Record<string, unknown> | undefined, after: Record<string, unknown> | undefined) => {
    if (!before && !after) return <p className="text-xs text-muted-foreground">Sem dados detalhados</p>;

    const allKeys = new Set([
      ...Object.keys(before || {}),
      ...Object.keys(after || {}),
    ]);

    const changedKeys = [...allKeys].filter(key => {
      const b = before?.[key];
      const a = after?.[key];
      return JSON.stringify(b) !== JSON.stringify(a);
    });

    if (changedKeys.length === 0 && before && after) {
      return <p className="text-xs text-muted-foreground">Nenhuma alteração detectada nos campos</p>;
    }

    return (
      <div className="space-y-1 max-h-64 overflow-y-auto">
        {(before && !after) && (
          <div className="text-xs">
            {Object.entries(before).slice(0, 20).map(([key, val]) => (
              <div key={key} className="flex gap-2 py-0.5">
                <span className="text-muted-foreground font-mono w-32 shrink-0">{key}:</span>
                <span className="text-red-400 line-through">{String(val ?? '—')}</span>
              </div>
            ))}
          </div>
        )}
        {(!before && after) && (
          <div className="text-xs">
            {Object.entries(after).slice(0, 20).map(([key, val]) => (
              <div key={key} className="flex gap-2 py-0.5">
                <span className="text-muted-foreground font-mono w-32 shrink-0">{key}:</span>
                <span className="text-green-400">{String(val ?? '—')}</span>
              </div>
            ))}
          </div>
        )}
        {before && after && changedKeys.slice(0, 20).map(key => (
          <div key={key} className="flex gap-2 py-0.5 text-xs">
            <span className="text-muted-foreground font-mono w-32 shrink-0">{key}:</span>
            <span className="text-red-400 line-through">{String(before[key] ?? '—')}</span>
            <span className="text-muted-foreground">→</span>
            <span className="text-green-400">{String(after[key] ?? '—')}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div>
      <PageHeader
        title="Atividades"
        subtitle="Histórico de auditoria e ações realizadas no sistema"
      />

      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-4 mb-6">
          <Card>
            <CardContent>
              <div className="flex items-center gap-3">
                <Database className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.totalLogs}</p>
                  <p className="text-xs text-muted-foreground">Total de registros</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <div className="flex items-center gap-3">
                <Clock className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.last24h}</p>
                  <p className="text-xs text-muted-foreground">Últimas 24h</p>
                </div>
              </div>
            </CardContent>
          </Card>
          {stats.byAction && Object.entries(stats.byAction).map(([acao, count]) => (
            <Card key={acao}>
              <CardContent>
                <div className="flex items-center gap-3">
                  <BarChart3 className={`h-8 w-8 ${acao === 'INSERT' ? 'text-green-500' : acao === 'UPDATE' ? 'text-yellow-500' : 'text-red-500'}`} />
                  <div>
                    <p className="text-2xl font-bold text-foreground">{count}</p>
                    <p className="text-xs text-muted-foreground">{actionLabels[acao] || acao}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <Select
          options={tableOptions}
          value={tableFilter}
          onChange={(e) => { setTableFilter(e.target.value); setPage(1); }}
          className="w-48"
        />
        <Select
          options={actionOptions}
          value={actionFilter}
          onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
          className="w-48"
        />
      </div>

      {/* Activity Timeline */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      ) : logs.length === 0 ? (
        <Card>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Activity className="h-12 w-12 mb-3 opacity-50" />
              <p>Nenhuma atividade encontrada</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {logs.map((log) => {
            const ActionIcon = actionIcons[log.acao] || Activity;
            const isExpanded = expandedId === log.id;
            return (
              <div
                key={log.id}
                className="rounded-lg border border-border bg-card overflow-hidden transition-colors hover:border-border/80"
              >
                <button
                  onClick={() => setExpandedId(isExpanded ? null : log.id)}
                  className="w-full flex items-center gap-4 p-4 text-left"
                >
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                    log.acao === 'INSERT' ? 'bg-green-500/10 text-green-500' :
                    log.acao === 'UPDATE' ? 'bg-yellow-500/10 text-yellow-500' :
                    'bg-red-500/10 text-red-500'
                  }`}>
                    <ActionIcon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Badge variant={actionVariants[log.acao]}>{actionLabels[log.acao]}</Badge>
                      <span className="text-sm text-foreground font-medium">
                        {tableLabels[log.tabela] || log.tabela}
                      </span>
                      {log.usuario && (
                        <span className="text-xs text-muted-foreground">
                          por {log.usuario.nome}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatDateTime(log.criadoEm)} · ID: {log.registroId?.slice(0, 8)}...
                    </p>
                  </div>
                  {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                </button>
                {isExpanded && (
                  <div className="border-t border-border px-4 py-3 bg-muted/20">
                    {renderJsonDiff(log.dadosAnteriores, log.dadosNovos)}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} total={total} onPageChange={setPage} />
    </div>
  );
}
