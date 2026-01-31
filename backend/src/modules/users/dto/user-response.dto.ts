import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({ example: 'f0a6c600-1bb3-4c4c-8b9c-c08fdf891862' })
  id: string;

  @ApiProperty({ example: 'Wesley Robot' })
  nome: string;

  @ApiProperty({ example: 'wesley@test.com' })
  email: string;

  @ApiProperty({ example: 'vendedor', enum: ['admin', 'gerente', 'vendedor'] })
  cargo: string;

  @ApiProperty({ example: true })
  ativo: boolean;

  @ApiProperty({ example: 'https://example.com/avatar.jpg', required: false })
  avatar?: string;

  @ApiProperty({ example: '11999999999', required: false })
  telefone?: string;

  @ApiProperty({ example: '2026-01-29T00:00:00.000Z' })
  criadoEm: Date;

  @ApiProperty({ example: '2026-01-29T00:00:00.000Z' })
  atualizadoEm: Date;
}
