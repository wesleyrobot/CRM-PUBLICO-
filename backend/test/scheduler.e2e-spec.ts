import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';
import { AuthHelper, AuthTokens } from './helpers/auth.helper';

describe('Scheduler API (e2e)', () => {
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
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /api/scheduler/jobs', () => {
    it('should return list of scheduled jobs', () => {
      return request(app.getHttpServer())
        .get('/api/scheduler/jobs')
        .set('Authorization', `Bearer ${tokens.gerenteToken}`)
        .expect((res) => {
          if (res.status === 200) {
            expect(Array.isArray(res.body)).toBe(true);
            
            if (res.body.length > 0) {
              res.body.forEach((job: any) => {
                expect(job).toHaveProperty('name');
                expect(job).toHaveProperty('nextRun');
              });

              // Verifica se os jobs esperados existem
              const jobNames = res.body.map((j: any) => j.name);
              expect(jobNames).toContain('refresh-dashboard-view');
              expect(jobNames).toContain('update-search-vectors');
              expect(jobNames).toContain('cleanup-old-audit-logs');
              expect(jobNames).toContain('vacuum-analyze');
            }
          }
        });
    });
  });

  describe('POST /api/scheduler/run/:jobName', () => {
    it('should run refresh-dashboard-view job manually', () => {
      return request(app.getHttpServer())
        .post('/api/scheduler/run/refresh-dashboard-view')
        .set('Authorization', `Bearer ${tokens.adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('success', true);
          expect(res.body).toHaveProperty('message');
          expect(res.body.message).toContain('Dashboard view atualizada');
        });
    });

    it('should run update-search-vectors job manually', () => {
      return request(app.getHttpServer())
        .post('/api/scheduler/run/update-search-vectors')
        .set('Authorization', `Bearer ${tokens.adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('success', true);
          expect(res.body.message).toContain('Search vectors atualizados');
        });
    });

    it('should run cleanup-old-audit-logs job manually', () => {
      return request(app.getHttpServer())
        .post('/api/scheduler/run/cleanup-old-audit-logs')
        .set('Authorization', `Bearer ${tokens.adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('success', true);
          expect(res.body.message).toContain('Logs antigos removidos');
        });
    });

    it('should return error for non-existent job', () => {
      return request(app.getHttpServer())
        .post('/api/scheduler/run/non-existent-job')
        .set('Authorization', `Bearer ${tokens.adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('success', false);
          expect(res.body.message).toContain('não encontrado');
        });
    });

    it('should require admin role', () => {
      return request(app.getHttpServer())
        .post('/api/scheduler/run/refresh-dashboard-view')
        .set('Authorization', `Bearer ${tokens.vendedorToken}`)
        .expect(403);
    });
  });

  describe('Cron Jobs Integration', () => {
    it('should have all expected cron jobs registered', () => {
      return request(app.getHttpServer())
        .get('/api/scheduler/jobs')
        .set('Authorization', `Bearer ${tokens.gerenteToken}`)
        .expect((res) => {
          if (res.status === 200) {
            const jobNames = res.body.map((j: any) => j.name);
            
            expect(jobNames).toContain('refresh-dashboard-view');
            expect(jobNames).toContain('update-search-vectors');
            expect(jobNames).toContain('cleanup-old-audit-logs');
            expect(jobNames).toContain('vacuum-analyze');
            
            expect(res.body).toHaveLength(4);
          }
        });
    });

    it('should have valid nextRun dates', () => {
      return request(app.getHttpServer())
        .get('/api/scheduler/jobs')
        .set('Authorization', `Bearer ${tokens.gerenteToken}`)
        .expect((res) => {
          if (res.status === 200) {
            res.body.forEach((job: any) => {
              if (job.nextRun) {
                const nextRun = new Date(job.nextRun);
                expect(nextRun.getTime()).toBeGreaterThan(Date.now() - 1000);
              }
            });
          }
        });
    });
  });
});
