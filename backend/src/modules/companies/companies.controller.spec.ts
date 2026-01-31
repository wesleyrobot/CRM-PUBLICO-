import { Test, TestingModule } from '@nestjs/testing';
import { CompaniesController } from './companies.controller';
import { CompaniesService } from './companies.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

describe('CompaniesController', () => {
  let controller: CompaniesController;

  const mockCompany = {
    id: '123',
    razaoSocial: 'Test Company',
    nomeFantasia: 'Test',
    cnpj: '12345678901234',
    segmento: 'Tech',
    ativo: true,
    criadoEm: new Date(),
    atualizadoEm: new Date(),
  };

  const mockCompaniesService = {
    create: jest.fn().mockResolvedValue(mockCompany),
    findAll: jest.fn().mockResolvedValue({ data: [mockCompany], meta: { total: 1 } }),
    findOne: jest.fn().mockResolvedValue(mockCompany),
    update: jest.fn().mockResolvedValue(mockCompany),
    remove: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CompaniesController],
      providers: [{ provide: CompaniesService, useValue: mockCompaniesService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<CompaniesController>(CompaniesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a company', async () => {
    const result = await controller.create({} as any);
    expect(result).toEqual(mockCompany);
  });

  it('should find all companies', async () => {
    const result = await controller.findAll({} as any);
    expect(result.data).toEqual([mockCompany]);
  });

  it('should find one company', async () => {
    const result = await controller.findOne('123');
    expect(result).toEqual(mockCompany);
  });

  it('should update a company', async () => {
    const result = await controller.update('123', {} as any);
    expect(result).toEqual(mockCompany);
  });

  it('should remove a company', async () => {
    const result = await controller.remove('123');
    expect(result).toBeUndefined();
  });
});
