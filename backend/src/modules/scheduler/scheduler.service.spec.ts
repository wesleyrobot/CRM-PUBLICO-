import { Test, TestingModule } from '@nestjs/testing';
import { SchedulerRegistry } from '@nestjs/schedule';
import { DataSource } from 'typeorm';
import { SchedulerService } from './scheduler.service';

describe('SchedulerService', () => {
  let service: SchedulerService;
  let dataSource: jest.Mocked<DataSource>;
  let schedulerRegistry: jest.Mocked<SchedulerRegistry>;

  const mockDataSource = {
    query: jest.fn(),
  };

  const mockCronJob = {
    nextDate: jest.fn().mockReturnValue({ toJSDate: () => new Date() }),
  };

  const mockSchedulerRegistry = {
    getCronJobs: jest.fn().mockReturnValue(
      new Map([
        ['refresh-dashboard-view', mockCronJob],
        ['update-search-vectors', mockCronJob],
      ]),
    ),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SchedulerService,
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
        {
          provide: SchedulerRegistry,
          useValue: mockSchedulerRegistry,
        },
      ],
    }).compile();

    service = module.get<SchedulerService>(SchedulerService);
    dataSource = module.get(DataSource);
    schedulerRegistry = module.get(SchedulerRegistry);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('refreshDashboardView', () => {
    it('should refresh the materialized view', async () => {
      mockDataSource.query.mockResolvedValueOnce([]);

      await service.refreshDashboardView();

      expect(mockDataSource.query).toHaveBeenCalledWith(
        'REFRESH MATERIALIZED VIEW mv_dashboard_stats',
      );
    });

    it('should handle errors gracefully', async () => {
      mockDataSource.query.mockRejectedValueOnce(new Error('DB error'));

      await expect(service.refreshDashboardView()).resolves.not.toThrow();
    });
  });

  describe('updateSearchVectors', () => {
    it('should update search vectors for all tables', async () => {
      mockDataSource.query.mockResolvedValue([]);

      await service.updateSearchVectors();

      expect(mockDataSource.query).toHaveBeenCalledTimes(3);
    });

    it('should handle errors gracefully', async () => {
      mockDataSource.query.mockRejectedValueOnce(new Error('DB error'));

      await expect(service.updateSearchVectors()).resolves.not.toThrow();
    });
  });

  describe('cleanupOldAuditLogs', () => {
    it('should delete audit logs older than 90 days', async () => {
      mockDataSource.query.mockResolvedValueOnce([[], 15]);

      await service.cleanupOldAuditLogs();

      expect(mockDataSource.query).toHaveBeenCalledWith(
        expect.stringContaining("INTERVAL '90 days'"),
      );
    });
  });

  describe('vacuumAnalyze', () => {
    it('should run VACUUM ANALYZE on all tables', async () => {
      mockDataSource.query.mockResolvedValue([]);

      await service.vacuumAnalyze();

      expect(mockDataSource.query).toHaveBeenCalledWith('VACUUM ANALYZE leads');
      expect(mockDataSource.query).toHaveBeenCalledWith('VACUUM ANALYZE clientes');
      expect(mockDataSource.query).toHaveBeenCalledWith('VACUUM ANALYZE empresas');
      expect(mockDataSource.query).toHaveBeenCalledWith('VACUUM ANALYZE usuarios');
      expect(mockDataSource.query).toHaveBeenCalledWith('VACUUM ANALYZE auditoria');
    });
  });

  describe('getJobs', () => {
    it('should return list of registered cron jobs', () => {
      const jobs = service.getJobs();

      expect(jobs).toHaveLength(2);
      expect(jobs[0].name).toBe('refresh-dashboard-view');
      expect(jobs[0].nextRun).toBeInstanceOf(Date);
    });
  });

  describe('runJob', () => {
    it('should run refresh-dashboard-view job', async () => {
      mockDataSource.query.mockResolvedValueOnce([]);

      const result = await service.runJob('refresh-dashboard-view');

      expect(result.success).toBe(true);
      expect(result.message).toContain('Dashboard view');
    });

    it('should run update-search-vectors job', async () => {
      mockDataSource.query.mockResolvedValue([]);

      const result = await service.runJob('update-search-vectors');

      expect(result.success).toBe(true);
      expect(result.message).toContain('Search vectors');
    });

    it('should run cleanup-old-audit-logs job', async () => {
      mockDataSource.query.mockResolvedValueOnce([]);

      const result = await service.runJob('cleanup-old-audit-logs');

      expect(result.success).toBe(true);
      expect(result.message).toContain('Logs antigos');
    });

    it('should run vacuum-analyze job', async () => {
      mockDataSource.query.mockResolvedValue([]);

      const result = await service.runJob('vacuum-analyze');

      expect(result.success).toBe(true);
      expect(result.message).toContain('VACUUM');
    });

    it('should return error for unknown job', async () => {
      const result = await service.runJob('unknown-job');

      expect(result.success).toBe(false);
      expect(result.message).toContain('não encontrado');
    });
  });
});
