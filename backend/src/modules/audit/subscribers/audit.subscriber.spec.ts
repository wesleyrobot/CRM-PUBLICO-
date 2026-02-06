import { AuditSubscriber } from './audit.subscriber';
import { DataSource } from 'typeorm';
import { Lead } from '../../leads/entities/lead.entity';
import { Client } from '../../clients/entities/client.entity';
import { Company } from '../../companies/entities/company.entity';
import { User } from '../../users/entities/user.entity';

describe('AuditSubscriber', () => {
  let subscriber: AuditSubscriber;
  let mockDataSource: any;
  let mockConnection: any;

  beforeEach(() => {
    mockConnection = {
      query: jest.fn().mockResolvedValue(undefined),
    };

    mockDataSource = {
      subscribers: [],
      query: jest.fn(),
    };

    subscriber = new AuditSubscriber(mockDataSource as unknown as DataSource);
  });

  it('should be defined', () => {
    expect(subscriber).toBeDefined();
  });

  it('should register itself as a subscriber', () => {
    expect(mockDataSource.subscribers).toContain(subscriber);
  });

  describe('afterInsert', () => {
    it('should create audit log for Lead insert', async () => {
      const lead = Object.assign(new Lead(), {
        id: 'uuid-123',
        nome: 'Test Lead',
        email: 'test@test.com',
      });

      const event = {
        entity: lead,
        manager: { connection: mockConnection },
      };

      await subscriber.afterInsert(event as any);

      expect(mockConnection.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO auditoria'),
        expect.arrayContaining(['leads', 'INSERT', 'uuid-123']),
      );
    });

    it('should create audit log for Client insert', async () => {
      const client = Object.assign(new Client(), {
        id: 'uuid-456',
        nome: 'Test Client',
      });

      const event = {
        entity: client,
        manager: { connection: mockConnection },
      };

      await subscriber.afterInsert(event as any);

      expect(mockConnection.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO auditoria'),
        expect.arrayContaining(['clientes', 'INSERT', 'uuid-456']),
      );
    });

    it('should create audit log for Company insert', async () => {
      const company = Object.assign(new Company(), {
        id: 'uuid-789',
        razaoSocial: 'Test Company',
      });

      const event = {
        entity: company,
        manager: { connection: mockConnection },
      };

      await subscriber.afterInsert(event as any);

      expect(mockConnection.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO auditoria'),
        expect.arrayContaining(['empresas', 'INSERT', 'uuid-789']),
      );
    });

    it('should NOT audit non-tracked entities', async () => {
      const event = {
        entity: { id: '123', name: 'Not tracked' },
        manager: { connection: mockConnection },
      };

      await subscriber.afterInsert(event as any);

      expect(mockConnection.query).not.toHaveBeenCalled();
    });

    it('should sanitize sensitive data (senha)', async () => {
      const user = Object.assign(new User(), {
        id: 'uuid-user',
        nome: 'Test User',
        senha: 'secret123',
        password: 'secret456',
      });

      const event = {
        entity: user,
        manager: { connection: mockConnection },
      };

      await subscriber.afterInsert(event as any);

      const queryArgs = mockConnection.query.mock.calls[0][1];
      const dadosNovos = JSON.parse(queryArgs[4]);
      expect(dadosNovos).not.toHaveProperty('senha');
      expect(dadosNovos).not.toHaveProperty('password');
    });

    it('should sanitize search_vector from data', async () => {
      const lead = Object.assign(new Lead(), {
        id: 'uuid-123',
        nome: 'Test Lead',
        search_vector: 'some tsvector data',
        searchVector: 'some tsvector data',
      });

      const event = {
        entity: lead,
        manager: { connection: mockConnection },
      };

      await subscriber.afterInsert(event as any);

      const queryArgs = mockConnection.query.mock.calls[0][1];
      const dadosNovos = JSON.parse(queryArgs[4]);
      expect(dadosNovos).not.toHaveProperty('search_vector');
      expect(dadosNovos).not.toHaveProperty('searchVector');
    });
  });

  describe('afterUpdate', () => {
    it('should create audit log for update', async () => {
      const lead = Object.assign(new Lead(), {
        id: 'uuid-123',
        nome: 'Updated Lead',
      });

      const event = {
        entity: lead,
        databaseEntity: { id: 'uuid-123', nome: 'Original Lead' },
        manager: { connection: mockConnection },
      };

      await subscriber.afterUpdate(event as any);

      expect(mockConnection.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO auditoria'),
        expect.arrayContaining(['leads', 'UPDATE', 'uuid-123']),
      );
    });

    it('should include previous data in audit log', async () => {
      const lead = Object.assign(new Lead(), {
        id: 'uuid-123',
        nome: 'Updated Lead',
      });

      const event = {
        entity: lead,
        databaseEntity: { id: 'uuid-123', nome: 'Original Lead' },
        manager: { connection: mockConnection },
      };

      await subscriber.afterUpdate(event as any);

      const queryArgs = mockConnection.query.mock.calls[0][1];
      const dadosAnteriores = JSON.parse(queryArgs[3]);
      expect(dadosAnteriores.nome).toBe('Original Lead');
    });

    it('should skip update when entity is null', async () => {
      const event = {
        entity: null,
        databaseEntity: {},
        manager: { connection: mockConnection },
      };

      await subscriber.afterUpdate(event as any);

      expect(mockConnection.query).not.toHaveBeenCalled();
    });
  });

  describe('afterRemove', () => {
    it('should create audit log for remove', async () => {
      const lead = Object.assign(new Lead(), {
        id: 'uuid-123',
        nome: 'Deleted Lead',
      });

      const event = {
        entity: lead,
        manager: { connection: mockConnection },
      };

      await subscriber.afterRemove(event as any);

      expect(mockConnection.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO auditoria'),
        expect.arrayContaining(['leads', 'DELETE', 'uuid-123']),
      );
    });

    it('should skip remove when entity is null', async () => {
      const event = {
        entity: null,
        manager: { connection: mockConnection },
      };

      await subscriber.afterRemove(event as any);

      expect(mockConnection.query).not.toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('should not throw when audit log fails', async () => {
      jest.spyOn(console, 'error').mockImplementation();
      mockConnection.query.mockRejectedValue(new Error('DB error'));

      const lead = Object.assign(new Lead(), {
        id: 'uuid-123',
        nome: 'Test Lead',
      });

      const event = {
        entity: lead,
        manager: { connection: mockConnection },
      };

      await expect(
        subscriber.afterInsert(event as any),
      ).resolves.not.toThrow();

      jest.restoreAllMocks();
    });
  });
});
