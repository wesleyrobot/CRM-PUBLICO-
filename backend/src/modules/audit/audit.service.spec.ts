import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditService } from './audit.service';
import { Audit } from './entities/audit.entity';

describe('AuditService', () => {
  let service: AuditService;
  let repository: jest.Mocked<Repository<Audit>>;

  const mockQueryBuilder = {
    orderBy: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getCount: jest.fn(),
    getMany: jest.fn(),
    select: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    groupBy: jest.fn().mockReturnThis(),
    getRawMany: jest.fn(),
    where: jest.fn().mockReturnThis(),
  };

  const mockRepository = {
    createQueryBuilder: jest.fn(() => mockQueryBuilder),
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    count: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditService,
        {
          provide: getRepositoryToken(Audit),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<AuditService>(AuditService);
    repository = module.get(getRepositoryToken(Audit));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated audit logs', async () => {
      const mockAudits = [
        {
          id: 1,
          tabela: 'leads',
          acao: 'INSERT',
          registroId: 'uuid-123',
          dadosAnteriores: null,
          dadosNovos: { nome: 'Test' },
          usuarioId: 'user-123',
          criadoEm: new Date(),
        },
      ];

      mockQueryBuilder.getCount.mockResolvedValue(1);
      mockQueryBuilder.getMany.mockResolvedValue(mockAudits);

      const result = await service.findAll({ page: 1, limit: 20 });

      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
      expect(result.meta.page).toBe(1);
    });

    it('should filter by tabela', async () => {
      mockQueryBuilder.getCount.mockResolvedValue(0);
      mockQueryBuilder.getMany.mockResolvedValue([]);

      await service.findAll({ tabela: 'leads', page: 1, limit: 20 });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('audit.tabela = :tabela', {
        tabela: 'leads',
      });
    });

    it('should filter by acao', async () => {
      mockQueryBuilder.getCount.mockResolvedValue(0);
      mockQueryBuilder.getMany.mockResolvedValue([]);

      await service.findAll({ acao: 'UPDATE', page: 1, limit: 20 });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('audit.acao = :acao', {
        acao: 'UPDATE',
      });
    });

    it('should filter by registroId', async () => {
      mockQueryBuilder.getCount.mockResolvedValue(0);
      mockQueryBuilder.getMany.mockResolvedValue([]);

      await service.findAll({ registroId: 'uuid-123', page: 1, limit: 20 });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('audit.registroId = :registroId', {
        registroId: 'uuid-123',
      });
    });
  });

  describe('findByRegistro', () => {
    it('should return audit logs for a specific registro', async () => {
      const mockAudits = [
        { id: 1, tabela: 'leads', acao: 'INSERT', registroId: 'uuid-123' },
        { id: 2, tabela: 'leads', acao: 'UPDATE', registroId: 'uuid-123' },
      ];

      mockRepository.find.mockResolvedValue(mockAudits);

      const result = await service.findByRegistro('uuid-123');

      expect(result).toHaveLength(2);
      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { registroId: 'uuid-123' },
        order: { criadoEm: 'DESC' },
      });
    });
  });

  describe('getStats', () => {
    it('should return audit statistics', async () => {
      mockRepository.count.mockResolvedValue(100);
      mockQueryBuilder.getRawMany
        .mockResolvedValueOnce([
          { acao: 'INSERT', count: '40' },
          { acao: 'UPDATE', count: '50' },
          { acao: 'DELETE', count: '10' },
        ])
        .mockResolvedValueOnce([
          { tabela: 'leads', count: '60' },
          { tabela: 'clientes', count: '40' },
        ]);
      mockQueryBuilder.getCount.mockResolvedValue(15);

      const result = await service.getStats();

      expect(result.totalLogs).toBe(100);
      expect(result.byAction.INSERT).toBe(40);
      expect(result.byAction.UPDATE).toBe(50);
      expect(result.byTable.leads).toBe(60);
      expect(result.last24h).toBe(15);
    });
  });

  describe('createManualLog', () => {
    it('should create a manual audit log', async () => {
      const auditData = {
        tabela: 'leads',
        acao: 'INSERT' as const,
        registroId: 'uuid-123',
        dadosNovos: { nome: 'Test' },
      };

      const mockAudit = { id: 1, ...auditData };
      mockRepository.create.mockReturnValue(mockAudit);
      mockRepository.save.mockResolvedValue(mockAudit);

      const result = await service.createManualLog(auditData);

      expect(mockRepository.create).toHaveBeenCalled();
      expect(mockRepository.save).toHaveBeenCalled();
      expect(result.id).toBe(1);
    });
  });
});
