import { Test, TestingModule } from '@nestjs/testing';
import { AuditController } from './audit.controller';
import { AuditService } from './audit.service';

describe('AuditController', () => {
  let controller: AuditController;
  let service: jest.Mocked<AuditService>;

  const mockAuditService = {
    findAll: jest.fn(),
    findByRegistro: jest.fn(),
    getStats: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuditController],
      providers: [
        {
          provide: AuditService,
          useValue: mockAuditService,
        },
      ],
    }).compile();

    controller = module.get<AuditController>(AuditController);
    service = module.get(AuditService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated audit logs', async () => {
      const expectedResponse = {
        data: [
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
        ],
        meta: {
          total: 1,
          page: 1,
          limit: 20,
          totalPages: 1,
        },
      };

      mockAuditService.findAll.mockResolvedValue(expectedResponse);

      const result = await controller.findAll({ page: 1, limit: 20 });

      expect(result).toEqual(expectedResponse);
      expect(service.findAll).toHaveBeenCalledWith({ page: 1, limit: 20 });
    });

    it('should pass filters to service', async () => {
      mockAuditService.findAll.mockResolvedValue({ data: [], meta: {} });

      await controller.findAll({
        tabela: 'leads',
        acao: 'UPDATE',
        page: 1,
        limit: 10,
      });

      expect(service.findAll).toHaveBeenCalledWith({
        tabela: 'leads',
        acao: 'UPDATE',
        page: 1,
        limit: 10,
      });
    });
  });

  describe('getStats', () => {
    it('should return audit statistics', async () => {
      const expectedStats = {
        totalLogs: 100,
        byAction: { INSERT: 40, UPDATE: 50, DELETE: 10 },
        byTable: { leads: 60, clientes: 40 },
        last24h: 15,
      };

      mockAuditService.getStats.mockResolvedValue(expectedStats);

      const result = await controller.getStats();

      expect(result).toEqual(expectedStats);
      expect(service.getStats).toHaveBeenCalled();
    });
  });

  describe('findByRegistro', () => {
    it('should return audit history for a registro', async () => {
      const mockAudits = [
        { id: 1, tabela: 'leads', acao: 'INSERT', registroId: 'uuid-123' },
        { id: 2, tabela: 'leads', acao: 'UPDATE', registroId: 'uuid-123' },
      ];

      mockAuditService.findByRegistro.mockResolvedValue(mockAudits);

      const result = await controller.findByRegistro('uuid-123');

      expect(result).toHaveLength(2);
      expect(service.findByRegistro).toHaveBeenCalledWith('uuid-123');
    });
  });
});
