'use client';

import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Shield,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';
import {
  Button,
  Input,
  Select,
  Modal,
  Badge,
  Table,
  Pagination,
} from '@/components/ui';
import { PageHeader } from '@/components/layout';
import api from '@/lib/api';
import { formatDate, formatPhone } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import type { User, PaginatedResponse } from '@/types';

const createUserSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  senha: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres')
    .regex(/[A-Z]/, 'Senha deve conter uma letra maiúscula')
    .regex(/[a-z]/, 'Senha deve conter uma letra minúscula')
    .regex(/[0-9]/, 'Senha deve conter um número'),
  cargo: z.enum(['admin', 'gerente', 'vendedor']),
  telefone: z.string().optional(),
  ativo: z.coerce.boolean().optional(),
});

const editUserSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  cargo: z.enum(['admin', 'gerente', 'vendedor']),
  telefone: z.string().optional(),
  ativo: z.coerce.boolean().optional(),
});

type CreateUserFormData = z.infer<typeof createUserSchema>;
type EditUserFormData = z.infer<typeof editUserSchema>;

const cargoLabels: Record<string, string> = {
  admin: 'Administrador',
  gerente: 'Gerente',
  vendedor: 'Vendedor',
};

const cargoVariants: Record<string, 'default' | 'info' | 'warning' | 'success' | 'error'> = {
  admin: 'error',
  gerente: 'warning',
  vendedor: 'success',
};

const cargoOptions = [
  { value: 'admin', label: 'Administrador' },
  { value: 'gerente', label: 'Gerente' },
  { value: 'vendedor', label: 'Vendedor' },
];

export default function EquipePage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isEditing = !!selectedUser;
  const schema = isEditing ? editUserSchema : createUserSchema;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateUserFormData>({
    resolver: zodResolver(schema) as any,
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const params: Record<string, string | number> = { page, limit: 10 };
      if (debouncedSearch) params.search = debouncedSearch;
      const { data } = await api.get<PaginatedResponse<User>>('/users', { params });
      setUsers(data.data);
      setTotalPages(data.meta.totalPages);
      setTotal(data.meta.total);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const openCreateModal = () => {
    setSelectedUser(null);
    reset({
      nome: '',
      email: '',
      senha: '',
      cargo: 'vendedor',
      telefone: '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (user: User) => {
    setSelectedUser(user);
    reset({
      nome: user.nome,
      email: user.email,
      senha: '',
      cargo: user.cargo,
      telefone: user.telefone || '',
    });
    setIsModalOpen(true);
  };

  const openDeleteModal = (user: User) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  const onSubmit = async (formData: CreateUserFormData | EditUserFormData) => {
    try {
      setSaving(true);
      if (selectedUser) {
        const { ...payload } = formData as EditUserFormData;
        await api.patch(`/users/${selectedUser.id}`, payload);
      } else {
        await api.post('/users', formData);
      }
      setIsModalOpen(false);
      fetchUsers();
    } catch (error: any) {
      console.error('Erro ao salvar usuário:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedUser) return;
    try {
      setDeleting(true);
      await api.delete(`/users/${selectedUser.id}`);
      setIsDeleteModalOpen(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (error) {
      console.error('Erro ao excluir usuário:', error);
    } finally {
      setDeleting(false);
    }
  };

  const getCargoIcon = (cargo: string) => {
    switch (cargo) {
      case 'admin': return <Shield className="h-4 w-4" />;
      case 'gerente': return <ShieldCheck className="h-4 w-4" />;
      default: return <UserCheck className="h-4 w-4" />;
    }
  };

  const columns = [
    {
      key: 'nome',
      title: 'Nome',
      render: (user: User) => (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-sm">
            {user.nome.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
          </div>
          <div>
            <p className="font-medium text-foreground">{user.nome}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'cargo',
      title: 'Cargo',
      render: (user: User) => (
        <Badge variant={cargoVariants[user.cargo] || 'default'}>
          <span className="flex items-center gap-1">
            {getCargoIcon(user.cargo)}
            {cargoLabels[user.cargo] || user.cargo}
          </span>
        </Badge>
      ),
    },
    {
      key: 'telefone',
      title: 'Telefone',
      render: (user: User) => (
        <span className="text-muted-foreground">
          {user.telefone ? formatPhone(user.telefone) : '—'}
        </span>
      ),
    },
    {
      key: 'ativo',
      title: 'Status',
      render: (user: User) => (
        <Badge variant={user.ativo ? 'success' : 'error'}>
          {user.ativo ? 'Ativo' : 'Inativo'}
        </Badge>
      ),
    },
    {
      key: 'criadoEm',
      title: 'Criado em',
      render: (user: User) => (
        <span className="text-muted-foreground">{formatDate(user.criadoEm)}</span>
      ),
    },
    {
      key: 'acoes',
      title: '',
      className: 'w-20',
      render: (user: User) => (
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); openEditModal(user); }}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <Pencil className="h-4 w-4" />
          </button>
          {user.id !== currentUser?.id && (
            <button
              onClick={(e) => { e.stopPropagation(); openDeleteModal(user); }}
              className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Equipe"
        subtitle="Gerencie os membros da sua equipe e permissões"
        actions={
          <Button leftIcon={<Plus className="h-4 w-4" />} onClick={openCreateModal}>
            Novo Membro
          </Button>
        }
      />

      <div className="mb-6">
        <Input
          placeholder="Buscar membros..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          leftIcon={<Search className="h-4 w-4" />}
          className="max-w-sm"
        />
      </div>

      <Table columns={columns} data={users} loading={loading} emptyMessage="Nenhum membro encontrado" />
      <Pagination page={page} totalPages={totalPages} total={total} onPageChange={setPage} />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedUser ? 'Editar Membro' : 'Novo Membro'}
        size="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Nome *" error={errors.nome?.message} {...register('nome')} />
            <Input label="Email *" type="email" error={errors.email?.message} {...register('email')} />
          </div>
          {!selectedUser && (
            <Input
              label="Senha *"
              type="password"
              error={errors.senha?.message}
              hint="Mínimo 8 caracteres, maiúscula, minúscula e número"
              {...register('senha')}
            />
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <Select label="Cargo *" options={cargoOptions} {...register('cargo')} />
            <Input label="Telefone" {...register('telefone')} />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" loading={saving}>
              {selectedUser ? 'Salvar Alterações' : 'Criar Membro'}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Excluir Membro"
        size="sm"
      >
        <p className="text-sm text-muted-foreground">
          Tem certeza que deseja excluir{' '}
          <strong className="text-foreground">{selectedUser?.nome}</strong>?
          Esta ação não pode ser desfeita.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>Cancelar</Button>
          <Button variant="destructive" onClick={handleDelete} loading={deleting}>Excluir</Button>
        </div>
      </Modal>
    </div>
  );
}
