import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApiKey } from './entities/api-key.entity';
import * as crypto from 'crypto';

@Injectable()
export class ApiKeysService {
  constructor(
    @InjectRepository(ApiKey)
    private apiKeyRepository: Repository<ApiKey>,
  ) {}

  async create(
    usuarioId: string,
    data: {
      nome: string;
      descricao?: string;
      expira_em?: Date;
      permissoes?: any;
    },
  ): Promise<{ apiKey: ApiKey; chaveGerada: string }> {
    // Gerar chave aleatória segura
    const chaveGerada = this.generateSecureKey();

    const apiKey = this.apiKeyRepository.create({
      ...data,
      chave: chaveGerada,
      usuario_id: usuarioId,
    });

    await this.apiKeyRepository.save(apiKey);

    // Retornar a chave gerada (única vez que será mostrada)
    return { apiKey, chaveGerada };
  }

  async findAll(usuarioId: string): Promise<ApiKey[]> {
    return this.apiKeyRepository.find({
      where: { usuario_id: usuarioId, deletado_em: null },
      order: { criado_em: 'DESC' },
    });
  }

  async findOne(id: string, usuarioId: string): Promise<ApiKey> {
    const apiKey = await this.apiKeyRepository.findOne({
      where: { id, usuario_id: usuarioId, deletado_em: null },
    });

    if (!apiKey) {
      throw new NotFoundException('API Key não encontrada');
    }

    return apiKey;
  }

  async update(
    id: string,
    usuarioId: string,
    data: Partial<ApiKey>,
  ): Promise<ApiKey> {
    const apiKey = await this.findOne(id, usuarioId);

    // Não permitir alterar a chave
    delete data.chave;

    Object.assign(apiKey, data);
    return this.apiKeyRepository.save(apiKey);
  }

  async remove(id: string, usuarioId: string): Promise<void> {
    const apiKey = await this.findOne(id, usuarioId);
    apiKey.deletado_em = new Date();
    await this.apiKeyRepository.save(apiKey);
  }

  async toggleActive(id: string, usuarioId: string): Promise<ApiKey> {
    const apiKey = await this.findOne(id, usuarioId);
    apiKey.ativo = !apiKey.ativo;
    return this.apiKeyRepository.save(apiKey);
  }

  private generateSecureKey(): string {
    // Gera uma chave de 32 bytes (256 bits) em hexadecimal = 64 caracteres
    return crypto.randomBytes(32).toString('hex');
  }

  async getStats(usuarioId: string): Promise<{
    total: number;
    ativas: number;
    inativas: number;
    expiradas: number;
  }> {
    const keys = await this.findAll(usuarioId);
    const now = new Date();

    return {
      total: keys.length,
      ativas: keys.filter((k) => k.ativo && (!k.expira_em || k.expira_em > now))
        .length,
      inativas: keys.filter((k) => !k.ativo).length,
      expiradas: keys.filter((k) => k.expira_em && k.expira_em <= now).length,
    };
  }
}
