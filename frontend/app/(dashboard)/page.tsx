'use client';

import { useState, useEffect, useMemo } from 'react';
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

// Mini Sparkline Component
function MiniSparkline({ data, color = '#00ff88' }: { data: number[]; color?: string }) {
  if (!data || data.length < 2) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

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
        <circle cx="96" cy="96" r={radius} stroke="currentColor" strokeWidth="12" fill="none" className="text-muted/30" />
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00ff88" />
            <stop offset="50%" stopColor="#00d4ff" />
            <stop offset="100%" stopColor="#5e72e4" />
          </linearGradient>
        </defs>
        <circle cx="96" cy="96" r={radius} stroke="url(#gradient)" strokeWidth="12" fill="none" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" className="transition-all duration-1000 ease-out" style={{ filter: 'drop-shadow(0 0 8px rgba(0, 255, 136, 0.5))' }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-4xl font-light text-foreground">{percentage.toFixed(0)}%</div>
        <div className="text-xs text-muted-foreground mt-1">Taxa de Conversão</div>
      </div>
    </div>
  );
}

// Radar Chart Component
function RadarChart({ data }: { data: { label: string; value: number; color: string }[] }) {
  const size = 300;
  const center = size / 2;
  const maxRadius = size / 2 - 60;
  const angleStep = (Math.PI * 2) / data.length;
  const startAngle = -Math.PI / 2;

  const points = data
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
        {[0.2, 0.4, 0.6, 0.8, 1].map((scale) => (
          <circle key={scale} cx={center} cy={center} r={maxRadius * scale} fill="none" stroke="currentColor" strokeWidth="1" className="text-border" opacity={0.2} />
        ))}
        {data.map((metric, i) => {
          const angle = startAngle + angleStep * i;
          const axisX = center + maxRadius * Math.cos(angle);
          const axisY = center + maxRadius * Math.sin(angle);
          const labelX = center + (maxRadius + 35) * Math.cos(angle);
          const labelY = center + (maxRadius + 35) * Math.sin(angle);
          return (
            <g key={i}>
              <line x1={center} y1={center} x2={axisX} y2={axisY} stroke="currentColor" strokeWidth="1" className="text-border" opacity={0.3} />
              <g transform={`translate(${labelX}, ${labelY})`}>
                <circle cx="0" cy="0" r="3" fill={metric.color} style={{ filter: `drop-shadow(0 0 4px ${metric.color})` }} />
                <text x="0" y="-8" textAnchor="middle" className="text-[11px] font-medium fill-current text-muted-foreground">{metric.label}</text>
                <text x="0" y="16" textAnchor="middle" className="text-[10px] font-bold fill-current" fill={metric.color}>{metric.value}%</text>
              </g>
            </g>
          );
        })}
        <polygon points={points} fill="url(#radarGradient)" stroke="#00ff88" strokeWidth="2.5" className="transition-all duration-1000" style={{ filter: 'drop-shadow(0 0 12px rgba(0, 255, 136, 0.5))' }} />
        {data.map((metric, i) => {
          const angle = startAngle + angleStep * i;
          const radius = (metric.value / 100) * maxRadius;
          const x = center + radius * Math.cos(angle);
          const y = center + radius * Math.sin(angle);
          return (
            <circle key={i} cx={x} cy={y} r="6" fill={metric.color} className="transition-all duration-300 cursor-pointer" style={{ filter: `drop-shadow(0 0 6px ${metric.color})` }}>
              <title>{metric.label}: {metric.value}%</title>
            </circle>
          );
        })}
        <circle cx={center} cy={center} r="4" fill="#00ff88" opacity={0.5} />
      </svg>
    </div>
  );
}

