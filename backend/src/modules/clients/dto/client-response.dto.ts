import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ClientResponseDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id: string;

  @ApiProperty({ example: 'Carlos Mendes' })
  nome: string;

  @ApiPropertyOptional({ example: 'carlos.mendes@empresa.com' })
  email?: string;

  @ApiPropertyOptional({ example: '(11) 3333-4444' })
  telefone?: string;

  @ApiPropertyOptional({ example: '(11) 98765-4321' })
  celular?: string;

  @ApiPropertyOptional({ example: 'Diretor Financeiro' })
  cargo?: string;

  @ApiPropertyOptional({ example: 'Financeiro' })
  departamento?: string;

  @ApiPropertyOptional({ example: '1985-03-15' })
  dataNascimento?: Date;

  @ApiProperty({ example: true })
  ativo: boolean;

  @ApiPropertyOptional({ example: 'Preferência por contato via email' })
  observacoes?: string;

  @ApiPropertyOptional({ example: '550e8400-e29b-41d4-a716-446655440000' })
  empresaId?: string;

  @ApiPropertyOptional({ example: '550e8400-e29b-41d4-a716-446655440001' })
  responsavelId?: string;

  @ApiProperty({ example: '2024-01-29T00:00:00.000Z' })
  criadoEm: Date;

  @ApiProperty({ example: '2024-01-29T00:00:00.000Z' })
  atualizadoEm: Date;
}
