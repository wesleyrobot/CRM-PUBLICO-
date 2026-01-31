import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CompaniesService } from './companies.service';
import { Company } from './entities/company.entity';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { NotFoundException } from '@nestjs/common';

describe('CompaniesService', () => {
  let service: CompaniesService;
  let repository: Repository<Company>;

  const mockCompany: Company = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    razaoSocial: 'Test Company LTDA',
    nomeFantasia: 'Test Company',
    cnpj: '12345678901234',
    segmento: 'Tecnologia',
    website: 'https://test.com',
    telefone: '1234567890',
    endereco: 'Rua Test, 123',
    cidade: 'São Paulo',
    estado: 'SP',
    cep: '12345678',
    funcionarios: 50,
    faturamentoAnual: 1000000,
    ativo: true,
    criadoEm: new Date(),
    atualizadoEm: new Date(),
    leads: [],
    clients: [],
  };

  const mockQueryBuilder: any = {
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn().mockResolvedValue([[mockCompany], 1]),
  };

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
    remove: jest.fn(),
    createQueryBuilder: jest.fn(() => mockQueryBuilder),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CompaniesService,
        {
          provide: getRepositoryToken(Company),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<CompaniesService>(CompaniesService);
    repository = module.get<Repository<Company>>(getRepositoryToken(Company));

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new company', async () => {
      const createCompanyDto: CreateCompanyDto = {
        razaoSocial: 'New Company LTDA',
        nomeFantasia: 'New Company',
        cnpj: '98765432109876',
        segmento: 'Varejo',
      };

      mockRepository.create.mockReturnValue(createCompanyDto);
      mockRepository.save.mockResolvedValue(mockCompany);

      const result = await service.create(createCompanyDto);

      expect(mockRepository.create).toHaveBeenCalledWith(createCompanyDto);
      expect(result).toEqual(mockCompany);
    });
  });

  describe('findAll', () => {
    it('should return paginated companies', async () => {
      const paginationDto = { page: 1, limit: 10 };

      const result = await service.findAll(paginationDto);

      expect(result.data).toEqual([mockCompany]);
      expect(result.meta.total).toBe(1);
      expect(mockRepository.createQueryBuilder).toHaveBeenCalledWith('company');
    });

    it('should handle search parameter', async () => {
      const paginationDto = { page: 1, limit: 10, search: 'test' };

      await service.findAll(paginationDto);

      expect(mockQueryBuilder.where).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a company by id', async () => {
      mockRepository.findOne.mockResolvedValue(mockCompany);

      const result = await service.findOne('123e4567-e89b-12d3-a456-426614174000');

      expect(result).toEqual(mockCompany);
    });

    it('should throw NotFoundException if company not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('invalid-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a company', async () => {
      const updateCompanyDto: UpdateCompanyDto = {
        nomeFantasia: 'Updated Company Name',
      };

      const updatedCompany = { ...mockCompany, nomeFantasia: 'Updated Company Name' };

      mockRepository.findOne.mockResolvedValueOnce(mockCompany);
      mockRepository.update.mockResolvedValue({ affected: 1 });
      mockRepository.findOne.mockResolvedValueOnce(updatedCompany);

      const result = await service.update('123e4567-e89b-12d3-a456-426614174000', updateCompanyDto);

      expect(result.nomeFantasia).toEqual('Updated Company Name');
    });
  });

  describe('remove', () => {
    it('should remove a company', async () => {
      mockRepository.findOne.mockResolvedValue(mockCompany);
      mockRepository.remove.mockResolvedValue(mockCompany);

      await service.remove('123e4567-e89b-12d3-a456-426614174000');

      expect(mockRepository.remove).toHaveBeenCalledWith(mockCompany);
    });

    it('should throw NotFoundException if company not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.remove('invalid-id')).rejects.toThrow(NotFoundException);
    });
  });
});
