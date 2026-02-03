import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

describe('DashboardModule', () => {
  let module: TestingModule;

  const mockDataSource = {
    query: jest.fn(),
  };

  beforeEach(async () => {
    module = await Test.createTestingModule({
      controllers: [DashboardController],
      providers: [
        DashboardService,
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });

  it('should have DashboardController', () => {
    const controller = module.get<DashboardController>(DashboardController);
    expect(controller).toBeDefined();
  });

  it('should have DashboardService', () => {
    const service = module.get<DashboardService>(DashboardService);
    expect(service).toBeDefined();
  });
});
