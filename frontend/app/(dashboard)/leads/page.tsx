'use client';

import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  UserPlus,
  Plus,
  Search,
  Pencil,
  Trash2,
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
import type { Lead, PaginatedResponse } from '@/types';

const leadSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  telefone: z.string().optional(),
  cargo: z.string().optional(),
  status: z.enum(['novo', 'em_contato', 'qualificado', 'perdido']).optional(),
  origem: z.string().optional(),
  observacoes: z.string().optional(),
  pontuacao: z.coerce.number().optional(),
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
  { value: 'site', label: 'Site' },
  { value: 'indicacao', label: 'Indicação' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'google', label: 'Google' },
  { value: 'evento', label: 'Evento' },
  { value: 'cold_call', label: 'Cold Call' },
  { value: 'outro', label: 'Outro' },
];

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LeadFormData>({
    resolver: zodResolver(leadSchema),
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchLeads = useCallback(async () => {
    try {
      setLoading(true);
      const params: Record<string, string | number> = { page, limit: 10 };
      if (debouncedSearch) params.search = debouncedSearch;
      const { data } = await api.get<PaginatedResponse<Lead>>('/leads', { params });
      setLeads(data.data);
      setTotalPages(data.meta.totalPages);
      setTotal(data.meta.total);
    } catch (error) {
      console.error('Erro ao buscar leads:', error);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const openCreateModal = () => {
    setSelectedLead(null);
    reset({
      nome: '',
      email: '',
      telefone: '',
      cargo: '',
      status: 'novo',
      origem: '',
      observacoes: '',
      pontuacao: 0,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (lead: Lead) => {
    setSelectedLead(lead);
    reset({
      nome: lead.nome,
      email: lead.email || '',
      telefone: lead.telefone || '',
      cargo: lead.cargo || '',
      status: lead.status,
      origem: lead.origem || '',
      observacoes: lead.observacoes || '',
      pontuacao: lead.pontuacao,
    });
    setIsModalOpen(true);
  };

  const openDeleteModal = (lead: Lead) => {
    setSelectedLead(lead);
    setIsDeleteModalOpen(true);
  };

  const onSubmit = async (formData: LeadFormData) => {
    try {
      setSaving(true);
      const payload = { ...formData };
      if (payload.email === '') delete (payload as Record<string, unknown>).email;
      if (selectedLead) {
        await api.patch(`/leads/${selectedLead.id}`, payload);
      } else {
        await api.post('/leads', payload);
      }
      setIsModalOpen(false);
      fetchLeads();
    } catch (error) {
      console.error('Erro ao salvar lead:', error);
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

  const columns = [
    {
      key: 'nome',
      title: 'Nome',
      render: (lead: Lead) => (
        <div>
          <p className="font-medium text-foreground">{lead.nome}</p>
          {lead.email && (
            <p className="text-xs text-muted-foreground">{lead.email}</p>
          )}
        </div>
      ),
    },
    {
      key: 'telefone',
      title: 'Telefone',
      render: (lead: Lead) => (
        <span className="text-muted-foreground">
          {lead.telefone ? formatPhone(lead.telefone) : '—'}
        </span>
      ),
    },
    {
      key: 'cargo',
      title: 'Cargo',
      render: (lead: Lead) => (
        <span className="text-muted-foreground">{lead.cargo || '—'}</span>
      ),
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
      title: 'Pontuação',
      render: (lead: Lead) => (
        <span className="font-medium text-foreground">{lead.pontuacao}</span>
      ),
    },
    {
      key: 'status',
      title: 'Status',
      render: (lead: Lead) => (
        <Badge variant={statusVariants[lead.status] || 'default'}>
          {statusLabels[lead.status] || lead.status}
        </Badge>
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
            onClick={(e) => {
              e.stopPropagation();
              openEditModal(lead);
            }}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              openDeleteModal(lead);
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
        title="Leads"
        subtitle="Gerencie seus leads e oportunidades de negócio"
        actions={
          <Button leftIcon={<Plus className="h-4 w-4" />} onClick={openCreateModal}>
            Novo Lead
          </Button>
        }
      />

      <div className="mb-6">
        <Input
          placeholder="Buscar leads..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          leftIcon={<Search className="h-4 w-4" />}
          className="max-w-sm"
        />
      </div>

      <Table columns={columns} data={leads} loading={loading} emptyMessage="Nenhum lead encontrado" />

      <Pagination page={page} totalPages={totalPages} total={total} onPageChange={setPage} />

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedLead ? 'Editar Lead' : 'Novo Lead'}
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
              label="Cargo"
              {...register('cargo')}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <Select
              label="Status"
              options={statusOptions}
              {...register('status')}
            />
            <Select
              label="Origem"
              options={origemOptions}
              placeholder="Selecione"
              {...register('origem')}
            />
            <Input
              label="Pontuação"
              type="number"
              {...register('pontuacao')}
            />
          </div>
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
              {selectedLead ? 'Salvar Alterações' : 'Criar Lead'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Excluir Lead"
        size="sm"
      >
        <p className="text-sm text-muted-foreground">
          Tem certeza que deseja excluir o lead{' '}
          <strong className="text-foreground">{selectedLead?.nome}</strong>?
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
