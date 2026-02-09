'use client';

import { useState, useEffect } from 'react';
import {
  Users,
  TrendingUp,
  Target,
  Activity,
  Calendar,
  ArrowUp,
  ArrowDown,
  DollarSign,
  Phone,
  Mail,
  Clock,
  Award,
  Briefcase,
  Star,
  Filter,
  ChevronRight,
  TrendingDown,
  Zap,
  TrendingUpIcon,
  BarChart3,
  PieChart,
  LineChart,
  CheckCircle2,
  AlertCircle,
  XCircle,
  MessageSquare,
  Video,
  FileText,
  Sparkles,
  Download,
  RefreshCw,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useDashboard } from '@/hooks/useDashboard';

// Metric Cards Data
const metrics = [
  {
    title: 'Total de Receita',
    value: 'R$ 103.390',
    change: '+13%',
    subtitle: 'Crescimento mensal',
    isPositive: true,
    icon: TrendingUp,
    trend: [65, 72, 68, 80, 85, 78, 90, 88],
  },
  {
    title: 'Leads Novos',
    value: '1.621',
    change: '+19%',
    subtitle: 'Últimos 30 dias',
    isPositive: true,
    icon: Users,
    trend: [45, 52, 48, 60, 68, 72, 78, 85],
  },
  {
    title: 'Taxa de Conversão',
    value: '85%',
    change: '-2%',
    subtitle: 'Meta: 90%',
    isPositive: false,
    icon: Target,
    trend: [88, 87, 86, 87, 86, 85, 85, 85],
  },
  {
    title: 'Oportunidades',
    value: '785',
    change: '+24%',
    subtitle: 'Em andamento',
    isPositive: true,
    icon: Activity,
    trend: [50, 58, 62, 70, 75, 78, 82, 88],
  },
];

// Sales Pipeline Data
const pipelineStages = [
  { name: 'Prospecção', count: 45, value: 'R$ 125k', color: '#3b82f6', percentage: 100, icon: Users },
  { name: 'Qualificação', count: 32, value: 'R$ 98k', color: '#00d4ff', percentage: 71, icon: CheckCircle2 },
  { name: 'Proposta', count: 18, value: 'R$ 67k', color: '#00ff88', percentage: 40, icon: FileText },
  { name: 'Negociação', count: 12, value: 'R$ 48k', color: '#f5a623', percentage: 27, icon: MessageSquare },
  { name: 'Fechamento', count: 8, value: 'R$ 32k', color: '#8b5cf6', percentage: 18, icon: Sparkles },
];

// Leads Data with complete CRM info
const leads = [
  {
    name: 'TechCorp Solutions',
    contact: 'Carlos Silva',
    email: 'carlos@techcorp.com',
    phone: '+55 11 98765-4321',
    value: 'R$ 45.000',
    score: 92,
    source: 'Indicação',
    stage: 'Proposta',
    probability: 75,
    lastContact: '2 horas atrás',
    responsible: 'Ana Costa',
    tags: ['Enterprise', 'Hot Lead'],
    statusIcon: Zap,
  },
  {
    name: 'InnovaTech Ltda',
    contact: 'Marina Santos',
    email: 'marina@innovatech.com',
    phone: '+55 21 99123-4567',
    value: 'R$ 28.000',
    score: 85,
    source: 'Website',
    stage: 'Qualificação',
    probability: 60,
    lastContact: '5 horas atrás',
    responsible: 'Pedro Lima',
    tags: ['Mid-Market', 'Warm'],
    statusIcon: TrendingUpIcon,
  },
  {
    name: 'Digital Minds',
    contact: 'Roberto Alves',
    email: 'roberto@digitalminds.io',
    phone: '+55 11 97654-3210',
    value: 'R$ 62.000',
    score: 95,
    source: 'LinkedIn',
    stage: 'Negociação',
    probability: 85,
    lastContact: '1 dia atrás',
    responsible: 'Ana Costa',
    tags: ['Enterprise', 'Hot Lead'],
    statusIcon: Sparkles,
  },
  {
    name: 'StartupX',
    contact: 'Julia Mendes',
    email: 'julia@startupx.com',
    phone: '+55 11 96543-2109',
    value: 'R$ 18.000',
    score: 68,
    source: 'Evento',
    stage: 'Prospecção',
    probability: 40,
    lastContact: '3 dias atrás',
    responsible: 'Pedro Lima',
    tags: ['Startup', 'Cold'],
    statusIcon: AlertCircle,
  },
];

// Deals - Oportunidades em destaque
const deals = [
  {
    company: 'TechCorp Solutions',
    value: 'R$ 45.000',
    probability: 75,
    stage: 'Proposta',
    daysInStage: 5,
    closeDate: '15/02/2026',
    responsible: 'Ana Costa',
    icon: FileText,
  },
  {
    company: 'Digital Minds',
    value: 'R$ 62.000',
    probability: 85,
    stage: 'Negociação',
    daysInStage: 12,
    closeDate: '20/02/2026',
    responsible: 'Ana Costa',
    icon: MessageSquare,
  },
  {
    company: 'GlobalTech Inc',
    value: 'R$ 95.000',
    probability: 90,
    stage: 'Fechamento',
    daysInStage: 8,
    closeDate: '10/02/2026',
    responsible: 'Carlos Mendes',
    icon: Sparkles,
  },
];

// Activity Timeline
const activities = [
  {
    type: 'call',
    title: 'Ligação com TechCorp Solutions',
    description: 'Discussão sobre proposta técnica e pricing',
    time: '2 horas atrás',
    user: 'Ana Costa',
    icon: Phone,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
  },
  {
    type: 'email',
    title: 'Email enviado para InnovaTech',
    description: 'Proposta comercial detalhada enviada',
    time: '5 horas atrás',
    user: 'Pedro Lima',
    icon: Mail,
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
  },
  {
    type: 'meeting',
    title: 'Reunião com Digital Minds',
    description: 'Apresentação de produto e demonstração técnica',
    time: '1 dia atrás',
    user: 'Ana Costa',
    icon: Video,
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
  },
  {
    type: 'task',
    title: 'Follow-up StartupX',
    description: 'Agendar próxima reunião de qualificação',
    time: '2 dias atrás',
    user: 'Pedro Lima',
    icon: CheckCircle2,
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
  },
];

