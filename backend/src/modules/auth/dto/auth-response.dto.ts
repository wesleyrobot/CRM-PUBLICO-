import { ApiProperty } from '@nestjs/swagger';

export class UserProfileDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id: string;

  @ApiProperty({ example: 'Wesley Robot' })
  nome: string;

  @ApiProperty({ example: 'wesley@test.com' })
  email: string;

  @ApiProperty({ example: 'vendedor', enum: ['admin', 'gerente', 'vendedor'] })
  cargo: string;

  @ApiProperty({ example: 'https://example.com/avatar.jpg', required: false })
  avatar?: string;
}

export class LoginResponseDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  access_token: string;

  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  refresh_token: string;

  @ApiProperty({ type: UserProfileDto })
  user: UserProfileDto;
}

export class ProfileResponseDto extends UserProfileDto {
  @ApiProperty({ example: '11999999999', required: false })
  telefone?: string;

  @ApiProperty({ example: '2024-01-29T00:00:00.000Z' })
  criadoEm: Date;
}
