import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Audit, AuditAction } from './entities/audit.entity';
import { AuditQueryDto, AuditResponse } from './dto/audit-query.dto';

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(Audit)
    private readonly auditRepository: Repository<Audit>,
  ) {}

  async findAll(query: AuditQueryDto): Promise<AuditResponse> {
    const { tabela, acao, registroId, usuarioId, page, limit } = query;

    const queryBuilder = this.auditRepository
      .createQueryBuilder('audit')
      .orderBy('audit.criadoEm', 'DESC');

    if (tabela) {
      queryBuilder.andWhere('audit.tabela = :tabela', { tabela });
    }

    if (acao) {
      queryBuilder.andWhere('audit.acao = :acao', { acao });
    }

    if (registroId) {
      queryBuilder.andWhere('audit.registroId = :registroId', { registroId });
    }

    if (usuarioId) {
      queryBuilder.andWhere('audit.usuarioId = :usuarioId', { usuarioId });
    }

    const total = await queryBuilder.getCount();
    const data = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return {
      data: data.map((item) => ({
        id: item.id,
        tabela: item.tabela,
        acao: item.acao,
        registroId: item.registroId,
        dadosAnteriores: item.dadosAnteriores,
        dadosNovos: item.dadosNovos,
        usuarioId: item.usuarioId,
        criadoEm: item.criadoEm,
      })),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findByRegistro(registroId: string): Promise<Audit[]> {
    return this.auditRepository.find({
      where: { registroId },
      order: { criadoEm: 'DESC' },
    });
  }

  async getStats(): Promise<{
    totalLogs: number;
    byAction: Record<string, number>;
    byTable: Record<string, number>;
    last24h: number;
  }> {
    const totalLogs = await this.auditRepository.count();

    const byActionResult = await this.auditRepository
      .createQueryBuilder('audit')
      .select('audit.acao', 'acao')
      .addSelect('COUNT(*)', 'count')
      .groupBy('audit.acao')
      .getRawMany();

    const byTableResult = await this.auditRepository
      .createQueryBuilder('audit')
      .select('audit.tabela', 'tabela')
      .addSelect('COUNT(*)', 'count')
      .groupBy('audit.tabela')
      .getRawMany();

    const last24h = await this.auditRepository
      .createQueryBuilder('audit')
      .where("audit.criadoEm >= NOW() - INTERVAL '24 hours'")
      .getCount();

    const byAction: Record<string, number> = {};
    byActionResult.forEach((r) => {
      byAction[r.acao] = parseInt(r.count);
    });

    const byTable: Record<string, number> = {};
    byTableResult.forEach((r) => {
      byTable[r.tabela] = parseInt(r.count);
    });

    return {
      totalLogs,
      byAction,
      byTable,
      last24h,
    };
  }

  async createManualLog(data: {
    tabela: string;
    acao: AuditAction;
    registroId: string;
    dadosAnteriores?: Record<string, any>;
    dadosNovos?: Record<string, any>;
    usuarioId?: string;
  }): Promise<Audit> {
    const audit = this.auditRepository.create({
      tabela: data.tabela,
      acao: data.acao,
      registroId: data.registroId,
      dadosAnteriores: data.dadosAnteriores || null,
      dadosNovos: data.dadosNovos || null,
      usuarioId: data.usuarioId || null,
    });

    return this.auditRepository.save(audit);
  }
}
