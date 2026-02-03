import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { AuditController } from './audit.controller';
import { AuditService } from './audit.service';
import { Audit } from './entities/audit.entity';
import { AuditSubscriber } from './subscribers/audit.subscriber';

describe('AuditModule', () => {
  let module: TestingModule;

  const mockRepository = {
    createQueryBuilder: jest.fn(() => ({
      orderBy: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getCount: jest.fn().mockResolvedValue(0),
      getMany: jest.fn().mockResolvedValue([]),
    })),
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    count: jest.fn(),
  };

  const mockDataSource = {
    subscribers: [],
  };

  beforeEach(async () => {
    module = await Test.createTestingModule({
      controllers: [AuditController],
      providers: [
        AuditService,
        AuditSubscriber,
        {
          provide: getRepositoryToken(Audit),
          useValue: mockRepository,
        },
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

  it('should have AuditController', () => {
    const controller = module.get<AuditController>(AuditController);
    expect(controller).toBeDefined();
  });

  it('should have AuditService', () => {
    const service = module.get<AuditService>(AuditService);
    expect(service).toBeDefined();
  });

  it('should have AuditSubscriber', () => {
    const subscriber = module.get<AuditSubscriber>(AuditSubscriber);
    expect(subscriber).toBeDefined();
  });
});
