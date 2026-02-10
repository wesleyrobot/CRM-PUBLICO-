'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Handshake,
  TrendingUp,
  UserCheck,
  Target,
  Filter,
  XCircle,
} from 'lucide-react';
import {
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui';
import { PageHeader } from '@/components/layout';
import api from '@/lib/api';
import { formatDate } from '@/lib/utils';
import type { Lead, Client, PaginatedResponse } from '@/types';

const statusLabels: Record<string, string> = {
  novo: 'Prospecção',
  em_contato: 'Negociação',
  qualificado: 'Fechamento',
  perdido: 'Perdido',
};

const statusVariants: Record<string, 'info' | 'warning' | 'success' | 'error'> = {
  novo: 'info',
  em_contato: 'warning',
  qualificado: 'success',
  perdido: 'error',
};

export default function NegociacoesPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [leadsRes, clientsRes] = await Promise.all([
        api.get<PaginatedResponse<Lead>>('/leads', { params: { limit: 100 } }),
        api.get<PaginatedResponse<Client>>('/clients', { params: { limit: 100 } }),
      ]);
      setLeads(leadsRes.data.data);
      setClients(clientsRes.data.data);
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const totalLeads = leads.length;
  const emContato = leads.filter(l => l.status === 'em_contato').length;
  const qualificados = leads.filter(l => l.status === 'qualificado').length;
  const perdidos = leads.filter(l => l.status === 'perdido').length;
  const convertidos = clients.length;
  const taxaConversao = totalLeads > 0 ? ((convertidos / totalLeads) * 100).toFixed(1) : '0';

  // Funnel data
  const funnelStages = [
    { label: 'Leads Totais', count: totalLeads, color: 'bg-blue-500', width: 100 },
    { label: 'Em Contato', count: emContato, color: 'bg-yellow-500', width: totalLeads > 0 ? (emContato / totalLeads) * 100 : 0 },
    { label: 'Qualificados', count: qualificados, color: 'bg-green-500', width: totalLeads > 0 ? (qualificados / totalLeads) * 100 : 0 },
    { label: 'Convertidos (Clientes)', count: convertidos, color: 'bg-primary', width: totalLeads > 0 ? (convertidos / totalLeads) * 100 : 0 },
    { label: 'Perdidos', count: perdidos, color: 'bg-red-500', width: totalLeads > 0 ? (perdidos / totalLeads) * 100 : 0 },
  ];

  // Active negotiations (em_contato + qualificado)
  const activeNegotiations = leads
    .filter(l => l.status === 'em_contato' || l.status === 'qualificado')
    .sort((a, b) => b.pontuacao - a.pontuacao);

  return (
    <div>
      <PageHeader
        title="Negociações"
        subtitle="Funil de vendas e acompanhamento de negociações"
      />

      {loading ? (
        <div className="grid gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}><CardContent><div className="h-20 animate-pulse rounded bg-muted" /></CardContent></Card>
          ))}
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-5 mb-8">
            <Card>
              <CardContent>
                <div className="flex items-center gap-3">
                  <Target className="h-8 w-8 text-blue-500" />
                  <div>
                    <p className="text-2xl font-bold text-foreground">{totalLeads}</p>
                    <p className="text-xs text-muted-foreground">Total Leads</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <div className="flex items-center gap-3">
                  <Handshake className="h-8 w-8 text-yellow-500" />
                  <div>
                    <p className="text-2xl font-bold text-foreground">{emContato + qualificados}</p>
                    <p className="text-xs text-muted-foreground">Em Negociação</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <div className="flex items-center gap-3">
                  <UserCheck className="h-8 w-8 text-green-500" />
                  <div>
                    <p className="text-2xl font-bold text-foreground">{convertidos}</p>
                    <p className="text-xs text-muted-foreground">Convertidos</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-8 w-8 text-primary" />
                  <div>
                    <p className="text-2xl font-bold text-foreground">{taxaConversao}%</p>
                    <p className="text-xs text-muted-foreground">Taxa Conversão</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <div className="flex items-center gap-3">
                  <XCircle className="h-8 w-8 text-red-500" />
                  <div>
                    <p className="text-2xl font-bold text-foreground">{perdidos}</p>
                    <p className="text-xs text-muted-foreground">Perdidos</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sales Funnel */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-primary" />
                Funil de Vendas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-w-2xl mx-auto">
                {funnelStages.map((stage, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <span className="w-44 text-sm text-muted-foreground text-right">{stage.label}</span>
                    <div className="flex-1 relative">
                      <div className="h-10 rounded-lg bg-muted overflow-hidden flex items-center">
                        <div
                          className={`h-full ${stage.color} rounded-lg transition-all flex items-center justify-center`}
                          style={{ width: `${Math.max(stage.width, 5)}%` }}
                        >
                          <span className="text-xs font-bold text-white drop-shadow">{stage.count}</span>
                        </div>
                      </div>
                    </div>
                    <span className="w-12 text-xs text-muted-foreground text-right">
                      {totalLeads > 0 ? `${((stage.count / totalLeads) * 100).toFixed(0)}%` : '0%'}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Active Negotiations Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Handshake className="h-5 w-5 text-primary" />
                Negociações Ativas ({activeNegotiations.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {activeNegotiations.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 text-muted-foreground font-medium">Lead</th>
                        <th className="text-left py-3 px-4 text-muted-foreground font-medium">Origem</th>
                        <th className="text-center py-3 px-4 text-muted-foreground font-medium">Pontuação</th>
                        <th className="text-center py-3 px-4 text-muted-foreground font-medium">Estágio</th>
                        <th className="text-left py-3 px-4 text-muted-foreground font-medium">Desde</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeNegotiations.map((lead) => (
                        <tr key={lead.id} className="border-b border-border/50 hover:bg-muted/30">
                          <td className="py-3 px-4">
                            <div>
                              <p className="font-medium text-foreground">{lead.nome}</p>
                              {lead.email && <p className="text-xs text-muted-foreground">{lead.email}</p>}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-muted-foreground">{lead.origem || '—'}</td>
                          <td className="py-3 px-4 text-center">
                            <span className="font-bold text-foreground">{lead.pontuacao}</span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <Badge variant={statusVariants[lead.status]}>
                              {statusLabels[lead.status]}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-muted-foreground">{formatDate(lead.criadoEm)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <Handshake className="h-12 w-12 mb-3 opacity-50" />
                  <p>Nenhuma negociação ativa</p>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
