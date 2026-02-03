import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { DashboardService } from './dashboard.service';
import { DashboardPeriod } from './dto/dashboard.dto';

describe('DashboardService', () => {
  let service: DashboardService;
  let dataSource: jest.Mocked<DataSource>;

  const mockDataSource = {
    query: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<DashboardService>(DashboardService);
    dataSource = module.get(DataSource);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getDashboard', () => {
    it('should return complete dashboard data', async () => {
      // Mock genérico que responde a todas as queries
      mockDataSource.query.mockImplementation((query: string) => {
        if (query.includes('mv_dashboard_stats')) {
          return Promise.resolve([{ total_leads: '100', total_clientes: '30', total_empresas: '20' }]);
        }
        if (query.includes('growth') || query.includes('current_period')) {
          return Promise.resolve([{
            growth_leads: '10.5', growth_clientes: '5.2', growth_empresas: '3.1',
          }]);
        }
        if (query.includes('qualified') && query.includes('lost')) {
          return Promise.resolve([{ qualified: '30', lost: '10', rate: '30.0' }]);
        }
        if (query.includes('usuarios')) {
          return Promise.resolve([{ total: '5' }]);
        }
        if (query.includes('generate_series')) {
          return Promise.resolve([
            { label: '01/01', leads: '10', clientes: '3' },
            { label: '02/01', leads: '15', clientes: '5' },
          ]);
        }
        if (query.includes('GROUP BY status')) {
          return Promise.resolve([
            { status: 'novo', count: '50', percentage: '50.0' },
            { status: 'qualificado', count: '30', percentage: '30.0' },
          ]);
        }
        if (query.includes('segmento')) {
          return Promise.resolve([
            { segmento: 'Tecnologia', leads: '40', clientes: '15', empresas: '10' },
          ]);
        }
        if (query.includes('u.nome')) {
          return Promise.resolve([
            { id: 'user-1', nome: 'João', leads: '20', clientes: '8', conversion: '40.0' },
          ]);
        }
        return Promise.resolve([]);
      });

      const result = await service.getDashboard({ period: DashboardPeriod.MONTH });

      expect(result.stats.totals.leads).toBe(100);
      expect(result.stats.totals.clientes).toBe(30);
      expect(result.timeline.labels).toHaveLength(2);
      expect(result.byStatus).toHaveLength(2);
      expect(result.topUsers).toHaveLength(1);
      expect(result.lastRefresh).toBeInstanceOf(Date);
    });
  });

  describe('getStats', () => {
    it('should return stats with totals and growth', async () => {
      mockDataSource.query
        .mockResolvedValueOnce([{ total_leads: '50', total_clientes: '20', total_empresas: '10' }])
        .mockResolvedValueOnce([{ growth_leads: '5.0', growth_clientes: '3.0', growth_empresas: '2.0' }])
        .mockResolvedValueOnce([{ qualified: '15', lost: '5', rate: '30.0' }])
        .mockResolvedValueOnce([{ total: '3' }]);

      const result = await service.getStats('');

      expect(result.totals.leads).toBe(50);
      expect(result.growth.leads).toBe(5.0);
      expect(result.conversion.rate).toBe(30.0);
    });
  });

  describe('getTimeline', () => {
    it('should return timeline data for month period', async () => {
      mockDataSource.query.mockResolvedValueOnce([
        { label: '01/01', leads: '10', clientes: '3' },
        { label: '02/01', leads: '15', clientes: '5' },
        { label: '03/01', leads: '20', clientes: '7' },
      ]);

      const result = await service.getTimeline(DashboardPeriod.MONTH);

      expect(result.labels).toHaveLength(3);
      expect(result.leads).toEqual([10, 15, 20]);
      expect(result.clientes).toEqual([3, 5, 7]);
    });

    it('should return hourly data for today period', async () => {
      mockDataSource.query.mockResolvedValueOnce([
        { label: '09:00', leads: '2', clientes: '1' },
        { label: '10:00', leads: '5', clientes: '2' },
      ]);

      const result = await service.getTimeline(DashboardPeriod.TODAY);

      expect(result.labels).toContain('09:00');
    });
  });

  describe('getByStatus', () => {
    it('should return leads grouped by status', async () => {
      mockDataSource.query.mockResolvedValueOnce([
        { status: 'novo', count: '50', percentage: '50.0' },
        { status: 'em_contato', count: '30', percentage: '30.0' },
        { status: 'qualificado', count: '20', percentage: '20.0' },
      ]);

      const result = await service.getByStatus('');

      expect(result).toHaveLength(3);
      expect(result[0].status).toBe('novo');
      expect(result[0].count).toBe(50);
      expect(result[0].percentage).toBe(50.0);
    });
  });

  describe('getBySegment', () => {
    it('should return data grouped by segment', async () => {
      mockDataSource.query.mockResolvedValueOnce([
        { segmento: 'Tecnologia', leads: '40', clientes: '15', empresas: '10' },
        { segmento: 'Varejo', leads: '30', clientes: '10', empresas: '8' },
      ]);

      const result = await service.getBySegment('');

      expect(result).toHaveLength(2);
      expect(result[0].segmento).toBe('Tecnologia');
      expect(result[0].leads).toBe(40);
    });
  });

  describe('getTopUsers', () => {
    it('should return top performing users', async () => {
      mockDataSource.query.mockResolvedValueOnce([
        { id: 'user-1', nome: 'João', leads: '30', clientes: '12', conversion: '40.0' },
        { id: 'user-2', nome: 'Maria', leads: '25', clientes: '10', conversion: '40.0' },
      ]);

      const result = await service.getTopUsers('');

      expect(result).toHaveLength(2);
      expect(result[0].nome).toBe('João');
      expect(result[0].conversion).toBe(40.0);
    });
  });

  describe('refreshMaterializedView', () => {
    it('should refresh the materialized view', async () => {
      mockDataSource.query.mockResolvedValueOnce([]);

      const result = await service.refreshMaterializedView();

      expect(result.success).toBe(true);
      expect(result.refreshedAt).toBeInstanceOf(Date);
      expect(mockDataSource.query).toHaveBeenCalledWith(
        'REFRESH MATERIALIZED VIEW mv_dashboard_stats',
      );
    });
  });
});
