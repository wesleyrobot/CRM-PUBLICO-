import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { LeadsService } from './leads.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { LeadFilterDto } from './dto/lead-filter.dto';
import { LeadResponseDto } from './dto/lead-response.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Leads')
@Controller('leads')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Post()
  @Roles('admin', 'gerente', 'vendedor')
  @ApiOperation({ summary: 'Criar novo lead' })
  @ApiResponse({ status: 201, description: 'Lead criado com sucesso', type: LeadResponseDto })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  create(@Body() createLeadDto: CreateLeadDto) {
    return this.leadsService.create(createLeadDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os leads com filtros e paginação' })
  @ApiResponse({ status: 200, description: 'Lista de leads', type: [LeadResponseDto] })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  findAll(@Query() filterDto: LeadFilterDto) {
    return this.leadsService.findAll(filterDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar lead por ID' })
  @ApiResponse({ status: 200, description: 'Lead encontrado', type: LeadResponseDto })
  @ApiResponse({ status: 404, description: 'Lead não encontrado' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.leadsService.findOne(id);
  }

  @Patch(':id')
  @Roles('admin', 'gerente', 'vendedor')
  @ApiOperation({ summary: 'Atualizar lead' })
  @ApiResponse({ status: 200, description: 'Lead atualizado', type: LeadResponseDto })
  @ApiResponse({ status: 404, description: 'Lead não encontrado' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateLeadDto: UpdateLeadDto,
  ) {
    return this.leadsService.update(id, updateLeadDto);
  }

  @Delete(':id')
  @Roles('admin', 'gerente')
  @ApiOperation({ summary: 'Deletar lead' })
  @ApiResponse({ status: 200, description: 'Lead deletado' })
  @ApiResponse({ status: 404, description: 'Lead não encontrado' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.leadsService.remove(id);
  }
}
