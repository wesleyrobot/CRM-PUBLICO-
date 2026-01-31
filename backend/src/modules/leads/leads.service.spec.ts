import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LeadsService } from './leads.service';
import { Lead } from './entities/lead.entity';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { NotFoundException } from '@nestjs/common';

describe('LeadsService', () => {
  let service: LeadsService;
  let repository: Repository<Lead>;

  const mockLead: Lead = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    nome: 'John Doe',
    email: 'john@example.com',
    telefone: '11999999999',
    cargo: 'CEO',
    status: 'novo',
    origem: 'Website',
    observacoes: 'Interested in product',
    pontuacao: 75,
    dataUltimoContato: new Date(),
    empresaId: 'company-id',
    responsavelId: 'user-id',
    criadoEm: new Date(),
    atualizadoEm: new Date(),
    company: null,
    responsavel: null,
  };

  const mockQueryBuilder: any = {
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn().mockResolvedValue([[mockLead], 1]),
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
        LeadsService,
        {
          provide: getRepositoryToken(Lead),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<LeadsService>(LeadsService);
    repository = module.get<Repository<Lead>>(getRepositoryToken(Lead));

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new lead', async () => {
      const createLeadDto: CreateLeadDto = {
        nome: 'Jane Smith',
        email: 'jane@example.com',
        telefone: '11988888888',
        cargo: 'CTO',
        status: 'novo',
        origem: 'LinkedIn',
        pontuacao: 50,
      };

      mockRepository.create.mockReturnValue(createLeadDto);
      mockRepository.save.mockResolvedValue(mockLead);

      const result = await service.create(createLeadDto);

      expect(mockRepository.create).toHaveBeenCalledWith(createLeadDto);
      expect(result).toEqual(mockLead);
    });
  });

  describe('findAll', () => {
    it('should return paginated leads', async () => {
      const paginationDto = { page: 1, limit: 10 };

      const result = await service.findAll(paginationDto);

      expect(result.data).toEqual([mockLead]);
      expect(result.meta.total).toBe(1);
      expect(mockRepository.createQueryBuilder).toHaveBeenCalledWith('lead');
    });

    it('should handle search parameter', async () => {
      const paginationDto = { page: 1, limit: 10, search: 'test' };

      await service.findAll(paginationDto);

      expect(mockQueryBuilder.where).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a lead by id', async () => {
      mockRepository.findOne.mockResolvedValue(mockLead);

      const result = await service.findOne('123e4567-e89b-12d3-a456-426614174000');

      expect(result).toEqual(mockLead);
    });

    it('should throw NotFoundException if lead not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('invalid-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a lead', async () => {
      const updateLeadDto: UpdateLeadDto = {
        status: 'qualificado',
        pontuacao: 90,
      };

      const updatedLead = { ...mockLead, ...updateLeadDto };

      mockRepository.findOne.mockResolvedValueOnce(mockLead);
      mockRepository.update.mockResolvedValue({ affected: 1 });
      mockRepository.findOne.mockResolvedValueOnce(updatedLead);

      const result = await service.update('123e4567-e89b-12d3-a456-426614174000', updateLeadDto);

      expect(result.status).toEqual('qualificado');
      expect(result.pontuacao).toEqual(90);
    });
  });

  describe('remove', () => {
    it('should remove a lead', async () => {
      mockRepository.findOne.mockResolvedValue(mockLead);
      mockRepository.remove.mockResolvedValue(mockLead);

      await service.remove('123e4567-e89b-12d3-a456-426614174000');

      expect(mockRepository.remove).toHaveBeenCalledWith(mockLead);
    });

    it('should throw NotFoundException if lead not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.remove('invalid-id')).rejects.toThrow(NotFoundException);
    });
  });
});
