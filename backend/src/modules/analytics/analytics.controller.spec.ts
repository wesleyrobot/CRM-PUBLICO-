import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

describe('AnalyticsController', () => {
  let controller: AnalyticsController;
  let service: AnalyticsService;

  const mockAnalyticsService = {
    getCompaniesWithLeadsCount: jest.fn().mockResolvedValue([
      { companyId: '123', companyName: 'Test Company', totalLeads: '5' },
    ]),
    getUserPerformanceReport: jest.fn().mockResolvedValue([
      { userId: '123', userName: 'Test User', totalLeads: '10', totalClients: '5' },
    ]),
    getLeadsByStatusWithCompanyInfo: jest.fn().mockResolvedValue([
      { company_id: '123', company_name: 'Test', status: 'novo', leads_count: '3' },
    ]),
    getTopPerformingCompanies: jest.fn().mockResolvedValue([
      { id: '123', company_name: 'Test', total_leads: '10', total_clients: '5' },
    ]),
    getLeadDistributionAnalysis: jest.fn().mockResolvedValue([
      { lead_category: 'Hot', status: 'novo', count: '5', avg_score: '85.00' },
    ]),
    getMonthlyLeadTrend: jest.fn().mockResolvedValue([
      { month: '2026-01', leads_created: '10', leads_converted: '3' },
    ]),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AnalyticsController],
      providers: [
        {
          provide: AnalyticsService,
          useValue: mockAnalyticsService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<AnalyticsController>(AnalyticsController);
    service = module.get<AnalyticsService>(AnalyticsService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return companies with leads count', async () => {
    const result = await controller.getCompaniesWithLeadsCount();
    expect(result).toHaveLength(1);
    expect(mockAnalyticsService.getCompaniesWithLeadsCount).toHaveBeenCalled();
  });

  it('should return user performance report', async () => {
    const result = await controller.getUserPerformanceReport();
    expect(result).toHaveLength(1);
    expect(mockAnalyticsService.getUserPerformanceReport).toHaveBeenCalled();
  });

  it('should return leads by status', async () => {
    const result = await controller.getLeadsByStatusWithCompanyInfo();
    expect(result).toHaveLength(1);
    expect(mockAnalyticsService.getLeadsByStatusWithCompanyInfo).toHaveBeenCalled();
  });

  it('should return top performing companies', async () => {
    const result = await controller.getTopPerformingCompanies('10');
    expect(result).toHaveLength(1);
    expect(mockAnalyticsService.getTopPerformingCompanies).toHaveBeenCalledWith(10);
  });

  it('should return lead distribution', async () => {
    const result = await controller.getLeadDistributionAnalysis();
    expect(result).toHaveLength(1);
    expect(mockAnalyticsService.getLeadDistributionAnalysis).toHaveBeenCalled();
  });

  it('should return monthly trend', async () => {
    const result = await controller.getMonthlyLeadTrend();
    expect(result).toHaveLength(1);
    expect(mockAnalyticsService.getMonthlyLeadTrend).toHaveBeenCalled();
  });
});
