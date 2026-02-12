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
  ArrowRightLeft,
  Filter,
  Upload,
} from 'lucide-react';
import Link from 'next/link';
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
import type { Lead, Company, User as UserType, PaginatedResponse } from '@/types';

const leadSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  telefone: z.string().optional(),
  cargo: z.string().optional(),
  status: z.enum(['novo', 'em_contato', 'qualificado', 'perdido']).optional(),
  origem: z.string().optional(),
  observacoes: z.string().optional(),
  pontuacao: z.coerce.number().optional(),
  empresaId: z.string().optional(),
  responsavelId: z.string().optional(),
});

type LeadFormData = z.infer<typeof leadSchema>;

const statusLabels: Record<string, string> = {
  novo: 'Novo',
  em_contato: 'Em Contato',
  qualificado: 'Qualificado',
  perdido: 'Perdido',
};

const statusVariants: Record<string, 'default' | 'info' | 'warning' | 'success' | 'error'> = {
  novo: 'info',
  em_contato: 'warning',
  qualificado: 'success',
  perdido: 'error',
};

const statusOptions = [
  { value: 'novo', label: 'Novo' },
  { value: 'em_contato', label: 'Em Contato' },
  { value: 'qualificado', label: 'Qualificado' },
  { value: 'perdido', label: 'Perdido' },
];

const origemOptions = [
  { value: '', label: 'Selecione' },
  { value: 'site', label: 'Site' },
  { value: 'indicacao', label: 'Indicação' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'google', label: 'Google' },
  { value: 'evento', label: 'Evento' },
  { value: 'cold_call', label: 'Cold Call' },
  { value: 'outro', label: 'Outro' },
];

