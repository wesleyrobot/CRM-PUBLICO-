'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Target,
  Search,
  ArrowRight,
  Star,
  Building2,
  User,
  ChevronRight,
  GripVertical,
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

  // Drag and drop state
  const [draggedLead, setDraggedLead] = useState<Lead | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);
  const dragCounterRef = useRef<Record<string, number>>({});

  const fetchAllLeads = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/leads', {
        params: { limit: 100, sortBy: 'pontuacao', sortOrder: 'DESC' },
      });
      const payload = response.data as any;
      const items = payload?.data || payload || [];
      setAllLeads(Array.isArray(items) ? items : []);
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
          api.get('/companies', { params: { limit: 100 } }),
          api.get('/users', { params: { limit: 100 } }),
        ]);
        const compPayload = compRes.data as any;
        const usersPayload = usersRes.data as any;
        setCompanies(Array.isArray(compPayload?.data) ? compPayload.data : Array.isArray(compPayload) ? compPayload : []);
        setUsers(Array.isArray(usersPayload?.data) ? usersPayload.data : Array.isArray(usersPayload) ? usersPayload : []);
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
    if (lead.status === newStatus) return;
    // Optimistic update
    setAllLeads(prev => prev.map(l => l.id === lead.id ? { ...l, status: newStatus as Lead['status'] } : l));
    try {
      await api.patch(`/leads/${lead.id}`, { status: newStatus });
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      // Revert on error
      fetchAllLeads();
    }
  };

  const openStatusModal = (lead: Lead) => {
    setSelectedLead(lead);
    setIsStatusModalOpen(true);
  };

  const getNextStatus = (current: string): string | null => {
    const idx = statuses.indexOf(current as typeof statuses[number]);
    if (idx >= 0 && idx < statuses.length - 1) return statuses[idx + 1];
    return null;
  };

  // --- Drag and Drop Handlers ---
  const handleDragStart = (e: React.DragEvent, lead: Lead) => {
    setDraggedLead(lead);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', lead.id);
    // Add a slight delay to allow the drag image to be captured
    const target = e.currentTarget as HTMLElement;
    setTimeout(() => {
      target.style.opacity = '0.4';
    }, 0);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    const target = e.currentTarget as HTMLElement;
    target.style.opacity = '1';
    setDraggedLead(null);
    setDragOverColumn(null);
    dragCounterRef.current = {};
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnterColumn = (e: React.DragEvent, status: string) => {
    e.preventDefault();
    if (!dragCounterRef.current[status]) dragCounterRef.current[status] = 0;
    dragCounterRef.current[status]++;
    setDragOverColumn(status);
  };

  const handleDragLeaveColumn = (e: React.DragEvent, status: string) => {
    if (!dragCounterRef.current[status]) dragCounterRef.current[status] = 0;
    dragCounterRef.current[status]--;
    if (dragCounterRef.current[status] <= 0) {
      dragCounterRef.current[status] = 0;
      if (dragOverColumn === status) {
        setDragOverColumn(null);
      }
    }
  };

  const handleDropOnColumn = (e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    dragCounterRef.current[newStatus] = 0;
    setDragOverColumn(null);
    if (draggedLead && draggedLead.status !== newStatus) {
      handleStatusChange(draggedLead, newStatus);
    }
    setDraggedLead(null);
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
            const isDropTarget = dragOverColumn === status && draggedLead?.status !== status;
            return (
              <div
                key={status}
                className="flex flex-col"
                onDragOver={handleDragOver}
                onDragEnter={(e) => handleDragEnterColumn(e, status)}
                onDragLeave={(e) => handleDragLeaveColumn(e, status)}
                onDrop={(e) => handleDropOnColumn(e, status)}
              >
                {/* Column Header */}
                <div className={`rounded-t-lg border ${config.bgColor} p-3 mb-2 transition-colors ${isDropTarget ? 'ring-2 ring-primary ring-offset-1' : ''}`}>
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
                <div className={`space-y-2 min-h-[200px] flex-1 rounded-b-lg p-1 transition-colors ${isDropTarget ? 'bg-primary/5 border-2 border-dashed border-primary/30' : ''}`}>
                  {leads.length === 0 && !isDropTarget ? (
                    <div className="flex items-center justify-center h-32 rounded-lg border border-dashed border-border text-muted-foreground text-xs">
                      Sem oportunidades
                    </div>
                  ) : leads.length === 0 && isDropTarget ? (
                    <div className="flex items-center justify-center h-32 rounded-lg border-2 border-dashed border-primary/40 text-primary text-xs font-medium">
                      Soltar aqui
                    </div>
                  ) : (
                    leads.map((lead) => {
                      const nextStatus = getNextStatus(lead.status);
                      const companyName = getCompanyName(lead.empresaId);
                      const responsavelName = getResponsavelName(lead.responsavelId);
                      const isDragging = draggedLead?.id === lead.id;
                      return (
                        <div
                          key={lead.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, lead)}
                          onDragEnd={handleDragEnd}
                          onClick={() => openStatusModal(lead)}
                          className={`rounded-lg border border-border bg-card p-3 hover:border-primary/30 transition-all cursor-grab active:cursor-grabbing group ${isDragging ? 'opacity-40 scale-95' : 'opacity-100'}`}
                        >
                          <div className="flex items-start justify-between mb-1">
                            <div className="flex items-center gap-1.5 flex-1 min-w-0">
                              <GripVertical className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0" />
                              <h4 className="text-sm font-medium text-foreground truncate">{lead.nome}</h4>
                            </div>
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

      {/* Drag hint */}
      {!loading && allLeads.length > 0 && (
        <p className="text-xs text-muted-foreground text-center mt-4">
          Arraste os cards entre as colunas para alterar o status, ou clique para escolher
        </p>
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
