import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LeadResponseDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id: string;

  @ApiProperty({ example: 'Maria Santos' })
  nome: string;

  @ApiPropertyOptional({ example: 'maria.santos@empresa.com' })
  email?: string;

  @ApiPropertyOptional({ example: '(11) 98765-4321' })
  telefone?: string;

  @ApiPropertyOptional({ example: 'Gerente de Compras' })
  cargo?: string;

  @ApiProperty({ example: 'novo', enum: ['novo', 'em_contato', 'qualificado', 'perdido'] })
  status: string;

  @ApiPropertyOptional({ example: 'Site institucional' })
  origem?: string;

  @ApiPropertyOptional({ example: 'Interessado em plano empresarial' })
  observacoes?: string;

  @ApiProperty({ example: 75 })
  pontuacao: number;

  @ApiPropertyOptional({ example: '2024-01-28T10:30:00Z' })
  dataUltimoContato?: Date;

  @ApiPropertyOptional({ example: '550e8400-e29b-41d4-a716-446655440000' })
  empresaId?: string;

  @ApiPropertyOptional({ example: '550e8400-e29b-41d4-a716-446655440001' })
  responsavelId?: string;

  @ApiProperty({ example: '2024-01-29T00:00:00.000Z' })
  criadoEm: Date;

  @ApiProperty({ example: '2024-01-29T00:00:00.000Z' })
  atualizadoEm: Date;
}
