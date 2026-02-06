import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';

export interface TestUser {
  id?: string;
  nome: string;
  email: string;
  senha: string;
  role: 'admin' | 'gerente' | 'vendedor';
}

export interface AuthTokens {
  adminToken: string;
  gerenteToken: string;
  vendedorToken: string;
}

const TEST_USERS: TestUser[] = [
  {
    nome: 'Admin Test',
    email: 'admin.test@crm.com',
    senha: 'Admin@123',
    role: 'admin',
  },
  {
    nome: 'Gerente Test',
    email: 'gerente.test@crm.com',
    senha: 'Gerente@123',
    role: 'gerente',
  },
  {
    nome: 'Vendedor Test',
    email: 'vendedor.test@crm.com',
    senha: 'Vendedor@123',
    role: 'vendedor',
  },
];

export class AuthHelper {
  static async createTestUsers(app: INestApplication): Promise<void> {
    for (const user of TEST_USERS) {
      try {
        // Tenta registrar via API
        const res = await request(app.getHttpServer())
          .post('/api/v1/auth/register')
          .send({
            nome: user.nome,
            email: user.email,
            senha: user.senha,
            cargo: user.role,
          });

        if (res.status === 201 || res.status === 200) {
          user.id = res.body.user?.id;
        }
      } catch (error) {
        // Usuário já existe, continua
      }
    }
  }

  static async cleanupTestUsers(app: INestApplication): Promise<void> {
    const dataSource = app.get(DataSource);
    const emails = TEST_USERS.map(u => u.email);

    await dataSource.query(
      `DELETE FROM usuarios WHERE email = ANY($1)`,
      [emails]
    );
  }

  static async getAuthTokens(app: INestApplication): Promise<AuthTokens> {
    const tokens: Partial<AuthTokens> = {};

    // Login como admin
    const adminRes = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: TEST_USERS[0].email,
        senha: TEST_USERS[0].senha,
      });

    tokens.adminToken = adminRes.body.access_token || adminRes.body.token;

    // Login como gerente
    const gerenteRes = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: TEST_USERS[1].email,
        senha: TEST_USERS[1].senha,
      });

    tokens.gerenteToken = gerenteRes.body.access_token || gerenteRes.body.token;

    // Login como vendedor
    const vendedorRes = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: TEST_USERS[2].email,
        senha: TEST_USERS[2].senha,
      });

    tokens.vendedorToken = vendedorRes.body.access_token || vendedorRes.body.token;

    return tokens as AuthTokens;
  }

  static getTestUsers(): TestUser[] {
    return TEST_USERS;
  }
}
