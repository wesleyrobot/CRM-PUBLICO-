import { Test, TestingModule } from '@nestjs/testing';
import { SearchService } from './search.service';
import { DataSource } from 'typeorm';
import { SearchEntity } from './dto/search.dto';

describe('SearchService', () => {
  let service: SearchService;
  let dataSource: jest.Mocked<DataSource>;

  const mockDataSource = {
    query: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SearchService,
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<SearchService>(SearchService);
    dataSource = module.get(DataSource);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('search', () => {
    it('should search in all entities when entity is ALL', async () => {
      mockDataSource.query.mockResolvedValue([]);

      const result = await service.search({
        query: 'teste',
        entity: SearchEntity.ALL,
        page: 1,
        limit: 10,
      });

      expect(result.meta.query).toBe('teste');
      expect(result.meta.page).toBe(1);
      expect(result.data).toEqual([]);
    });

    it('should search only leads when entity is LEADS', async () => {
      mockDataSource.query.mockResolvedValue([
        { id: '1', nome: 'Lead Teste', email: 'lead@test.com', telefone: '11999', rank: 0.5 },
      ]);

      const result = await service.search({
        query: 'teste',
        entity: SearchEntity.LEADS,
        page: 1,
        limit: 10,
      });

      expect(result.meta.entities.leads).toBe(1);
      expect(result.data[0].type).toBe('lead');
    });

    it('should search only clientes when entity is CLIENTES', async () => {
      mockDataSource.query.mockResolvedValue([
        { id: '2', nome: 'Cliente Teste', email: 'cliente@test.com', telefone: '11888', rank: 0.7 },
      ]);

      const result = await service.search({
        query: 'teste',
        entity: SearchEntity.CLIENTES,
        page: 1,
        limit: 10,
      });

      expect(result.meta.entities.clientes).toBe(1);
    });

    it('should search only empresas when entity is EMPRESAS', async () => {
      mockDataSource.query.mockResolvedValue([
        { id: '3', nome: 'Empresa Teste', email: '12345678000100', telefone: '11777', rank: 0.8 },
      ]);

      const result = await service.search({
        query: 'teste',
        entity: SearchEntity.EMPRESAS,
        page: 1,
        limit: 10,
      });

      expect(result.meta.entities.empresas).toBe(1);
    });

    it('should paginate results correctly', async () => {
      const manyResults = Array.from({ length: 25 }, (_, i) => ({
        id: `${i}`,
        nome: `Result ${i}`,
        email: `email${i}@test.com`,
        telefone: '11999',
        rank: Math.random(),
      }));

      mockDataSource.query.mockResolvedValue(manyResults);

      const result = await service.search({
        query: 'teste',
        entity: SearchEntity.LEADS,
        page: 2,
        limit: 10,
      });

      expect(result.data.length).toBe(10);
      expect(result.meta.page).toBe(2);
      expect(result.meta.totalPages).toBe(3);
    });

    it('should sort results by rank descending', async () => {
      mockDataSource.query.mockResolvedValue([
        { id: '1', nome: 'Low Rank', email: 'a@test.com', telefone: '11', rank: 0.1 },
        { id: '2', nome: 'High Rank', email: 'b@test.com', telefone: '22', rank: 0.9 },
        { id: '3', nome: 'Mid Rank', email: 'c@test.com', telefone: '33', rank: 0.5 },
      ]);

      const result = await service.search({
        query: 'teste',
        entity: SearchEntity.LEADS,
        page: 1,
        limit: 10,
      });

      expect(result.data[0].rank).toBeGreaterThanOrEqual(result.data[1].rank);
      expect(result.data[1].rank).toBeGreaterThanOrEqual(result.data[2].rank);
    });

    it('should handle empty query gracefully', async () => {
      mockDataSource.query.mockResolvedValue([]);

      const result = await service.search({
        query: 'xyz123notfound',
        entity: SearchEntity.ALL,
        page: 1,
        limit: 10,
      });

      expect(result.data).toEqual([]);
      expect(result.meta.total).toBe(0);
    });

    it('should fallback to ILIKE when Full-Text fails', async () => {
      // updateSearchVector succeeds, Full-Text fails, fallback works
      mockDataSource.query
        .mockResolvedValueOnce([]) // updateSearchVector
        .mockRejectedValueOnce(new Error('FTS error')) // Full-Text search fails
        .mockResolvedValueOnce([{ id: '1', nome: 'Fallback', email: 'fb@test.com', telefone: '11' }]); // fallback ILIKE

      const result = await service.search({
        query: 'teste',
        entity: SearchEntity.LEADS,
        page: 1,
        limit: 10,
      });

      expect(result.data.length).toBe(1);
      expect(result.data[0].nome).toBe('Fallback');
    });
  });
});
