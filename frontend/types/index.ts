export interface User {
  id: string;
  nome: string;
  email: string;
  cargo: 'admin' | 'gerente' | 'vendedor';
  avatar?: string;
  telefone?: string;
  ativo: boolean;
  criadoEm: string;
  atualizadoEm: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: User;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ApiError {
  statusCode: number;
  message: string;
  errors?: string[];
  timestamp: string;
}

export interface Company {
  id: string;
  razaoSocial: string;
  nomeFantasia?: string;
  cnpj?: string;
  segmento?: string;
  website?: string;
  telefone?: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  funcionarios?: number;
  faturamentoAnual?: number;
  ativo: boolean;
  criadoEm: string;
  atualizadoEm: string;
}

export type LeadStatus = 'novo' | 'em_contato' | 'qualificado' | 'perdido';

export interface Lead {
  id: string;
  nome: string;
  email?: string;
  telefone?: string;
  cargo?: string;
  status: LeadStatus;
  origem?: string;
  observacoes?: string;
  pontuacao: number;
  dataUltimoContato?: string;
  empresaId?: string;
  responsavelId?: string;
  criadoEm: string;
  atualizadoEm: string;
}

export interface Client {
  id: string;
  nome: string;
  email?: string;
  telefone?: string;
  celular?: string;
  cargo?: string;
  departamento?: string;
  dataNascimento?: string;
  ativo: boolean;
  observacoes?: string;
  empresaId?: string;
  responsavelId?: string;
  criadoEm: string;
  atualizadoEm: string;
}

export type AuditAction = 'INSERT' | 'UPDATE' | 'DELETE';

export interface AuditLog {
  id: number;
  tabela: string;
  acao: AuditAction;
  registroId: string;
  dadosAnteriores?: Record<string, unknown>;
  dadosNovos?: Record<string, unknown>;
  usuarioId?: string;
  usuario?: { id: string; nome: string; email: string };
  criadoEm: string;
}

export interface AuditStats {
  totalLogs: number;
  byAction: Record<string, number>;
  byTable: Record<string, number>;
  last24h: number;
}

export interface SearchResult {
  id: string;
  type: 'lead' | 'cliente' | 'empresa';
  nome: string;
  email?: string;
  telefone?: string;
  rank: number;
  highlight?: string;
}

export interface SearchResponse {
  data: SearchResult[];
  meta: {
    query: string;
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    entities: {
      leads: number;
      clientes: number;
      empresas: number;
    };
  };
}

export interface SchedulerJob {
  name: string;
  nextRun?: string;
  description?: string;
}

export interface HealthCheck {
  status: string;
  timestamp: string;
  uptime: string;
  database: { status: string; responseTime: string };
  memory: { rss: string; heapTotal: string; heapUsed: string; external: string };
  environment: string;
  nodeVersion: string;
  responseTime: string;
}

export interface UserPerformance {
  userId: string;
  userName: string;
  userEmail: string;
  totalLeads: number;
  totalClients: number;
}

export interface TopCompany {
  companyId: string;
  companyName: string;
  totalLeads: number;
  totalClients: number;
  conversionRate: number;
}

export interface MonthlyTrend {
  month: string;
  leads_created: number;
  leads_converted: number;
  conversion_rate: number;
  cumulative_leads: number;
}

export interface LeadDistribution {
  category: string;
  status: string;
  count: number;
  percentage: number;
}
