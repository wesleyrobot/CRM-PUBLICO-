import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AnalyticsService } from './analytics.service';
import { User } from '../users/entities/user.entity';
import { Company } from '../companies/entities/company.entity';
import { Lead } from '../leads/entities/lead.entity';
import { Client } from '../clients/entities/client.entity';

describe('AnalyticsService', () => {
  let service: AnalyticsService;
  let userRepository: Repository<User>;
  let companyRepository: Repository<Company>;
  let leadRepository: Repository<Lead>;
  let clientRepository: Repository<Client>;

  const mockQueryBuilder: any = {
    leftJoin: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    groupBy: jest.fn().mockReturnThis(),
    addGroupBy: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    getRawMany: jest.fn(),
  };

  const mockUserRepository = {
    createQueryBuilder: jest.fn(() => mockQueryBuilder),
  };

  const mockCompanyRepository = {
    createQueryBuilder: jest.fn(() => mockQueryBuilder),
    query: jest.fn(),
  };

  const mockLeadRepository = {
    query: jest.fn(),
  };

  const mockClientRepository = {
    query: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyticsService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: getRepositoryToken(Company),
          useValue: mockCompanyRepository,
        },
        {
          provide: getRepositoryToken(Lead),
          useValue: mockLeadRepository,
        },
        {
          provide: getRepositoryToken(Client),
          useValue: mockClientRepository,
        },
      ],
    }).compile();

    service = module.get<AnalyticsService>(AnalyticsService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    companyRepository = module.get<Repository<Company>>(getRepositoryToken(Company));
    leadRepository = module.get<Repository<Lead>>(getRepositoryToken(Lead));
    clientRepository = module.get<Repository<Client>>(getRepositoryToken(Client));

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getCompaniesWithLeadsCount', () => {
    it('should return companies with leads count', async () => {
      const mockResult = [
        { companyId: '1', companyName: 'Company A', totalLeads: '5' },
        { companyId: '2', companyName: 'Company B', totalLeads: '3' },
      ];

      mockQueryBuilder.getRawMany.mockResolvedValue(mockResult);

      const result = await service.getCompaniesWithLeadsCount();

      expect(result).toEqual(mockResult);
      expect(mockCompanyRepository.createQueryBuilder).toHaveBeenCalledWith('company');
    });

    it('should return empty array if no companies', async () => {
      mockQueryBuilder.getRawMany.mockResolvedValue([]);

      const result = await service.getCompaniesWithLeadsCount();

      expect(result).toEqual([]);
    });
  });

  describe('getUserPerformanceReport', () => {
    it('should return user performance data', async () => {
      const mockResult = [
        {
          userId: '1',
          userName: 'John Doe',
          userEmail: 'john@example.com',
          totalLeads: '10',
          totalClients: '5',
        },
      ];

      mockQueryBuilder.getRawMany.mockResolvedValue(mockResult);

      const result = await service.getUserPerformanceReport();

      expect(result).toEqual(mockResult);
      expect(mockUserRepository.createQueryBuilder).toHaveBeenCalledWith('user');
    });
  });

  describe('getLeadsByStatusWithCompanyInfo', () => {
    it('should return leads by status with company info using CTE', async () => {
      const mockResult = [
        {
          company_id: '1',
          company_name: 'Company A',
          status: 'novo',
          leads_count: 5,
          average_score: 75.5,
        },
      ];

      mockLeadRepository.query.mockResolvedValue(mockResult);

      const result = await service.getLeadsByStatusWithCompanyInfo();

      expect(result).toEqual(mockResult);
      expect(mockLeadRepository.query).toHaveBeenCalled();
    });

    it('should handle empty results', async () => {
      mockLeadRepository.query.mockResolvedValue([]);

      const result = await service.getLeadsByStatusWithCompanyInfo();

      expect(result).toEqual([]);
    });
  });

  describe('getTopPerformingCompanies', () => {
    it('should return top performing companies with default limit', async () => {
      const mockResult = [
        {
          id: '1',
          company_name: 'Top Company',
          segmento: 'Tech',
          total_leads: 100,
          total_clients: 50,
          conversion_rate: 50.0,
        },
      ];

      mockCompanyRepository.query.mockResolvedValue(mockResult);

      const result = await service.getTopPerformingCompanies();

      expect(result).toEqual(mockResult);
      expect(mockCompanyRepository.query).toHaveBeenCalledWith(expect.any(String), [10]);
    });

    it('should accept custom limit', async () => {
      mockCompanyRepository.query.mockResolvedValue([]);

      await service.getTopPerformingCompanies(5);

      expect(mockCompanyRepository.query).toHaveBeenCalledWith(expect.any(String), [5]);
    });
  });

  describe('getLeadDistributionAnalysis', () => {
    it('should return lead distribution with CASE and window functions', async () => {
      const mockResult = [
        {
          lead_category: 'Hot',
          status: 'novo',
          count: 10,
          avg_score: 85.5,
          oldest_lead: new Date(),
          newest_lead: new Date(),
          percentage: 25.5,
        },
      ];

      mockLeadRepository.query.mockResolvedValue(mockResult);

      const result = await service.getLeadDistributionAnalysis();

      expect(result).toEqual(mockResult);
      expect(mockLeadRepository.query).toHaveBeenCalled();
    });
  });

  describe('getMonthlyLeadTrend', () => {
    it('should return monthly lead trend with CTE and window functions', async () => {
      const mockResult = [
        {
          month: '2026-01',
          leads_created: 50,
          leads_converted: 25,
          conversion_rate: 50.0,
          cumulative_leads: 50,
        },
      ];

      mockLeadRepository.query.mockResolvedValue(mockResult);

      const result = await service.getMonthlyLeadTrend();

      expect(result).toEqual(mockResult);
      expect(mockLeadRepository.query).toHaveBeenCalled();
    });

    it('should handle no data scenario', async () => {
      mockLeadRepository.query.mockResolvedValue([]);

      const result = await service.getMonthlyLeadTrend();

      expect(result).toEqual([]);
    });
  });
});
