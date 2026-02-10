'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  BarChart3,
  TrendingUp,
  Building2,
  Users,
  Target,
  Flame,
  Thermometer,
  Snowflake,
  Ban,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Badge } from '@/components/ui';
import { PageHeader } from '@/components/layout';
import api from '@/lib/api';
import type { UserPerformance, TopCompany, MonthlyTrend, LeadDistribution } from '@/types';

export default function RelatoriosPage() {
  const [userPerformance, setUserPerformance] = useState<UserPerformance[]>([]);
  const [topCompanies, setTopCompanies] = useState<TopCompany[]>([]);
  const [monthlyTrend, setMonthlyTrend] = useState<MonthlyTrend[]>([]);
  const [leadDistribution, setLeadDistribution] = useState<LeadDistribution[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      const [perfRes, compRes, trendRes, distRes] = await Promise.all([
        api.get('/analytics/user-performance'),
        api.get('/analytics/top-companies?limit=10'),
        api.get('/analytics/monthly-trend'),
        api.get('/analytics/lead-distribution'),
      ]);
      setUserPerformance(Array.isArray(perfRes.data) ? perfRes.data : []);
      setTopCompanies(Array.isArray(compRes.data) ? compRes.data : []);
      setMonthlyTrend(Array.isArray(trendRes.data) ? trendRes.data : []);
      setLeadDistribution(Array.isArray(distRes.data) ? distRes.data : []);
    } catch (error) {
      console.error('Erro ao buscar analytics:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const distCategories = leadDistribution.reduce<Record<string, { count: number; percentage: number }>>((acc, d) => {
    const cat = d.lead_category;
    if (!acc[cat]) acc[cat] = { count: 0, percentage: 0 };
    acc[cat].count += Number(d.count);
    acc[cat].percentage += Number(d.percentage);
    return acc;
  }, {});

  const getCategoryIcon = (cat: string) => {
    switch (cat.toLowerCase()) {
      case 'hot': return <Flame className="h-5 w-5 text-red-500" />;
      case 'warm': return <Thermometer className="h-5 w-5 text-orange-500" />;
      case 'cold': return <Snowflake className="h-5 w-5 text-blue-500" />;
      default: return <Ban className="h-5 w-5 text-gray-500" />;
    }
  };

  const getCategoryColor = (cat: string) => {
    switch (cat.toLowerCase()) {
      case 'hot': return 'bg-red-500';
      case 'warm': return 'bg-orange-500';
      case 'cold': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  // Monthly trend chart
  const trendMaxLeads = Math.max(...monthlyTrend.map(m => Number(m.cumulative_leads || m.leads_created)), 1);

  return (
    <div>
      <PageHeader
        title="Relatórios"
        subtitle="Analytics avançados e métricas de performance"
      />

      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}><CardContent><div className="h-24 animate-pulse rounded bg-muted" /></CardContent></Card>
          ))}
        </div>
      ) : (
        <>
          {/* Lead Distribution Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
            {Object.entries(distCategories).map(([category, data]) => (
              <Card key={category}>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground capitalize">{category}</p>
                      <p className="text-2xl font-bold text-foreground">{data.count}</p>
                      <p className="text-xs text-muted-foreground">{Number(data.percentage).toFixed(1)}% do total</p>
                    </div>
                    {getCategoryIcon(category)}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Monthly Trend Chart */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Tendência Mensal (12 meses)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {monthlyTrend.length > 0 ? (
                <div className="space-y-3">
                  {monthlyTrend.map((m, i) => {
                    const created = Number(m.leads_created);
                    const converted = Number(m.leads_converted);
                    const rate = Number(m.conversion_rate);
                    const barWidth = (created / trendMaxLeads) * 100;
                    return (
                      <div key={i} className="flex items-center gap-4">
                        <span className="w-20 text-xs text-muted-foreground truncate">
                          {m.month ? new Date(m.month).toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }) : `Mês ${i + 1}`}
                        </span>
                        <div className="flex-1 relative">
                          <div className="h-6 rounded bg-muted overflow-hidden">
                            <div
                              className="h-full bg-primary/60 rounded transition-all"
                              style={{ width: `${barWidth}%` }}
                            />
                          </div>
                        </div>
                        <div className="flex items-center gap-3 w-48 text-xs">
                          <span className="text-foreground font-medium">{created} criados</span>
                          <span className="text-green-500">{converted} conv.</span>
                          <span className="text-muted-foreground">{rate.toFixed(0)}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-center text-sm text-muted-foreground py-8">Sem dados de tendência mensal</p>
              )}
            </CardContent>
          </Card>

          <div className="grid gap-6 lg:grid-cols-2 mb-8">
            {/* Top Companies */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  Top Empresas por Conversão
                </CardTitle>
              </CardHeader>
              <CardContent>
                {topCompanies.length > 0 ? (
                  <div className="space-y-3">
                    {topCompanies.map((company, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-3">
                          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                            {i + 1}
                          </span>
                          <div>
                            <p className="text-sm font-medium text-foreground">{company.company_name}</p>
                            <p className="text-xs text-muted-foreground">
                              {company.total_leads} leads · {company.total_clients} clientes
                            </p>
                          </div>
                        </div>
                        <Badge variant={Number(company.conversion_rate) > 50 ? 'success' : Number(company.conversion_rate) > 25 ? 'warning' : 'default'}>
                          {Number(company.conversion_rate).toFixed(0)}%
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-sm text-muted-foreground py-8">Sem dados de empresas</p>
                )}
              </CardContent>
            </Card>

            {/* User Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Performance da Equipe
                </CardTitle>
              </CardHeader>
              <CardContent>
                {userPerformance.length > 0 ? (
                  <div className="space-y-3">
                    {userPerformance.map((perf, i) => {
                      const totalLeads = Number(perf.totalLeads);
                      const totalClients = Number(perf.totalClients);
                      const rate = totalLeads > 0 ? ((totalClients / totalLeads) * 100) : 0;
                      return (
                        <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-xs">
                              {perf.userName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-foreground">{perf.userName}</p>
                              <p className="text-xs text-muted-foreground">{perf.userEmail}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-foreground">{totalLeads} leads / {totalClients} clientes</p>
                            <p className="text-xs text-muted-foreground">Conversão: {rate.toFixed(0)}%</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-center text-sm text-muted-foreground py-8">Sem dados de performance</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Lead Distribution Detail */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Distribuição Detalhada de Leads
              </CardTitle>
            </CardHeader>
            <CardContent>
              {leadDistribution.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 text-muted-foreground font-medium">Categoria</th>
                        <th className="text-left py-3 px-4 text-muted-foreground font-medium">Status</th>
                        <th className="text-right py-3 px-4 text-muted-foreground font-medium">Quantidade</th>
                        <th className="text-right py-3 px-4 text-muted-foreground font-medium">%</th>
                        <th className="py-3 px-4 text-muted-foreground font-medium">Barra</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leadDistribution.map((d, i) => (
                        <tr key={i} className="border-b border-border/50 hover:bg-muted/30">
                          <td className="py-3 px-4">
                            <span className="flex items-center gap-2">
                              {getCategoryIcon(d.lead_category)}
                              <span className="capitalize font-medium">{d.lead_category}</span>
                            </span>
                          </td>
                          <td className="py-3 px-4 text-muted-foreground">{d.status}</td>
                          <td className="py-3 px-4 text-right font-medium">{d.count}</td>
                          <td className="py-3 px-4 text-right text-muted-foreground">{Number(d.percentage).toFixed(1)}%</td>
                          <td className="py-3 px-4 w-40">
                            <div className="h-2 rounded bg-muted overflow-hidden">
                              <div className={`h-full rounded ${getCategoryColor(d.lead_category)}`} style={{ width: `${Math.min(Number(d.percentage), 100)}%` }} />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-center text-sm text-muted-foreground py-8">Sem dados de distribuição</p>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
