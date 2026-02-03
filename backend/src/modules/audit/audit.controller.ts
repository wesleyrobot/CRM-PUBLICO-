import { Controller, Get, Query, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { AuditService } from './audit.service';
import { AuditQueryDto, AuditResponse } from './dto/audit-query.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Audit } from './entities/audit.entity';

@ApiTags('Audit')
@Controller('audit')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @Roles('admin', 'gerente')
  @ApiOperation({
    summary: 'Listar logs de auditoria',
    description: `
      Retorna todos os logs de auditoria com filtros e paginação.

      **Filtros disponíveis:**
      - tabela: leads, clientes, empresas, usuarios
      - acao: INSERT, UPDATE, DELETE
      - registroId: UUID do registro alterado
      - usuarioId: UUID do usuário que fez a alteração

      **Requer:** Role admin ou gerente
    `,
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de logs de auditoria',
    schema: {
      example: {
        data: [
          {
            id: 1,
            tabela: 'leads',
            acao: 'UPDATE',
            registroId: '123e4567-e89b-12d3-a456-426614174000',
            dadosAnteriores: { status: 'novo' },
            dadosNovos: { status: 'qualificado' },
            usuarioId: '123e4567-e89b-12d3-a456-426614174001',
            criadoEm: '2024-01-15T10:30:00Z',
          },
        ],
        meta: {
          total: 150,
          page: 1,
          limit: 20,
          totalPages: 8,
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 403, description: 'Acesso negado - requer role admin ou gerente' })
  async findAll(@Query() query: AuditQueryDto): Promise<AuditResponse> {
    return this.auditService.findAll(query);
  }

  @Get('stats')
  @Roles('admin', 'gerente')
  @ApiOperation({
    summary: 'Estatísticas de auditoria',
    description: 'Retorna estatísticas gerais dos logs de auditoria.',
  })
  @ApiResponse({
    status: 200,
    description: 'Estatísticas de auditoria',
    schema: {
      example: {
        totalLogs: 1500,
        byAction: {
          INSERT: 500,
          UPDATE: 800,
          DELETE: 200,
        },
        byTable: {
          leads: 600,
          clientes: 500,
          empresas: 300,
          usuarios: 100,
        },
        last24h: 45,
      },
    },
  })
  async getStats() {
    return this.auditService.getStats();
  }

  @Get('registro/:registroId')
  @Roles('admin', 'gerente')
  @ApiOperation({
    summary: 'Histórico de um registro',
    description: 'Retorna todo o histórico de alterações de um registro específico.',
  })
  @ApiParam({
    name: 'registroId',
    description: 'UUID do registro',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Histórico do registro',
  })
  async findByRegistro(@Param('registroId') registroId: string): Promise<Audit[]> {
    return this.auditService.findByRegistro(registroId);
  }
}
