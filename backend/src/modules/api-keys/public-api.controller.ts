import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Request,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { ApiKeyGuard } from './guards/api-key.guard';
import { LeadsService } from '../leads/leads.service';

@Controller({ path: 'public', version: '1' })
export class PublicApiController {
  constructor(private readonly leadsService: LeadsService) {}

  // ============================================================================
  // WEBHOOK PARA RECEBER LEADS DE CAMPANHAS
  // ============================================================================

  @Post('webhook/leads')
  @UseGuards(ApiKeyGuard)
  async receiveLeadWebhook(@Request() req, @Body() data: any) {
    // Verificar permissão
    if (!req.apiKey.permissoes?.criar_leads) {
      throw new ForbiddenException(
        'Esta API Key não tem permissão para criar leads',
      );
    }

    // Validar dados mínimos
    if (!data.nome || !data.email) {
      throw new BadRequestException(
        'Campos obrigatórios: nome e email são necessários',
      );
    }

    // Mapear campos do webhook para o formato do sistema
    const leadData = {
      nome: data.nome || data.name,
      email: data.email,
      telefone: data.telefone || data.phone || data.tel,
      cargo: data.cargo || data.position || data.job_title,
      origem: data.origem || data.source || 'webhook',
      status: data.status || 'novo',
      pontuacao: data.pontuacao || data.score || 0,
      interesse: data.interesse || data.interest,
      observacoes: data.observacoes || data.notes || data.message,
      empresa_id: data.empresa_id || data.company_id,
      responsavel_id: req.user.id, // Usar o dono da API Key como responsável
      // Campos customizados (salvos em JSONB se a entidade suportar)
      custom_fields: data.custom_fields || {},
    };

    // Criar o lead
    const lead = await this.leadsService.create(leadData);

    return {
      success: true,
      message: 'Lead recebido com sucesso',
      lead_id: lead.id,
      timestamp: new Date().toISOString(),
    };
  }

  // ============================================================================
  // API PARA CONSULTAR LEADS
  // ============================================================================

  @Get('leads')
  @UseGuards(ApiKeyGuard)
  async getLeads(
    @Request() req,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 50,
    @Query('status') status?: string,
    @Query('origem') origem?: string,
    @Query('data_inicio') dataInicio?: string,
    @Query('data_fim') dataFim?: string,
  ) {
    // Verificar permissão
    if (!req.apiKey.permissoes?.ler_leads) {
      throw new ForbiddenException(
        'Esta API Key não tem permissão para ler leads',
      );
    }

    // Limitar o número máximo de resultados por página
    if (limit > 100) {
      throw new BadRequestException('Limite máximo de 100 registros por página');
    }

    // Buscar leads com filtros
    const result = await this.leadsService.findAll({
      page,
      limit,
      status: status as any,
    });

    return {
      success: true,
      data: result.data,
      meta: result.meta,
      timestamp: new Date().toISOString(),
    };
  }

  // ============================================================================
  // API PARA CONSULTAR ESTATÍSTICAS
  // ============================================================================

  // TODO: Implementar endpoint de estatísticas quando o método estiver disponível
  // @Get('leads/stats')
  // @UseGuards(ApiKeyGuard)
  // async getLeadStats(@Request() req) { ... }
}
