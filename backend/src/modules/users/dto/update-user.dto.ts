import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
  IsIn,
  IsBoolean,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '../entities/user.entity';

export class UpdateUserDto {
  @ApiPropertyOptional({
    description: 'Nome completo do usuário',
    example: 'João Silva',
    minLength: 2,
    maxLength: 100,
  })
  @IsOptional()
  @IsString({ message: 'Nome deve ser uma string' })
  @MinLength(2, { message: 'Nome deve ter no mínimo 2 caracteres' })
  @MaxLength(100, { message: 'Nome deve ter no máximo 100 caracteres' })
  nome?: string;

  @ApiPropertyOptional({
    description: 'Email do usuário',
    example: 'joao.silva@exemplo.com',
    format: 'email',
    maxLength: 150,
  })
  @IsOptional()
  @IsEmail({}, { message: 'Email inválido' })
  @MaxLength(150, { message: 'Email deve ter no máximo 150 caracteres' })
  email?: string;

  @ApiPropertyOptional({
    description: 'Nova senha do usuário',
    example: 'novaSenha123',
    minLength: 6,
  })
  @IsOptional()
  @IsString({ message: 'Senha deve ser uma string' })
  @MinLength(6, { message: 'Senha deve ter no mínimo 6 caracteres' })
  senha?: string;

  @ApiPropertyOptional({
    description: 'Cargo/função do usuário',
    example: 'vendedor',
    enum: ['admin', 'gerente', 'vendedor'],
  })
  @IsOptional()
  @IsIn(['admin', 'gerente', 'vendedor'], {
    message: 'Cargo deve ser admin, gerente ou vendedor',
  })
  cargo?: UserRole;

  @ApiPropertyOptional({
    description: 'Status de ativação',
    example: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'Ativo deve ser verdadeiro ou falso' })
  ativo?: boolean;

  @ApiPropertyOptional({
    description: 'URL do avatar',
    example: 'https://exemplo.com/avatar.jpg',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  avatar?: string;

  @ApiPropertyOptional({
    description: 'Telefone de contato',
    example: '(11) 98765-4321',
    maxLength: 20,
  })
  @IsOptional()
  @IsString()
  @MaxLength(20, { message: 'Telefone deve ter no máximo 20 caracteres' })
  telefone?: string;
}
