'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Target,
  Search,
  ArrowRight,
  Star,
  Building2,
  User,
  ChevronRight,
} from 'lucide-react';
import {
  Button,
  Input,
  Modal,
  Badge,
  Card,
  CardContent,
} from '@/components/ui';
import { PageHeader } from '@/components/layout';
import api from '@/lib/api';
import { formatDate } from '@/lib/utils';
import type { Lead, Company, User as UserType, PaginatedResponse } from '@/types';

const statusConfig: Record<string, { label: string; color: string; bgColor: string }> = {
  novo: { label: 'Novo', color: 'text-blue-400', bgColor: 'bg-blue-500/10 border-blue-500/30' },
  em_contato: { label: 'Em Contato', color: 'text-yellow-400', bgColor: 'bg-yellow-500/10 border-yellow-500/30' },
  qualificado: { label: 'Qualificado', color: 'text-green-400', bgColor: 'bg-green-500/10 border-green-500/30' },
  perdido: { label: 'Perdido', color: 'text-red-400', bgColor: 'bg-red-500/10 border-red-500/30' },
};

const statuses = ['novo', 'em_contato', 'qualificado', 'perdido'] as const;

export default function OportunidadesPage() {
  const [allLeads, setAllLeads] = useState<Lead[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);

  const fetchAllLeads = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get<PaginatedResponse<Lead>>('/leads', {
        params: { limit: 100, sortBy: 'pontuacao', sortOrder: 'DESC' },
      });
      setAllLeads(data.data);
    } catch (error) {
      console.error('Erro ao buscar leads:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllLeads();
  }, [fetchAllLeads]);

  useEffect(() => {
    const fetchAux = async () => {
      try {
        const [compRes, usersRes] = await Promise.all([
          api.get<PaginatedResponse<Company>>('/companies', { params: { limit: 100 } }),
          api.get<PaginatedResponse<UserType>>('/users', { params: { limit: 100 } }),
        ]);
        setCompanies(compRes.data.data || []);
        setUsers(usersRes.data.data || []);
      } catch { /* non-critical */ }
    };
    fetchAux();
  }, []);

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

  const filteredLeads = search
    ? allLeads.filter(l => l.nome.toLowerCase().includes(search.toLowerCase()) || l.email?.toLowerCase().includes(search.toLowerCase()))
    : allLeads;

  const leadsByStatus = statuses.reduce<Record<string, Lead[]>>((acc, status) => {
    acc[status] = filteredLeads.filter(l => l.status === status);
    return acc;
  }, {} as Record<string, Lead[]>);

  const handleStatusChange = async (lead: Lead, newStatus: string) => {
    try {
      await api.patch(`/leads/${lead.id}`, { status: newStatus });
      fetchAllLeads();
    } catch (error) {
      console.error('Erro ao alterar status:', error);
    }
  };

  const openStatusModal = (lead: Lead) => {
    setSelectedLead(lead);
    setIsStatusModalOpen(true);
  };

  // Quick advance to next status
  const getNextStatus = (current: string): string | null => {
    const idx = statuses.indexOf(current as typeof statuses[number]);
    if (idx >= 0 && idx < statuses.length - 1) return statuses[idx + 1];
    return null;
  };

  return (
    <div>
      <PageHeader
        title="Oportunidades"
        subtitle={`Pipeline de vendas · ${filteredLeads.length} oportunidades`}
      />

      {/* Summary */}
      <div className="grid gap-4 md:grid-cols-5 mb-6">
        <Card>
          <CardContent>
            <p className="text-xs text-muted-foreground">Total Pipeline</p>
            <p className="text-2xl font-bold text-foreground">{filteredLeads.length}</p>
          </CardContent>
        </Card>
        {statuses.map(status => (
          <Card key={status}>
            <CardContent>
              <p className={`text-xs ${statusConfig[status].color}`}>{statusConfig[status].label}</p>
              <p className="text-2xl font-bold text-foreground">{leadsByStatus[status]?.length || 0}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search */}
      <div className="mb-6">
        <Input
          placeholder="Buscar oportunidades..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          leftIcon={<Search className="h-4 w-4" />}
          className="max-w-sm"
        />
      </div>

      {/* Kanban Board */}
      {loading ? (
        <div className="grid gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-96 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-4">
          {statuses.map((status, idx) => {
            const config = statusConfig[status];
            const leads = leadsByStatus[status] || [];
            return (
              <div key={status} className="flex flex-col">
                {/* Column Header */}
                <div className={`rounded-t-lg border ${config.bgColor} p-3 mb-2`}>
                  <div className="flex items-center justify-between">
                    <h3 className={`text-sm font-semibold ${config.color}`}>{config.label}</h3>
                    <span className={`text-xs font-bold ${config.color}`}>{leads.length}</span>
                  </div>
                  {idx < statuses.length - 1 && (
                    <div className="flex items-center gap-1 mt-1">
                      <ArrowRight className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        {statusConfig[statuses[idx + 1]].label}
                      </span>
                    </div>
                  )}
                </div>

                {/* Cards */}
                <div className="space-y-2 min-h-[200px] flex-1">
                  {leads.length === 0 ? (
                    <div className="flex items-center justify-center h-32 rounded-lg border border-dashed border-border text-muted-foreground text-xs">
                      Sem oportunidades
                    </div>
                  ) : (
                    leads.map((lead) => {
                      const nextStatus = getNextStatus(lead.status);
                      const companyName = getCompanyName(lead.empresaId);
                      const responsavelName = getResponsavelName(lead.responsavelId);
                      return (
                        <div
                          key={lead.id}
                          onClick={() => openStatusModal(lead)}
                          className="rounded-lg border border-border bg-card p-3 hover:border-primary/30 transition-colors cursor-pointer group"
                        >
                          <div className="flex items-start justify-between mb-1">
                            <h4 className="text-sm font-medium text-foreground truncate">{lead.nome}</h4>
                            <div className="flex items-center gap-1 shrink-0">
                              <Star className="h-3 w-3 text-yellow-500" />
                              <span className="text-xs font-bold text-foreground">{lead.pontuacao}</span>
                            </div>
                          </div>
                          {lead.email && (
                            <p className="text-xs text-muted-foreground truncate mb-1">{lead.email}</p>
                          )}
                          {companyName && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                              <Building2 className="h-3 w-3" /> {companyName}
                            </p>
                          )}
                          {responsavelName && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                              <User className="h-3 w-3" /> {responsavelName}
                            </p>
                          )}
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center gap-2">
                              {lead.origem && (
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Target className="h-3 w-3" /> {lead.origem}
                                </span>
                              )}
                            </div>
                            {nextStatus && (
                              <button
                                onClick={(e) => { e.stopPropagation(); handleStatusChange(lead, nextStatus); }}
                                className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5 text-xs text-primary hover:text-primary/80"
                                title={`Mover para ${statusConfig[nextStatus].label}`}
                              >
                                <ChevronRight className="h-3 w-3" />
                              </button>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">{formatDate(lead.criadoEm)}</p>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Status Change Modal */}
      <Modal isOpen={isStatusModalOpen} onClose={() => setIsStatusModalOpen(false)} title="Alterar Status" size="sm">
        <p className="text-sm text-muted-foreground mb-4">
          Alterar status de <strong className="text-foreground">{selectedLead?.nome}</strong>:
        </p>
        <div className="grid grid-cols-2 gap-2">
          {statuses.map(s => (
            <button
              key={s}
              onClick={() => { if (selectedLead) { handleStatusChange(selectedLead, s); setIsStatusModalOpen(false); } }}
              disabled={selectedLead?.status === s}
              className={`rounded-lg border p-3 text-sm font-medium transition-colors ${
                selectedLead?.status === s
                  ? 'border-primary bg-primary/10 text-primary cursor-default'
                  : 'border-border hover:border-primary/50 hover:bg-accent text-foreground'
              }`}
            >
              <Badge variant={s === 'novo' ? 'info' : s === 'em_contato' ? 'warning' : s === 'qualificado' ? 'success' : 'error'}>
                {statusConfig[s].label}
              </Badge>
            </button>
          ))}
        </div>
      </Modal>
    </div>
  );
}