// Top Performers
const topPerformers = [
  { name: 'Ana Costa', deals: 24, value: 'R$ 485k', conversion: 32, avatar: 'AC', color: 'from-primary to-blue-500' },
  { name: 'Carlos Mendes', deals: 18, value: 'R$ 395k', conversion: 28, avatar: 'CM', color: 'from-blue-500 to-purple-500' },
  { name: 'Pedro Lima', deals: 15, value: 'R$ 312k', conversion: 25, avatar: 'PL', color: 'from-purple-500 to-pink-500' },
  { name: 'Julia Santos', deals: 12, value: 'R$ 268k', conversion: 22, avatar: 'JS', color: 'from-pink-500 to-primary' },
];

// Performance Data
const performanceData = [
  { month: 'Jan', value: 75, amount: 82 },
  { month: 'Fev', value: 82, amount: 95 },
  { month: 'Mar', value: 78, amount: 88 },
  { month: 'Abr', value: 88, amount: 102 },
  { month: 'Mai', value: 95, amount: 118 },
  { month: 'Jun', value: 92, amount: 112 },
];

// Calendar events
const events = [
  { time: '10:00', title: 'Demo TechCorp Solutions', date: 'Hoje', type: 'meeting', icon: Video, color: 'text-blue-400' },
  { time: '14:00', title: 'Follow-up InnovaTech', date: 'Hoje', type: 'call', icon: Phone, color: 'text-emerald-400' },
  { time: '16:30', title: 'Proposta Digital Minds', date: 'Amanhã', type: 'email', icon: Mail, color: 'text-purple-400' },
];

// Sales Forecast with detailed data
const forecastData = [
  {
    month: 'Fev',
    forecast: 145,
    target: 150,
    deals: 32,
    avgTicket: 4531,
    conversion: 28,
    trend: [138, 140, 142, 143, 145],
  },
  {
    month: 'Mar',
    forecast: 168,
    target: 160,
    deals: 38,
    avgTicket: 4421,
    conversion: 32,
    trend: [158, 162, 165, 166, 168],
  },
  {
    month: 'Abr',
    forecast: 182,
    target: 170,
    deals: 42,
    avgTicket: 4333,
    conversion: 35,
    trend: [172, 175, 178, 180, 182],
  },
];

// Mini Sparkline Component
function MiniSparkline({ data, color = '#00ff88' }: { data: number[]; color?: string }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min;

  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = 100 - ((value - min) / range) * 100;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width="60" height="24" viewBox="0 0 100 100" className="opacity-50 group-hover:opacity-100 transition-opacity">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Donut Chart Component
function DonutChart({ percentage }: { percentage: number }) {
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative w-48 h-48 mx-auto">
      <svg className="transform -rotate-90 w-48 h-48">
        <circle
          cx="96"
          cy="96"
          r={radius}
          stroke="currentColor"
          strokeWidth="12"
          fill="none"
          className="text-muted/30"
        />
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
        <div className="text-xs text-muted-foreground mt-1">Taxa de Conversão</div>
      </div>
    </div>
  );
}

// Radar Chart Component (Properly Aligned)
function RadarChart() {
  const metrics = [
    { label: 'Engajamento', value: 85, color: '#00ff88' },
    { label: 'Conversão', value: 78, color: '#00d4ff' },
    { label: 'Satisfação', value: 92, color: '#5e72e4' },
    { label: 'Performance', value: 88, color: '#f5a623' },
    { label: 'Qualidade', value: 90, color: '#ff6b9d' },
  ];

  const size = 300;
  const center = size / 2;
  const maxRadius = size / 2 - 60;
  const angleStep = (Math.PI * 2) / metrics.length;
  const startAngle = -Math.PI / 2;

  const points = metrics
    .map((metric, i) => {
      const angle = startAngle + angleStep * i;
      const radius = (metric.value / 100) * maxRadius;
      const x = center + radius * Math.cos(angle);
      const y = center + radius * Math.sin(angle);
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className="relative w-full h-80 flex items-center justify-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <defs>
          <linearGradient id="radarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00ff88" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#00d4ff" stopOpacity="0.1" />
          </linearGradient>
        </defs>

        {/* Background grid circles */}
        {[0.2, 0.4, 0.6, 0.8, 1].map((scale) => (
          <circle
            key={scale}
            cx={center}
            cy={center}
            r={maxRadius * scale}
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            className="text-border"
            opacity={0.2}
          />
        ))}

        {/* Axis lines and labels */}
        {metrics.map((metric, i) => {
          const angle = startAngle + angleStep * i;
          const axisX = center + maxRadius * Math.cos(angle);
          const axisY = center + maxRadius * Math.sin(angle);
          const labelX = center + (maxRadius + 35) * Math.cos(angle);
          const labelY = center + (maxRadius + 35) * Math.sin(angle);

          return (
            <g key={i}>
              {/* Axis line */}
              <line
                x1={center}
                y1={center}
                x2={axisX}
                y2={axisY}
                stroke="currentColor"
                strokeWidth="1"
                className="text-border"
                opacity={0.3}
              />

              {/* Label */}
              <g transform={`translate(${labelX}, ${labelY})`}>
                <circle
                  cx="0"
                  cy="0"
                  r="3"
                  fill={metric.color}
                  style={{ filter: `drop-shadow(0 0 4px ${metric.color})` }}
                />
                <text
                  x="0"
                  y="-8"
                  textAnchor="middle"
                  className="text-[11px] font-medium fill-current text-muted-foreground"
                >
                  {metric.label}
                </text>
                <text
                  x="0"
                  y="16"
                  textAnchor="middle"
                  className="text-[10px] font-bold fill-current"
                  fill={metric.color}
                >
                  {metric.value}%
                </text>
              </g>
            </g>
          );
        })}

        {/* Data polygon */}
        <polygon
          points={points}
          fill="url(#radarGradient)"
          stroke="#00ff88"
          strokeWidth="2.5"
          className="transition-all duration-1000"
          style={{
            filter: 'drop-shadow(0 0 12px rgba(0, 255, 136, 0.5))',
          }}
        />

        {/* Data points */}
        {metrics.map((metric, i) => {
          const angle = startAngle + angleStep * i;
          const radius = (metric.value / 100) * maxRadius;
          const x = center + radius * Math.cos(angle);
          const y = center + radius * Math.sin(angle);
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r="6"
              fill={metric.color}
              className="transition-all duration-300 cursor-pointer hover:r-8"
              style={{
                filter: `drop-shadow(0 0 6px ${metric.color})`,
              }}
            >
              <title>{metric.label}: {metric.value}%</title>
            </circle>
          );
        })}

        {/* Center point */}
        <circle
          cx={center}
          cy={center}
          r="4"
          fill="#00ff88"
          opacity={0.5}
        />
      </svg>
    </div>
  );
}

