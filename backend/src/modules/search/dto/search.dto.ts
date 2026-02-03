import { IsNotEmpty, IsString, IsOptional, IsEnum, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum SearchEntity {
  LEADS = 'leads',
  CLIENTES = 'clientes',
  EMPRESAS = 'empresas',
  ALL = 'all',
}

export class SearchDto {
  @ApiProperty({
    description: 'Termo de busca (suporta português com acentos)',
    example: 'João Silva tecnologia',
  })
  @IsNotEmpty({ message: 'O termo de busca é obrigatório' })
  @IsString()
  query: string;

  @ApiPropertyOptional({
    description: 'Entidade para buscar (leads, clientes, empresas ou all)',
    enum: SearchEntity,
    default: SearchEntity.ALL,
  })
  @IsOptional()
  @IsEnum(SearchEntity)
  entity?: SearchEntity = SearchEntity.ALL;

  @ApiPropertyOptional({
    description: 'Número da página',
    example: 1,
    minimum: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Quantidade de resultados por página',
    example: 10,
    minimum: 1,
    maximum: 50,
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number = 10;
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
