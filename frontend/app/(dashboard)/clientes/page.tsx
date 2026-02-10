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
  Building2,
  User,
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
import { formatPhone, formatDate } from '@/lib/utils';
import type { Client, Company, User as UserType, PaginatedResponse } from '@/types';

const clientSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  telefone: z.string().optional(),
  celular: z.string().optional(),
  cargo: z.string().optional(),
  departamento: z.string().optional(),
  dataNascimento: z.string().optional(),
  observacoes: z.string().optional(),
  empresaId: z.string().optional(),
  responsavelId: z.string().optional(),
});

type ClientFormData = z.infer<typeof clientSchema>;

const ativoFilterOptions = [
  { value: '', label: 'Todos' },
  { value: 'true', label: 'Ativos' },
  { value: 'false', label: 'Inativos' },
];

export default function ClientesPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [ativoFilter, setAtivoFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema) as any,
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const [compRes, usersRes] = await Promise.all([
          api.get('/companies', { params: { limit: 100 } }),
          api.get('/users', { params: { limit: 100 } }),
        ]);
        setCompanies(compRes.data.data || []);
        setUsers(usersRes.data.data || []);
      } catch (error) {
        console.error('Erro ao buscar dados auxiliares:', error);
      }
    };
    fetchDropdownData();
  }, []);

  const fetchClients = useCallback(async () => {
    try {
      setLoading(true);
      const params: Record<string, string | number> = { page, limit: 10 };
      if (debouncedSearch) params.search = debouncedSearch;
      if (ativoFilter) params.ativo = ativoFilter;
      const { data } = await api.get<PaginatedResponse<Client>>('/clients', { params });
      setClients(data.data);
      setTotalPages(data.meta.totalPages);
      setTotal(data.meta.total);
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, ativoFilter]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const companyOptions = [
    { value: '', label: 'Sem empresa' },
    ...companies.map(c => ({ value: c.id, label: c.nomeFantasia || c.razaoSocial })),
  ];

  const userOptions = [
    { value: '', label: 'Sem responsável' },
    ...users.map(u => ({ value: u.id, label: u.nome })),
  ];

  const getCompanyName = (empresaId?: string) => {
    if (!empresaId) return null;
    const c = companies.find(c => c.id === empresaId);
    return c ? (c.nomeFantasia || c.razaoSocial) : null;
  };

  const getResponsavelName = (responsavelId?: string) => {
    if (!responsavelId) return null;
    const u = users.find(u => u.id === responsavelId);
    return u ? u.nome : null;
  };

  const openCreateModal = () => {
    setSelectedClient(null);
    setErrorMsg('');
    reset({
      nome: '', email: '', telefone: '', celular: '',
      cargo: '', departamento: '', dataNascimento: '', observacoes: '',
      empresaId: '', responsavelId: '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (client: Client) => {
    setSelectedClient(client);
    setErrorMsg('');
    reset({
      nome: client.nome, email: client.email || '', telefone: client.telefone || '',
      celular: client.celular || '', cargo: client.cargo || '',
      departamento: client.departamento || '',
      dataNascimento: client.dataNascimento ? client.dataNascimento.split('T')[0] : '',
      observacoes: client.observacoes || '',
      empresaId: client.empresaId || '', responsavelId: client.responsavelId || '',
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
      setErrorMsg('');
      const payload: Record<string, unknown> = { ...formData };
      if (payload.email === '') delete payload.email;
      if (payload.dataNascimento === '') delete payload.dataNascimento;
      if (payload.empresaId === '') delete payload.empresaId;
      if (payload.responsavelId === '') delete payload.responsavelId;
      if (selectedClient) {
        await api.patch(`/clients/${selectedClient.id}`, payload);
      } else {
        await api.post('/clients', payload);
      }
      setIsModalOpen(false);
      fetchClients();
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Erro ao salvar cliente';
      setErrorMsg(typeof msg === 'string' ? msg : JSON.stringify(msg));
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
          {client.email && <p className="text-xs text-muted-foreground">{client.email}</p>}
        </div>
      ),
    },
    {
      key: 'empresa',
      title: 'Empresa',
      render: (client: Client) => {
        const name = getCompanyName(client.empresaId);
        return name ? (
          <span className="text-muted-foreground flex items-center gap-1">
            <Building2 className="h-3 w-3" /> {name}
          </span>
        ) : <span className="text-muted-foreground">—</span>;
      },
    },
    {
      key: 'responsavel',
      title: 'Responsável',
      render: (client: Client) => {
        const name = getResponsavelName(client.responsavelId);
        return name ? (
          <span className="text-muted-foreground flex items-center gap-1">
            <User className="h-3 w-3" /> {name}
          </span>
        ) : <span className="text-muted-foreground">—</span>;
      },
    },
    {
      key: 'telefone',
      title: 'Telefone',
      render: (client: Client) => (
        <span className="text-muted-foreground">
          {client.telefone ? formatPhone(client.telefone) : client.celular ? formatPhone(client.celular) : '—'}
        </span>
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
            onClick={(e) => { e.stopPropagation(); openEditModal(client); }}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); openDeleteModal(client); }}
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
        subtitle={`Gerencie sua base de clientes · ${total} clientes`}
        actions={
          <Button leftIcon={<Plus className="h-4 w-4" />} onClick={openCreateModal}>
            Novo Cliente
          </Button>
        }
      />

      <div className="flex gap-4 mb-6">
        <Input
          placeholder="Buscar clientes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          leftIcon={<Search className="h-4 w-4" />}
          className="max-w-sm"
        />
        <Select
          options={ativoFilterOptions}
          value={ativoFilter}
          onChange={(e) => { setAtivoFilter(e.target.value); setPage(1); }}
          className="w-40"
        />
      </div>

      <Table columns={columns} data={clients} loading={loading} emptyMessage="Nenhum cliente encontrado" />
      <Pagination page={page} totalPages={totalPages} total={total} onPageChange={setPage} />

      {/* Create/Edit Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={selectedClient ? 'Editar Cliente' : 'Novo Cliente'} size="lg">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {errorMsg && (
            <div className="rounded-md bg-destructive/10 border border-destructive/30 px-4 py-2 text-sm text-destructive">
              {errorMsg}
            </div>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Nome *" error={errors.nome?.message} {...register('nome')} />
            <Input label="Email" type="email" error={errors.email?.message} {...register('email')} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Telefone" {...register('telefone')} />
            <Input label="Celular" {...register('celular')} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Cargo" {...register('cargo')} />
            <Input label="Departamento" {...register('departamento')} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Select label="Empresa" options={companyOptions} {...register('empresaId')} />
            <Select label="Responsável" options={userOptions} {...register('responsavelId')} />
          </div>
          <Input label="Data de Nascimento" type="date" {...register('dataNascimento')} />
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Observações</label>
            <textarea
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              {...register('observacoes')}
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button type="submit" loading={saving}>{selectedClient ? 'Salvar Alterações' : 'Criar Cliente'}</Button>
          </div>
        </form>
      </Modal>

      {/* Delete Modal */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Excluir Cliente" size="sm">
        <p className="text-sm text-muted-foreground">
          Tem certeza que deseja excluir o cliente{' '}
          <strong className="text-foreground">{selectedClient?.nome}</strong>? Esta ação não pode ser desfeita.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>Cancelar</Button>
          <Button variant="destructive" onClick={handleDelete} loading={deleting}>Excluir</Button>
        </div>
      </Modal>
    </div>
  );
}
