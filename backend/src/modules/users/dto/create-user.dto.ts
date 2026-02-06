import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
  IsIn,
  IsBoolean,
  Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '../entities/user.entity';

export class CreateUserDto {
  @ApiProperty({
    description: 'Nome completo do usuário',
    example: 'João Silva',
    minLength: 2,
    maxLength: 100,
  })
  @IsString({ message: 'Nome deve ser uma string' })
  @MinLength(2, { message: 'Nome deve ter no mínimo 2 caracteres' })
  @MaxLength(100, { message: 'Nome deve ter no máximo 100 caracteres' })
  nome: string;

  @ApiProperty({
    description: 'Email do usuário',
    example: 'joao.silva@exemplo.com',
    format: 'email',
    maxLength: 150,
  })
  @IsEmail({}, { message: 'Email inválido' })
  @MaxLength(150, { message: 'Email deve ter no máximo 150 caracteres' })
  email: string;

  @ApiProperty({
    description:
      'Senha do usuário (mínimo 8 caracteres, deve conter maiúscula, minúscula e número)',
    example: 'Senha@123',
    minLength: 8,
  })
  @IsString({ message: 'Senha deve ser uma string' })
  @MinLength(8, { message: 'Senha deve ter no mínimo 8 caracteres' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message:
      'Senha deve conter pelo menos uma letra maiúscula, uma minúscula e um número',
  })
  senha: string;

  @ApiPropertyOptional({
    description: 'Cargo/função do usuário no sistema',
    example: 'vendedor',
    enum: ['admin', 'gerente', 'vendedor'],
    default: 'vendedor',
  })
  @IsOptional()
  @IsIn(['admin', 'gerente', 'vendedor'], {
    message: 'Cargo deve ser admin, gerente ou vendedor',
  })
  cargo?: UserRole;

  @ApiPropertyOptional({
    description: 'Status de ativação do usuário',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'Ativo deve ser verdadeiro ou falso' })
  ativo?: boolean;

  @ApiPropertyOptional({
    description: 'URL do avatar do usuário',
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
