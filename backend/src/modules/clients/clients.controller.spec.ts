import { Test, TestingModule } from '@nestjs/testing';
import { ClientsController } from './clients.controller';
import { ClientsService } from './clients.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

describe('ClientsController', () => {
  let controller: ClientsController;

  const mockClient = {
    id: '123',
    nome: 'Test Client',
    email: 'client@test.com',
    ativo: true,
    criadoEm: new Date(),
    atualizadoEm: new Date(),
  };

  const mockClientsService = {
    create: jest.fn().mockResolvedValue(mockClient),
    findAll: jest.fn().mockResolvedValue({ data: [mockClient], meta: { total: 1 } }),
    findOne: jest.fn().mockResolvedValue(mockClient),
    update: jest.fn().mockResolvedValue(mockClient),
    remove: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClientsController],
      providers: [{ provide: ClientsService, useValue: mockClientsService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<ClientsController>(ClientsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a client', async () => {
    const result = await controller.create({} as any);
    expect(result).toEqual(mockClient);
  });

  it('should find all clients', async () => {
    const result = await controller.findAll({} as any);
    expect(result.data).toEqual([mockClient]);
  });

  it('should find one client', async () => {
    const result = await controller.findOne('123');
    expect(result).toEqual(mockClient);
  });

  it('should update a client', async () => {
    const result = await controller.update('123', {} as any);
    expect(result).toEqual(mockClient);
  });

  it('should remove a client', async () => {
    const result = await controller.remove('123');
    expect(result).toBeUndefined();
  });
});
