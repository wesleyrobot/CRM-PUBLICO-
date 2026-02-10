'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, Search, Menu, UserPlus, Users, Building2, X } from 'lucide-react';
import { Avatar, Badge } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import type { SearchResult, SearchResponse } from '@/types';

interface HeaderProps {
  onMenuClick?: () => void;
}

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

const typeRoutes: Record<string, string> = {
  lead: '/leads',
  cliente: '/clientes',
  empresa: '/empresas',
};

export function Header({ onMenuClick }: HeaderProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searching, setSearching] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [searchError, setSearchError] = useState('');

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim() || q.trim().length < 2) {
      setResults([]);
      setShowDropdown(false);
      setSearchError('');
      return;
    }
    try {
      setSearching(true);
      setSearchError('');
      const response = await api.get('/search', {
        params: { query: q.trim(), limit: 8 },
      });
      // After envelope unwrap: response.data = { data: SearchResult[], meta: {...} }
      const payload = response.data as any;
      const items = payload?.data || payload || [];
      setResults(Array.isArray(items) ? items : []);
      setShowDropdown(true);
    } catch (err: any) {
      setResults([]);
      setSearchError(err?.response?.data?.message || 'Erro na busca');
      setShowDropdown(true);
    } finally {
      setSearching(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => doSearch(query), 350);
    return () => clearTimeout(timer);
  }, [query, doSearch]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleResultClick = (result: SearchResult) => {
    setShowDropdown(false);
    setQuery('');
    router.push(typeRoutes[result.type] || '/');
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setShowDropdown(false);
    inputRef.current?.focus();
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-card px-6">
      {/* Left side */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-foreground lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Search with dropdown */}
        <div className="relative flex-1 max-w-md lg:max-w-lg" ref={dropdownRef}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => results.length > 0 && setShowDropdown(true)}
              placeholder="Buscar leads, clientes, empresas..."
              className="h-10 w-full rounded-lg border border-input bg-background pl-10 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            {query && (
              <button onClick={clearSearch} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Dropdown Results */}
          {showDropdown && (
            <div className="absolute top-full left-0 mt-1 w-full rounded-lg border border-border bg-card shadow-lg overflow-hidden z-50">
              {searching ? (
                <div className="p-4 text-center text-sm text-muted-foreground">Buscando...</div>
              ) : results.length > 0 ? (
                <div className="max-h-80 overflow-y-auto">
                  {results.map((result, i) => {
                    const TypeIcon = typeIcons[result.type] || Search;
                    return (
                      <button
                        key={`${result.type}-${result.id}-${i}`}
                        onClick={() => handleResultClick(result)}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-accent transition-colors border-b border-border/50 last:border-0"
                      >
                        <TypeIcon className={`h-4 w-4 shrink-0 ${
                          result.type === 'lead' ? 'text-blue-500' :
                          result.type === 'cliente' ? 'text-green-500' : 'text-orange-500'
                        }`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{result.nome}</p>
                          {result.email && <p className="text-xs text-muted-foreground truncate">{result.email}</p>}
                        </div>
                        <Badge variant={result.type === 'lead' ? 'info' : result.type === 'cliente' ? 'success' : 'warning'}>
                          {typeLabels[result.type]}
                        </Badge>
                      </button>
                    );
                  })}
                  <button
                    onClick={() => { setShowDropdown(false); router.push('/comunicacoes'); }}
                    className="w-full px-4 py-2 text-xs text-center text-primary hover:bg-accent transition-colors"
                  >
                    Ver todos os resultados →
                  </button>
                </div>
              ) : searchError ? (
                <div className="p-4 text-center text-sm text-destructive">{searchError}</div>
              ) : query.trim().length >= 2 ? (
                <div className="p-4 text-center text-sm text-muted-foreground">Nenhum resultado encontrado</div>
              ) : null}
            </div>
          )}
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <button className="relative rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-foreground">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-primary" />
        </button>

        {/* User */}
        <div className="flex items-center gap-3">
          <Avatar name={user?.nome} size="sm" />
          <div className="hidden md:block">
            <p className="text-sm font-medium text-foreground">{user?.nome}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
