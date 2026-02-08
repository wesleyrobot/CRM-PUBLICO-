'use client';

import {
  Users,
  UserPlus,
  Target,
  TrendingUp,
  Calendar,
  MessageSquare,
  CheckCircle,
  Clock,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { cn, formatCurrency } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

// Metric Cards
const metrics = [
  { title: 'Leads Novos', value: '128', subtitle: 'Hoje', icon: CheckCircle, color: 'text-blue-500', bgColor: 'bg-blue-50' },
  { title: 'Oportunidades', value: '56', subtitle: 'Em Andamento', icon: Target, color: 'text-cyan-500', bgColor: 'bg-cyan-50' },
  { title: 'Vendas do Mês', value: 'R$ 124.500', subtitle: 'Este Mês', icon: TrendingUp, color: 'text-green-500', bgColor: 'bg-green-50' },
  { title: 'Taxa de Conversão', value: '32%', subtitle: 'Últimos 30 Dias', icon: Users, color: 'text-purple-500', bgColor: 'bg-purple-50' },
];

// Sales Funnel Data
const funnelData = [
  { stage: 'Prospects', count: 80, color: 'bg-blue-500' },
  { stage: 'Qualificação', count: 45, color: 'bg-cyan-500' },
  { stage: 'Proposta', count: 25, color: 'bg-amber-500' },
  { stage: 'Fechado', count: 12, color: 'bg-red-500' },
];

// Performance Data
const performanceData = [
  { month: 'Set', value: 60 },
  { month: 'Out', value: 75 },
  { month: 'Nov', value: 85 },
  { month: 'Dez', value: 70 },
  { month: 'Jan', value: 95 },
];

// Leads Table Data
const leadsData = [
  { name: 'Paula Mendes', company: 'Tech Solutions', status: 'Em Negociação', statusColor: 'bg-green-500', action: 'Próxima Ação' },
  { name: 'Carlos Lima', company: 'Grupo Alpha', status: 'Proposta Enviada', statusColor: 'bg-amber-500', action: 'Próxima Ação' },
  { name: 'Mariana Rocha', company: 'InovaTech', status: 'Follow-up Amanhã', statusColor: 'bg-blue-500', action: 'Próxima Ação' },
];

// Schedule Data
const schedule = [
  { time: '10:00', title: 'Reunião com Empresa X' },
  { time: '11:30', title: 'Ligação com João Silva' },
  { time: '14:00', title: 'Follow-up com Mariana' },
];

// Notes Data
const notes = [
  { author: 'Ana Costa', time: 'Há 1 hora', message: 'Segue informações solicitadas, qualquer dúvida esou à disposição!' },
];

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      {/* Metrics Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <Card key={metric.title} className="hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{metric.title}</p>
                  <p className="mt-2 text-3xl font-bold group-hover:text-primary transition-colors">{metric.value}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{metric.subtitle}</p>
                </div>
                <div className={cn('rounded-lg p-3 transition-transform group-hover:scale-110', metric.bgColor)}>
                  <metric.icon className={cn('h-6 w-6', metric.color)} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Funil de Vendas */}
        <Card>
          <CardHeader>
            <CardTitle>Funil de Vendas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {funnelData.map((item, index) => {
                const total = funnelData[0].count;
                const percentage = Math.round((item.count / total) * 100);

                return (
                  <div key={item.stage} className="flex items-center gap-4">
                    <div
                      className={cn(
                        'flex h-16 items-center justify-center rounded-lg text-white font-bold text-xl transition-all hover:scale-105 hover:shadow-lg cursor-pointer',
                        item.color
                      )}
                      style={{
                        width: `${100 - index * 15}%`,
                        minWidth: '120px'
                      }}
                    >
                      <div className="flex flex-col items-center">
                        <span>{item.count}</span>
                        <span className="text-xs font-normal opacity-90">{percentage}%</span>
                      </div>
                    </div>
                    <span className="text-sm font-medium whitespace-nowrap">{item.stage}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Desempenho de Vendas */}
        <Card>
          <CardHeader>
            <CardTitle>Desempenho de Vendas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between gap-2 h-48 relative">
              {performanceData.map((item, index) => (
                <div key={item.month} className="flex flex-col items-center gap-2 flex-1 group">
                  <div className="relative w-full">
                    <div
                      className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg transition-all hover:from-blue-600 hover:to-blue-500 cursor-pointer shadow-md hover:shadow-xl"
                      style={{ height: `${item.value * 1.9}px` }}
                    >
                      {/* Tooltip com valor */}
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        {item.value}%
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-medium text-muted-foreground">{item.month}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Metas do Mês */}
        <Card>
          <CardHeader>
            <CardTitle>Metas do Mês</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium">R$ 150.000 / 200.000</span>
                  <span className="text-green-600 font-semibold">75%</span>
                </div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden shadow-inner">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 via-cyan-500 to-green-500 rounded-full transition-all duration-1000 ease-out shadow-lg relative"
                    style={{ width: '75%' }}
                  >
                    <div className="absolute inset-0 bg-white/20 animate-pulse rounded-full"></div>
                  </div>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>Faltam R$ 50.000</span>
                  <span>Meta até 31/Jan</span>
                </div>
              </div>

              {/* Agenda de Hoje */}
              <div className="mt-8">
                <div className="flex items-center gap-2 mb-4">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  <h3 className="font-semibold">Agenda de Hoje</h3>
                </div>
                <div className="space-y-3">
                  {schedule.map((item, index) => (
                    <div key={index} className="flex gap-3 text-sm p-2 rounded-lg hover:bg-accent/50 transition-colors cursor-pointer group">
                      <span className="font-semibold text-blue-600 whitespace-nowrap group-hover:text-blue-700">{item.time}</span>
                      <span className="text-muted-foreground group-hover:text-foreground transition-colors">- {item.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Leads em Andamento + Notas */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Leads em Andamento */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Leads em Andamento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Nome</th>
                    <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Empresa</th>
                    <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Status</th>
                    <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Próxima Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {leadsData.map((lead, index) => (
                    <tr key={index} className="border-b last:border-0 hover:bg-accent/50 transition-colors group">
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-sm font-medium shadow-md group-hover:shadow-lg transition-shadow">
                            {lead.name[0]}
                          </div>
                          <span className="font-medium group-hover:text-primary transition-colors">{lead.name}</span>
                        </div>
                      </td>
                      <td className="py-4 text-muted-foreground">{lead.company}</td>
                      <td className="py-4">
                        <span className={cn('inline-flex items-center px-3 py-1 rounded-full text-xs font-medium text-white shadow-sm', lead.statusColor)}>
                          {lead.status}
                        </span>
                      </td>
                      <td className="py-4">
                        <button className="text-blue-600 hover:text-blue-700 hover:underline text-sm font-medium transition-all">
                          {lead.action} →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Notas e Comentários */}
        <Card>
          <CardHeader>
            <CardTitle>Notas e Comentários</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {notes.map((note, index) => (
                <div key={index} className="space-y-2 p-3 rounded-lg hover:bg-accent/30 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-medium shadow-md flex-shrink-0">
                      {note.author[0]}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">{note.author}</span>
                        <span className="text-xs text-muted-foreground">{note.time}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{note.message}</p>
                    </div>
                  </div>
                </div>
              ))}
              <div className="mt-4 pt-4 border-t">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Escreva um comentário..."
                    className="flex-1 px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-background transition-all"
                  />
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 hover:shadow-md transition-all flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Enviar
                  </button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
