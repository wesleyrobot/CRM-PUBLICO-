import { Test, TestingModule } from '@nestjs/testing';
import { LeadsController } from './leads.controller';
import { LeadsService } from './leads.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

describe('LeadsController', () => {
  let controller: LeadsController;

  const mockLead = {
    id: '123',
    nome: 'Test Lead',
    email: 'lead@test.com',
    status: 'novo',
    pontuacao: 75,
    criadoEm: new Date(),
    atualizadoEm: new Date(),
  };

  const mockLeadsService = {
    create: jest.fn().mockResolvedValue(mockLead),
    findAll: jest.fn().mockResolvedValue({ data: [mockLead], meta: { total: 1 } }),
    findOne: jest.fn().mockResolvedValue(mockLead),
    update: jest.fn().mockResolvedValue(mockLead),
    remove: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LeadsController],
      providers: [{ provide: LeadsService, useValue: mockLeadsService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<LeadsController>(LeadsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a lead', async () => {
    const result = await controller.create({} as any);
    expect(result).toEqual(mockLead);
  });

  it('should find all leads', async () => {
    const result = await controller.findAll({} as any);
    expect(result.data).toEqual([mockLead]);
  });

  it('should find one lead', async () => {
    const result = await controller.findOne('123');
    expect(result).toEqual(mockLead);
  });

  it('should update a lead', async () => {
    const result = await controller.update('123', {} as any);
    expect(result).toEqual(mockLead);
  });

  it('should remove a lead', async () => {
    const result = await controller.remove('123');
    expect(result).toBeUndefined();
  });
});
