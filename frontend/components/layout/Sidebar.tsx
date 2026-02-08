'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar } from '@/components/ui';

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
  { name: 'E-mail', icon: Mail, color: 'text-blue-500' },
  { name: 'Ligação', icon: Phone, color: 'text-green-500' },
  { name: 'Reunião', icon: Calendar, color: 'text-purple-500' },
  { name: 'WhatsApp', icon: MessageSquare, color: 'text-emerald-500' },
  { name: 'Tarefa', icon: CheckSquare, color: 'text-amber-500' },
];

const recentActivities = [
  { type: 'Ligação', description: 'João Silva', time: 'Há 2 horas', icon: Phone, color: 'text-green-500' },
  { type: 'E-mail', description: 'Ana Costa', time: 'Há 3 horas', icon: Mail, color: 'text-blue-500' },
  { type: 'WhatsApp', description: 'Reunião confirmada', time: 'Hoje, 09:00', icon: MessageSquare, color: 'text-emerald-500' },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

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
        <button className="w-full flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-blue-700 hover:shadow-lg">
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

        {/* Atividades Recentes */}
        <div className="mb-6">
          <p className="mb-3 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Atividades Recentes
          </p>
          <div className="space-y-3">
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex items-start gap-3 rounded-lg px-2 py-2 hover:bg-accent/50 transition-colors">
                <div className={cn('mt-0.5', activity.color)}>
                  <activity.icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground truncate">
                    {activity.type} com {activity.description}
                  </p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">
                      {activity.time}
                    </p>
                  </div>
                </div>
              </div>
            ))}
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
