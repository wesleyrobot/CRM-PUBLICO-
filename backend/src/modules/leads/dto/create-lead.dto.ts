import { IsString, IsOptional, IsNumber, IsIn, MaxLength, IsEmail, IsUUID, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LeadStatus } from '../entities/lead.entity';

export class CreateLeadDto {
  @ApiProperty({
    description: 'Nome completo do lead',
    example: 'Maria Santos',
    maxLength: 100,
  })
  @IsString()
  @MaxLength(100)
  nome: string;

  @ApiPropertyOptional({
    description: 'Email do lead',
    example: 'maria.santos@empresa.com',
    format: 'email',
    maxLength: 150,
  })
  @IsOptional()
  @IsEmail()
  @MaxLength(150)
  email?: string;

  @ApiPropertyOptional({
    description: 'Telefone de contato',
    example: '(11) 98765-4321',
    maxLength: 20,
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  telefone?: string;

  @ApiPropertyOptional({
    description: 'Cargo do lead na empresa',
    example: 'Gerente de Compras',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  cargo?: string;

  @ApiPropertyOptional({
    description: 'Status atual do lead no funil de vendas',
    example: 'novo',
    enum: ['novo', 'em_contato', 'qualificado', 'perdido'],
    default: 'novo',
  })
  @IsOptional()
  @IsIn(['novo', 'em_contato', 'qualificado', 'perdido'])
  status?: LeadStatus;

  @ApiPropertyOptional({
    description: 'Origem do lead (ex: site, indicação, evento)',
    example: 'Site institucional',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  origem?: string;

  @ApiPropertyOptional({
    description: 'Observações adicionais sobre o lead',
    example: 'Interessado em plano empresarial',
  })
  @IsOptional()
  @IsString()
  observacoes?: string;

  @ApiPropertyOptional({
    description: 'Pontuação do lead (lead scoring)',
    example: 75,
  })
  @IsOptional()
  @IsNumber()
  pontuacao?: number;

  @ApiPropertyOptional({
    description: 'Data do último contato com o lead',
    example: '2024-01-28T10:30:00Z',
    format: 'date-time',
  })
  @IsOptional()
  @IsDateString()
  dataUltimoContato?: string;

  @ApiPropertyOptional({
    description: 'ID da empresa associada ao lead',
    example: '550e8400-e29b-41d4-a716-446655440000',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  empresaId?: string;

  @ApiPropertyOptional({
    description: 'ID do usuário responsável pelo lead',
    example: '550e8400-e29b-41d4-a716-446655440001',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  responsavelId?: string;
}
