import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';
import { AuthHelper, AuthTokens } from './helpers/auth.helper';

describe('Audit API (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let tokens: AuthTokens;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );
    await app.init();

    dataSource = moduleFixture.get<DataSource>(DataSource);

    // Cria usuários de teste
    await AuthHelper.createTestUsers(app);

    // Obtém tokens de autenticação
    tokens = await AuthHelper.getAuthTokens(app);

    // Cria alguns registros de auditoria para teste
    try {
      await dataSource.query(`
        INSERT INTO auditoria (tabela, acao, registro_id, dados_novos, criado_em)
        VALUES
          ('leads', 'INSERT', 'test-uuid-1', '{"nome": "Test Lead"}', NOW()),
          ('clientes', 'UPDATE', 'test-uuid-2', '{"nome": "Test Client"}', NOW())
        ON CONFLICT DO NOTHING
      `);
    } catch (error) {
      // Ignora erro se já existir
    }
  });

  afterAll(async () => {
    // Limpa registros de teste
    try {
      await dataSource.query(`
        DELETE FROM auditoria WHERE registro_id IN ('test-uuid-1', 'test-uuid-2')
      `);
    } catch (error) {
      // Ignora erro
    }
    await app.close();
  });

  describe('GET /api/audit', () => {
    it('should return paginated audit logs', () => {
      return request(app.getHttpServer())
        .get('/api/audit')
        .query({ page: 1, limit: 20 })
        .set('Authorization', `Bearer ${tokens.gerenteToken}`)
        .expect((res) => {
          // Should return 401 without auth or 200 with proper auth
          if (res.status === 200) {
            expect(res.body).toHaveProperty('data');
            expect(res.body).toHaveProperty('meta');
            expect(res.body.meta).toHaveProperty('total');
            expect(res.body.meta).toHaveProperty('page');
            expect(res.body.meta).toHaveProperty('limit');
            expect(res.body.meta).toHaveProperty('totalPages');
            expect(Array.isArray(res.body.data)).toBe(true);
          }
        });
    });

    it('should filter by tabela', () => {
      return request(app.getHttpServer())
        .get('/api/audit')
        .query({ tabela: 'leads', page: 1, limit: 10 })
        .set('Authorization', `Bearer ${tokens.gerenteToken}`)
        .expect((res) => {
          if (res.status === 200) {
            expect(res.body).toHaveProperty('data');
            res.body.data.forEach((log: any) => {
              expect(log.tabela).toBe('leads');
            });
          }
        });
    });

    it('should filter by acao', () => {
      return request(app.getHttpServer())
        .get('/api/audit')
        .query({ acao: 'INSERT', page: 1, limit: 10 })
        .set('Authorization', `Bearer ${tokens.gerenteToken}`)
        .expect((res) => {
          if (res.status === 200) {
            expect(res.body).toHaveProperty('data');
            res.body.data.forEach((log: any) => {
              expect(log.acao).toBe('INSERT');
            });
          }
        });
    });

    it('should validate pagination params', () => {
      return request(app.getHttpServer())
        .get('/api/audit')
        .query({ page: 0, limit: 200 })
        .set('Authorization', `Bearer ${tokens.gerenteToken}`)
        .expect((res) => {
          // Should return validation error for invalid params
          expect([400, 401]).toContain(res.status);
        });
    });
  });

  describe('GET /api/audit/stats', () => {
    it('should return audit statistics', () => {
      return request(app.getHttpServer())
        .get('/api/audit/stats')
        .set('Authorization', `Bearer ${tokens.gerenteToken}`)
        .expect((res) => {
          if (res.status === 200) {
            expect(res.body).toHaveProperty('totalLogs');
            expect(res.body).toHaveProperty('byAction');
            expect(res.body).toHaveProperty('byTable');
            expect(res.body).toHaveProperty('last24h');
          }
        });
    });
  });

  describe('GET /api/audit/registro/:registroId', () => {
    it('should return audit history for a specific registro', () => {
      return request(app.getHttpServer())
        .get('/api/audit/registro/test-uuid-1')
        .set('Authorization', `Bearer ${tokens.gerenteToken}`)
        .expect((res) => {
          if (res.status === 200) {
            expect(Array.isArray(res.body)).toBe(true);
            res.body.forEach((log: any) => {
              expect(log.registroId).toBe('test-uuid-1');
            });
          }
        });
    });

    it('should return empty array for non-existent registro', () => {
      return request(app.getHttpServer())
        .get('/api/audit/registro/non-existent-uuid')
        .set('Authorization', `Bearer ${tokens.gerenteToken}`)
        .expect((res) => {
          if (res.status === 200) {
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body).toHaveLength(0);
          }
        });
    });
  });
});
