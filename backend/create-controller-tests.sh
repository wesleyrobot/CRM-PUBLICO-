#!/bin/bash

# CompaniesController
cat > src/modules/companies/companies.controller.spec.ts << 'EOF'
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
EOF

# LeadsController
cat > src/modules/leads/leads.controller.spec.ts << 'EOF'
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
EOF

# ClientsController
cat > src/modules/clients/clients.controller.spec.ts << 'EOF'
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
EOF

echo "✅ Controller tests created!"
