import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Integration, IntegrationEvent } from './entities/integration.entity';
import { IntegrationLog } from './entities/integration-log.entity';
import axios, { AxiosRequestConfig } from 'axios';

@Injectable()
export class IntegrationsService {
  private readonly logger = new Logger(IntegrationsService.name);

  constructor(
    @InjectRepository(Integration)
    private integrationsRepository: Repository<Integration>,
    @InjectRepository(IntegrationLog)
    private logsRepository: Repository<IntegrationLog>,
  ) {}

  async create(userId: string, data: Partial<Integration>): Promise<Integration> {
    const integration = this.integrationsRepository.create({
      ...data,
      user_id: userId,
    });

    return this.integrationsRepository.save(integration);
  }

  async findAll(userId: string): Promise<Integration[]> {
    return this.integrationsRepository.find({
      where: { user_id: userId, deleted_at: null },
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: string, userId: string): Promise<Integration> {
    const integration = await this.integrationsRepository.findOne({
      where: { id, user_id: userId, deleted_at: null },
    });

    if (!integration) {
      throw new NotFoundException('Integração não encontrada');
    }

    return integration;
  }

  async update(
    id: string,
    userId: string,
    data: Partial<Integration>,
  ): Promise<Integration> {
    const integration = await this.findOne(id, userId);
    Object.assign(integration, data);
    return this.integrationsRepository.save(integration);
  }

  async remove(id: string, userId: string): Promise<void> {
    const integration = await this.findOne(id, userId);
    integration.deleted_at = new Date();
    await this.integrationsRepository.save(integration);
  }

  async toggleActive(id: string, userId: string): Promise<Integration> {
    const integration = await this.findOne(id, userId);
    integration.active = !integration.active;
    return this.integrationsRepository.save(integration);
  }

  async test(id: string, userId: string): Promise<{
    success: boolean;
    status?: number;
    response?: any;
    error?: string;
    duration: number;
  }> {
    const integration = await this.findOne(id, userId);

    const testPayload = {
      event: 'test',
      data: {
        test: true,
        timestamp: new Date().toISOString(),
        message: 'Este é um teste de integração do CRM Público',
      },
    };

    return this.trigger(integration, IntegrationEvent.LEAD_CREATED, testPayload);
  }

  async trigger(
    integration: Integration,
    event: IntegrationEvent,
    data: any,
  ): Promise<{
    success: boolean;
    status?: number;
    response?: any;
    error?: string;
    duration: number;
  }> {
    const startTime = Date.now();

    try {
      // Preparar headers
      const headers: any = {
        'Content-Type': 'application/json',
        ...integration.headers,
      };

      // Adicionar autenticação se houver
      if (integration.auth_token) {
        headers['Authorization'] = `Bearer ${integration.auth_token}`;
      }

      // Preparar payload
      let payload = {
        event,
        timestamp: new Date().toISOString(),
        data,
      };

      // Aplicar template customizado se houver
      if (integration.config?.custom_payload_template) {
        try {
          payload = JSON.parse(
            integration.config.custom_payload_template.replace(
              '{{data}}',
              JSON.stringify(data),
            ),
          );
        } catch (e) {
          this.logger.warn('Erro ao aplicar template customizado', e);
        }
      }

      // Configurar request
      const config: AxiosRequestConfig = {
        method: integration.method.toLowerCase() as any,
        url: integration.url,
        headers,
        data: payload,
        timeout: integration.config?.timeout_ms || 30000,
      };

      // Executar request
      const response = await axios(config);
      const duration = Date.now() - startTime;

      // Salvar log de sucesso
      await this.saveLog(integration.id, event, payload, {
        success: true,
        response_status: response.status,
        response_body: JSON.stringify(response.data),
        duration_ms: duration,
      });

      // Atualizar estatísticas
      await this.integrationsRepository.update(integration.id, {
        last_triggered_at: new Date(),
        success_count: () => 'success_count + 1',
        last_error: null,
      });

      return {
        success: true,
        status: response.status,
        response: response.data,
        duration,
      };
    } catch (error: any) {
      const duration = Date.now() - startTime;
      const errorMessage =
        error.response?.data?.message || error.message || 'Erro desconhecido';

      // Salvar log de erro
      await this.saveLog(integration.id, event, data, {
        success: false,
        response_status: error.response?.status,
        error: errorMessage,
        duration_ms: duration,
      });

      // Atualizar estatísticas
      await this.integrationsRepository.update(integration.id, {
        last_triggered_at: new Date(),
        error_count: () => 'error_count + 1',
        last_error: errorMessage,
      });

      // Tentar retry se configurado
      if (
        integration.config?.retry_on_failure &&
        integration.config?.max_retries
      ) {
        // TODO: Implementar fila de retry
        this.logger.warn(
          `Retry seria executado para integração ${integration.id}`,
        );
      }

      return {
        success: false,
        status: error.response?.status,
        error: errorMessage,
        duration,
      };
    }
  }

  async triggerEvent(event: IntegrationEvent, data: any): Promise<void> {
    // Buscar todas as integrações ativas que escutam este evento
    const integrations = await this.integrationsRepository.find({
      where: { active: true, deleted_at: null },
    });

    const relevantIntegrations = integrations.filter((integration) =>
      integration.events.includes(event),
    );

    this.logger.log(
      `Disparando evento ${event} para ${relevantIntegrations.length} integrações`,
    );

    // Executar todas as integrações em paralelo (fire and forget)
    const promises = relevantIntegrations.map((integration) =>
      this.trigger(integration, event, data).catch((err) => {
        this.logger.error(
          `Erro ao disparar integração ${integration.id}:`,
          err,
        );
      }),
    );

    await Promise.allSettled(promises);
  }

  private async saveLog(
    integrationId: string,
    event: IntegrationEvent,
    payload: any,
    result: {
      success: boolean;
      response_status?: number;
      response_body?: string;
      error?: string;
      duration_ms: number;
    },
  ): Promise<void> {
    await this.logsRepository.save({
      integration_id: integrationId,
      event,
      payload,
      ...result,
    });
  }

  async getLogs(
    integrationId: string,
    userId: string,
    limit: number = 50,
  ): Promise<IntegrationLog[]> {
    // Verificar se a integração pertence ao usuário
    await this.findOne(integrationId, userId);

    return this.logsRepository.find({
      where: { integration_id: integrationId },
      order: { created_at: 'DESC' },
      take: limit,
    });
  }

  async getStats(userId: string): Promise<{
    total: number;
    active: number;
    inactive: number;
    total_success: number;
    total_errors: number;
  }> {
    const integrations = await this.findAll(userId);

    return {
      total: integrations.length,
      active: integrations.filter((i) => i.active).length,
      inactive: integrations.filter((i) => !i.active).length,
      total_success: integrations.reduce((sum, i) => sum + i.success_count, 0),
      total_errors: integrations.reduce((sum, i) => sum + i.error_count, 0),
    };
  }
}
