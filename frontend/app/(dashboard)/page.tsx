'use client';

import {
  Users,
  UserPlus,
  Target,
  DollarSign,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { cn, formatCurrency } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

interface StatCardProps {
  title: string;
  value: string;
  change: number;
  icon: React.ReactNode;
  trend: 'up' | 'down';
}

function StatCard({ title, value, change, icon, trend }: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="mt-1 text-2xl font-bold text-foreground">{value}</p>
            <div className="mt-1 flex items-center gap-1">
              {trend === 'up' ? (
                <ArrowUpRight className="h-4 w-4 text-success" />
              ) : (
                <ArrowDownRight className="h-4 w-4 text-error" />
              )}
              <span
                className={cn(
                  'text-sm font-medium',
                  trend === 'up' ? 'text-success' : 'text-error'
                )}
              >
                {change}%
              </span>
              <span className="text-sm text-muted-foreground">vs mês anterior</span>
            </div>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface RecentActivity {
  id: string;
  type: 'lead' | 'client' | 'deal' | 'task';
  title: string;
  description: string;
  time: string;
}

const recentActivities: RecentActivity[] = [
  {
    id: '1',
    type: 'lead',
    title: 'Novo lead cadastrado',
    description: 'João Silva - Tech Solutions',
    time: 'Há 5 minutos',
  },
  {
    id: '2',
    type: 'deal',
    title: 'Negociação fechada',
    description: 'Contrato anual - R$ 45.000',
    time: 'Há 1 hora',
  },
  {
    id: '3',
    type: 'client',
    title: 'Cliente convertido',
    description: 'Maria Santos - ABC Corp',
    time: 'Há 2 horas',
  },
  {
    id: '4',
    type: 'task',
    title: 'Reunião agendada',
    description: 'Follow-up com prospect',
    time: 'Há 3 horas',
  },
];

const typeColors = {
  lead: 'bg-info/10 text-info',
  client: 'bg-success/10 text-success',
  deal: 'bg-warning/10 text-warning',
  task: 'bg-primary/10 text-primary',
};

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div>
      <PageHeader
        title={`Olá, ${user?.nome?.split(' ')[0]}!`}
        subtitle="Aqui está o resumo das suas atividades"
      />

      {/* Stats Grid */}
      <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total de Leads"
          value="234"
          change={12}
          icon={<UserPlus className="h-6 w-6" />}
          trend="up"
        />
        <StatCard
          title="Clientes Ativos"
          value="1,892"
          change={8}
          icon={<Users className="h-6 w-6" />}
          trend="up"
        />
        <StatCard
          title="Oportunidades"
          value="45"
          change={-3}
          icon={<Target className="h-6 w-6" />}
          trend="down"
        />
        <StatCard
          title="Receita do Mês"
          value={formatCurrency(156780)}
          change={23}
          icon={<DollarSign className="h-6 w-6" />}
          trend="up"
        />
      </div>

      {/* Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Atividade Recente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-4 rounded-lg p-3 transition-colors hover:bg-accent"
                >
                  <div
                    className={cn(
                      'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
                      typeColors[activity.type]
                    )}
                  >
                    {activity.type === 'lead' && <UserPlus className="h-5 w-5" />}
                    {activity.type === 'client' && <Users className="h-5 w-5" />}
                    {activity.type === 'deal' && <DollarSign className="h-5 w-5" />}
                    {activity.type === 'task' && <Target className="h-5 w-5" />}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{activity.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {activity.description}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {activity.time}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Pipeline Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Funil de Vendas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { stage: 'Contato Inicial', count: 23, value: 125000, color: 'bg-blue-500' },
                { stage: 'Qualificação', count: 15, value: 89000, color: 'bg-cyan-500' },
                { stage: 'Proposta', count: 8, value: 67000, color: 'bg-violet-500' },
                { stage: 'Negociação', count: 5, value: 45000, color: 'bg-amber-500' },
                { stage: 'Fechamento', count: 3, value: 32000, color: 'bg-green-500' },
              ].map((item) => (
                <div key={item.stage} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">
                      {item.stage}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {item.count} oportunidades
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                      <div
                        className={cn('h-full rounded-full', item.color)}
                        style={{ width: `${(item.count / 23) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-foreground">
                      {formatCurrency(item.value)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
