import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SearchService } from './search.service';
import { SearchDto, SearchResponse } from './dto/search.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Search')
@Controller('search')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @ApiOperation({
    summary: 'Busca Full-Text em português',
    description: `
      Realiza busca Full-Text Search otimizada para português em leads, clientes e empresas.

      **Recursos:**
      - Suporte a acentos e caracteres especiais
      - Busca parcial (prefixo)
      - Ranking por relevância
      - Highlight dos termos encontrados
      - Fallback para ILIKE se Full-Text falhar

      **Exemplos de busca:**
      - "João" - busca todos com João no nome
      - "tecnologia SP" - busca por tecnologia em SP
      - "11999" - busca por telefone
    `,
  })
  @ApiResponse({
    status: 200,
    description: 'Resultados da busca com ranking',
    schema: {
      example: {
        data: [
          {
            id: 'uuid-123',
            type: 'lead',
            nome: 'João Silva',
            email: 'joao@email.com',
            telefone: '11999999999',
            rank: 0.85,
            highlight: '<mark>João</mark> Silva - Empresa de <mark>tecnologia</mark>',
          },
        ],
        meta: {
          query: 'João tecnologia',
          total: 15,
          page: 1,
          limit: 10,
          totalPages: 2,
          entities: {
            leads: 5,
            clientes: 7,
            empresas: 3,
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  async search(@Query() dto: SearchDto): Promise<SearchResponse> {
    return this.searchService.search(dto);
  }
}
