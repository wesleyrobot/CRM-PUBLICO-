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
      const mockMvStats = [{ total_leads: '100', total_clientes: '30', total_empresas: '20' }];
      const mockGrowth = [{
        current_leads: 100,
        current_clientes: 30,
        current_empresas: 20,
        growth_leads: 10.5,
        growth_clientes: 5.0,
        growth_empresas: 2.5
      }];
      const mockConversion = [{ rate: 30.0, qualified: 30, lost: 10 }];
      const mockUsuarios = [{ total: '10' }];
      const mockTimeline = [
        { label: '01/01', leads: '10', clientes: '3' },
        { label: '02/01', leads: '15', clientes: '5' },
      ];
      const mockByStatus = [
        { status: 'novo', count: '50', percentage: '50.0' },
        { status: 'qualificado', count: '30', percentage: '30.0' },
      ];
      const mockBySegment = [
        { segmento: 'Tecnologia', leads: '40', clientes: '15', empresas: '10' },
      ];
      const mockTopUsers = [
        { id: 'uuid-1', nome: 'João', leads: '30', clientes: '12', conversion: '40.0' },
      ];

      // Mock com implementação inteligente para lidar com queries em paralelo
      mockDataSource.query.mockImplementation((sql: string) => {
        if (sql.includes('mv_dashboard_stats')) return Promise.resolve(mockMvStats);
        if (sql.includes('current_period')) return Promise.resolve(mockGrowth);
        if (sql.includes('qualified')) return Promise.resolve(mockConversion);
        if (sql.includes('usuarios')) return Promise.resolve(mockUsuarios);
        if (sql.includes('generate_series')) return Promise.resolve(mockTimeline);
        if (sql.includes('GROUP BY status')) return Promise.resolve(mockByStatus);
        if (sql.includes('segmento')) return Promise.resolve(mockBySegment);
        if (sql.includes('conversion')) return Promise.resolve(mockTopUsers);
        return Promise.resolve([]);
      });

      const result = await service.getDashboard({ period: DashboardPeriod.MONTH });

      expect(result).toBeDefined();
      expect(result.stats.totals.leads).toBe(100);
      expect(result.stats.totals.clientes).toBe(30);
      expect(result.stats.growth.leads).toBe(10.5);
      expect(result.timeline.labels).toHaveLength(2);
      expect(result.byStatus).toHaveLength(2);
      expect(result.topUsers).toHaveLength(1);
      expect(result.lastRefresh).toBeInstanceOf(Date);
    });
  });

  describe('getStats', () => {
    it('should return dashboard statistics', async () => {
      const mockMvStats = [{ total_leads: '150', total_clientes: '45', total_empresas: '30' }];
      const mockGrowth = [{
        current_leads: 150,
        current_clientes: 45,
        current_empresas: 30,
        growth_leads: 12.5,
        growth_clientes: 8.3,
        growth_empresas: 5.0
      }];
      const mockConversion = [{ rate: 30.0, qualified: 45, lost: 20 }];
      const mockUsuarios = [{ total: '10' }];

      mockDataSource.query
        .mockResolvedValueOnce(mockMvStats)
        .mockResolvedValueOnce(mockGrowth)
        .mockResolvedValueOnce(mockConversion)
        .mockResolvedValueOnce(mockUsuarios);

      const result = await service.getStats('');

      expect(result.totals.leads).toBe(150);
      expect(result.totals.clientes).toBe(45);
      expect(result.totals.usuarios).toBe(10);
      expect(result.growth.leads).toBe(12.5);
      expect(result.conversion.rate).toBe(30.0);
    });
  });

  describe('getTimeline', () => {
    it('should return timeline for month period', async () => {
      const mockResults = [
        { label: '01/01', leads: '10', clientes: '3' },
        { label: '02/01', leads: '15', clientes: '5' },
        { label: '03/01', leads: '20', clientes: '7' },
      ];

      mockDataSource.query.mockResolvedValue(mockResults);

      const result = await service.getTimeline(DashboardPeriod.MONTH);

      expect(result.labels).toEqual(['01/01', '02/01', '03/01']);
      expect(result.leads).toEqual([10, 15, 20]);
      expect(result.clientes).toEqual([3, 5, 7]);
    });

    it('should return timeline for week period', async () => {
      mockDataSource.query.mockResolvedValue([]);

      const result = await service.getTimeline(DashboardPeriod.WEEK);

      expect(result.labels).toEqual([]);
      expect(result.leads).toEqual([]);
      expect(result.clientes).toEqual([]);
    });
  });

  describe('getByStatus', () => {
    it('should return leads distribution by status', async () => {
      const mockResults = [
        { status: 'novo', count: '50', percentage: '33.3' },
        { status: 'qualificado', count: '45', percentage: '30.0' },
        { status: 'perdido', count: '20', percentage: '13.3' },
      ];

      mockDataSource.query.mockResolvedValue(mockResults);

      const result = await service.getByStatus('');

      expect(result).toHaveLength(3);
      expect(result[0].status).toBe('novo');
      expect(result[0].count).toBe(50);
      expect(result[0].percentage).toBe(33.3);
    });
  });

  describe('getBySegment', () => {
    it('should return distribution by segment', async () => {
      const mockResults = [
        { segmento: 'Tecnologia', leads: '40', clientes: '15', empresas: '10' },
        { segmento: 'Varejo', leads: '30', clientes: '10', empresas: '8' },
      ];

      mockDataSource.query.mockResolvedValue(mockResults);

      const result = await service.getBySegment('');

      expect(result).toHaveLength(2);
      expect(result[0].segmento).toBe('Tecnologia');
      expect(result[0].leads).toBe(40);
      expect(result[0].clientes).toBe(15);
    });
  });

  describe('getTopUsers', () => {
    it('should return top 5 users by performance', async () => {
      const mockResults = [
        { id: 'uuid-1', nome: 'João', leads: '30', clientes: '12', conversion: '40.0' },
        { id: 'uuid-2', nome: 'Maria', leads: '25', clientes: '10', conversion: '40.0' },
      ];

      mockDataSource.query.mockResolvedValue(mockResults);

      const result = await service.getTopUsers('');

      expect(result).toHaveLength(2);
      expect(result[0].nome).toBe('João');
      expect(result[0].leads).toBe(30);
      expect(result[0].conversion).toBe(40.0);
    });
  });

  describe('refreshMaterializedView', () => {
    it('should refresh the materialized view', async () => {
      mockDataSource.query.mockResolvedValue(undefined);

      const result = await service.refreshMaterializedView();

      expect(result.success).toBe(true);
      expect(result.refreshedAt).toBeInstanceOf(Date);
      expect(mockDataSource.query).toHaveBeenCalledWith('REFRESH MATERIALIZED VIEW mv_dashboard_stats');
    });
  });
});
