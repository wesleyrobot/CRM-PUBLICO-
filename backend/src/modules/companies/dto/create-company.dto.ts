import { IsString, IsOptional, IsNumber, IsBoolean, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCompanyDto {
  @ApiProperty({
    description: 'Razão social da empresa',
    example: 'Tech Solutions Ltda',
    maxLength: 200,
  })
  @IsString()
  @MaxLength(200)
  razaoSocial: string;

  @ApiPropertyOptional({
    description: 'Nome fantasia da empresa',
    example: 'Tech Solutions',
    maxLength: 200,
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  nomeFantasia?: string;

  @ApiPropertyOptional({
    description: 'CNPJ da empresa',
    example: '12.345.678/0001-90',
    maxLength: 18,
  })
  @IsOptional()
  @IsString()
  @MaxLength(18)
  cnpj?: string;

  @ApiPropertyOptional({
    description: 'Segmento de atuação',
    example: 'Tecnologia',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  segmento?: string;

  @ApiPropertyOptional({
    description: 'Website da empresa',
    example: 'https://techsolutions.com.br',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  website?: string;

  @ApiPropertyOptional({
    description: 'Telefone principal',
    example: '(11) 3333-4444',
    maxLength: 20,
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  telefone?: string;

  @ApiPropertyOptional({
    description: 'Endereço completo',
    example: 'Av. Paulista, 1000 - São Paulo/SP',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  endereco?: string;

  @ApiPropertyOptional({
    description: 'Cidade',
    example: 'São Paulo',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  cidade?: string;

  @ApiPropertyOptional({
    description: 'Estado (UF)',
    example: 'SP',
    maxLength: 2,
  })
  @IsOptional()
  @IsString()
  @MaxLength(2)
  estado?: string;

  @ApiPropertyOptional({
    description: 'CEP',
    example: '01310-100',
    maxLength: 9,
  })
  @IsOptional()
  @IsString()
  @MaxLength(9)
  cep?: string;

  @ApiPropertyOptional({
    description: 'Número de funcionários',
    example: 50,
  })
  @IsOptional()
  @IsNumber()
  funcionarios?: number;

  @ApiPropertyOptional({
    description: 'Faturamento anual em reais',
    example: 5000000,
  })
  @IsOptional()
  @IsNumber()
  faturamentoAnual?: number;

  @ApiPropertyOptional({
    description: 'Status de ativação',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  ativo?: boolean;
}
