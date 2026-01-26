import { IsString, IsOptional, IsNumber, IsIn, MaxLength, IsEmail, IsUUID, IsDateString } from 'class-validator';
import { LeadStatus } from '../entities/lead.entity';

export class CreateLeadDto {
  @IsString()
  @MaxLength(100)
  nome: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(150)
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  telefone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  cargo?: string;

  @IsOptional()
  @IsIn(['novo', 'em_contato', 'qualificado', 'perdido'])
  status?: LeadStatus;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  origem?: string;

  @IsOptional()
  @IsString()
  observacoes?: string;

  @IsOptional()
  @IsNumber()
  pontuacao?: number;

  @IsOptional()
  @IsDateString()
  dataUltimoContato?: string;

  @IsOptional()
  @IsUUID()
  empresaId?: string;

  @IsOptional()
  @IsUUID()
  responsavelId?: string;
}
