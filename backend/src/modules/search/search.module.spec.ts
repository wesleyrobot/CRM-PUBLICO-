import { Test, TestingModule } from '@nestjs/testing';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';
import { DataSource } from 'typeorm';

describe('SearchModule', () => {
  let module: TestingModule;

  const mockDataSource = {
    query: jest.fn(),
  };

  const mockCacheManager = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
  };

  beforeEach(async () => {
    module = await Test.createTestingModule({
      controllers: [SearchController],
      providers: [
        SearchService,
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager,
        },
      ],
    }).compile();
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });

  it('should have SearchController', () => {
    const controller = module.get<SearchController>(SearchController);
    expect(controller).toBeDefined();
  });

  it('should have SearchService', () => {
    const service = module.get<SearchService>(SearchService);
    expect(service).toBeDefined();
  });

  it('should inject DataSource into SearchService', () => {
    const service = module.get<SearchService>(SearchService);
    expect(service).toHaveProperty('dataSource');
  });
});
