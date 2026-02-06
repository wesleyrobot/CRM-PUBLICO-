import { Test, TestingModule } from '@nestjs/testing';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';
import { SearchEntity } from './dto/search.dto';

describe('SearchController', () => {
  let controller: SearchController;
  let service: jest.Mocked<SearchService>;

  const mockSearchService = {
    search: jest.fn(),
  };

  const mockCacheManager = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SearchController],
      providers: [
        {
          provide: SearchService,
          useValue: mockSearchService,
        },
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager,
        },
      ],
    }).compile();

    controller = module.get<SearchController>(SearchController);
    service = module.get(SearchService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('search', () => {
    it('should call searchService.search with correct parameters', async () => {
      const dto = {
        query: 'João',
        entity: SearchEntity.ALL,
        page: 1,
        limit: 10,
      };

      const expectedResponse = {
        data: [
          {
            id: '123',
            type: 'lead' as const,
            nome: 'João Silva',
            email: 'joao@test.com',
            telefone: '11999999999',
            rank: 0.85,
          },
        ],
        meta: {
          query: 'João',
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
          entities: { leads: 1, clientes: 0, empresas: 0 },
        },
      };

      mockSearchService.search.mockResolvedValue(expectedResponse);

      const result = await controller.search(dto);

      expect(service.search).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expectedResponse);
    });

    it('should handle search with specific entity', async () => {
      const dto = {
        query: 'empresa',
        entity: SearchEntity.EMPRESAS,
        page: 1,
        limit: 5,
      };

      mockSearchService.search.mockResolvedValue({
        data: [],
        meta: {
          query: 'empresa',
          total: 0,
          page: 1,
          limit: 5,
          totalPages: 0,
          entities: { leads: 0, clientes: 0, empresas: 0 },
        },
      });

      await controller.search(dto);

      expect(service.search).toHaveBeenCalledWith(dto);
    });

    it('should return paginated results', async () => {
      const dto = {
        query: 'teste',
        entity: SearchEntity.ALL,
        page: 2,
        limit: 10,
      };

      const expectedResponse = {
        data: [],
        meta: {
          query: 'teste',
          total: 25,
          page: 2,
          limit: 10,
          totalPages: 3,
          entities: { leads: 10, clientes: 10, empresas: 5 },
        },
      };

      mockSearchService.search.mockResolvedValue(expectedResponse);

      const result = await controller.search(dto);

      expect(result.meta.page).toBe(2);
      expect(result.meta.totalPages).toBe(3);
    });
  });
});
