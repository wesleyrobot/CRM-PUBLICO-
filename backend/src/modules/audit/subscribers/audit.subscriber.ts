import {
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  UpdateEvent,
  RemoveEvent,
  DataSource,
} from 'typeorm';
import { Audit, AuditAction } from '../entities/audit.entity';
import { Lead } from '../../leads/entities/lead.entity';
import { Client } from '../../clients/entities/client.entity';
import { Company } from '../../companies/entities/company.entity';
import { User } from '../../users/entities/user.entity';

// Tabelas que serão auditadas
const AUDITED_ENTITIES = [Lead, Client, Company, User];

// Mapeamento de entidade para nome da tabela
const ENTITY_TABLE_MAP: Record<string, string> = {
  Lead: 'leads',
  Client: 'clientes',
  Company: 'empresas',
  User: 'usuarios',
};

@EventSubscriber()
export class AuditSubscriber implements EntitySubscriberInterface {
  constructor(dataSource: DataSource) {
    dataSource.subscribers.push(this);
  }

  private shouldAudit(entity: any): boolean {
    return AUDITED_ENTITIES.some((e) => entity instanceof e);
  }

  private getTableName(entity: any): string {
    const entityName = entity.constructor.name;
    return ENTITY_TABLE_MAP[entityName] || entityName.toLowerCase();
  }

  private sanitizeData(data: any): Record<string, any> {
    if (!data) return null;

    const sanitized = { ...data };
    // Remove campos sensíveis
    delete sanitized.senha;
    delete sanitized.password;
    delete sanitized.search_vector;
    delete sanitized.searchVector;
    // Remove relacionamentos circulares
    delete sanitized.company;
    delete sanitized.responsavel;
    delete sanitized.leads;
    delete sanitized.clients;
    delete sanitized.usuario;

    return sanitized;
  }

  async afterInsert(event: InsertEvent<any>): Promise<void> {
    if (!this.shouldAudit(event.entity)) return;

    await this.createAuditLog(event.manager.connection, {
      tabela: this.getTableName(event.entity),
      acao: 'INSERT',
      registroId: event.entity.id,
      dadosAnteriores: null,
      dadosNovos: this.sanitizeData(event.entity),
      usuarioId: this.extractUserId(event),
    });
  }

  async afterUpdate(event: UpdateEvent<any>): Promise<void> {
    if (!event.entity || !this.shouldAudit(event.entity)) return;

    await this.createAuditLog(event.manager.connection, {
      tabela: this.getTableName(event.entity),
      acao: 'UPDATE',
      registroId: event.entity.id,
      dadosAnteriores: this.sanitizeData(event.databaseEntity),
      dadosNovos: this.sanitizeData(event.entity),
      usuarioId: this.extractUserId(event),
    });
  }

  async afterRemove(event: RemoveEvent<any>): Promise<void> {
    if (!event.entity || !this.shouldAudit(event.entity)) return;

    await this.createAuditLog(event.manager.connection, {
      tabela: this.getTableName(event.entity),
      acao: 'DELETE',
      registroId: event.entity.id,
      dadosAnteriores: this.sanitizeData(event.entity),
      dadosNovos: null,
      usuarioId: this.extractUserId(event),
    });
  }

  private extractUserId(event: any): string | null {
    // Tenta extrair o userId do contexto (se disponível via request)
    // Como o subscriber não tem acesso direto ao request, retornamos null
    // O userId será preenchido pelo service quando necessário
    return null;
  }

  private async createAuditLog(
    connection: DataSource,
    data: {
      tabela: string;
      acao: AuditAction;
      registroId: string;
      dadosAnteriores: Record<string, any> | null;
      dadosNovos: Record<string, any> | null;
      usuarioId: string | null;
    },
  ): Promise<void> {
    try {
      await connection.query(
        `INSERT INTO auditoria (tabela, acao, registro_id, dados_anteriores, dados_novos, usuario_id, criado_em)
         VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
        [
          data.tabela,
          data.acao,
          data.registroId,
          data.dadosAnteriores ? JSON.stringify(data.dadosAnteriores) : null,
          data.dadosNovos ? JSON.stringify(data.dadosNovos) : null,
          data.usuarioId,
        ],
      );
    } catch (error) {
      // Log silencioso para não interromper a operação principal
      console.error('Erro ao criar log de auditoria:', error.message);
    }
  }
}
