import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CompanyResponseDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id: string;

  @ApiProperty({ example: 'Tech Solutions Ltda' })
  razaoSocial: string;

  @ApiPropertyOptional({ example: 'Tech Solutions' })
  nomeFantasia?: string;

  @ApiPropertyOptional({ example: '12.345.678/0001-90' })
  cnpj?: string;

  @ApiPropertyOptional({ example: 'Tecnologia' })
  segmento?: string;

  @ApiPropertyOptional({ example: 'https://techsolutions.com.br' })
  website?: string;

  @ApiPropertyOptional({ example: '(11) 3333-4444' })
  telefone?: string;

  @ApiPropertyOptional({ example: 'Av. Paulista, 1000 - São Paulo/SP' })
  endereco?: string;

  @ApiPropertyOptional({ example: 'São Paulo' })
  cidade?: string;

  @ApiPropertyOptional({ example: 'SP' })
  estado?: string;

  @ApiPropertyOptional({ example: '01310-100' })
  cep?: string;

  @ApiPropertyOptional({ example: 50 })
  funcionarios?: number;

  @ApiPropertyOptional({ example: 5000000 })
  faturamentoAnual?: number;

  @ApiProperty({ example: true })
  ativo: boolean;

  @ApiProperty({ example: '2024-01-29T00:00:00.000Z' })
  criadoEm: Date;

  @ApiProperty({ example: '2024-01-29T00:00:00.000Z' })
  atualizadoEm: Date;
}
