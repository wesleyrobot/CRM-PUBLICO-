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
  Query,
} from '@nestjs/common';
import { IntegrationsService } from './integrations.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { IntegrationType, IntegrationEvent } from './entities/integration.entity';

@Controller({ path: 'integrations', version: '1' })
@UseGuards(JwtAuthGuard)
export class IntegrationsController {
  constructor(private readonly integrationsService: IntegrationsService) {}

  @Post()
  async create(
    @Request() req,
    @Body()
    createDto: {
      name: string;
      description?: string;
      type?: IntegrationType;
      url: string;
      method?: string;
      auth_token?: string;
      headers?: Record<string, string>;
      config?: any;
      events?: IntegrationEvent[];
    },
  ) {
    return this.integrationsService.create(req.user.id, createDto);
  }

  @Get()
  async findAll(@Request() req) {
    return this.integrationsService.findAll(req.user.id);
  }

  @Get('stats')
  async getStats(@Request() req) {
    return this.integrationsService.getStats(req.user.id);
  }

  @Get(':id')
  async findOne(@Request() req, @Param('id') id: string) {
    return this.integrationsService.findOne(id, req.user.id);
  }

  @Get(':id/logs')
  async getLogs(
    @Request() req,
    @Param('id') id: string,
    @Query('limit') limit?: number,
  ) {
    return this.integrationsService.getLogs(
      id,
      req.user.id,
      limit ? parseInt(limit.toString()) : 50,
    );
  }

  @Post(':id/test')
  async test(@Request() req, @Param('id') id: string) {
    return this.integrationsService.test(id, req.user.id);
  }

  @Patch(':id')
  async update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateDto: any,
  ) {
    return this.integrationsService.update(id, req.user.id, updateDto);
  }

  @Patch(':id/toggle')
  async toggleActive(@Request() req, @Param('id') id: string) {
    return this.integrationsService.toggleActive(id, req.user.id);
  }

  @Delete(':id')
  async remove(@Request() req, @Param('id') id: string) {
    await this.integrationsService.remove(id, req.user.id);
    return { message: 'Integração removida com sucesso' };
  }
}
