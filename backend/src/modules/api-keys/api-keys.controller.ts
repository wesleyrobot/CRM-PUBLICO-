import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiKeysService } from './api-keys.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller({ path: 'keys', version: '1' })
@UseGuards(JwtAuthGuard)
export class ApiKeysController {
  constructor(private readonly apiKeysService: ApiKeysService) {}

  @Post()
  async create(
    @Request() req,
    @Body()
    createDto: {
      nome: string;
      descricao?: string;
      expira_em?: string;
      permissoes?: any;
    },
  ) {
    const { apiKey, chaveGerada } = await this.apiKeysService.create(
      req.user.id,
      {
        ...createDto,
        expira_em: createDto.expira_em
          ? new Date(createDto.expira_em)
          : undefined,
        permissoes: createDto.permissoes || {
          criar_leads: true,
          ler_leads: true,
          atualizar_leads: false,
          deletar_leads: false,
          ler_clientes: false,
          ler_empresas: false,
        },
      },
    );

    // Retornar a chave gerada (ÚNICA VEZ que será mostrada)
    return {
      ...apiKey,
      chave: chaveGerada,
      aviso:
        'ATENÇÃO: Guarde esta chave em local seguro. Ela não será mostrada novamente!',
    };
  }

  @Get()
  async findAll(@Request() req) {
    const keys = await this.apiKeysService.findAll(req.user.id);

    // Não retornar a chave completa, apenas os últimos 8 caracteres
    return keys.map((key) => ({
      ...key,
      chave: `********${key.chave.slice(-8)}`,
    }));
  }

  @Get('stats')
  async getStats(@Request() req) {
    return this.apiKeysService.getStats(req.user.id);
  }

  @Get(':id')
  async findOne(@Request() req, @Param('id') id: string) {
    const key = await this.apiKeysService.findOne(id, req.user.id);

    return {
      ...key,
      chave: `********${key.chave.slice(-8)}`,
    };
  }

  @Patch(':id')
  async update(
    @Request() req,
    @Param('id') id: string,
    @Body()
    updateDto: {
      nome?: string;
      descricao?: string;
      expira_em?: string;
      permissoes?: any;
    },
  ) {
    const updated = await this.apiKeysService.update(id, req.user.id, {
      ...updateDto,
      expira_em: updateDto.expira_em
        ? new Date(updateDto.expira_em)
        : undefined,
    });

    return {
      ...updated,
      chave: `********${updated.chave.slice(-8)}`,
    };
  }

  @Patch(':id/toggle')
  async toggleActive(@Request() req, @Param('id') id: string) {
    const updated = await this.apiKeysService.toggleActive(id, req.user.id);

    return {
      ...updated,
      chave: `********${updated.chave.slice(-8)}`,
    };
  }

  @Delete(':id')
  async remove(@Request() req, @Param('id') id: string) {
    await this.apiKeysService.remove(id, req.user.id);
    return { message: 'API Key removida com sucesso' };
  }
}
