'use client';

import { useState, useCallback } from 'react';
import {
  MessageSquare,
  Search,
  UserPlus,
  Users,
  Building2,
  ExternalLink,
  Hash,
  AlertCircle,
} from 'lucide-react';
import {
  Button,
  Input,
  Select,
  Badge,
  Card,
  CardContent,
} from '@/components/ui';
import { PageHeader } from '@/components/layout';
import api from '@/lib/api';
import type { SearchResult, SearchResponse } from '@/types';

const typeIcons: Record<string, typeof UserPlus> = {
  lead: UserPlus,
  cliente: Users,
  empresa: Building2,
};

const typeLabels: Record<string, string> = {
  lead: 'Lead',
  cliente: 'Cliente',
  empresa: 'Empresa',
};

const typeVariants: Record<string, 'info' | 'success' | 'warning'> = {
  lead: 'info',
  cliente: 'success',
  empresa: 'warning',
};

const entityOptions = [
  { value: 'all', label: 'Todos' },
  { value: 'leads', label: 'Leads' },
  { value: 'clientes', label: 'Clientes' },
  { value: 'empresas', label: 'Empresas' },
];

export default function ComunicacoesPage() {
  const [query, setQuery] = useState('');
  const [entity, setEntity] = useState('all');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [meta, setMeta] = useState<SearchResponse['meta'] | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [page, setPage] = useState(1);

  const performSearch = useCallback(async (searchPage = 1) => {
    if (!query.trim()) return;
    try {
      setLoading(true);
      setSearched(true);
      setErrorMsg('');
      const response = await api.get('/search', {
        params: {
          query: query.trim(),
          entity: entity === 'all' ? undefined : entity,
          page: searchPage,
          limit: 20,
        },
      });
      // After envelope unwrapper, response.data = { data: SearchResult[], meta: {...} }
      const payload = response.data as any;
      const searchData = payload?.data || payload || [];
      const searchMeta = payload?.meta || null;
      setResults(Array.isArray(searchData) ? searchData : []);
      setMeta(searchMeta);
      setPage(searchPage);
    } catch (error: any) {
      console.error('Erro na busca:', error);
      const msg = error?.response?.data?.message || error?.message || 'Erro ao realizar busca. Verifique se o backend está rodando.';
      setErrorMsg(typeof msg === 'string' ? msg : JSON.stringify(msg));
      setResults([]);
      setMeta(null);
    } finally {
      setLoading(false);
    }
  }, [query, entity]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') performSearch();
  };

  const getDetailLink = (result: SearchResult) => {
    switch (result.type) {
      case 'lead': return '/leads';
      case 'cliente': return '/clientes';
      case 'empresa': return '/empresas';
      default: return '/';
    }
  };

  return (
    <div>
      <PageHeader
        title="Comunicações"
        subtitle="Busca inteligente full-text com suporte a português"
      />

      {/* Search Bar */}
      <Card className="mb-6">
        <CardContent>
          <div className="flex items-end gap-4">
            <div className="flex-1">
              <Input
                placeholder="Buscar leads, clientes, empresas..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                leftIcon={<Search className="h-4 w-4" />}
              />
            </div>
            <Select
              options={entityOptions}
              value={entity}
              onChange={(e) => setEntity(e.target.value)}
              className="w-40"
            />
            <Button onClick={() => performSearch()} loading={loading}>
              Buscar
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Busca com ranking de relevância, suporte a acentos e destaque dos termos encontrados. Pressione Enter ou clique Buscar.
          </p>
        </CardContent>
      </Card>

      {/* Error Message */}
      {errorMsg && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 mb-6 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-destructive">Erro na busca</p>
            <p className="text-xs text-destructive/80 mt-1">{errorMsg}</p>
          </div>
        </div>
      )}

      {/* Search Stats */}
      {meta && (
        <div className="grid gap-4 md:grid-cols-4 mb-6">
          <Card>
            <CardContent>
              <p className="text-2xl font-bold text-foreground">{meta.total}</p>
              <p className="text-xs text-muted-foreground">Resultados para &ldquo;{meta.query}&rdquo;</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <div className="flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-lg font-bold text-foreground">{meta.entities.leads}</p>
                  <p className="text-xs text-muted-foreground">Leads</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-lg font-bold text-foreground">{meta.entities.clientes}</p>
                  <p className="text-xs text-muted-foreground">Clientes</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-orange-500" />
                <div>
                  <p className="text-lg font-bold text-foreground">{meta.entities.empresas}</p>
                  <p className="text-xs text-muted-foreground">Empresas</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Results */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      ) : results.length > 0 ? (
        <div className="space-y-2">
          {results.map((result, i) => {
            const TypeIcon = typeIcons[result.type] || Hash;
            return (
              <Card key={`${result.type}-${result.id}-${i}`} className="hover:border-primary/30 transition-colors">
                <div className="flex items-center gap-4 p-4">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                    result.type === 'lead' ? 'bg-blue-500/10 text-blue-500' :
                    result.type === 'cliente' ? 'bg-green-500/10 text-green-500' :
                    'bg-orange-500/10 text-orange-500'
                  }`}>
                    <TypeIcon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-medium text-foreground">{result.nome}</h3>
                      <Badge variant={typeVariants[result.type]}>{typeLabels[result.type]}</Badge>
                      {result.rank > 0 && (
                        <span className="text-xs text-muted-foreground">
                          Relevância: {Number(result.rank).toFixed(2)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      {result.email && <span>{result.email}</span>}
                      {result.telefone && <span>{result.telefone}</span>}
                    </div>
                    {result.highlight && (
                      <p
                        className="text-xs text-muted-foreground mt-1 [&_mark]:bg-primary/30 [&_mark]:text-foreground [&_mark]:px-0.5 [&_mark]:rounded"
                        dangerouslySetInnerHTML={{ __html: result.highlight }}
                      />
                    )}
                  </div>
                  <a
                    href={getDetailLink(result)}
                    className="shrink-0 rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-foreground"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </Card>
            );
          })}

          {/* Pagination */}
          {meta && meta.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => performSearch(page - 1)}
                disabled={page <= 1}
              >
                Anterior
              </Button>
              <span className="text-sm text-muted-foreground">
                Página {page} de {meta.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => performSearch(page + 1)}
                disabled={page >= meta.totalPages}
              >
                Próxima
              </Button>
            </div>
          )}
        </div>
      ) : searched && !errorMsg ? (
        <Card>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Search className="h-12 w-12 mb-3 opacity-50" />
              <p>Nenhum resultado encontrado</p>
              <p className="text-xs mt-1">Tente usar termos diferentes ou mais genéricos</p>
            </div>
          </CardContent>
        </Card>
      ) : !searched ? (
        <Card>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <MessageSquare className="h-12 w-12 mb-3 opacity-50" />
              <p>Digite um termo para buscar</p>
              <p className="text-xs mt-1">A busca utiliza Full-Text Search do PostgreSQL com suporte a português</p>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
