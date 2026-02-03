import { IsOptional, IsString, IsEnum, IsUUID, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { AuditAction } from '../entities/audit.entity';

export class AuditQueryDto {
  @ApiPropertyOptional({
    description: 'Filtrar por tabela',
    example: 'leads',
  })
  @IsOptional()
  @IsString()
  tabela?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por ação',
    enum: ['INSERT', 'UPDATE', 'DELETE'],
  })
  @IsOptional()
  @IsEnum(['INSERT', 'UPDATE', 'DELETE'])
  acao?: AuditAction;

  @ApiPropertyOptional({
    description: 'Filtrar por ID do registro',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID()
  registroId?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por ID do usuário',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID()
  usuarioId?: string;

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
    description: 'Itens por página',
    example: 20,
    minimum: 1,
    maximum: 100,
    default: 20,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}

export interface AuditResponse {
  data: {
    id: number;
    tabela: string;
    acao: string;
    registroId: string;
    dadosAnteriores: Record<string, any> | null;
    dadosNovos: Record<string, any> | null;
    usuarioId: string | null;
    criadoEm: Date;
  }[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