// Neon Line Chart - Cyberpunk Style with Data
function NeonLineChart() {
  const [showLoss, setShowLoss] = useState(true);
  const [showGain, setShowGain] = useState(true);
  const [hoveredPoint, setHoveredPoint] = useState<{ type: 'loss' | 'gain'; index: number } | null>(null);

  const width = 1200;
  const height = 500;
  const padding = { top: 60, right: 80, bottom: 80, left: 80 };

  // Data points with months and values
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'];
  const lossData = [95, 88, 82, 70, 58, 45]; // Declining (red)
  const gainData = [35, 48, 62, 78, 88, 95]; // Growing (green)

  const maxValue = 100;
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Generate smooth path
  const generatePath = (data: number[]) => {
    const points = data.map((value, i) => ({
      x: padding.left + (i / (data.length - 1)) * chartWidth,
      y: padding.top + chartHeight - (value / maxValue) * chartHeight,
    }));

    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const cp1x = prev.x + (curr.x - prev.x) * 0.5;
      const cp1y = prev.y;
      const cp2x = curr.x - (curr.x - prev.x) * 0.5;
      const cp2y = curr.y;
      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${curr.x} ${curr.y}`;
    }
    return { path, points };
  };

  const lossPath = generatePath(lossData);
  const gainPath = generatePath(gainData);

  return (
    <div className="relative w-full bg-[#050810] rounded-b-lg p-6">
      {/* Interactive Controls */}
      <div className="flex items-center justify-end gap-4 mb-4">
        <button
          onClick={() => setShowLoss(!showLoss)}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300',
            showLoss
              ? 'bg-[#ff0844]/20 border-2 border-[#ff0844] text-[#ff0844]'
              : 'bg-muted/20 border-2 border-border text-muted-foreground hover:border-[#ff0844]/50'
          )}
          style={{
            filter: showLoss ? 'drop-shadow(0 0 8px rgba(255, 8, 68, 0.4))' : 'none',
          }}
        >
          <div className={cn(
            'w-3 h-3 rounded-full transition-all',
            showLoss ? 'bg-[#ff0844]' : 'bg-muted-foreground'
          )}
            style={{
              boxShadow: showLoss ? '0 0 8px rgba(255, 8, 68, 0.6)' : 'none',
            }}
          />
          <span className="text-sm font-medium">Declínio de Perdas</span>
        </button>

        <button
          onClick={() => setShowGain(!showGain)}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300',
            showGain
              ? 'bg-[#00ff88]/20 border-2 border-[#00ff88] text-[#00ff88]'
              : 'bg-muted/20 border-2 border-border text-muted-foreground hover:border-[#00ff88]/50'
          )}
          style={{
            filter: showGain ? 'drop-shadow(0 0 12px rgba(0, 255, 136, 0.5))' : 'none',
          }}
        >
          <div className={cn(
            'w-3 h-3 rounded-full transition-all',
            showGain ? 'bg-[#00ff88]' : 'bg-muted-foreground'
          )}
            style={{
              boxShadow: showGain ? '0 0 12px rgba(0, 255, 136, 0.7)' : 'none',
            }}
          />
          <span className="text-sm font-medium">Crescimento de Ganhos</span>
        </button>
      </div>

      <div className="relative" style={{ height: `${height}px` }}>
        <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
          <defs>
            {/* Grid pattern */}
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1"/>
            </pattern>

            {/* Glow filters */}
            <filter id="redGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="6" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>

            <filter id="greenGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="10" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>

            {/* Gradients */}
            <linearGradient id="redGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ff0844" stopOpacity="0.9"/>
              <stop offset="50%" stopColor="#ff2a5a" stopOpacity="1"/>
              <stop offset="100%" stopColor="#ff0844" stopOpacity="0.8"/>
            </linearGradient>

            <linearGradient id="greenGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#00ff88" stopOpacity="0.8"/>
              <stop offset="50%" stopColor="#00ffaa" stopOpacity="1"/>
              <stop offset="100%" stopColor="#00ff88" stopOpacity="0.9"/>
            </linearGradient>

            {/* Area gradients */}
            <linearGradient id="redArea" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ff0844" stopOpacity="0.2"/>
              <stop offset="100%" stopColor="#ff0844" stopOpacity="0.0"/>
            </linearGradient>

            <linearGradient id="greenArea" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#00ff88" stopOpacity="0.2"/>
              <stop offset="100%" stopColor="#00ff88" stopOpacity="0.0"/>
            </linearGradient>
          </defs>

          {/* Grid background */}
          <rect width={width} height={height} fill="url(#grid)" />

          {/* Ambient glow effects */}
          <ellipse cx="25%" cy="30%" rx="300" ry="150" fill="#ff0844" opacity="0.06" />
          <ellipse cx="75%" cy="70%" rx="350" ry="180" fill="#00ff88" opacity="0.1" />

          {/* Y-axis labels */}
          {[0, 25, 50, 75, 100].map((value) => {
            const y = padding.top + chartHeight - (value / maxValue) * chartHeight;
            return (
              <g key={value}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  stroke="rgba(255,255,255,0.05)"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
                <text
                  x={padding.left - 20}
                  y={y}
                  textAnchor="end"
                  dominantBaseline="middle"
                  className="text-xs fill-muted-foreground"
                >
                  {value}
                </text>
              </g>
            );
          })}

          {/* X-axis labels */}
          {months.map((month, i) => {
            const x = padding.left + (i / (months.length - 1)) * chartWidth;
            const y = height - padding.bottom + 30;
            return (
              <text
                key={month}
                x={x}
                y={y}
                textAnchor="middle"
                className="text-sm font-medium fill-foreground"
              >
                {month}
              </text>
            );
          })}

          {/* Area fills */}
          {showLoss && (
            <path
              d={`${lossPath.path} L ${width - padding.right} ${height - padding.bottom} L ${padding.left} ${height - padding.bottom} Z`}
              fill="url(#redArea)"
              className="transition-all duration-500"
            />
          )}
          {showGain && (
            <path
              d={`${gainPath.path} L ${width - padding.right} ${height - padding.bottom} L ${padding.left} ${height - padding.bottom} Z`}
              fill="url(#greenArea)"
              className="transition-all duration-500"
            />
          )}

          {/* Red declining line */}
          {showLoss && (
            <path
              d={lossPath.path}
              fill="none"
              stroke="url(#redGradient)"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#redGlow)"
              className="transition-all duration-500"
            />
          )}

          {/* Green ascending line */}
          {showGain && (
            <path
              d={gainPath.path}
              fill="none"
              stroke="url(#greenGradient)"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#greenGlow)"
              className="transition-all duration-500"
            />
          )}

          {/* Data points and labels - Red */}
          {showLoss && lossPath.points.map((point, i) => {
            const isHovered = hoveredPoint?.type === 'loss' && hoveredPoint?.index === i;
            return (
              <g
                key={`loss-${i}`}
                className="cursor-pointer transition-all duration-300"
                onMouseEnter={() => setHoveredPoint({ type: 'loss', index: i })}
                onMouseLeave={() => setHoveredPoint(null)}
              >
                <circle
                  cx={point.x}
                  cy={point.y}
                  r={isHovered ? "10" : "6"}
                  fill="#ff0844"
                  stroke="#050810"
                  strokeWidth="2"
                  style={{
                    filter: isHovered
                      ? 'drop-shadow(0 0 16px #ff0844)'
                      : 'drop-shadow(0 0 8px #ff0844)',
                    transition: 'all 0.3s ease'
                  }}
                />
                <text
                  x={point.x}
                  y={point.y - (isHovered ? 24 : 18)}
                  textAnchor="middle"
                  className={cn(
                    "font-bold transition-all duration-300",
                    isHovered ? "text-sm" : "text-xs"
                  )}
                  fill="#ff0844"
                >
                  {lossData[i]}%
                </text>
                {isHovered && (
                  <text
                    x={point.x}
                    y={point.y + 20}
                    textAnchor="middle"
                    className="text-[10px] font-medium"
                    fill="#ff0844"
                  >
                    {months[i]}
                  </text>
                )}
              </g>
            );
          })}

          {/* Data points and labels - Green */}
          {showGain && gainPath.points.map((point, i) => {
            const isHovered = hoveredPoint?.type === 'gain' && hoveredPoint?.index === i;
            return (
              <g
                key={`gain-${i}`}
                className="cursor-pointer transition-all duration-300"
                onMouseEnter={() => setHoveredPoint({ type: 'gain', index: i })}
                onMouseLeave={() => setHoveredPoint(null)}
              >
                <circle
                  cx={point.x}
                  cy={point.y}
                  r={isHovered ? "12" : "7"}
                  fill="#00ff88"
                  stroke="#050810"
                  strokeWidth="2"
                  style={{
                    filter: isHovered
                      ? 'drop-shadow(0 0 20px #00ff88)'
                      : 'drop-shadow(0 0 12px #00ff88)',
                    transition: 'all 0.3s ease'
                  }}
                />
                <text
                  x={point.x}
                  y={point.y - (isHovered ? 26 : 18)}
                  textAnchor="middle"
                  className={cn(
                    "font-bold transition-all duration-300",
                    isHovered ? "text-sm" : "text-xs"
                  )}
                  fill="#00ff88"
                >
                  {gainData[i]}%
                </text>
                {isHovered && (
                  <text
                    x={point.x}
                    y={point.y + 22}
                    textAnchor="middle"
                    className="text-[10px] font-medium"
                    fill="#00ff88"
                  >
                    {months[i]}
                  </text>
                )}
              </g>
            );
          })}

          {/* Axis labels */}
          <text
            x={padding.left - 50}
            y={padding.top + chartHeight / 2}
            textAnchor="middle"
            transform={`rotate(-90, ${padding.left - 50}, ${padding.top + chartHeight / 2})`}
            className="text-sm font-medium fill-muted-foreground"
          >
            Performance (%)
          </text>

          <text
            x={width / 2}
            y={height - 20}
            textAnchor="middle"
            className="text-sm font-medium fill-muted-foreground"
          >
            Período
          </text>
        </svg>
      </div>

      {/* Interactive Legend */}
      <div className="flex items-center justify-center gap-8 mt-6">
        <button
          onClick={() => setShowLoss(!showLoss)}
          className={cn(
            "flex items-center gap-3 p-3 rounded-lg transition-all duration-300",
            showLoss ? "opacity-100" : "opacity-50 grayscale"
          )}
        >
          <div
            className={cn(
              "w-12 h-1 rounded-full bg-gradient-to-r from-[#ff0844] to-[#ff2a5a] transition-all",
              showLoss && "animate-pulse"
            )}
            style={{
              filter: showLoss ? 'drop-shadow(0 0 6px #ff0844)' : 'none',
            }}
          />
          <div>
            <div className={cn(
              "text-sm font-medium transition-colors",
              showLoss ? "text-[#ff0844]" : "text-muted-foreground"
            )}>
              Declínio de Perdas
            </div>
            <div className="text-xs text-muted-foreground">
              {showLoss ? "Ativado • Clique para ocultar" : "Desativado • Clique para mostrar"}
            </div>
          </div>
        </button>

        <button
          onClick={() => setShowGain(!showGain)}
          className={cn(
            "flex items-center gap-3 p-3 rounded-lg transition-all duration-300",
            showGain ? "opacity-100" : "opacity-50 grayscale"
          )}
        >
          <div
            className={cn(
              "w-12 h-1 rounded-full bg-gradient-to-r from-[#00ff88] to-[#00ffaa] transition-all",
              showGain && "animate-pulse"
            )}
            style={{
              filter: showGain ? 'drop-shadow(0 0 10px #00ff88)' : 'none',
            }}
          />
          <div>
            <div className={cn(
              "text-sm font-medium transition-colors",
              showGain ? "text-[#00ff88]" : "text-muted-foreground"
            )}>
              Crescimento de Ganhos
            </div>
            <div className="text-xs text-muted-foreground">
              {showGain ? "Ativado • Clique para ocultar" : "Desativado • Clique para mostrar"}
            </div>
          </div>
        </button>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 0.6;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.2);
          }
        }
      `}</style>
    </div>
  );
}