// Timeline Line Chart - uses real data from API
function TimelineChart({ labels, leadsData, clientesData }: { labels: string[]; leadsData: number[]; clientesData: number[] }) {
  const [showLeads, setShowLeads] = useState(true);
  const [showClientes, setShowClientes] = useState(true);
  const [hoveredPoint, setHoveredPoint] = useState<{ type: 'leads' | 'clientes'; index: number } | null>(null);

  const width = 1400;
  const height = 700;
  const padding = { top: 60, right: 80, bottom: 80, left: 80 };

  const allValues = [...(showLeads ? leadsData : []), ...(showClientes ? clientesData : [])];
  const maxValue = Math.max(...allValues, 1);
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const generatePath = (data: number[]) => {
    if (data.length === 0) return { path: '', points: [] as { x: number; y: number }[] };
    const points = data.map((value, i) => ({
      x: padding.left + (i / Math.max(data.length - 1, 1)) * chartWidth,
      y: padding.top + chartHeight - (value / maxValue) * chartHeight,
    }));
    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const cp1x = prev.x + (curr.x - prev.x) * 0.5;
      const cp2x = curr.x - (curr.x - prev.x) * 0.5;
      path += ` C ${cp1x} ${prev.y}, ${cp2x} ${curr.y}, ${curr.x} ${curr.y}`;
    }
    return { path, points };
  };

  const leadsPath = generatePath(leadsData);
  const clientesPath = generatePath(clientesData);
  const ySteps = [0, Math.round(maxValue * 0.25), Math.round(maxValue * 0.5), Math.round(maxValue * 0.75), maxValue];

  return (
    <div className="relative w-full bg-[#050810] rounded-b-lg p-6">
      <div className="flex items-center justify-end gap-4 mb-4">
        <button onClick={() => setShowLeads(!showLeads)} className={cn('flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300', showLeads ? 'bg-[#00ff88]/20 border-2 border-[#00ff88] text-[#00ff88]' : 'bg-muted/20 border-2 border-border text-muted-foreground')} style={{ filter: showLeads ? 'drop-shadow(0 0 12px rgba(0, 255, 136, 0.5))' : 'none' }}>
          <div className={cn('w-3 h-3 rounded-full', showLeads ? 'bg-[#00ff88]' : 'bg-muted-foreground')} style={{ boxShadow: showLeads ? '0 0 12px rgba(0, 255, 136, 0.7)' : 'none' }} />
          <span className="text-sm font-medium">Leads</span>
        </button>
        <button onClick={() => setShowClientes(!showClientes)} className={cn('flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300', showClientes ? 'bg-[#00d4ff]/20 border-2 border-[#00d4ff] text-[#00d4ff]' : 'bg-muted/20 border-2 border-border text-muted-foreground')} style={{ filter: showClientes ? 'drop-shadow(0 0 8px rgba(0, 212, 255, 0.4))' : 'none' }}>
          <div className={cn('w-3 h-3 rounded-full', showClientes ? 'bg-[#00d4ff]' : 'bg-muted-foreground')} style={{ boxShadow: showClientes ? '0 0 8px rgba(0, 212, 255, 0.6)' : 'none' }} />
          <span className="text-sm font-medium">Clientes</span>
        </button>
      </div>

      <div className="relative" style={{ height: `${height}px` }}>
        <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1"/></pattern>
            <filter id="greenGlow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="10" result="coloredBlur"/><feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
            <filter id="blueGlow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="6" result="coloredBlur"/><feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
            <linearGradient id="greenGradient" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#00ff88" stopOpacity="0.8"/><stop offset="100%" stopColor="#00ff88" stopOpacity="0.9"/></linearGradient>
            <linearGradient id="blueGradient" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#00d4ff" stopOpacity="0.8"/><stop offset="100%" stopColor="#00d4ff" stopOpacity="0.9"/></linearGradient>
            <linearGradient id="greenArea" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#00ff88" stopOpacity="0.2"/><stop offset="100%" stopColor="#00ff88" stopOpacity="0.0"/></linearGradient>
            <linearGradient id="blueArea" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#00d4ff" stopOpacity="0.15"/><stop offset="100%" stopColor="#00d4ff" stopOpacity="0.0"/></linearGradient>
          </defs>
          <rect width={width} height={height} fill="url(#grid)" />
          <ellipse cx="35%" cy="40%" rx="300" ry="150" fill="#00ff88" opacity="0.06" />
          <ellipse cx="65%" cy="60%" rx="350" ry="180" fill="#00d4ff" opacity="0.04" />

          {ySteps.map((value) => {
            const y = padding.top + chartHeight - (value / maxValue) * chartHeight;
            return (
              <g key={value}>
                <line x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke="rgba(255,255,255,0.05)" strokeWidth="1" strokeDasharray="4 4" />
                <text x={padding.left - 20} y={y} textAnchor="end" dominantBaseline="middle" className="text-xs fill-muted-foreground">{value}</text>
              </g>
            );
          })}

          {labels.map((label, i) => {
            const x = padding.left + (i / Math.max(labels.length - 1, 1)) * chartWidth;
            return <text key={i} x={x} y={height - padding.bottom + 30} textAnchor="middle" className="text-sm font-medium fill-foreground">{label}</text>;
          })}

          {showLeads && leadsPath.path && (
            <>
              <path d={`${leadsPath.path} L ${width - padding.right} ${height - padding.bottom} L ${padding.left} ${height - padding.bottom} Z`} fill="url(#greenArea)" />
              <path d={leadsPath.path} fill="none" stroke="url(#greenGradient)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" filter="url(#greenGlow)" />
            </>
          )}
          {showClientes && clientesPath.path && (
            <>
              <path d={`${clientesPath.path} L ${width - padding.right} ${height - padding.bottom} L ${padding.left} ${height - padding.bottom} Z`} fill="url(#blueArea)" />
              <path d={clientesPath.path} fill="none" stroke="url(#blueGradient)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" filter="url(#blueGlow)" />
            </>
          )}

          {showLeads && leadsPath.points.map((point, i) => {
            const isHovered = hoveredPoint?.type === 'leads' && hoveredPoint?.index === i;
            return (
              <g key={`l-${i}`} className="cursor-pointer" onMouseEnter={() => setHoveredPoint({ type: 'leads', index: i })} onMouseLeave={() => setHoveredPoint(null)}>
                <circle cx={point.x} cy={point.y} r={isHovered ? "12" : "7"} fill="#00ff88" stroke="#050810" strokeWidth="2" style={{ filter: isHovered ? 'drop-shadow(0 0 20px #00ff88)' : 'drop-shadow(0 0 12px #00ff88)', transition: 'all 0.3s ease' }} />
                <text x={point.x} y={point.y - 18} textAnchor="middle" className="text-xs font-bold" fill="#00ff88">{leadsData[i]}</text>
              </g>
            );
          })}
          {showClientes && clientesPath.points.map((point, i) => {
            const isHovered = hoveredPoint?.type === 'clientes' && hoveredPoint?.index === i;
            return (
              <g key={`c-${i}`} className="cursor-pointer" onMouseEnter={() => setHoveredPoint({ type: 'clientes', index: i })} onMouseLeave={() => setHoveredPoint(null)}>
                <circle cx={point.x} cy={point.y} r={isHovered ? "10" : "6"} fill="#00d4ff" stroke="#050810" strokeWidth="2" style={{ filter: isHovered ? 'drop-shadow(0 0 16px #00d4ff)' : 'drop-shadow(0 0 8px #00d4ff)', transition: 'all 0.3s ease' }} />
                <text x={point.x} y={point.y - 18} textAnchor="middle" className="text-xs font-bold" fill="#00d4ff">{clientesData[i]}</text>
              </g>
            );
          })}

          <text x={padding.left - 50} y={padding.top + chartHeight / 2} textAnchor="middle" transform={`rotate(-90, ${padding.left - 50}, ${padding.top + chartHeight / 2})`} className="text-sm font-medium fill-muted-foreground">Quantidade</text>
          <text x={width / 2} y={height - 20} textAnchor="middle" className="text-sm font-medium fill-muted-foreground">Período</text>
        </svg>
      </div>

      <div className="flex items-center justify-center gap-8 mt-6">
        <div className="flex items-center gap-3 p-3 rounded-lg">
          <div className="w-12 h-1 rounded-full bg-[#00ff88]" style={{ filter: 'drop-shadow(0 0 10px #00ff88)' }} />
          <div>
            <div className="text-sm font-medium text-[#00ff88]">Leads</div>
            <div className="text-xs text-muted-foreground">Total: {leadsData.reduce((a, b) => a + b, 0)}</div>
          </div>
        </div>
        <div className="flex items-center gap-3 p-3 rounded-lg">
          <div className="w-12 h-1 rounded-full bg-[#00d4ff]" style={{ filter: 'drop-shadow(0 0 6px #00d4ff)' }} />
          <div>
            <div className="text-sm font-medium text-[#00d4ff]">Clientes</div>
            <div className="text-xs text-muted-foreground">Total: {clientesData.reduce((a, b) => a + b, 0)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Status helpers
function getStatusLabel(status: string) {
  const map: Record<string, string> = { novo: 'Novo', em_contato: 'Em Contato', qualificado: 'Qualificado', perdido: 'Perdido' };
  return map[status] || status;
}

function getStatusStyle(status: string) {
  const map: Record<string, string> = {
    novo: 'bg-muted/30 text-muted-foreground border border-border',
    em_contato: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
    qualificado: 'bg-primary/10 text-primary border border-primary/20',
    perdido: 'bg-red-500/10 text-red-400 border border-red-500/20',
  };
  return map[status] || 'bg-muted/30 text-muted-foreground border border-border';
}

function getStatusBarColor(status: string) {
  const map: Record<string, string> = {
    qualificado: 'bg-gradient-to-r from-primary to-emerald-500',
    em_contato: 'bg-gradient-to-r from-blue-500 to-blue-400',
    perdido: 'bg-gradient-to-r from-red-500 to-red-400',
    novo: 'bg-gradient-to-r from-gray-500 to-gray-400',
  };
  return map[status] || 'bg-gradient-to-r from-gray-500 to-gray-400';
}

// Segment Bar Chart
function SegmentBarChart({ data }: { data: { segmento: string; leads: number; clientes: number; empresas: number }[] }) {
  const maxVal = Math.max(...data.map(d => Math.max(d.leads, d.clientes)), 1);
  return (
    <div className="space-y-3">
      {data.slice(0, 8).map((seg, i) => (
        <div key={i} className="group cursor-pointer">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-foreground group-hover:text-primary transition-colors truncate max-w-[140px]">{seg.segmento}</span>
            <span className="text-[10px] text-muted-foreground">{seg.leads}L / {seg.clientes}C / {seg.empresas}E</span>
          </div>
          <div className="flex gap-1 h-2">
            <div className="bg-gradient-to-r from-primary to-primary/60 rounded-full transition-all duration-500" style={{ width: `${(seg.leads / maxVal) * 100}%`, filter: 'drop-shadow(0 0 4px rgba(0, 255, 136, 0.3))' }} />
            <div className="bg-gradient-to-r from-blue-500 to-blue-500/60 rounded-full transition-all duration-500" style={{ width: `${(seg.clientes / maxVal) * 100}%` }} />
          </div>
        </div>
      ))}
      <div className="flex items-center gap-4 mt-2 text-[10px] text-muted-foreground">
        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-primary" />Leads</div>
        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-500" />Clientes</div>
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
    refreshInterval: 60000,
  });

  const currentDate = new Date().toLocaleDateString('pt-BR', { weekday: 'long', month: 'long', day: 'numeric' });

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    refresh();
  }, [timeRange, refresh]);

  const timeString = currentTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  const periodLabel = currentTime.getHours() >= 12 ? 'PM' : 'AM';

  const greeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  // Build metrics from real API data
  const displayMetrics = useMemo(() => {
    const s = dashboardData?.stats;
    if (!s) return [
      { title: 'Total de Leads', value: '-', change: '-', subtitle: 'Carregando...', isPositive: true, icon: Users, trend: [0, 0] },
      { title: 'Total de Clientes', value: '-', change: '-', subtitle: 'Carregando...', isPositive: true, icon: Target, trend: [0, 0] },
      { title: 'Taxa de Conversão', value: '-', change: '-', subtitle: 'Carregando...', isPositive: true, icon: TrendingUp, trend: [0, 0] },
      { title: 'Total de Empresas', value: '-', change: '-', subtitle: 'Carregando...', isPositive: true, icon: Briefcase, trend: [0, 0] },
    ];
    return [
      {
        title: 'Total de Leads',
        value: (s.totals?.leads ?? 0).toLocaleString('pt-BR'),
        change: `${(s.growth?.leads ?? 0) > 0 ? '+' : ''}${(s.growth?.leads ?? 0).toFixed(1)}%`,
        subtitle: 'Crescimento no período',
        isPositive: (s.growth?.leads ?? 0) >= 0,
        icon: Users,
        trend: dashboardData?.timeline?.leads ?? [0, 0],
      },
      {
        title: 'Total de Clientes',
        value: (s.totals?.clientes ?? 0).toLocaleString('pt-BR'),
        change: `${(s.growth?.clientes ?? 0) > 0 ? '+' : ''}${(s.growth?.clientes ?? 0).toFixed(1)}%`,
        subtitle: 'Crescimento no período',
        isPositive: (s.growth?.clientes ?? 0) >= 0,
        icon: Target,
        trend: dashboardData?.timeline?.clientes ?? [0, 0],
      },
      {
        title: 'Taxa de Conversão',
        value: `${(s.conversion?.rate ?? 0).toFixed(1)}%`,
        change: `${s.conversion?.qualified ?? 0} qualificados`,
        subtitle: `${s.conversion?.lost ?? 0} perdidos`,
        isPositive: (s.conversion?.rate ?? 0) >= 20,
        icon: TrendingUp,
        trend: [Math.max((s.conversion?.rate ?? 0) - 5, 0), (s.conversion?.rate ?? 0) - 2, s.conversion?.rate ?? 0],
      },
      {
        title: 'Total de Empresas',
        value: (s.totals?.empresas ?? 0).toLocaleString('pt-BR'),
        change: `${(s.growth?.empresas ?? 0) > 0 ? '+' : ''}${(s.growth?.empresas ?? 0).toFixed(1)}%`,
        subtitle: `${s.totals?.usuarios ?? 0} usuários ativos`,
        isPositive: (s.growth?.empresas ?? 0) >= 0,
        icon: Briefcase,
        trend: [Math.max((s.totals?.empresas ?? 0) - 3, 0), (s.totals?.empresas ?? 0) - 1, s.totals?.empresas ?? 0],
      },
    ];
  }, [dashboardData]);

  const byStatusData = dashboardData?.byStatus ?? [];
  const topUsersData = dashboardData?.topUsers ?? [];
  const bySegmentData = dashboardData?.bySegment ?? [];
  const timelineLabels = dashboardData?.timeline?.labels ?? [];
  const timelineLeads = dashboardData?.timeline?.leads ?? [];
  const timelineClientes = dashboardData?.timeline?.clientes ?? [];

  // Radar from real stats
  const radarData = useMemo(() => {
    const conv = dashboardData?.stats?.conversion?.rate ?? 0;
    const totalLeads = dashboardData?.stats?.totals?.leads ?? 0;
    const totalClientes = dashboardData?.stats?.totals?.clientes ?? 0;
    const qualificados = dashboardData?.stats?.conversion?.qualified ?? 0;
    const perdidos = dashboardData?.stats?.conversion?.lost ?? 0;
    const novos = byStatusData.find(s => s.status === 'novo')?.count ?? 0;

    const engajamento = totalLeads > 0 ? Math.min(((totalLeads - novos) / totalLeads) * 100, 100) : 0;
    const retencao = totalLeads > 0 ? Math.min(((totalLeads - perdidos) / totalLeads) * 100, 100) : 0;
    const performance = totalLeads > 0 ? Math.min((totalClientes / totalLeads) * 200, 100) : 0;
    const qualidade = totalLeads > 0 ? Math.min((qualificados / totalLeads) * 200, 100) : 0;

    return [
      { label: 'Engajamento', value: Math.round(engajamento), color: '#00ff88' },
      { label: 'Conversão', value: Math.round(conv), color: '#00d4ff' },
      { label: 'Retenção', value: Math.round(retencao), color: '#5e72e4' },
      { label: 'Performance', value: Math.round(performance), color: '#f5a623' },
      { label: 'Qualidade', value: Math.round(qualidade), color: '#ff6b9d' },
    ];
  }, [dashboardData, byStatusData]);

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      {/* Alerts Bar - real data */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
          <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-amber-500">{byStatusData.find(s => s.status === 'qualificado')?.count ?? 0} Leads Qualificados</p>
            <p className="text-xs text-amber-500/70 truncate">Prontos para conversão</p>
          </div>
          <ChevronRight className="h-4 w-4 text-amber-500" />
        </div>
        <div className="flex items-center gap-3 p-3 rounded-lg bg-red-500/10 border border-red-500/30">
          <XCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-red-500">{byStatusData.find(s => s.status === 'perdido')?.count ?? 0} Leads Perdidos</p>
            <p className="text-xs text-red-500/70 truncate">Analisar motivos de perda</p>
          </div>
          <ChevronRight className="h-4 w-4 text-red-500" />
        </div>
        <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/10 border border-primary/30">
          <Sparkles className="h-5 w-5 text-primary flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-primary">Conversão: {(dashboardData?.stats?.conversion?.rate ?? 0).toFixed(1)}%</p>
            <p className="text-xs text-primary/70 truncate">{byStatusData.find(s => s.status === 'novo')?.count ?? 0} novos leads para trabalhar</p>
          </div>
          <ChevronRight className="h-4 w-4 text-primary" />
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-light text-foreground mb-1">{greeting()}, {user?.nome || 'Admin'}</h1>
          <p className="text-sm text-muted-foreground capitalize">{currentDate}</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 hover:bg-primary/20 transition-all border border-primary/30 hover:border-primary group">
            <Users className="h-4 w-4 text-primary" />
            <span className="text-sm text-primary font-medium">Novo Lead</span>
          </button>
          <button onClick={() => setShowFilters(!showFilters)} className={cn("flex items-center gap-2 px-4 py-2 rounded-lg transition-all border group", showFilters ? "bg-primary/20 border-primary" : "bg-muted/30 hover:bg-muted/50 border-border hover:border-primary/50")}>
            <Filter className={cn("h-4 w-4 transition-colors", showFilters ? "text-primary" : "text-muted-foreground group-hover:text-primary")} />
            <span className={cn("text-sm", showFilters ? "text-primary font-medium" : "text-foreground")}>Filtros</span>
          </button>
          <button onClick={refresh} disabled={isLoading} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-all border border-border hover:border-primary/50 group disabled:opacity-50" title="Atualizar dados">
            <RefreshCw className={cn("h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors", isLoading && "animate-spin")} />
          </button>
          <button onClick={exportData} disabled={isExporting} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-all border border-border hover:border-primary/50 group disabled:opacity-50" title="Exportar dados">
            <Download className={cn("h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors", isExporting && "animate-bounce")} />
          </button>
          <div className="text-right">
            <div className="text-3xl font-light text-foreground tabular-nums">{timeString}</div>
            <div className="text-xs text-muted-foreground">{periodLabel}</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="flex items-center gap-3 p-4 rounded-lg bg-card border border-border animate-in slide-in-from-top duration-200">
          <span className="text-sm text-muted-foreground">Período:</span>
          <div className="flex gap-2">
            {(['today', 'week', 'month', 'quarter'] as const).map((range) => (
              <button key={range} onClick={() => setTimeRange(range)} className={cn("px-3 py-1.5 rounded-lg text-xs font-medium transition-all", timeRange === range ? "bg-primary/20 text-primary border border-primary/50" : "bg-muted/30 text-muted-foreground hover:bg-muted/50")}>
                {range === 'today' && 'Hoje'}
                {range === 'week' && 'Esta Semana'}
                {range === 'month' && 'Este Mês'}
                {range === 'quarter' && 'Este Trimestre'}
              </button>
            ))}
          </div>
          <div className="ml-auto">
            <button onClick={exportData} disabled={isExporting} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/30 hover:bg-muted/50 text-xs">
              <FileText className="h-3 w-3" /><span>Exportar</span>
            </button>
          </div>
        </div>
      )}

      {/* Loading */}
      {isLoading && !dashboardData && (
        <div className="flex items-center justify-center p-12">
          <div className="flex flex-col items-center gap-3">
            <RefreshCw className="h-8 w-8 text-primary animate-spin" />
            <p className="text-sm text-muted-foreground">Carregando dados do dashboard...</p>
          </div>
        </div>
      )}

      {/* Error */}
      {error && !dashboardData && (
        <div className="flex items-center justify-center p-12">
          <div className="flex flex-col items-center gap-3">
            <XCircle className="h-8 w-8 text-red-500" />
            <p className="text-sm text-red-500">{error}</p>
            <button onClick={refresh} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary">
              <RefreshCw className="h-4 w-4" /> Tentar Novamente
            </button>
          </div>
        </div>
      )}

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {displayMetrics.map((metric, index) => (
          <Card key={index} className="bg-card border-border hover:border-primary/50 transition-all group cursor-pointer relative overflow-hidden" onMouseEnter={() => setHoveredMetric(index)} onMouseLeave={() => setHoveredMetric(null)}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className={cn('p-2 rounded-lg transition-all duration-300', hoveredMetric === index ? 'bg-primary/20 scale-110' : 'bg-primary/10')} style={{ filter: hoveredMetric === index ? 'drop-shadow(0 0 8px rgba(0, 255, 136, 0.4))' : 'none' }}>
                  <metric.icon className="h-5 w-5 text-primary" />
                </div>
                <div className={cn('flex items-center gap-1 text-xs font-medium px-2 py-1 rounded transition-all', metric.isPositive ? 'text-emerald-400 bg-emerald-500/10' : 'text-red-400 bg-red-500/10')}>
                  {metric.isPositive ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                  {metric.change}
                </div>
              </div>
              <div className="space-y-1">
                <h3 className="text-3xl font-light text-foreground group-hover:text-primary transition-colors">{metric.value}</h3>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">{metric.title}</p>
                <p className="text-xs text-muted-foreground">{metric.subtitle}</p>
              </div>
              <div className="mt-4 flex justify-end">
                <MiniSparkline data={metric.trend} color={metric.isPositive ? '#00ff88' : '#ef4444'} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Timeline Chart - REAL DATA */}
      <Card className="bg-card border-border">
        <CardHeader className="border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10"><TrendingUpIcon className="h-5 w-5 text-primary" /></div>
              <div>
                <CardTitle className="text-base font-medium text-foreground">Timeline de Leads e Clientes</CardTitle>
                <p className="text-xs text-muted-foreground mt-1">Evolução no período selecionado</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-light text-foreground">{(dashboardData?.stats?.totals?.leads ?? 0) + (dashboardData?.stats?.totals?.clientes ?? 0)}</div>
              <div className="text-xs text-muted-foreground">Total registros</div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {timelineLabels.length > 0 ? (
            <TimelineChart labels={timelineLabels} leadsData={timelineLeads} clientesData={timelineClientes} />
          ) : (
            <div className="flex items-center justify-center h-96 text-muted-foreground text-sm">
              {isLoading ? 'Carregando timeline...' : 'Sem dados para o período selecionado'}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Status Distribution + Top Performers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Status Distribution */}
        <Card className="lg:col-span-2 bg-card border-border">
          <CardHeader className="border-b border-border">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" />
              <CardTitle className="text-base font-medium text-foreground">Distribuição por Status</CardTitle>
            </div>
            <p className="text-xs text-muted-foreground">Leads agrupados por status atual</p>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {byStatusData.map((item, index) => (
                <div key={index} className="group cursor-pointer">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className={cn('inline-flex items-center px-2.5 py-1 rounded text-xs font-medium', getStatusStyle(item.status))}>{getStatusLabel(item.status)}</span>
                      <span className="text-sm font-medium text-foreground">{item.count} leads</span>
                    </div>
                    <span className="text-sm font-medium text-primary">{item.percentage.toFixed(1)}%</span>
                  </div>
                  <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
                    <div className={cn('h-full rounded-full transition-all duration-700', getStatusBarColor(item.status))} style={{ width: `${item.percentage}%`, filter: item.status === 'qualificado' ? 'drop-shadow(0 0 4px rgba(0, 255, 136, 0.4))' : 'none' }} />
                  </div>
                </div>
              ))}
              {byStatusData.length === 0 && <div className="text-center text-muted-foreground text-sm py-8">Carregando dados...</div>}
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
            <p className="text-xs text-muted-foreground">Ranking por clientes convertidos</p>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            {topUsersData.map((performer, index) => {
              const initials = performer.nome.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();
              const colors = ['from-yellow-500 to-amber-500', 'from-primary to-blue-500', 'from-blue-500 to-purple-500', 'from-purple-500 to-pink-500', 'from-pink-500 to-primary'];
              return (
                <div key={performer.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/20 hover:bg-muted/30 transition-all cursor-pointer group">
                  <div className={cn('flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium text-foreground flex-shrink-0 group-hover:scale-110 transition-transform', index === 0 ? 'bg-gradient-to-br from-yellow-500 to-amber-500' : 'bg-gradient-to-br from-primary/30 to-blue-500/30')} style={{ filter: 'drop-shadow(0 0 4px rgba(0, 255, 136, 0.3))' }}>
                    {index + 1}
                  </div>
                  <div className={cn('w-10 h-10 rounded-lg bg-gradient-to-br flex items-center justify-center text-sm font-medium text-foreground flex-shrink-0 group-hover:scale-110 transition-transform', colors[index % colors.length])} style={{ filter: 'drop-shadow(0 0 4px rgba(0, 255, 136, 0.2))' }}>
                    {initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-foreground mb-1 group-hover:text-primary transition-colors">{performer.nome}</div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{performer.leads} leads</span><span>·</span>
                      <span>{performer.clientes} clientes</span><span>·</span>
                      <span>{performer.conversion.toFixed(0)}% conv.</span>
                    </div>
                  </div>
                </div>
              );
            })}
            {topUsersData.length === 0 && <div className="text-center text-muted-foreground text-sm py-8">Carregando...</div>}
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Segment Distribution */}
        <Card className="bg-card border-border">
          <CardHeader className="border-b border-border">
            <div className="flex items-center gap-2">
              <LineChart className="h-4 w-4 text-primary" />
              <CardTitle className="text-base font-medium text-foreground">Por Segmento</CardTitle>
            </div>
            <p className="text-xs text-muted-foreground">Distribuição por área de atuação</p>
          </CardHeader>
          <CardContent className="p-6">
            {bySegmentData.length > 0 ? <SegmentBarChart data={bySegmentData} /> : <div className="text-center text-muted-foreground text-sm py-8">Carregando...</div>}
          </CardContent>
        </Card>

        {/* Conversion Donut */}
        <Card className="bg-card border-border">
          <CardHeader className="border-b border-border">
            <div className="flex items-center gap-2">
              <PieChart className="h-4 w-4 text-primary" />
              <CardTitle className="text-base font-medium text-foreground">Taxa de Conversão</CardTitle>
            </div>
            <p className="text-xs text-muted-foreground">Lead qualificado / Total de leads</p>
          </CardHeader>
          <CardContent className="p-6">
            <DonutChart percentage={dashboardData?.stats?.conversion?.rate ?? 0} />
            <div className="mt-6 pt-6 border-t border-border space-y-3">
              {byStatusData.map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={cn('w-3 h-3 rounded-full', item.status === 'qualificado' ? 'bg-primary' : item.status === 'em_contato' ? 'bg-blue-500' : item.status === 'novo' ? 'bg-gray-500' : 'bg-red-500')} />
                    <span className="text-xs text-muted-foreground">{getStatusLabel(item.status)}</span>
                  </div>
                  <span className="text-sm font-medium text-foreground">{item.percentage.toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Radar */}
        <Card className="bg-card border-border">
          <CardHeader className="border-b border-border">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              <CardTitle className="text-base font-medium text-foreground">Performance Analytics</CardTitle>
            </div>
            <p className="text-xs text-muted-foreground">Métricas calculadas dos dados reais</p>
          </CardHeader>
          <CardContent className="p-6">
            <RadarChart data={radarData} />
          </CardContent>
        </Card>
      </div>

      {/* Footer indicator */}
      <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <div className={cn('w-2 h-2 rounded-full', dashboardData ? 'bg-primary animate-pulse' : 'bg-red-500')} />
        <span>
          {dashboardData
            ? `Dados reais do backend · Atualizado: ${dashboardData.lastRefresh ? new Date(dashboardData.lastRefresh).toLocaleTimeString('pt-BR') : 'agora'}`
            : 'Aguardando conexão com backend...'}
        </span>
      </div>
    </div>
  );
}
