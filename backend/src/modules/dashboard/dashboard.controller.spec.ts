import { Test, TestingModule } from '@nestjs/testing';
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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DashboardController],
      providers: [
        {
          provide: DashboardService,
          useValue: mockDashboardService,
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
      const expectedResponse = {
        stats: {
          totals: { leads: 100, clientes: 30, empresas: 20, usuarios: 5 },
          growth: { leads: 10.5, clientes: 5.2, empresas: 3.1 },
          conversion: { rate: 30.0, qualified: 30, lost: 10 },
        },
        timeline: {
          labels: ['01/01', '02/01'],
          leads: [10, 15],
          clientes: [3, 5],
        },
        byStatus: [{ status: 'novo', count: 50, percentage: 50.0 }],
        bySegment: [{ segmento: 'Tecnologia', leads: 40, clientes: 15, empresas: 10 }],
        topUsers: [{ id: 'user-1', nome: 'João', leads: 20, clientes: 8, conversion: 40.0 }],
        lastRefresh: new Date(),
      };

      mockDashboardService.getDashboard.mockResolvedValue(expectedResponse);

      const result = await controller.getDashboard({ period: DashboardPeriod.MONTH });

      expect(result).toEqual(expectedResponse);
      expect(service.getDashboard).toHaveBeenCalledWith({ period: DashboardPeriod.MONTH });
    });

    it('should accept custom date range', async () => {
      mockDashboardService.getDashboard.mockResolvedValue({});

      await controller.getDashboard({
        startDate: '2024-01-01',
        endDate: '2024-12-31',
      });

      expect(service.getDashboard).toHaveBeenCalledWith({
        startDate: '2024-01-01',
        endDate: '2024-12-31',
      });
    });
  });

  describe('getStats', () => {
    it('should return stats only', async () => {
      const expectedStats = {
        totals: { leads: 100, clientes: 30, empresas: 20, usuarios: 5 },
        growth: { leads: 10.5, clientes: 5.2, empresas: 3.1 },
        conversion: { rate: 30.0, qualified: 30, lost: 10 },
      };

      mockDashboardService.getStats.mockResolvedValue(expectedStats);

      const result = await controller.getStats({ period: DashboardPeriod.WEEK });

      expect(result).toEqual(expectedStats);
    });
  });

  describe('getTimeline', () => {
    it('should return timeline data', async () => {
      const expectedTimeline = {
        labels: ['01/01', '02/01', '03/01'],
        leads: [10, 15, 20],
        clientes: [3, 5, 7],
      };

      mockDashboardService.getTimeline.mockResolvedValue(expectedTimeline);

      const result = await controller.getTimeline({ period: DashboardPeriod.MONTH });

      expect(result).toEqual(expectedTimeline);
      expect(service.getTimeline).toHaveBeenCalledWith(DashboardPeriod.MONTH);
    });
  });

  describe('refreshView', () => {
    it('should refresh materialized view', async () => {
      const expectedResponse = {
        success: true,
        refreshedAt: new Date(),
      };

      mockDashboardService.refreshMaterializedView.mockResolvedValue(expectedResponse);

      const result = await controller.refreshView();

      expect(result.success).toBe(true);
      expect(service.refreshMaterializedView).toHaveBeenCalled();
    });
  });
});
