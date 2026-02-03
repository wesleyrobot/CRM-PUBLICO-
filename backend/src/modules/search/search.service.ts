import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { SearchDto, SearchEntity, SearchResult, SearchResponse } from './dto/search.dto';

@Injectable()
export class SearchService {
  constructor(private readonly dataSource: DataSource) {}

  async search(dto: SearchDto): Promise<SearchResponse> {
    const { query, entity, page, limit } = dto;
    const offset = (page - 1) * limit;

    // Converte query para formato tsquery (português)
    const tsQuery = this.buildTsQuery(query);

    const results: SearchResult[] = [];
    const counts = { leads: 0, clientes: 0, empresas: 0 };

    // Busca em cada entidade conforme solicitado
    if (entity === SearchEntity.ALL || entity === SearchEntity.LEADS) {
      const leadsResult = await this.searchLeads(tsQuery, query);
      results.push(...leadsResult.results);
      counts.leads = leadsResult.count;
    }

    if (entity === SearchEntity.ALL || entity === SearchEntity.CLIENTES) {
      const clientesResult = await this.searchClientes(tsQuery, query);
      results.push(...clientesResult.results);
      counts.clientes = clientesResult.count;
    }

    if (entity === SearchEntity.ALL || entity === SearchEntity.EMPRESAS) {
      const empresasResult = await this.searchEmpresas(tsQuery, query);
      results.push(...empresasResult.results);
      counts.empresas = empresasResult.count;
    }

    // Ordena por rank (relevância) e aplica paginação
    results.sort((a, b) => b.rank - a.rank);
    const paginatedResults = results.slice(offset, offset + limit);
    const total = results.length;

    return {
      data: paginatedResults,
      meta: {
        query,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        entities: counts,
      },
    };
  }

  private buildTsQuery(query: string): string {
    // Remove caracteres especiais e divide em palavras
    const words = query
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos para normalização
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter((w) => w.length > 1);

    // Cria query com operador OR para maior flexibilidade
    return words.map((w) => `${w}:*`).join(' | ');
  }

  private async searchLeads(
    tsQuery: string,
    originalQuery: string,
  ): Promise<{ results: SearchResult[]; count: number }> {
    // Primeiro, atualiza o search_vector se estiver vazio
    await this.updateSearchVector('leads', 'nome', 'email', 'observacoes');

    const query = `
      SELECT
        id,
        nome,
        email,
        telefone,
        ts_rank(search_vector, to_tsquery('portuguese', $1)) as rank,
        ts_headline('portuguese', COALESCE(nome, '') || ' ' || COALESCE(email, '') || ' ' || COALESCE(observacoes, ''),
          to_tsquery('portuguese', $1),
          'StartSel=<mark>, StopSel=</mark>, MaxWords=35, MinWords=15'
        ) as highlight
      FROM leads
      WHERE deletado_em IS NULL
        AND (
          search_vector @@ to_tsquery('portuguese', $1)
          OR nome ILIKE $2
          OR email ILIKE $2
          OR observacoes ILIKE $2
        )
      ORDER BY rank DESC
      LIMIT 100
    `;

    try {
      const results = await this.dataSource.query(query, [tsQuery, `%${originalQuery}%`]);
      return {
        results: results.map((r: any) => ({
          id: r.id,
          type: 'lead' as const,
          nome: r.nome,
          email: r.email,
          telefone: r.telefone,
          rank: parseFloat(r.rank) || 0.1,
          highlight: r.highlight,
        })),
        count: results.length,
      };
    } catch {
      // Fallback para busca simples se Full-Text falhar
      return this.fallbackSearch('leads', originalQuery);
    }
  }