const statusFilterOptions = [
  { value: '', label: 'Todos os status' },
  { value: 'novo', label: 'Novo' },
  { value: 'em_contato', label: 'Em Contato' },
  { value: 'qualificado', label: 'Qualificado' },
  { value: 'perdido', label: 'Perdido' },
];

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LeadFormData>({
    resolver: zodResolver(leadSchema) as any,
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch companies and users for dropdowns
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

  const fetchLeads = useCallback(async () => {
    try {
      setLoading(true);
      const params: Record<string, string | number> = { page, limit: 10 };
      if (debouncedSearch) params.search = debouncedSearch;
      if (statusFilter) params.status = statusFilter;
      const { data } = await api.get<PaginatedResponse<Lead>>('/leads', { params });
      setLeads(data.data);
      setTotalPages(data.meta.totalPages);
      setTotal(data.meta.total);
    } catch (error) {
      console.error('Erro ao buscar leads:', error);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, statusFilter]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

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
    setSelectedLead(null);
    setErrorMsg('');
    reset({
      nome: '', email: '', telefone: '', cargo: '',
      status: 'novo', origem: '', observacoes: '', pontuacao: 0,
      empresaId: '', responsavelId: '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (lead: Lead) => {
    setSelectedLead(lead);
    setErrorMsg('');
    reset({
      nome: lead.nome, email: lead.email || '', telefone: lead.telefone || '',
      cargo: lead.cargo || '', status: lead.status, origem: lead.origem || '',
      observacoes: lead.observacoes || '', pontuacao: lead.pontuacao,
      empresaId: lead.empresaId || '', responsavelId: lead.responsavelId || '',
    });
    setIsModalOpen(true);
  };

  const openDeleteModal = (lead: Lead) => {
    setSelectedLead(lead);
    setIsDeleteModalOpen(true);
  };

  const openStatusModal = (lead: Lead) => {
    setSelectedLead(lead);
    setIsStatusModalOpen(true);
  };

  const onSubmit = async (formData: LeadFormData) => {
    try {
      setSaving(true);
      setErrorMsg('');
      const payload: Record<string, unknown> = { ...formData };
      if (payload.email === '') delete payload.email;
      if (payload.empresaId === '') delete payload.empresaId;
      if (payload.responsavelId === '') delete payload.responsavelId;
      if (payload.origem === '') delete payload.origem;
      if (selectedLead) {
        await api.patch(`/leads/${selectedLead.id}`, payload);
      } else {
        await api.post('/leads', payload);
      }
      setIsModalOpen(false);
      fetchLeads();
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Erro ao salvar lead';
      setErrorMsg(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedLead) return;
    try {
      setDeleting(true);
      await api.delete(`/leads/${selectedLead.id}`);
      setIsDeleteModalOpen(false);
      setSelectedLead(null);
      fetchLeads();
    } catch (error) {
      console.error('Erro ao excluir lead:', error);
    } finally {
      setDeleting(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!selectedLead) return;
    try {
      await api.patch(`/leads/${selectedLead.id}`, { status: newStatus });
      setIsStatusModalOpen(false);
      setSelectedLead(null);
      fetchLeads();
    } catch (error) {
      console.error('Erro ao alterar status:', error);
    }
  };

  const columns = [
    {
      key: 'nome',
      title: 'Nome',
      render: (lead: Lead) => (
        <div>
          <p className="font-medium text-foreground">{lead.nome}</p>
          {lead.email && <p className="text-xs text-muted-foreground">{lead.email}</p>}
        </div>
      ),
    },
    {
      key: 'empresa',
      title: 'Empresa',
      render: (lead: Lead) => {
        const name = getCompanyName(lead.empresaId);
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
      render: (lead: Lead) => {
        const name = getResponsavelName(lead.responsavelId);
        return name ? (
          <span className="text-muted-foreground flex items-center gap-1">
            <User className="h-3 w-3" /> {name}
          </span>
        ) : <span className="text-muted-foreground">—</span>;
      },
    },
    {
      key: 'origem',
      title: 'Origem',
      render: (lead: Lead) => (
        <span className="text-muted-foreground">{lead.origem || '—'}</span>
      ),
    },
    {
      key: 'pontuacao',
      title: 'Score',
      render: (lead: Lead) => (
        <span className="font-medium text-foreground">{lead.pontuacao}</span>
      ),
    },
    {
      key: 'status',
      title: 'Status',
      render: (lead: Lead) => (
        <button onClick={(e) => { e.stopPropagation(); openStatusModal(lead); }}>
          <Badge variant={statusVariants[lead.status] || 'default'}>
            {statusLabels[lead.status] || lead.status}
          </Badge>
        </button>
      ),
    },
    {
      key: 'criadoEm',
      title: 'Criado em',
      render: (lead: Lead) => (
        <span className="text-muted-foreground">{formatDate(lead.criadoEm)}</span>
      ),
    },
    {
      key: 'acoes',
      title: '',
      className: 'w-20',
      render: (lead: Lead) => (
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); openEditModal(lead); }}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); openDeleteModal(lead); }}
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
        title="Leads"
        subtitle={`Gerencie seus leads e oportunidades de negócio · ${total} leads`}
        actions={
          <div className="flex gap-3">
            <Link href="/leads/import">
              <Button variant="outline" leftIcon={<Upload className="h-4 w-4" />}>
                Importar Excel
              </Button>
            </Link>
            <Button leftIcon={<Plus className="h-4 w-4" />} onClick={openCreateModal}>
              Novo Lead
            </Button>
          </div>
        }
      />

      <div className="flex gap-4 mb-6">
        <Input
          placeholder="Buscar leads..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          leftIcon={<Search className="h-4 w-4" />}
          className="max-w-sm"
        />
        <Select
          options={statusFilterOptions}
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="w-48"
        />
      </div>

      <Table columns={columns} data={leads} loading={loading} emptyMessage="Nenhum lead encontrado" />
      <Pagination page={page} totalPages={totalPages} total={total} onPageChange={setPage} />

      {/* Create/Edit Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={selectedLead ? 'Editar Lead' : 'Novo Lead'} size="lg">
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
            <Input label="Cargo" {...register('cargo')} />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <Select label="Status" options={statusOptions} {...register('status')} />
            <Select label="Origem" options={origemOptions} {...register('origem')} />
            <Input label="Pontuação" type="number" {...register('pontuacao')} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Select label="Empresa" options={companyOptions} {...register('empresaId')} />
            <Select label="Responsável" options={userOptions} {...register('responsavelId')} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Observações</label>
            <textarea
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              {...register('observacoes')}
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button type="submit" loading={saving}>{selectedLead ? 'Salvar Alterações' : 'Criar Lead'}</Button>
          </div>
        </form>
      </Modal>

      {/* Status Change Modal */}
      <Modal isOpen={isStatusModalOpen} onClose={() => setIsStatusModalOpen(false)} title="Alterar Status" size="sm">
        <p className="text-sm text-muted-foreground mb-4">
          Alterar status de <strong className="text-foreground">{selectedLead?.nome}</strong>:
        </p>
        <div className="grid grid-cols-2 gap-2">
          {statusOptions.map(opt => (
            <button
              key={opt.value}
              onClick={() => handleStatusChange(opt.value)}
              disabled={selectedLead?.status === opt.value}
              className={`rounded-lg border p-3 text-sm font-medium transition-colors ${
                selectedLead?.status === opt.value
                  ? 'border-primary bg-primary/10 text-primary cursor-default'
                  : 'border-border hover:border-primary/50 hover:bg-accent text-foreground'
              }`}
            >
              <Badge variant={statusVariants[opt.value]}>{opt.label}</Badge>
            </button>
          ))}
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Excluir Lead" size="sm">
        <p className="text-sm text-muted-foreground">
          Tem certeza que deseja excluir o lead{' '}
          <strong className="text-foreground">{selectedLead?.nome}</strong>? Esta ação não pode ser desfeita.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>Cancelar</Button>
          <Button variant="destructive" onClick={handleDelete} loading={deleting}>Excluir</Button>
        </div>
      </Modal>
    </div>
  );
}
