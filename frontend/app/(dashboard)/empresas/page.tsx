'use client';

import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Building2,
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
import { formatCNPJ, formatPhone, formatDate } from '@/lib/utils';
import type { Company, PaginatedResponse } from '@/types';

const companySchema = z.object({
  razaoSocial: z.string().min(1, 'Razão social é obrigatória'),
  nomeFantasia: z.string().optional(),
  cnpj: z.string().optional(),
  segmento: z.string().optional(),
  website: z.string().optional(),
  telefone: z.string().optional(),
  endereco: z.string().optional(),
  cidade: z.string().optional(),
  estado: z.string().optional(),
  cep: z.string().optional(),
  funcionarios: z.coerce.number().optional(),
  faturamentoAnual: z.coerce.number().optional(),
});

type CompanyFormData = z.infer<typeof companySchema>;

const estadosBR = [
  { value: 'AC', label: 'AC' }, { value: 'AL', label: 'AL' },
  { value: 'AP', label: 'AP' }, { value: 'AM', label: 'AM' },
  { value: 'BA', label: 'BA' }, { value: 'CE', label: 'CE' },
  { value: 'DF', label: 'DF' }, { value: 'ES', label: 'ES' },
  { value: 'GO', label: 'GO' }, { value: 'MA', label: 'MA' },
  { value: 'MT', label: 'MT' }, { value: 'MS', label: 'MS' },
  { value: 'MG', label: 'MG' }, { value: 'PA', label: 'PA' },
  { value: 'PB', label: 'PB' }, { value: 'PR', label: 'PR' },
  { value: 'PE', label: 'PE' }, { value: 'PI', label: 'PI' },
  { value: 'RJ', label: 'RJ' }, { value: 'RN', label: 'RN' },
  { value: 'RS', label: 'RS' }, { value: 'RO', label: 'RO' },
  { value: 'RR', label: 'RR' }, { value: 'SC', label: 'SC' },
  { value: 'SP', label: 'SP' }, { value: 'SE', label: 'SE' },
  { value: 'TO', label: 'TO' },
];