// Sales Forecast Chart - Vertical Bars with Area Chart
function SalesForecastChart({ data }: { data: typeof forecastData }) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const maxValue = Math.max(...data.map(d => Math.max(d.forecast, d.target)));

  const chartHeight = 280;
  const barWidth = 60;
  const spacing = 40;
  const chartWidth = data.length * (barWidth + spacing);

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-full">
        {/* Chart */}
        <div className="relative h-80 flex items-end justify-center gap-10 px-8 pb-12">
          {data.map((item, index) => {
            const isHovered = hoveredIndex === index;
            const forecastHeight = (item.forecast / maxValue) * chartHeight;
            const targetHeight = (item.target / maxValue) * chartHeight;
            const isAboveTarget = item.forecast >= item.target;
            const deviation = Math.round(((item.forecast - item.target) / item.target) * 100);

            return (
              <div
                key={index}
                className="relative flex flex-col items-center group cursor-pointer"
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {/* Hover Card */}
                {isHovered && (
                  <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-56 p-4 rounded-lg bg-card border border-primary/50 shadow-lg z-20 animate-in fade-in duration-200"
                    style={{ filter: 'drop-shadow(0 0 12px rgba(0, 255, 136, 0.3))' }}
                  >
                    <div className="text-xs text-muted-foreground mb-2">{item.month}</div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <div className="text-[10px] text-muted-foreground">Forecast</div>
                        <div className="text-lg font-medium text-primary">R$ {item.forecast}k</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-muted-foreground">Meta</div>
                        <div className="text-lg font-medium text-muted-foreground">R$ {item.target}k</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-muted-foreground">Deals</div>
                        <div className="text-sm font-medium">{item.deals}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-muted-foreground">Conversão</div>
                        <div className="text-sm font-medium">{item.conversion}%</div>
                      </div>
                    </div>
                    <div className={cn(
                      'mt-2 pt-2 border-t border-border text-xs font-medium flex items-center gap-1',
                      isAboveTarget ? 'text-emerald-400' : 'text-red-400'
                    )}>
                      {isAboveTarget ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                      <span>{isAboveTarget ? '+' : ''}{deviation}% vs Meta</span>
                    </div>
                  </div>
                )}

                {/* Bar Container */}
                <div className="relative" style={{ height: `${chartHeight}px`, width: `${barWidth}px` }}>
                  {/* Target Line */}
                  <div
                    className="absolute left-0 right-0 border-t-2 border-dashed border-amber-500/50 z-10"
                    style={{ bottom: `${targetHeight}px` }}
                  >
                    <div className="absolute -right-8 -top-2 text-[10px] text-amber-500">
                      Meta
                    </div>
                  </div>

                  {/* Forecast Bar */}
                  <div
                    className={cn(
                      'absolute bottom-0 left-0 right-0 rounded-t-lg transition-all duration-700 ease-out',
                      isHovered && 'scale-105'
                    )}
                    style={{
                      height: `${forecastHeight}px`,
                      background: `linear-gradient(180deg, ${isAboveTarget ? '#00ff88' : '#f59e0b'}, ${isAboveTarget ? '#00d4ff' : '#ef4444'})`,
                      filter: `drop-shadow(0 0 ${isHovered ? '16' : '8'}px ${isAboveTarget ? 'rgba(0, 255, 136, 0.4)' : 'rgba(245, 158, 11, 0.3)'})`,
                      boxShadow: `inset 0 -2px 8px rgba(0, 0, 0, 0.3)`,
                    }}
                  >
                    {/* Value Label */}
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-xs font-medium text-primary whitespace-nowrap">
                      R$ {item.forecast}k
                    </div>

                    {/* Sparkline Pattern */}
                    <svg className="absolute inset-0 opacity-20" width="100%" height="100%">
                      <defs>
                        <pattern id={`pattern-${index}`} x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
                          <circle cx="4" cy="4" r="1" fill="white" opacity="0.5" />
                        </pattern>
                      </defs>
                      <rect width="100%" height="100%" fill={`url(#pattern-${index})`} />
                    </svg>
                  </div>
                </div>

                {/* Month Label */}
                <div className="mt-3 text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                  {item.month}
                </div>

                {/* Conversion Badge */}
                <div className="mt-1 flex items-center gap-1 text-[10px] text-muted-foreground">
                  <Target className="h-3 w-3" />
                  <span>{item.conversion}%</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 mt-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-gradient-to-t from-[#00d4ff] to-[#00ff88]" />
            <span className="text-muted-foreground">Acima da Meta</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-gradient-to-t from-[#ef4444] to-[#f59e0b]" />
            <span className="text-muted-foreground">Abaixo da Meta</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 border-t-2 border-dashed border-amber-500/50" />
            <span className="text-muted-foreground">Linha de Meta</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [hoveredMetric, setHoveredMetric] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month' | 'quarter'>('month');
  const [currentTime, setCurrentTime] = useState(new Date());

  // Connect to backend API
  const {
    data: dashboardData,
    isLoading,
    error,
    refresh,
    exportData,
    isExporting
  } = useDashboard({
    period: timeRange,
    autoRefresh: true,
    refreshInterval: 60000, // Refresh every minute
  });

  const currentDate = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Refresh dashboard when timeRange changes
  useEffect(() => {
    refresh();
  }, [timeRange, refresh]);

  const timeString = currentTime.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit'
  });
  const period = currentTime.getHours() >= 12 ? 'PM' : 'AM';

  const greeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  // Calculate metrics from real data
  const realMetrics = dashboardData ? [
    {
      title: 'Total de Leads',
      value: dashboardData.stats.totals.leads.toLocaleString('pt-BR'),
      change: `${dashboardData.stats.growth.leads > 0 ? '+' : ''}${dashboardData.stats.growth.leads.toFixed(1)}%`,
      subtitle: 'Crescimento no período',
      isPositive: dashboardData.stats.growth.leads > 0,
      icon: Users,
      trend: [45, 52, 48, 60, 68, 72, 78, 85],
    },
    {
      title: 'Total de Clientes',
      value: dashboardData.stats.totals.clientes.toLocaleString('pt-BR'),
      change: `${dashboardData.stats.growth.clientes > 0 ? '+' : ''}${dashboardData.stats.growth.clientes.toFixed(1)}%`,
      subtitle: 'Crescimento no período',
      isPositive: dashboardData.stats.growth.clientes > 0,
      icon: Target,
      trend: [50, 58, 62, 70, 75, 78, 82, 88],
    },
    {
      title: 'Taxa de Conversão',
      value: `${dashboardData.stats.conversion.rate.toFixed(1)}%`,
      change: dashboardData.stats.conversion.rate >= 30 ? 'Ótimo' : 'Melhorar',
      subtitle: `${dashboardData.stats.conversion.qualified} qualificados`,
      isPositive: dashboardData.stats.conversion.rate >= 30,
      icon: TrendingUp,
      trend: [88, 87, 86, 87, 86, 85, 85, 85],
    },
    {
      title: 'Total de Empresas',
      value: dashboardData.stats.totals.empresas.toLocaleString('pt-BR'),
      change: `${dashboardData.stats.growth.empresas > 0 ? '+' : ''}${dashboardData.stats.growth.empresas.toFixed(1)}%`,
      subtitle: 'Crescimento no período',
      isPositive: dashboardData.stats.growth.empresas > 0,
      icon: Activity,
      trend: [65, 72, 68, 80, 85, 78, 90, 88],
    },
  ] : metrics;

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      {/* Alerts Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
          <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-amber-500">3 Deals Fechando Hoje</p>
            <p className="text-xs text-amber-500/70 truncate">R$ 47k em oportunidades</p>
          </div>
          <ChevronRight className="h-4 w-4 text-amber-500" />
        </div>

        <div className="flex items-center gap-3 p-3 rounded-lg bg-red-500/10 border border-red-500/30">
          <XCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-red-500">5 Follow-ups Atrasados</p>
            <p className="text-xs text-red-500/70 truncate">Requer atenção imediata</p>
          </div>
          <ChevronRight className="h-4 w-4 text-red-500" />
        </div>

        <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/10 border border-primary/30">
          <Sparkles className="h-5 w-5 text-primary flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-primary">Meta do Mês: 89%</p>
            <p className="text-xs text-primary/70 truncate">Faltam R$ 23k para bater meta</p>
          </div>
          <ChevronRight className="h-4 w-4 text-primary" />
        </div>
      </div>

      {/* Header with Quick Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-light text-foreground mb-1">
            {greeting()}, {user?.nome || 'Admin Teste'}
          </h1>
          <p className="text-sm text-muted-foreground capitalize">{currentDate}</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Quick Actions */}
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 hover:bg-primary/20 transition-all border border-primary/30 hover:border-primary group">
            <Users className="h-4 w-4 text-primary" />
            <span className="text-sm text-primary font-medium">Novo Lead</span>
          </button>

          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-all border border-border hover:border-primary/50 group">
            <Calendar className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            <span className="text-sm text-foreground">Agendar</span>
          </button>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg transition-all border group",
              showFilters
                ? "bg-primary/20 border-primary"
                : "bg-muted/30 hover:bg-muted/50 border-border hover:border-primary/50"
            )}
          >
            <Filter className={cn(
              "h-4 w-4 transition-colors",
              showFilters ? "text-primary" : "text-muted-foreground group-hover:text-primary"
            )} />
            <span className={cn(
              "text-sm",
              showFilters ? "text-primary font-medium" : "text-foreground"
            )}>Filtros</span>
          </button>

          <button
            onClick={refresh}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-all border border-border hover:border-primary/50 group disabled:opacity-50"
            title="Atualizar dados"
          >
            <RefreshCw className={cn(
              "h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors",
              isLoading && "animate-spin"
            )} />
          </button>

          <button
            onClick={exportData}
            disabled={isExporting}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-all border border-border hover:border-primary/50 group disabled:opacity-50"
            title="Exportar dados (JSON)"
          >
            <Download className={cn(
              "h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors",
              isExporting && "animate-bounce"
            )} />
          </button>

          <div className="text-right">
            <div className="text-3xl font-light text-foreground tabular-nums">{timeString}</div>
            <div className="text-xs text-muted-foreground">{period}</div>
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="flex items-center gap-3 p-4 rounded-lg bg-card border border-border animate-in slide-in-from-top duration-200">
          <span className="text-sm text-muted-foreground">Período:</span>
          <div className="flex gap-2">
            {(['today', 'week', 'month', 'quarter'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                  timeRange === range
                    ? "bg-primary/20 text-primary border border-primary/50"
                    : "bg-muted/30 text-muted-foreground hover:bg-muted/50"
                )}
              >
                {range === 'today' && 'Hoje'}
                {range === 'week' && 'Esta Semana'}
                {range === 'month' && 'Este Mês'}
                {range === 'quarter' && 'Este Trimestre'}
              </button>
            ))}
          </div>
          <div className="ml-auto flex gap-2">
            <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/30 hover:bg-muted/50 text-xs">
              <FileText className="h-3 w-3" />
              <span>Exportar</span>
            </button>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && !dashboardData && (
        <div className="flex items-center justify-center p-12">
          <div className="flex flex-col items-center gap-3">
            <RefreshCw className="h-8 w-8 text-primary animate-spin" />
            <p className="text-sm text-muted-foreground">Carregando dados do dashboard...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !dashboardData && (
        <div className="flex items-center justify-center p-12">
          <div className="flex flex-col items-center gap-3">
            <XCircle className="h-8 w-8 text-red-500" />
            <p className="text-sm text-red-500">{error}</p>
            <button
              onClick={refresh}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary"
            >
              <RefreshCw className="h-4 w-4" />
              Tentar Novamente
            </button>
          </div>
        </div>
      )}

      {/* Metrics Grid with Sparklines */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {realMetrics.map((metric, index) => (
          <Card
            key={index}
            className="bg-card border-border hover:border-primary/50 transition-all group cursor-pointer relative overflow-hidden"
            onMouseEnter={() => setHoveredMetric(index)}
            onMouseLeave={() => setHoveredMetric(null)}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div
                  className={cn(
                    'p-2 rounded-lg transition-all duration-300',
                    hoveredMetric === index ? 'bg-primary/20 scale-110' : 'bg-primary/10'
                  )}
                  style={{
                    filter: hoveredMetric === index ? 'drop-shadow(0 0 8px rgba(0, 255, 136, 0.4))' : 'none',
                  }}
                >
                  <metric.icon className="h-5 w-5 text-primary" />
                </div>
                <div
                  className={cn(
                    'flex items-center gap-1 text-xs font-medium px-2 py-1 rounded transition-all',
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

              {/* Sparkline */}
              <div className="mt-4 flex justify-end">
                <MiniSparkline data={metric.trend} color={metric.isPositive ? '#00ff88' : '#ef4444'} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Sales Pipeline Funnel with Icons */}
      <Card className="bg-card border-border">
        <CardHeader className="border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <TrendingUpIcon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-base font-medium text-foreground">Pipeline de Vendas</CardTitle>
                <p className="text-xs text-muted-foreground mt-1">Funil de conversão por estágio</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-light text-foreground">R$ 370k</div>
              <div className="text-xs text-muted-foreground">Total em pipeline</div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <NeonLineChart />
        </CardContent>
      </Card>

      {/* Leads Table + Deals */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Leads Table */}
        <Card className="lg:col-span-2 bg-card border-border">
          <CardHeader className="border-b border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                <CardTitle className="text-base font-medium text-foreground">Leads Ativos</CardTitle>
              </div>
              <span className="text-xs text-muted-foreground">Ordenado por score</span>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border text-xs text-muted-foreground">
                    <th className="text-left p-4 font-medium">Lead</th>
                    <th className="text-left p-4 font-medium">Score</th>
                    <th className="text-left p-4 font-medium">Valor</th>
                    <th className="text-left p-4 font-medium">Estágio</th>
                    <th className="text-left p-4 font-medium">Prob.</th>
                    <th className="text-left p-4 font-medium">Responsável</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead, index) => (
                    <tr
                      key={index}
                      className="border-b border-border/50 hover:bg-muted/30 transition-colors cursor-pointer group"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-xs font-medium flex-shrink-0 group-hover:scale-110 transition-transform"
                            style={{
                              filter: 'drop-shadow(0 0 4px rgba(0, 255, 136, 0.2))',
                            }}
                          >
                            {lead.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-medium text-foreground mb-1 group-hover:text-primary transition-colors truncate">
                              {lead.name}
                            </div>
                            <div className="text-xs text-muted-foreground truncate">{lead.contact}</div>
                            <div className="flex gap-1 mt-1">
                              {lead.tags.map((tag, tagIndex) => (
                                <span
                                  key={tagIndex}
                                  className="text-[10px] px-1.5 py-0.5 rounded bg-muted/50 text-muted-foreground"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <lead.statusIcon
                            className={cn(
                              'h-4 w-4',
                              lead.score >= 90
                                ? 'text-primary'
                                : lead.score >= 70
                                ? 'text-amber-400'
                                : 'text-muted-foreground'
                            )}
                          />
                          <span
                            className={cn(
                              'text-sm font-medium',
                              lead.score >= 90
                                ? 'text-primary'
                                : lead.score >= 70
                                ? 'text-amber-400'
                                : 'text-muted-foreground'
                            )}
                          >
                            {lead.score}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="text-sm font-medium text-foreground">{lead.value}</span>
                      </td>
                      <td className="p-4">
                        <span
                          className={cn(
                            'inline-flex items-center px-2 py-1 rounded text-xs font-medium',
                            lead.stage === 'Negociação'
                              ? 'bg-primary/10 text-primary border border-primary/20'
                              : lead.stage === 'Proposta'
                              ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                              : lead.stage === 'Qualificação'
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              : 'bg-muted/30 text-muted-foreground border border-border'
                          )}
                        >
                          {lead.stage}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="text-sm text-foreground">{lead.probability}%</span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary/20 to-blue-500/20 flex items-center justify-center text-[10px] font-medium text-foreground">
                            {lead.responsible.substring(0, 2).toUpperCase()}
                          </div>
                          <span className="text-xs text-muted-foreground">{lead.responsible}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Top Deals + Calendar */}
        <div className="space-y-6">
          {/* Top Deals */}
          <Card className="bg-card border-border">
            <CardHeader className="border-b border-border">
              <CardTitle className="text-base font-medium text-foreground flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-primary" />
                Top Deals
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {deals.map((deal, index) => (
                <div
                  key={index}
                  className="p-4 rounded-lg bg-muted/20 border border-border hover:border-primary/50 transition-all cursor-pointer group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div
                        className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform"
                        style={{
                          filter: 'drop-shadow(0 0 4px rgba(0, 255, 136, 0.2))',
                        }}
                      >
                        <deal.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-foreground mb-1 group-hover:text-primary transition-colors truncate">
                          {deal.company}
                        </div>
                        <div className="text-xs text-muted-foreground">{deal.responsible}</div>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-2">
                      <div className="text-lg font-light text-primary">{deal.value}</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Prob. {deal.probability}%</span>
                    <span className="text-muted-foreground">{deal.daysInStage}d no estágio</span>
                  </div>
                  <div className="mt-2 h-1.5 bg-muted/30 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-blue-500 rounded-full transition-all duration-500"
                      style={{
                        width: `${deal.probability}%`,
                        filter: 'drop-shadow(0 0 4px rgba(0, 255, 136, 0.4))',
                      }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Calendar */}
          <Card className="bg-card border-border">
            <CardHeader className="border-b border-border">
              <CardTitle className="text-base font-medium text-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                Próximas Atividades
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {events.map((event, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-center w-12 h-12 rounded bg-primary/10 text-primary text-sm font-medium flex-shrink-0 group-hover:bg-primary/20 transition-all group-hover:scale-110">
                    {event.time}
                  </div>
                  <div className="flex-1 min-w-0 pt-1">
                    <div className="flex items-center gap-2 mb-1">
                      <event.icon className={cn('h-3 w-3', event.color)} />
                      <div className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                        {event.title}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">{event.date}</div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Activity Timeline + Top Performers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Timeline */}
        <Card className="lg:col-span-2 bg-card border-border">
          <CardHeader className="border-b border-border">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              <CardTitle className="text-base font-medium text-foreground">Timeline de Atividades</CardTitle>
            </div>
            <p className="text-xs text-muted-foreground">Histórico recente de interações</p>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {activities.map((activity, index) => (
                <div key={index} className="flex gap-4 group cursor-pointer">
                  <div className="relative">
                    <div
                      className={cn(
                        'w-10 h-10 rounded-lg flex items-center justify-center transition-all',
                        activity.bgColor,
                        activity.color,
                        'group-hover:scale-110'
                      )}
                      style={{
                        filter: 'drop-shadow(0 0 4px rgba(0, 255, 136, 0.2))',
                      }}
                    >
                      <activity.icon className="h-4 w-4" />
                    </div>
                    {index < activities.length - 1 && (
                      <div className="absolute top-10 left-5 w-px h-8 bg-border" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0 pt-1">
                    <div className="flex items-start justify-between mb-1">
                      <div className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                        {activity.title}
                      </div>
                      <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">{activity.time}</span>
                    </div>
                    <div className="text-xs text-muted-foreground mb-2">{activity.description}</div>
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-gradient-to-br from-primary/20 to-blue-500/20 flex items-center justify-center text-[9px] font-medium text-foreground">
                        {activity.user.substring(0, 2).toUpperCase()}
                      </div>
                      <span className="text-xs text-muted-foreground">{activity.user}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Performers */}
        <Card className="bg-card border-border">
          <CardHeader className="border-b border-border">
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-primary" />
              <CardTitle className="text-base font-medium text-foreground">Top Performers</CardTitle>
            </div>
            <p className="text-xs text-muted-foreground">Ranking do mês</p>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            {topPerformers.map((performer, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 rounded-lg bg-muted/20 hover:bg-muted/30 transition-all cursor-pointer group"
              >
                <div
                  className={cn(
                    'flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium text-foreground flex-shrink-0 group-hover:scale-110 transition-transform',
                    index === 0 ? 'bg-gradient-to-br from-yellow-500 to-amber-500' : 'bg-gradient-to-br from-primary/30 to-blue-500/30'
                  )}
                  style={{
                    filter: 'drop-shadow(0 0 4px rgba(0, 255, 136, 0.3))',
                  }}
                >
                  {index + 1}
                </div>
                <div
                  className={cn(
                    'w-10 h-10 rounded-lg bg-gradient-to-br flex items-center justify-center text-sm font-medium text-foreground flex-shrink-0 group-hover:scale-110 transition-transform',
                    performer.color
                  )}
                  style={{
                    filter: 'drop-shadow(0 0 4px rgba(0, 255, 136, 0.2))',
                  }}
                >
                  {performer.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-foreground mb-1 group-hover:text-primary transition-colors">
                    {performer.name}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{performer.deals} deals</span>
                    <span>·</span>
                    <span>{performer.conversion}% conv.</span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-sm font-medium text-primary">{performer.value}</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Performance Metrics with Calendar */}
        <Card className="bg-card border-border">
          <CardHeader className="border-b border-border">
            <div className="flex items-center gap-2">
              <LineChart className="h-4 w-4 text-primary" />
              <CardTitle className="text-base font-medium text-foreground">Performance Mensal</CardTitle>
            </div>
            <p className="text-xs text-muted-foreground">Histórico de vendas (em mil)</p>
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
                    {/* Tooltip on hover */}
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-background/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-medium text-foreground whitespace-nowrap border border-border">
                      R$ {item.amount}k
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                    {item.month}
                  </span>
                </div>
              ))}
            </div>

            {/* Mini Calendar */}
            <div className="mt-6 pt-6 border-t border-border">
              <div className="flex items-center justify-between mb-3">
                <div className="text-xs font-medium text-foreground">Fevereiro 2026</div>
                <div className="text-xs text-muted-foreground">Atividades do Mês</div>
              </div>
              <div className="grid grid-cols-7 gap-1">
                {/* Week days header */}
                {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((day, i) => (
                  <div key={i} className="text-center text-[10px] text-muted-foreground font-medium py-1">
                    {day}
                  </div>
                ))}

                {/* Calendar days */}
                {/* Empty cells for days before month starts (Feb 2026 starts on Sunday) */}
                {Array.from({ length: 0 }).map((_, i) => (
                  <div key={`empty-${i}`} className="aspect-square" />
                ))}

                {/* Days of the month */}
                {Array.from({ length: 28 }).map((_, i) => {
                  const day = i + 1;
                  const today = day === 8; // Today is Feb 8
                  const hasEvent = [10, 12, 15, 18, 20, 25].includes(day);
                  const hasMultipleEvents = [10, 20].includes(day);

                  return (
                    <div
                      key={day}
                      className={cn(
                        'aspect-square flex items-center justify-center text-[10px] rounded transition-all cursor-pointer relative group',
                        today
                          ? 'bg-primary text-background font-bold scale-110 z-10'
                          : hasEvent
                          ? 'bg-primary/20 text-primary hover:bg-primary/30 border border-primary/50'
                          : 'text-muted-foreground hover:bg-muted/30 hover:text-foreground'
                      )}
                      style={{
                        filter: today ? 'drop-shadow(0 0 8px rgba(0, 255, 136, 0.5))' : 'none',
                      }}
                    >
                      {day}
                      {hasMultipleEvents && (
                        <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
                      )}

                      {/* Hover tooltip for events */}
                      {hasEvent && (
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-background/95 backdrop-blur-sm border border-primary/50 rounded-lg p-2 whitespace-nowrap text-[10px] z-20 pointer-events-none">
                          <div className="text-primary font-medium mb-1">
                            {day === 10 && '3 Eventos'}
                            {day === 12 && 'Demo Cliente'}
                            {day === 15 && 'Reunião Equipe'}
                            {day === 18 && 'Follow-up'}
                            {day === 20 && '2 Eventos'}
                            {day === 25 && 'Apresentação'}
                          </div>
                          {(day === 10 || day === 20) && (
                            <div className="text-muted-foreground text-[9px]">
                              Clique para detalhes
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Calendar legend */}
              <div className="mt-3 pt-3 border-t border-border flex items-center justify-center gap-3 text-[10px]">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <span className="text-muted-foreground">Hoje</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded bg-primary/20 border border-primary/50" />
                  <span className="text-muted-foreground">Com eventos</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  <span className="text-muted-foreground">Múltiplos</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Conversion Rate Donut */}
        <Card className="bg-card border-border">
          <CardHeader className="border-b border-border">
            <div className="flex items-center gap-2">
              <PieChart className="h-4 w-4 text-primary" />
              <CardTitle className="text-base font-medium text-foreground">Taxa de Conversão</CardTitle>
            </div>
            <p className="text-xs text-muted-foreground">Pipeline geral</p>
          </CardHeader>
          <CardContent className="p-6">
            <DonutChart percentage={85} />
            <div className="mt-6 pt-6 border-t border-border space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-primary" />
                  <span className="text-xs text-muted-foreground">Leads Qualificados</span>
                </div>
                <span className="text-sm font-medium text-foreground">84%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  <span className="text-xs text-muted-foreground">Propostas Enviadas</span>
                </div>
                <span className="text-sm font-medium text-foreground">78%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-purple-500" />
                  <span className="text-xs text-muted-foreground">Deals Fechados</span>
                </div>
                <span className="text-sm font-medium text-foreground">32%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Performance Metrics Chart */}
        <Card className="bg-card border-border">
          <CardHeader className="border-b border-border">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              <CardTitle className="text-base font-medium text-foreground">Performance Analytics</CardTitle>
            </div>
            <p className="text-xs text-muted-foreground">Métricas vs Meta</p>
          </CardHeader>
          <CardContent className="p-6">
            <RadarChart />
          </CardContent>
        </Card>
      </div>

      {/* Advanced Sales Forecast */}
      <Card className="bg-card border-border">
        <CardHeader className="border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <BarChart3 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-base font-medium text-foreground">Previsão de Vendas</CardTitle>
                <p className="text-xs text-muted-foreground mt-1">Forecast vs Meta com analytics detalhado</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-primary" />
                <span className="text-xs text-muted-foreground">Forecast</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-muted" />
                <span className="text-xs text-muted-foreground">Meta</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <SalesForecastChart data={forecastData} />
        </CardContent>
      </Card>
    </div>
  );
}
