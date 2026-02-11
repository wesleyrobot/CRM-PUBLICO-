'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  UserPlus,
  Building2,
  Target,
  Handshake,
  History,
  Search,
  BarChart3,
  Zap,
  Settings,
  LogOut,
  Plus,
  Clock,
  Pencil,
  Trash2,
  UserCog,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar } from '@/components/ui';
import api from '@/lib/api';
import type { AuditLog } from '@/types';

const menuItems = [
  {
    title: 'Principal',
    items: [
      { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    ],
  },
  {
    title: 'Vendas',
    items: [
      { name: 'Leads', href: '/leads', icon: UserPlus },
      { name: 'Clientes', href: '/clientes', icon: Users },
      { name: 'Empresas', href: '/empresas', icon: Building2 },
      { name: 'Oportunidades', href: '/oportunidades', icon: Target },
      { name: 'Negociações', href: '/negociacoes', icon: Handshake },
    ],
  },
  {
    title: 'Operações',
    items: [
      { name: 'Atividades', href: '/atividades', icon: History },
      { name: 'Comunicações', href: '/comunicacoes', icon: Search },
    ],
  },
  {
    title: 'Gestão',
    items: [
      { name: 'Equipe', href: '/equipe', icon: UserCog },
      { name: 'Relatórios', href: '/relatorios', icon: BarChart3 },
      { name: 'Automações', href: '/automacoes', icon: Zap },
      { name: 'Configurações', href: '/configuracoes', icon: Settings },
    ],
  },
];

const actionIcons: Record<string, typeof Plus> = {
  INSERT: Plus,
  UPDATE: Pencil,
  DELETE: Trash2,
};

const actionColors: Record<string, string> = {
  INSERT: 'text-emerald-500',
  UPDATE: 'text-amber-500',
  DELETE: 'text-red-400',
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
  if (diffMin < 60) return `${diffMin}min`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d`;
}

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [recentLogs, setRecentLogs] = useState<AuditLog[]>([]);

  useEffect(() => {
    const fetchRecent = async () => {
      try {
        const response = await api.get('/audit', { params: { limit: 3, page: 1 } });
        const payload = response.data as any;
        const items = payload?.data || payload || [];
        setRecentLogs(Array.isArray(items) ? items.slice(0, 3) : []);
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
      <div className="flex h-14 items-center gap-2.5 border-b border-border px-5">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <LayoutDashboard className="h-3.5 w-3.5" />
        </div>
        <div>
          <span className="text-xs font-semibold text-foreground">CRM Pro</span>
          <p className="text-[9px] text-muted-foreground leading-none">Gestão Comercial</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {menuItems.map((section) => (
          <div key={section.title} className="mb-5">
            <p className="mb-1.5 px-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">
              {section.title}
            </p>
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const isActive = pathname === item.href ||
                  (item.href !== '/' && item.href !== '/dashboard' && pathname.startsWith(item.href));

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        'flex items-center gap-3 rounded-md px-3 py-2 text-[13px] font-medium transition-colors',
                        isActive
                          ? 'bg-primary/10 text-primary border-l-2 border-primary ml-0 pl-[10px]'
                          : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                      )}
                    >
                      <item.icon className={cn('h-4 w-4', isActive ? 'text-primary' : '')} />
                      {item.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}

        {/* Atividades Recentes */}
        {recentLogs.length > 0 && (
          <div className="mb-4 border-t border-border pt-4">
            <p className="mb-2 px-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">
              Recentes
            </p>
            <div className="space-y-1">
              {recentLogs.map((log) => {
                const ActionIcon = actionIcons[log.acao] || Plus;
                const color = actionColors[log.acao] || 'text-muted-foreground';
                return (
                  <div key={log.id} className="flex items-center gap-2.5 px-3 py-1.5 rounded-md hover:bg-accent/50 transition-colors">
                    <ActionIcon className={cn('h-3.5 w-3.5 shrink-0', color)} />
                    <p className="text-[12px] text-muted-foreground truncate flex-1">
                      {actionLabels[log.acao] || log.acao} {tableLabels[log.tabela] || log.tabela}
                    </p>
                    <span className="text-[10px] text-muted-foreground/60 shrink-0 tabular-nums">
                      {timeAgo(log.criadoEm)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </nav>

      {/* User */}
      <div className="border-t border-border p-3">
        <div className="flex items-center gap-3 rounded-md p-2 hover:bg-accent/50 transition-colors">
          <Avatar name={user?.nome} size="sm" />
          <div className="flex-1 overflow-hidden">
            <p className="truncate text-[13px] font-medium text-foreground">
              {user?.nome}
            </p>
            <p className="truncate text-[11px] text-muted-foreground">
              {user?.cargo === 'admin' ? 'Administrador' :
               user?.cargo === 'gerente' ? 'Gerente' : 'Vendedor'}
            </p>
          </div>
          <button
            onClick={logout}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            title="Sair"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