export default function EmpresasPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CompanyFormData>({
    resolver: zodResolver(companySchema),
  });

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchCompanies = useCallback(async () => {
    try {
      setLoading(true);
      const params: Record<string, string | number> = { page, limit: 10 };
      if (debouncedSearch) params.search = debouncedSearch;
      const { data } = await api.get<PaginatedResponse<Company>>('/companies', { params });
      setCompanies(data.data);
      setTotalPages(data.meta.totalPages);
      setTotal(data.meta.total);
    } catch (error) {
      console.error('Erro ao buscar empresas:', error);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch]);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  const openCreateModal = () => {
    setSelectedCompany(null);
    reset({
      razaoSocial: '',
      nomeFantasia: '',
      cnpj: '',
      segmento: '',
      website: '',
      telefone: '',
      endereco: '',
      cidade: '',
      estado: '',
      cep: '',
      funcionarios: undefined,
      faturamentoAnual: undefined,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (company: Company) => {
    setSelectedCompany(company);
    reset({
      razaoSocial: company.razaoSocial,
      nomeFantasia: company.nomeFantasia || '',
      cnpj: company.cnpj || '',
      segmento: company.segmento || '',
      website: company.website || '',
      telefone: company.telefone || '',
      endereco: company.endereco || '',
      cidade: company.cidade || '',
      estado: company.estado || '',
      cep: company.cep || '',
      funcionarios: company.funcionarios ?? undefined,
      faturamentoAnual: company.faturamentoAnual ?? undefined,
    });
    setIsModalOpen(true);
  };

  const openDeleteModal = (company: Company) => {
    setSelectedCompany(company);
    setIsDeleteModalOpen(true);
  };

  const onSubmit = async (formData: CompanyFormData) => {
    try {
      setSaving(true);
      if (selectedCompany) {
        await api.patch(`/companies/${selectedCompany.id}`, formData);
      } else {
        await api.post('/companies', formData);
      }
      setIsModalOpen(false);
      fetchCompanies();
    } catch (error) {
      console.error('Erro ao salvar empresa:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedCompany) return;
    try {
      setDeleting(true);
      await api.delete(`/companies/${selectedCompany.id}`);
      setIsDeleteModalOpen(false);
      setSelectedCompany(null);
      fetchCompanies();
    } catch (error) {
      console.error('Erro ao excluir empresa:', error);
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    {
      key: 'razaoSocial',
      title: 'Empresa',
      render: (company: Company) => (
        <div>
          <p className="font-medium text-foreground">
            {company.nomeFantasia || company.razaoSocial}
          </p>
          {company.nomeFantasia && (
            <p className="text-xs text-muted-foreground">{company.razaoSocial}</p>
          )}
        </div>
      ),
    },
    {
      key: 'cnpj',
      title: 'CNPJ',
      render: (company: Company) => (
        <span className="text-muted-foreground">
          {company.cnpj ? formatCNPJ(company.cnpj) : '—'}
        </span>
      ),
    },
    {
      key: 'segmento',
      title: 'Segmento',
      render: (company: Company) => (
        <span className="text-muted-foreground">{company.segmento || '—'}</span>
      ),
    },
    {
      key: 'cidade',
      title: 'Cidade/UF',
      render: (company: Company) => (
        <span className="text-muted-foreground">
          {company.cidade && company.estado
            ? `${company.cidade}/${company.estado}`
            : company.cidade || company.estado || '—'}
        </span>
      ),
    },
    {
      key: 'telefone',
      title: 'Telefone',
      render: (company: Company) => (
        <span className="text-muted-foreground">
          {company.telefone ? formatPhone(company.telefone) : '—'}
        </span>
      ),
    },
    {
      key: 'ativo',
      title: 'Status',
      render: (company: Company) => (
        <Badge variant={company.ativo ? 'success' : 'error'}>
          {company.ativo ? 'Ativa' : 'Inativa'}
        </Badge>
      ),
    },
    {
      key: 'acoes',
      title: '',
      className: 'w-20',
      render: (company: Company) => (
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              openEditModal(company);
            }}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              openDeleteModal(company);
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
        title="Empresas"
        subtitle="Gerencie as empresas cadastradas"
        actions={
          <Button leftIcon={<Plus className="h-4 w-4" />} onClick={openCreateModal}>
            Nova Empresa
          </Button>
        }
      />

      {/* Search */}
      <div className="mb-6">
        <Input
          placeholder="Buscar empresas..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          leftIcon={<Search className="h-4 w-4" />}
          className="max-w-sm"
        />
      </div>

      {/* Table */}
      <Table columns={columns} data={companies} loading={loading} emptyMessage="Nenhuma empresa encontrada" />

      {/* Pagination */}
      <Pagination page={page} totalPages={totalPages} total={total} onPageChange={setPage} />

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedCompany ? 'Editar Empresa' : 'Nova Empresa'}
        size="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Razão Social *"
              error={errors.razaoSocial?.message}
              {...register('razaoSocial')}
            />
            <Input
              label="Nome Fantasia"
              {...register('nomeFantasia')}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="CNPJ"
              {...register('cnpj')}
            />
            <Input
              label="Segmento"
              {...register('segmento')}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Website"
              {...register('website')}
            />
            <Input
              label="Telefone"
              {...register('telefone')}
            />
          </div>
          <Input
            label="Endereço"
            {...register('endereco')}
          />
          <div className="grid gap-4 sm:grid-cols-3">
            <Input
              label="Cidade"
              {...register('cidade')}
            />
            <Select
              label="Estado"
              options={estadosBR}
              placeholder="Selecione"
              {...register('estado')}
            />
            <Input
              label="CEP"
              {...register('cep')}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Funcionários"
              type="number"
              {...register('funcionarios')}
            />
            <Input
              label="Faturamento Anual (R$)"
              type="number"
              {...register('faturamentoAnual')}
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
              {selectedCompany ? 'Salvar Alterações' : 'Criar Empresa'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Excluir Empresa"
        size="sm"
      >
        <p className="text-sm text-muted-foreground">
          Tem certeza que deseja excluir a empresa{' '}
          <strong className="text-foreground">
            {selectedCompany?.nomeFantasia || selectedCompany?.razaoSocial}
          </strong>
          ? Esta ação não pode ser desfeita.
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
