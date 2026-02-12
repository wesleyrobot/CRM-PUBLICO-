import { IsString, IsEmail, IsOptional, IsPhoneNumber } from 'class-validator';

export class ImportLeadDto {
  @IsString()
  nome: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  telefone?: string;

  @IsString()
  @IsOptional()
  empresa?: string;

  @IsString()
  @IsOptional()
  cargo?: string;

  @IsString()
  @IsOptional()
  origem?: string;

  @IsString()
  @IsOptional()
  observacoes?: string;
}

export class ImportResultDto {
  total: number;
  sucesso: number;
  erros: number;
  detalhes: {
    linha: number;
    dados: any;
    erro?: string;
    status: 'sucesso' | 'erro';
  }[];
}
