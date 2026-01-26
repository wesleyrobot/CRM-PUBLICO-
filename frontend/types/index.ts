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
