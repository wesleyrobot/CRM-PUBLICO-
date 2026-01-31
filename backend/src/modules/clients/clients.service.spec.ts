import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientsService } from './clients.service';
import { Client } from './entities/client.entity';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { NotFoundException } from '@nestjs/common';

describe('ClientsService', () => {
  let service: ClientsService;
  let repository: Repository<Client>;

  const mockClient: Client = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    nome: 'Maria Silva',
    email: 'maria@example.com',
    telefone: '1133334444',
    celular: '11987654321',
    cargo: 'Gerente',
    departamento: 'Vendas',
    dataNascimento: new Date('1990-01-15'),
    ativo: true,
    observacoes: 'Cliente VIP',
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
    getManyAndCount: jest.fn().mockResolvedValue([[mockClient], 1]),
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
        ClientsService,
        {
          provide: getRepositoryToken(Client),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<ClientsService>(ClientsService);
    repository = module.get<Repository<Client>>(getRepositoryToken(Client));

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new client', async () => {
      const createClientDto: CreateClientDto = {
        nome: 'João Santos',
        email: 'joao@example.com',
        telefone: '1144445555',
        celular: '11976543210',
        cargo: 'Diretor',
        departamento: 'TI',
      };

      mockRepository.create.mockReturnValue(createClientDto);
      mockRepository.save.mockResolvedValue(mockClient);

      const result = await service.create(createClientDto);

      expect(mockRepository.create).toHaveBeenCalledWith(createClientDto);
      expect(result).toEqual(mockClient);
    });
  });

  describe('findAll', () => {
    it('should return paginated clients', async () => {
      const paginationDto = { page: 1, limit: 10 };

      const result = await service.findAll(paginationDto);

      expect(result.data).toEqual([mockClient]);
      expect(result.meta.total).toBe(1);
      expect(mockRepository.createQueryBuilder).toHaveBeenCalledWith('client');
    });

    it('should handle search parameter', async () => {
      const paginationDto = { page: 1, limit: 10, search: 'test' };

      await service.findAll(paginationDto);

      expect(mockQueryBuilder.where).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a client by id', async () => {
      mockRepository.findOne.mockResolvedValue(mockClient);

      const result = await service.findOne('123e4567-e89b-12d3-a456-426614174000');

      expect(result).toEqual(mockClient);
    });

    it('should throw NotFoundException if client not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('invalid-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a client', async () => {
      const updateClientDto: UpdateClientDto = {
        cargo: 'Diretor Executivo',
        ativo: true,
      };

      const updatedClient = { ...mockClient, cargo: 'Diretor Executivo' };

      mockRepository.findOne.mockResolvedValueOnce(mockClient);
      mockRepository.update.mockResolvedValue({ affected: 1 });
      mockRepository.findOne.mockResolvedValueOnce(updatedClient);

      const result = await service.update('123e4567-e89b-12d3-a456-426614174000', updateClientDto);

      expect(result.cargo).toEqual('Diretor Executivo');
    });
  });

  describe('remove', () => {
    it('should remove a client', async () => {
      mockRepository.findOne.mockResolvedValue(mockClient);
      mockRepository.remove.mockResolvedValue(mockClient);

      await service.remove('123e4567-e89b-12d3-a456-426614174000');

      expect(mockRepository.remove).toHaveBeenCalledWith(mockClient);
    });

    it('should throw NotFoundException if client not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.remove('invalid-id')).rejects.toThrow(NotFoundException);
    });
  });
});
