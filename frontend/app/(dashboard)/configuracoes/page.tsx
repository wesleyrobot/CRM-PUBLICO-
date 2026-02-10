'use client';

import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Settings,
  User,
  Server,
  Database,
  Shield,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Save,
} from 'lucide-react';
import {
  Button,
  Input,
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui';
import { PageHeader } from '@/components/layout';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import type { HealthCheck } from '@/types';

const profileSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  telefone: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function ConfiguracoesPage() {
  const { user } = useAuth();
  const [health, setHealth] = useState<HealthCheck | null>(null);
  const [healthLoading, setHealthLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema) as any,
    defaultValues: {
      nome: user?.nome || '',
      email: user?.email || '',
      telefone: user?.telefone || '',
    },
  });

  const fetchHealth = useCallback(async () => {
    try {
      setHealthLoading(true);
      const response = await api.get<HealthCheck>('/metrics/health');
      setHealth(response.data);
    } catch (error) {
      console.error('Erro ao buscar health:', error);
    } finally {
      setHealthLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHealth();
  }, [fetchHealth]);

  const onSubmit = async (formData: ProfileFormData) => {
    try {
      setSaving(true);
      setSaveSuccess(false);
      if (user?.id) {
        await api.patch(`/users/${user.id}`, formData);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
    } finally {
      setSaving(false);
    }
  };

  const cargoLabel = user?.cargo === 'admin' ? 'Administrador' : user?.cargo === 'gerente' ? 'Gerente' : 'Vendedor';

  return (
    <div>
      <PageHeader
        title="Configurações"
        subtitle="Gerencie seu perfil e visualize o status do sistema"
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Profile Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Meu Perfil
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xl">
                {user?.nome?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">{user?.nome}</h3>
                <div className="flex items-center gap-2">
                  <Badge variant={user?.cargo === 'admin' ? 'error' : user?.cargo === 'gerente' ? 'warning' : 'success'}>
                    <span className="flex items-center gap-1">
                      <Shield className="h-3 w-3" />
                      {cargoLabel}
                    </span>
                  </Badge>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input label="Nome" error={errors.nome?.message} {...register('nome')} />
              <Input label="Email" type="email" error={errors.email?.message} {...register('email')} />
              <Input label="Telefone" {...register('telefone')} />
              <div className="flex items-center gap-3 pt-2">
                <Button type="submit" loading={saving} leftIcon={<Save className="h-4 w-4" />}>
                  Salvar Alterações
                </Button>
                {saveSuccess && (
                  <span className="flex items-center gap-1 text-sm text-green-500">
                    <CheckCircle className="h-4 w-4" /> Salvo!
                  </span>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        {/* System Health */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Server className="h-5 w-5 text-primary" />
                  Status do Sistema
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={fetchHealth} leftIcon={<RefreshCw className="h-4 w-4" />}>
                  Atualizar
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {healthLoading ? (
                <div className="space-y-3">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-10 animate-pulse rounded bg-muted" />
                  ))}
                </div>
              ) : health ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <span className="text-sm text-muted-foreground">Status Geral</span>
                    <Badge variant={health.status === 'healthy' ? 'success' : 'error'}>
                      <span className="flex items-center gap-1">
                        {health.status === 'healthy' ? <CheckCircle className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                        {health.status === 'healthy' ? 'Saudável' : 'Degradado'}
                      </span>
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <span className="text-sm text-muted-foreground flex items-center gap-2">
                      <Database className="h-4 w-4" /> Banco de Dados
                    </span>
                    <div className="text-right">
                      <Badge variant={health.database?.status === 'healthy' ? 'success' : 'error'}>
                        {health.database?.status === 'healthy' ? 'Online' : 'Offline'}
                      </Badge>
                      {health.database?.responseTime && (
                        <p className="text-xs text-muted-foreground mt-1">{health.database.responseTime}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <span className="text-sm text-muted-foreground">Uptime</span>
                    <span className="text-sm font-medium text-foreground">{health.uptime}</span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <span className="text-sm text-muted-foreground">Ambiente</span>
                    <Badge variant="info">{health.environment}</Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <span className="text-sm text-muted-foreground">Node.js</span>
                    <span className="text-sm font-mono text-foreground">{health.nodeVersion}</span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <span className="text-sm text-muted-foreground">Tempo de Resposta</span>
                    <span className="text-sm font-medium text-foreground">{health.responseTime}</span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                  <AlertCircle className="h-8 w-8 mb-2 text-red-500" />
                  <p className="text-sm">Não foi possível verificar o status</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Memory Usage */}
          {health?.memory && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Database className="h-4 w-4 text-primary" />
                  Uso de Memória
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { label: 'RSS', value: health.memory.rss },
                    { label: 'Heap Total', value: health.memory.heapTotal },
                    { label: 'Heap Usado', value: health.memory.heapUsed },
                    { label: 'External', value: health.memory.external },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">{item.label}</span>
                      <span className="text-xs font-mono text-foreground">{item.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* System Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Settings className="h-4 w-4 text-primary" />
                Informações do Sistema
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Backend</span>
                  <span className="font-mono text-foreground">NestJS 11</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Frontend</span>
                  <span className="font-mono text-foreground">Next.js 16</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Database</span>
                  <span className="font-mono text-foreground">PostgreSQL 16</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Cache</span>
                  <span className="font-mono text-foreground">Redis 7</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ORM</span>
                  <span className="font-mono text-foreground">TypeORM 0.3</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
