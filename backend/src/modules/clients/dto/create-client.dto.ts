import { IsString, IsOptional, IsBoolean, IsEmail, MaxLength, IsUUID, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateClientDto {
  @ApiProperty({
    description: 'Nome completo do cliente',
    example: 'Carlos Mendes',
    maxLength: 100,
  })
  @IsString()
  @MaxLength(100)
  nome: string;

  @ApiPropertyOptional({
    description: 'Email do cliente',
    example: 'carlos.mendes@empresa.com',
    format: 'email',
    maxLength: 150,
  })
  @IsOptional()
  @IsEmail()
  @MaxLength(150)
  email?: string;

  @ApiPropertyOptional({
    description: 'Telefone fixo',
    example: '(11) 3333-4444',
    maxLength: 20,
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  telefone?: string;

  @ApiPropertyOptional({
    description: 'Telefone celular',
    example: '(11) 98765-4321',
    maxLength: 20,
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  celular?: string;

  @ApiPropertyOptional({
    description: 'Cargo do cliente na empresa',
    example: 'Diretor Financeiro',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  cargo?: string;

  @ApiPropertyOptional({
    description: 'Departamento do cliente',
    example: 'Financeiro',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  departamento?: string;

  @ApiPropertyOptional({
    description: 'Data de nascimento do cliente',
    example: '1985-03-15',
    format: 'date-time',
  })
  @IsOptional()
  @IsDateString()
  dataNascimento?: string;

  @ApiPropertyOptional({
    description: 'Status de ativação do cliente',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  ativo?: boolean;

  @ApiPropertyOptional({
    description: 'Observações sobre o cliente',
    example: 'Preferência por contato via email',
  })
  @IsOptional()
  @IsString()
  observacoes?: string;

  @ApiPropertyOptional({
    description: 'ID da empresa associada ao cliente',
    example: '550e8400-e29b-41d4-a716-446655440000',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  empresaId?: string;

  @ApiPropertyOptional({
    description: 'ID do usuário responsável pelo cliente',
    example: '550e8400-e29b-41d4-a716-446655440001',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  responsavelId?: string;
}
