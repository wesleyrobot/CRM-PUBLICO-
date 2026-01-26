'use client';

import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Users,
  Plus,
  Search,
  Pencil,
  Trash2,
} from 'lucide-react';
import {
  Button,
  Input,
  Modal,
  Badge,
  Table,
  Pagination,
} from '@/components/ui';
import { PageHeader } from '@/components/layout';
import api from '@/lib/api';
import { formatPhone, formatDate } from '@/lib/utils';
import type { Client, PaginatedResponse } from '@/types';

const clientSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  telefone: z.string().optional(),
  celular: z.string().optional(),
  cargo: z.string().optional(),
  departamento: z.string().optional(),
  dataNascimento: z.string().optional(),
  observacoes: z.string().optional(),
});

type ClientFormData = z.infer<typeof clientSchema>;

export default function ClientesPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchClients = useCallback(async () => {
    try {
      setLoading(true);
      const params: Record<string, string | number> = { page, limit: 10 };
      if (debouncedSearch) params.search = debouncedSearch;
      const { data } = await api.get<PaginatedResponse<Client>>('/clients', { params });
      setClients(data.data);
      setTotalPages(data.meta.totalPages);
      setTotal(data.meta.total);
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const openCreateModal = () => {
    setSelectedClient(null);
    reset({
      nome: '',
      email: '',
      telefone: '',
      celular: '',
      cargo: '',
      departamento: '',
      dataNascimento: '',
      observacoes: '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (client: Client) => {
    setSelectedClient(client);
    reset({
      nome: client.nome,
      email: client.email || '',
      telefone: client.telefone || '',
      celular: client.celular || '',
      cargo: client.cargo || '',
      departamento: client.departamento || '',
      dataNascimento: client.dataNascimento || '',
      observacoes: client.observacoes || '',
    });
    setIsModalOpen(true);
  };

  const openDeleteModal = (client: Client) => {
    setSelectedClient(client);
    setIsDeleteModalOpen(true);
  };

  const onSubmit = async (formData: ClientFormData) => {
    try {
      setSaving(true);
      const payload = { ...formData };
      if (payload.email === '') delete (payload as Record<string, unknown>).email;
      if (payload.dataNascimento === '') delete (payload as Record<string, unknown>).dataNascimento;
      if (selectedClient) {
        await api.patch(`/clients/${selectedClient.id}`, payload);
      } else {
        await api.post('/clients', payload);
      }
      setIsModalOpen(false);
      fetchClients();
    } catch (error) {
      console.error('Erro ao salvar cliente:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedClient) return;
    try {
      setDeleting(true);
      await api.delete(`/clients/${selectedClient.id}`);
      setIsDeleteModalOpen(false);
      setSelectedClient(null);
      fetchClients();
    } catch (error) {
      console.error('Erro ao excluir cliente:', error);
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    {
      key: 'nome',
      title: 'Nome',
      render: (client: Client) => (
        <div>
          <p className="font-medium text-foreground">{client.nome}</p>
          {client.email && (
            <p className="text-xs text-muted-foreground">{client.email}</p>
          )}
        </div>
      ),
    },
    {
      key: 'telefone',
      title: 'Telefone',
      render: (client: Client) => (
        <span className="text-muted-foreground">
          {client.telefone ? formatPhone(client.telefone) : '—'}
        </span>
      ),
    },
    {
      key: 'celular',
      title: 'Celular',
      render: (client: Client) => (
        <span className="text-muted-foreground">
          {client.celular ? formatPhone(client.celular) : '—'}
        </span>
      ),
    },
    {
      key: 'cargo',
      title: 'Cargo',
      render: (client: Client) => (
        <span className="text-muted-foreground">{client.cargo || '—'}</span>
      ),
    },
    {
      key: 'departamento',
      title: 'Departamento',
      render: (client: Client) => (
        <span className="text-muted-foreground">{client.departamento || '—'}</span>
      ),
    },
    {
      key: 'ativo',
      title: 'Status',
      render: (client: Client) => (
        <Badge variant={client.ativo ? 'success' : 'error'}>
          {client.ativo ? 'Ativo' : 'Inativo'}
        </Badge>
      ),
    },
    {
      key: 'criadoEm',
      title: 'Criado em',
      render: (client: Client) => (
        <span className="text-muted-foreground">{formatDate(client.criadoEm)}</span>
      ),
    },
    {
      key: 'acoes',
      title: '',
      className: 'w-20',
      render: (client: Client) => (
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              openEditModal(client);
            }}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              openDeleteModal(client);
            }}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Clientes"
        subtitle="Gerencie sua base de clientes"
        actions={
          <Button leftIcon={<Plus className="h-4 w-4" />} onClick={openCreateModal}>
            Novo Cliente
          </Button>
        }
      />

      <div className="mb-6">
        <Input
          placeholder="Buscar clientes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          leftIcon={<Search className="h-4 w-4" />}
          className="max-w-sm"
        />
      </div>

      <Table columns={columns} data={clients} loading={loading} emptyMessage="Nenhum cliente encontrado" />

      <Pagination page={page} totalPages={totalPages} total={total} onPageChange={setPage} />

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedClient ? 'Editar Cliente' : 'Novo Cliente'}
        size="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Nome *"
              error={errors.nome?.message}
              {...register('nome')}
            />
            <Input
              label="Email"
              type="email"
              error={errors.email?.message}
              {...register('email')}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Telefone"
              {...register('telefone')}
            />
            <Input
              label="Celular"
              {...register('celular')}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Cargo"
              {...register('cargo')}
            />
            <Input
              label="Departamento"
              {...register('departamento')}
            />
          </div>
          <Input
            label="Data de Nascimento"
            type="date"
            {...register('dataNascimento')}
          />
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Observações
            </label>
            <textarea
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              {...register('observacoes')}
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" loading={saving}>
              {selectedClient ? 'Salvar Alterações' : 'Criar Cliente'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Excluir Cliente"
        size="sm"
      >
        <p className="text-sm text-muted-foreground">
          Tem certeza que deseja excluir o cliente{' '}
          <strong className="text-foreground">{selectedClient?.nome}</strong>?
          Esta ação não pode ser desfeita.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => setIsDeleteModalOpen(false)}
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            loading={deleting}
          >
            Excluir
          </Button>
        </div>
      </Modal>
    </div>
  );
}
