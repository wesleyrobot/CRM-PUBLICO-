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

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4">
        {menuItems.map((section) => (
          <div key={section.title} className="mb-6">
            <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
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
