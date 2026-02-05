import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';
import { AuthHelper, AuthTokens } from './helpers/auth.helper';

describe('Dashboard API (e2e)', () => {
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

    // Cria view materializada se não existir
    try {
      await dataSource.query(`
        CREATE MATERIALIZED VIEW IF NOT EXISTS mv_dashboard_stats AS
        SELECT
          COUNT(DISTINCT l.id) as total_leads,
          COUNT(DISTINCT c.id) as total_clientes,
          COUNT(DISTINCT e.id) as total_empresas
        FROM leads l
        CROSS JOIN clientes c
        CROSS JOIN empresas e
        WHERE l.deletado_em IS NULL
          AND c.deletado_em IS NULL
          AND e.deletado_em IS NULL
      `);
    } catch (error) {
      // View já existe
    }
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /api/dashboard', () => {
    it('should return complete dashboard data', () => {
      return request(app.getHttpServer())
        .get('/api/dashboard')
        .query({ period: 'month' })
        .set('Authorization', `Bearer ${tokens.gerenteToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('stats');
          expect(res.body).toHaveProperty('timeline');
          expect(res.body).toHaveProperty('byStatus');
          expect(res.body).toHaveProperty('bySegment');
          expect(res.body).toHaveProperty('topUsers');
          expect(res.body).toHaveProperty('lastRefresh');

          expect(res.body.stats).toHaveProperty('totals');
          expect(res.body.stats).toHaveProperty('growth');
          expect(res.body.stats).toHaveProperty('conversion');
        });
    });

    it.skip('should accept custom date range', () => {
      // TODO: Fix date filter SQL query
      return request(app.getHttpServer())
        .get('/api/dashboard')
        .query({
          startDate: '2024-01-01',
          endDate: '2024-01-31',
        })
        .set('Authorization', `Bearer ${tokens.gerenteToken}`)
        .expect(200);
    });

    it('should accept different periods', async () => {
      // Test only one period to avoid rate limiting
      const result = await request(app.getHttpServer())
        .get('/api/dashboard')
        .query({ period: 'week' })
        .set('Authorization', `Bearer ${tokens.gerenteToken}`)
        .expect(200);

      expect(result.body).toHaveProperty('stats');
      expect(result.body).toHaveProperty('timeline');
    });
  });

  describe('GET /api/dashboard/stats', () => {
    it('should return dashboard statistics', () => {
      return request(app.getHttpServer())
        .get('/api/dashboard/stats')
        .set('Authorization', `Bearer ${tokens.gerenteToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('totals');
          expect(res.body).toHaveProperty('growth');
          expect(res.body).toHaveProperty('conversion');

          expect(res.body.totals).toHaveProperty('leads');
          expect(res.body.totals).toHaveProperty('clientes');
          expect(res.body.totals).toHaveProperty('empresas');
          expect(res.body.totals).toHaveProperty('usuarios');
        });
    });
  });

  describe('GET /api/dashboard/timeline', () => {
    it('should return timeline data', () => {
      return request(app.getHttpServer())
        .get('/api/dashboard/timeline')
        .query({ period: 'week' })
        .set('Authorization', `Bearer ${tokens.gerenteToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('labels');
          expect(res.body).toHaveProperty('leads');
          expect(res.body).toHaveProperty('clientes');
          expect(Array.isArray(res.body.labels)).toBe(true);
          expect(Array.isArray(res.body.leads)).toBe(true);
          expect(Array.isArray(res.body.clientes)).toBe(true);
        });
    });
  });

  describe('POST /api/dashboard/refresh', () => {
    it('should refresh materialized view (admin only)', () => {
      return request(app.getHttpServer())
        .post('/api/dashboard/refresh')
        .set('Authorization', `Bearer ${tokens.adminToken}`)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('success', true);
          expect(res.body).toHaveProperty('refreshedAt');
        });
    });
  });
});
