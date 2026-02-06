import { IsOptional, IsIn } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { LeadStatus } from '../entities/lead.entity';

export class LeadFilterDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'Filtrar por status do lead',
    example: 'novo',
    enum: ['novo', 'em_contato', 'qualificado', 'perdido'],
  })
  @IsOptional()
  @IsIn(['novo', 'em_contato', 'qualificado', 'perdido'])
  status?: LeadStatus;
}
