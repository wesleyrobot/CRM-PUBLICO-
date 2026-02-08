'use client';

import {
  Users,
  TrendingUp,
  Target,
  Activity,
  Calendar,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

// Metric Cards Data
const metrics = [
  {
    title: 'Total de Receita',
    value: 'R$ 103.390',
    change: '+13%',
    subtitle: 'Crescimento mensal',
    isPositive: true,
    icon: TrendingUp,
  },
  {
    title: 'Leads Novos',
    value: '1.621',
    change: '+19%',
    subtitle: 'Últimos 30 dias',
    isPositive: true,
    icon: Users,
  },
  {
    title: 'Taxa de Conversão',
    value: '85%',
    change: '-2%',
    subtitle: 'Meta: 90%',
    isPositive: false,
    icon: Target,
  },
  {
    title: 'Oportunidades',
    value: '785',
    change: '+24%',
    subtitle: 'Em andamento',
    isPositive: true,
    icon: Activity,
  },
];

// Projects / Leads Data
const projects = [
  {
    name: 'Plataforma de comércio eletrônico',
    description: 'Loja virtual completa com pagamento integrado',
    status: 'ready',
    statusLabel: 'Preparar',
    lastUpdate: '02/07/2026',
  },
  {
    name: 'Aplicativo móvel (iOS e Android)',
    description: 'Aplicativo móvel multiplataforma com base',
    status: 'ready',
    statusLabel: 'Preparar',
    lastUpdate: '02/07/2026',
  },
  {
    name: 'Análise de painel',
    description: 'Painel de Business Intelligence em tempo real',
    status: 'progress',
    statusLabel: 'Em andamento',
    lastUpdate: '02/07/2026',
  },
  {
    name: 'Serviço de Gateway de API',
    description: 'Arquitetura de microsserviços com GraphQL',
    status: 'ready',
    statusLabel: 'Preparar',
    lastUpdate: '02/07/2026',
  },
];

// Performance Data
const performanceData = [
  { month: 'Jan-24', value: 75 },
  { month: 'Feb-24', value: 82 },
  { month: 'Mar-24', value: 78 },
  { month: 'Apr-24', value: 88 },
  { month: 'May-24', value: 95 },
];

// Calendar events
const events = [
  { time: '10:00', title: 'Reunião com Empresa X', date: 'Hoje' },
  { time: '14:00', title: 'Apresentação de proposta', date: 'Hoje' },
  { time: '16:30', title: 'Follow-up cliente Alpha', date: 'Amanhã' },
];

// Donut Chart Component
function DonutChart({ percentage }: { percentage: number }) {
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative w-48 h-48 mx-auto">
      <svg className="transform -rotate-90 w-48 h-48">
        {/* Background circle */}
        <circle
          cx="96"
          cy="96"
          r={radius}
          stroke="currentColor"
          strokeWidth="12"
          fill="none"
          className="text-muted/30"
        />
        {/* Progress circle - gradient */}
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00ff88" />
            <stop offset="50%" stopColor="#00d4ff" />
            <stop offset="100%" stopColor="#5e72e4" />
          </linearGradient>
        </defs>
        <circle
          cx="96"
          cy="96"
          r={radius}
          stroke="url(#gradient)"
          strokeWidth="12"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
          style={{
            filter: 'drop-shadow(0 0 8px rgba(0, 255, 136, 0.5))',
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-4xl font-light text-foreground">{percentage}%</div>
        <div className="text-xs text-muted-foreground mt-1">Completude</div>
      </div>
    </div>
  );
}

// Radar Chart Component (simplified)
function RadarChart() {
  const metrics = [
    { label: 'Engajamento', value: 85, color: '#00ff88' },
    { label: 'Conversão Real', value: 78, color: '#00d4ff' },
    { label: 'User Satisfaction', value: 92, color: '#5e72e4' },
    { label: 'Performance', value: 88, color: '#f5a623' },
    { label: 'Content Quality', value: 90, color: '#ff6b9d' },
  ];

  const size = 200;
  const center = size / 2;
  const maxRadius = size / 2 - 30;
  const angleStep = (Math.PI * 2) / metrics.length;

  const points = metrics
    .map((metric, i) => {
      const angle = angleStep * i - Math.PI / 2;
      const radius = (metric.value / 100) * maxRadius;
      const x = center + radius * Math.cos(angle);
      const y = center + radius * Math.sin(angle);
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className="relative w-full h-64">
      <svg width={size} height={size} className="mx-auto">
        {/* Background web */}
        {[0.25, 0.5, 0.75, 1].map((scale) => (
          <polygon
            key={scale}
            points={metrics
              .map((_, i) => {
                const angle = angleStep * i - Math.PI / 2;
                const radius = maxRadius * scale;
                const x = center + radius * Math.cos(angle);
                const y = center + radius * Math.sin(angle);
                return `${x},${y}`;
              })
              .join(' ')}
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            className="text-border"
          />
        ))}

        {/* Axis lines */}
        {metrics.map((_, i) => {
          const angle = angleStep * i - Math.PI / 2;
          const x = center + maxRadius * Math.cos(angle);
          const y = center + maxRadius * Math.sin(angle);
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={x}
              y2={y}
              stroke="currentColor"
              strokeWidth="1"
              className="text-border"
            />
          );
        })}

        {/* Data polygon */}
        <polygon
          points={points}
          fill="url(#radarGradient)"
          stroke="#00ff88"
          strokeWidth="2"
          className="transition-all duration-1000"
          style={{
            filter: 'drop-shadow(0 0 8px rgba(0, 255, 136, 0.4))',
          }}
        />

        {/* Gradient */}
        <defs>
          <linearGradient id="radarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00ff88" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#00d4ff" stopOpacity="0.1" />
          </linearGradient>
        </defs>

        {/* Data points */}
        {metrics.map((metric, i) => {
          const angle = angleStep * i - Math.PI / 2;
          const radius = (metric.value / 100) * maxRadius;
          const x = center + radius * Math.cos(angle);
          const y = center + radius * Math.sin(angle);
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r="4"
              fill={metric.color}
              className="transition-all duration-300 hover:r-6"
              style={{
                filter: `drop-shadow(0 0 4px ${metric.color})`,
              }}
            />
          );
        })}
      </svg>

      {/* Labels */}
      <div className="absolute inset-0 pointer-events-none">
        {metrics.map((metric, i) => {
          const angle = angleStep * i - Math.PI / 2;
          const labelRadius = maxRadius + 20;
          const x = center + labelRadius * Math.cos(angle);
          const y = center + labelRadius * Math.sin(angle);
          return (
            <div
              key={i}
              className="absolute text-xs text-muted-foreground font-medium"
              style={{
                left: `${x}px`,
                top: `${y}px`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              {metric.label}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const currentDate = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-light text-foreground mb-1">
            Boa tarde, {user?.nome || 'Admin Teste'}
          </h1>
          <p className="text-sm text-muted-foreground capitalize">{currentDate}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-3xl font-light text-foreground">07:39</div>
            <div className="text-xs text-muted-foreground">PM</div>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => (
          <Card
            key={index}
            className="bg-card border-border hover:border-primary/50 transition-all group cursor-pointer"
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <metric.icon className="h-5 w-5 text-primary" />
                </div>
                <div
                  className={cn(
                    'flex items-center gap-1 text-xs font-medium px-2 py-1 rounded',
                    metric.isPositive
                      ? 'text-emerald-400 bg-emerald-500/10'
                      : 'text-red-400 bg-red-500/10'
                  )}
                >
                  {metric.isPositive ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                  {metric.change}
                </div>
              </div>
              <div className="space-y-1">
                <h3 className="text-3xl font-light text-foreground group-hover:text-primary transition-colors">
                  {metric.value}
                </h3>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">{metric.title}</p>
                <p className="text-xs text-muted-foreground">{metric.subtitle}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Projects / Leads */}
        <Card className="lg:col-span-2 bg-card border-border">
          <CardHeader className="border-b border-border">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-medium text-foreground">Projetos recentes</CardTitle>
              <span className="text-xs text-muted-foreground">Exibindo 1 a 4 de 15 resultados</span>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border text-xs text-muted-foreground">
                  <th className="text-left p-4 font-medium">Nome</th>
                  <th className="text-left p-4 font-medium">Status</th>
                  <th className="text-left p-4 font-medium">Última atualização</th>
                  <th className="text-left p-4 font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((project, index) => (
                  <tr
                    key={index}
                    className="border-b border-border/50 hover:bg-muted/30 transition-colors cursor-pointer"
                  >
                    <td className="p-4">
                      <div>
                        <div className="text-sm font-medium text-foreground mb-1">{project.name}</div>
                        <div className="text-xs text-muted-foreground">{project.description}</div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span
                        className={cn(
                          'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-all hover:scale-105',
                          project.status === 'ready'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        )}
                      >
                        {project.statusLabel}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">{project.lastUpdate}</td>
                    <td className="p-4">
                      <button className="text-xs text-primary hover:text-primary/80 transition-colors hover:underline">
                        Ver detalhes
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex items-center justify-between p-4 border-t border-border">
              <button className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                Anterior
              </button>
              <div className="flex gap-1">
                {[1, 2, 3].map((page) => (
                  <button
                    key={page}
                    className={cn(
                      'w-8 h-8 rounded text-xs font-medium transition-all',
                      page === 1
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
                    )}
                  >
                    {page}
                  </button>
                ))}
              </div>
              <button className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                Próximo
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Right Column - Calendar & Stats */}
        <div className="space-y-6">
          {/* Calendar / Schedule */}
          <Card className="bg-card border-border">
            <CardHeader className="border-b border-border">
              <CardTitle className="text-base font-medium text-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                Agenda
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {events.map((event, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-center w-12 h-12 rounded bg-primary/10 text-primary text-sm font-medium flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                    {event.time}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-foreground mb-1 group-hover:text-primary transition-colors">
                      {event.title}
                    </div>
                    <div className="text-xs text-muted-foreground">{event.date}</div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Donut Chart */}
          <Card className="bg-card border-border">
            <CardHeader className="border-b border-border">
              <CardTitle className="text-base font-medium text-foreground">Task Completion</CardTitle>
              <p className="text-xs text-muted-foreground">Overall completion rate</p>
            </CardHeader>
            <CardContent className="p-6">
              <DonutChart percentage={85} />
              <div className="mt-6 pt-6 border-t border-border space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-primary" />
                    <span className="text-xs text-muted-foreground">User Engagement</span>
                  </div>
                  <span className="text-sm font-medium text-foreground">84%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                    <span className="text-xs text-muted-foreground">Response Time</span>
                  </div>
                  <span className="text-sm font-medium text-foreground">78%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bottom Section - Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Metrics */}
        <Card className="bg-card border-border">
          <CardHeader className="border-b border-border">
            <CardTitle className="text-base font-medium text-foreground">Métricas de desempenho</CardTitle>
            <p className="text-xs text-muted-foreground">
              Visão geral das principais indicadores e métricas de desempenho
            </p>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex items-end justify-between gap-2 h-40">
              {performanceData.map((item, index) => (
                <div key={index} className="flex flex-col items-center gap-2 flex-1 group cursor-pointer">
                  <div className="relative w-full flex items-end justify-center">
                    <div
                      className="w-full bg-gradient-to-t from-primary to-primary/60 hover:from-primary hover:to-primary/80 transition-all duration-300 rounded-t group-hover:scale-105"
                      style={{
                        height: `${item.value}%`,
                        filter: 'drop-shadow(0 0 8px rgba(0, 255, 136, 0.3))',
                      }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                    {item.month}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-6 border-t border-border grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-light text-foreground">88.0%</div>
                <div className="text-xs text-muted-foreground mt-1">Completude média</div>
              </div>
              <div>
                <div className="text-2xl font-light text-foreground">4/5</div>
                <div className="text-xs text-muted-foreground mt-1">Ações de meta</div>
              </div>
              <div>
                <div className="text-2xl font-light text-foreground">Abril</div>
                <div className="text-xs text-muted-foreground mt-1">Melhor mês</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Radar Chart - Performance Analytics */}
        <Card className="bg-card border-border">
          <CardHeader className="border-b border-border">
            <CardTitle className="text-base font-medium text-foreground">Performance Analytics</CardTitle>
            <p className="text-xs text-muted-foreground">
              As principais indicadores e métricas analíticas
            </p>
          </CardHeader>
          <CardContent className="p-6">
            <RadarChart />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