  private async searchClientes(
    tsQuery: string,
    originalQuery: string,
  ): Promise<{ results: SearchResult[]; count: number }> {
    await this.updateSearchVector('clientes', 'nome', 'email', 'observacoes');

    const query = `
      SELECT
        id,
        nome,
        email,
        telefone,
        ts_rank(search_vector, to_tsquery('portuguese', $1)) as rank,
        ts_headline('portuguese', COALESCE(nome, '') || ' ' || COALESCE(email, '') || ' ' || COALESCE(observacoes, ''),
          to_tsquery('portuguese', $1),
          'StartSel=<mark>, StopSel=</mark>, MaxWords=35, MinWords=15'
        ) as highlight
      FROM clientes
      WHERE deletado_em IS NULL
        AND (
          search_vector @@ to_tsquery('portuguese', $1)
          OR nome ILIKE $2
          OR email ILIKE $2
          OR observacoes ILIKE $2
        )
      ORDER BY rank DESC
      LIMIT 100
    `;

    try {
      const results = await this.dataSource.query(query, [tsQuery, `%${originalQuery}%`]);
      return {
        results: results.map((r: any) => ({
          id: r.id,
          type: 'cliente' as const,
          nome: r.nome,
          email: r.email,
          telefone: r.telefone,
          rank: parseFloat(r.rank) || 0.1,
          highlight: r.highlight,
        })),
        count: results.length,
      };
    } catch {
      return this.fallbackSearch('clientes', originalQuery);
    }
  }

  private async searchEmpresas(
    tsQuery: string,
    originalQuery: string,
  ): Promise<{ results: SearchResult[]; count: number }> {
    await this.updateSearchVector('empresas', 'razao_social', 'nome_fantasia', 'segmento');

    const query = `
      SELECT
        id,
        COALESCE(nome_fantasia, razao_social) as nome,
        cnpj as email,
        telefone,
        ts_rank(search_vector, to_tsquery('portuguese', $1)) as rank,
        ts_headline('portuguese', COALESCE(razao_social, '') || ' ' || COALESCE(nome_fantasia, '') || ' ' || COALESCE(segmento, ''),
          to_tsquery('portuguese', $1),
          'StartSel=<mark>, StopSel=</mark>, MaxWords=35, MinWords=15'
        ) as highlight
      FROM empresas
      WHERE deletado_em IS NULL
        AND (
          search_vector @@ to_tsquery('portuguese', $1)
          OR razao_social ILIKE $2
          OR nome_fantasia ILIKE $2
          OR cnpj ILIKE $2
        )
      ORDER BY rank DESC
      LIMIT 100
    `;

    try {
      const results = await this.dataSource.query(query, [tsQuery, `%${originalQuery}%`]);
      return {
        results: results.map((r: any) => ({
          id: r.id,
          type: 'empresa' as const,
          nome: r.nome,
          email: r.email, // CNPJ
          telefone: r.telefone,
          rank: parseFloat(r.rank) || 0.1,
          highlight: r.highlight,
        })),
        count: results.length,
      };
    } catch {
      return this.fallbackSearch('empresas', originalQuery, 'razao_social');
    }
  }

  private async updateSearchVector(
    table: string,
    col1: string,
    col2: string,
    col3: string,
  ): Promise<void> {
    // Atualiza registros onde search_vector está null
    const query = `
      UPDATE ${table}
      SET search_vector = to_tsvector('portuguese',
        COALESCE(${col1}, '') || ' ' ||
        COALESCE(${col2}, '') || ' ' ||
        COALESCE(${col3}, '')
      )
      WHERE search_vector IS NULL
    `;
    await this.dataSource.query(query);
  }

  private async fallbackSearch(
    table: string,
    query: string,
    nameColumn = 'nome',
  ): Promise<{ results: SearchResult[]; count: number }> {
    const sql = `
      SELECT id, ${nameColumn} as nome, email, telefone
      FROM ${table}
      WHERE deletado_em IS NULL
        AND (${nameColumn} ILIKE $1 OR email ILIKE $1)
      LIMIT 100
    `;

    const results = await this.dataSource.query(sql, [`%${query}%`]);
    const type = table === 'leads' ? 'lead' : table === 'clientes' ? 'cliente' : 'empresa';

    return {
      results: results.map((r: any) => ({
        id: r.id,
        type: type as 'lead' | 'cliente' | 'empresa',
        nome: r.nome,
        email: r.email,
        telefone: r.telefone,
        rank: 0.1,
      })),
      count: results.length,
    };
  }
}
