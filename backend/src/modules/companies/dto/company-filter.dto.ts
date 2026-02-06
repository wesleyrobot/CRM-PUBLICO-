import { IsOptional, IsBoolean, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class CompanyFilterDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'Filtrar por status ativo/inativo',
    example: true,
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  ativo?: boolean;

  @ApiPropertyOptional({
    description: 'Filtrar por segmento',
    example: 'Tecnologia',
  })
  @IsOptional()
  @IsString()
  segmento?: string;
}
