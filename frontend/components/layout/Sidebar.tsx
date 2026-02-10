'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  UserPlus,
  Building2,
  Target,
  FileText,
  CheckSquare,
  MessageSquare,
  BarChart3,
  Zap,
  Settings,
  LogOut,
  Plus,
  Mail,
  Phone,
  Calendar,
  Clock,
  Pencil,
  Trash2,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar } from '@/components/ui';
import api from '@/lib/api';
import type { AuditLog } from '@/types';

const menuItems = [
  {
    title: 'Principal',
    items: [
      { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    ],
  },
  {
    title: 'Vendas',
    items: [
      { name: 'Leads', href: '/leads', icon: UserPlus },
      { name: 'Clientes', href: '/clientes', icon: Users },
      { name: 'Empresas', href: '/empresas', icon: Building2 },
      { name: 'Oportunidades', href: '/oportunidades', icon: Target },
      { name: 'Negociações', href: '/negociacoes', icon: FileText },
    ],
  },
  {
    title: 'Operações',
    items: [
      { name: 'Atividades', href: '/atividades', icon: CheckSquare },
      { name: 'Comunicações', href: '/comunicacoes', icon: MessageSquare },
    ],
  },
  {
    title: 'Gestão',
    items: [
      { name: 'Equipe', href: '/equipe', icon: Users },
      { name: 'Relatórios', href: '/relatorios', icon: BarChart3 },
      { name: 'Automações', href: '/automacoes', icon: Zap },
      { name: 'Configurações', href: '/configuracoes', icon: Settings },
    ],
  },
];

const quickActions = [
  { name: 'Novo Lead', icon: UserPlus, color: 'text-blue-500', href: '/leads' },
  { name: 'Buscar', icon: MessageSquare, color: 'text-emerald-500', href: '/comunicacoes' },
  { name: 'Relatório', icon: BarChart3, color: 'text-purple-500', href: '/relatorios' },
  { name: 'Pipeline', icon: Target, color: 'text-amber-500', href: '/oportunidades' },
];

const actionIcons: Record<string, typeof Plus> = {
  INSERT: Plus,
  UPDATE: Pencil,
  DELETE: Trash2,
};

const actionColors: Record<string, string> = {
  INSERT: 'text-green-500',
  UPDATE: 'text-yellow-500',
  DELETE: 'text-red-500',
};

const actionLabels: Record<string, string> = {
  INSERT: 'Criou',
  UPDATE: 'Editou',
  DELETE: 'Removeu',
};

const tableLabels: Record<string, string> = {
  leads: 'lead',
  clientes: 'cliente',
  empresas: 'empresa',
  usuarios: 'usuário',
};

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'Agora';
  if (diffMin < 60) return `Há ${diffMin}min`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `Há ${diffHours}h`;
  const diffDays = Math.floor(diffHours / 24);
  return `Há ${diffDays}d`;
}

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [recentLogs, setRecentLogs] = useState<AuditLog[]>([]);

  useEffect(() => {
    const fetchRecent = async () => {
      try {
        const response = await api.get('/audit', { params: { limit: 5, page: 1 } });
        const payload = response.data as any;
        const items = payload?.data || payload || [];
        setRecentLogs(Array.isArray(items) ? items.slice(0, 5) : []);
      } catch {
        // Silently fail - sidebar activities are not critical
      }
    };
    fetchRecent();
    const interval = setInterval(fetchRecent, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-border bg-card">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 border-b border-border px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
          <span className="text-sm font-bold text-white">CRM</span>
        </div>
        <span className="text-lg font-semibold text-foreground">Sistema CRM</span>
      </div>

      {/* Nova Interação Button */}
      <div className="p-4">
        <button
          onClick={() => router.push('/leads')}
          className="w-full flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-blue-700 hover:shadow-lg"
        >
          <Plus className="h-5 w-5" />
          Nova Interação
        </button>
      </div>

      {/* Quick Actions */}
      <div className="px-4 pb-4">
        <p className="mb-3 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Ações Rápidas
        </p>
        <div className="space-y-1">
          {quickActions.map((action) => (
            <button
              key={action.name}
              onClick={() => router.push(action.href)}
              className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <action.icon className={cn('h-5 w-5', action.color)} />
              {action.name}
            </button>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-4 pb-4">
        {menuItems.map((section) => (
          <div key={section.title} className="mb-6">
            <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {section.title}
            </p>
            <ul className="space-y-1">
              {section.items.map((item) => {
                const isActive = pathname === item.href ||
                  (item.href !== '/' && pathname.startsWith(item.href));

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-primary/10 text-primary'
                          : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                      )}
                    >
                      <item.icon className="h-5 w-5" />
                      {item.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}

        {/* Atividades Recentes - Real data from audit API */}
        <div className="mb-6">
          <p className="mb-3 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Atividades Recentes
          </p>
          <div className="space-y-3">
            {recentLogs.length > 0 ? recentLogs.map((log) => {
              const ActionIcon = actionIcons[log.acao] || Plus;
              const color = actionColors[log.acao] || 'text-muted-foreground';
              return (
                <div key={log.id} className="flex items-start gap-3 rounded-lg px-2 py-2 hover:bg-accent/50 transition-colors">
                  <div className={cn('mt-0.5', color)}>
                    <ActionIcon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground truncate">
                      {actionLabels[log.acao] || log.acao} {tableLabels[log.tabela] || log.tabela}
                    </p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">
                        {timeAgo(log.criadoEm)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            }) : (
              <p className="text-xs text-muted-foreground px-2">Nenhuma atividade recente</p>
            )}
          </div>
        </div>
      </nav>

      {/* User */}
      <div className="border-t border-border p-4">
        <div className="flex items-center gap-3">
          <Avatar name={user?.nome} size="md" />
          <div className="flex-1 overflow-hidden">
            <p className="truncate text-sm font-medium text-foreground">
              {user?.nome}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {user?.cargo === 'admin' ? 'Administrador' :
               user?.cargo === 'gerente' ? 'Gerente' : 'Vendedor'}
            </p>
          </div>
          <button
            onClick={logout}
            className="rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-foreground"
            title="Sair"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
