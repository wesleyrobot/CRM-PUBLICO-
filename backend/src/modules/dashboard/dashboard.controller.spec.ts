import { Test, TestingModule } from '@nestjs/testing';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { DashboardPeriod } from './dto/dashboard.dto';

describe('DashboardController', () => {
  let controller: DashboardController;
  let service: jest.Mocked<DashboardService>;

  const mockDashboardService = {
    getDashboard: jest.fn(),
    getStats: jest.fn(),
    getTimeline: jest.fn(),
    refreshMaterializedView: jest.fn(),
  };

  const mockCacheManager = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DashboardController],
      providers: [
        {
          provide: DashboardService,
          useValue: mockDashboardService,
        },
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager,
        },
      ],
    }).compile();

    controller = module.get<DashboardController>(DashboardController);
    service = module.get(DashboardService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getDashboard', () => {
    it('should return complete dashboard data', async () => {
      const mockResponse = {
        stats: {
          totals: { leads: 150, clientes: 45, empresas: 30, usuarios: 10 },
          growth: { leads: 12.5, clientes: 8.3, empresas: 5.0 },
          conversion: { rate: 30.0, qualified: 45, lost: 20 },
        },
        timeline: {
          labels: ['01/01', '02/01'],
          leads: [10, 15],
          clientes: [3, 5],
        },
        byStatus: [
          { status: 'novo', count: 50, percentage: 33.3 },
        ],
        bySegment: [
          { segmento: 'Tecnologia', leads: 40, clientes: 15, empresas: 10 },
        ],
        topUsers: [
          { id: 'uuid', nome: 'João', leads: 30, clientes: 12, conversion: 40.0 },
        ],
        lastRefresh: new Date(),
      };

      mockDashboardService.getDashboard.mockResolvedValue(mockResponse);

      const result = await controller.getDashboard({ period: DashboardPeriod.MONTH });

      expect(result).toEqual(mockResponse);
      expect(service.getDashboard).toHaveBeenCalledWith({ period: DashboardPeriod.MONTH });
    });

    it('should handle custom date range', async () => {
      const mockResponse = {
        stats: expect.any(Object),
        timeline: expect.any(Object),
        byStatus: [],
        bySegment: [],
        topUsers: [],
        lastRefresh: new Date(),
      };

      mockDashboardService.getDashboard.mockResolvedValue(mockResponse);

      await controller.getDashboard({
        startDate: '2024-01-01',
        endDate: '2024-01-31',
      });

      expect(service.getDashboard).toHaveBeenCalledWith({
        startDate: '2024-01-01',
        endDate: '2024-01-31',
      });
    });
  });

  describe('getStats', () => {
    it('should return dashboard statistics', async () => {
      const mockStats = {
        totals: { leads: 150, clientes: 45, empresas: 30, usuarios: 10 },
        growth: { leads: 12.5, clientes: 8.3, empresas: 5.0 },
        conversion: { rate: 30.0, qualified: 45, lost: 20 },
      };

      mockDashboardService.getStats.mockResolvedValue(mockStats);

      const result = await controller.getStats({ period: DashboardPeriod.MONTH });

      expect(result).toEqual(mockStats);
      expect(service.getStats).toHaveBeenCalled();
    });

    it('should handle custom date range for stats', async () => {
      mockDashboardService.getStats.mockResolvedValue({});

      await controller.getStats({
        startDate: '2024-01-01',
        endDate: '2024-01-31',
      });

      expect(service.getStats).toHaveBeenCalledWith(
        expect.stringContaining('2024-01-01'),
      );
    });

    it('should handle today period', async () => {
      mockDashboardService.getStats.mockResolvedValue({});
      await controller.getStats({ period: 'today' as any });
      expect(service.getStats).toHaveBeenCalledWith(
        expect.stringContaining('CURRENT_DATE'),
      );
    });

    it('should handle week period', async () => {
      mockDashboardService.getStats.mockResolvedValue({});
      await controller.getStats({ period: DashboardPeriod.WEEK });
      expect(service.getStats).toHaveBeenCalledWith(
        expect.stringContaining('week'),
      );
    });

    it('should handle quarter period', async () => {
      mockDashboardService.getStats.mockResolvedValue({});
      await controller.getStats({ period: 'quarter' as any });
      expect(service.getStats).toHaveBeenCalledWith(
        expect.stringContaining('quarter'),
      );
    });

    it('should handle year period', async () => {
      mockDashboardService.getStats.mockResolvedValue({});
      await controller.getStats({ period: 'year' as any });
      expect(service.getStats).toHaveBeenCalledWith(
        expect.stringContaining('year'),
      );
    });

    it('should handle all/default period', async () => {
      mockDashboardService.getStats.mockResolvedValue({});
      await controller.getStats({ period: 'all' as any });
      expect(service.getStats).toHaveBeenCalledWith('');
    });
  });

  describe('getTimeline', () => {
    it('should return timeline data', async () => {
      const mockTimeline = {
        labels: ['01/01', '02/01', '03/01'],
        leads: [10, 15, 20],
        clientes: [3, 5, 7],
      };

      mockDashboardService.getTimeline.mockResolvedValue(mockTimeline);

      const result = await controller.getTimeline({ period: DashboardPeriod.WEEK });

      expect(result).toEqual(mockTimeline);
      expect(service.getTimeline).toHaveBeenCalledWith(DashboardPeriod.WEEK);
    });
  });

  describe('refreshView', () => {
    it('should refresh the materialized view', async () => {
      const mockResult = {
        success: true,
        refreshedAt: new Date(),
      };

      mockDashboardService.refreshMaterializedView.mockResolvedValue(mockResult);

      const result = await controller.refreshView();

      expect(result.success).toBe(true);
      expect(result.refreshedAt).toBeInstanceOf(Date);
      expect(service.refreshMaterializedView).toHaveBeenCalled();
    });
  });
});
