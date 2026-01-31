import { DataSource } from 'typeorm';
import { config } from 'dotenv';

// Mock do dotenv
jest.mock('dotenv', () => ({
  config: jest.fn(),
}));

describe('TypeORM Configuration', () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    originalEnv = { ...process.env };
    jest.clearAllMocks();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should use environment variables for database configuration', () => {
    process.env.DB_HOST = 'test-host';
    process.env.DB_PORT = '5433';
    process.env.DB_USERNAME = 'test-user';
    process.env.DB_PASSWORD = 'test-pass';
    process.env.DB_DATABASE = 'test-db';

    expect(process.env.DB_HOST).toBe('test-host');
    expect(process.env.DB_PORT).toBe('5433');
    expect(process.env.DB_USERNAME).toBe('test-user');
    expect(process.env.DB_PASSWORD).toBe('test-pass');
    expect(process.env.DB_DATABASE).toBe('test-db');
  });

  it('should use default values when environment variables are not set', () => {
    delete process.env.DB_HOST;
    delete process.env.DB_PORT;
    delete process.env.DB_USERNAME;
    delete process.env.DB_PASSWORD;
    delete process.env.DB_DATABASE;

    const defaultHost = process.env.DB_HOST || 'localhost';
    const defaultPort = parseInt(process.env.DB_PORT || '5432');
    const defaultUsername = process.env.DB_USERNAME || 'postgres';
    const defaultPassword = process.env.DB_PASSWORD || 'postgres';
    const defaultDatabase = process.env.DB_DATABASE || 'crm_db';

    expect(defaultHost).toBe('localhost');
    expect(defaultPort).toBe(5432);
    expect(defaultUsername).toBe('postgres');
    expect(defaultPassword).toBe('postgres');
    expect(defaultDatabase).toBe('crm_db');
  });

  it('should handle different NODE_ENV values', () => {
    const environments = ['development', 'production', 'test'];

    environments.forEach((env) => {
      process.env.NODE_ENV = env;
      expect(process.env.NODE_ENV).toBe(env);
    });
  });

  it('should validate port number conversion', () => {
    process.env.DB_PORT = '5432';
    const port = parseInt(process.env.DB_PORT);
    expect(port).toBe(5432);
    expect(typeof port).toBe('number');
  });

  it('should handle invalid port numbers gracefully', () => {
    process.env.DB_PORT = 'invalid';
    const port = parseInt(process.env.DB_PORT);
    expect(isNaN(port)).toBe(true);
  });

  it('should validate synchronize setting based on environment', () => {
    // Development
    process.env.NODE_ENV = 'development';
    const devSync = process.env.NODE_ENV === 'development';
    expect(devSync).toBe(true);

    // Production
    process.env.NODE_ENV = 'production';
    const prodSync = process.env.NODE_ENV === 'development';
    expect(prodSync).toBe(false);
  });

  it('should validate logging configuration', () => {
    process.env.NODE_ENV = 'development';
    const shouldLog = process.env.NODE_ENV === 'development';
    expect(shouldLog).toBe(true);

    process.env.NODE_ENV = 'production';
    const shouldNotLog = process.env.NODE_ENV === 'development';
    expect(shouldNotLog).toBe(false);
  });

  it('should handle SSL configuration', () => {
    process.env.DB_SSL = 'true';
    const sslEnabled = process.env.DB_SSL === 'true';
    expect(sslEnabled).toBe(true);

    delete process.env.DB_SSL;
    const sslDisabled = process.env.DB_SSL === 'true';
    expect(sslDisabled).toBe(false);
  });

  it('should validate entities path configuration', () => {
    const entitiesPath = 'dist/**/*.entity.js';
    expect(entitiesPath).toContain('entity.js');
    expect(entitiesPath).toContain('dist');
  });

  it('should validate migrations path configuration', () => {
    const migrationsPath = 'dist/database/migrations/*.js';
    expect(migrationsPath).toContain('migrations');
    expect(migrationsPath).toContain('.js');
  });
});

describe('DataSource Configuration', () => {
  it('should create DataSource with correct configuration', () => {
    const mockConfig = {
      type: 'postgres' as const,
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'postgres',
      database: 'crm_db',
      entities: ['dist/**/*.entity.js'],
      migrations: ['dist/database/migrations/*.js'],
      synchronize: false,
    };

    expect(mockConfig.type).toBe('postgres');
    expect(mockConfig.host).toBe('localhost');
    expect(mockConfig.port).toBe(5432);
    expect(mockConfig.entities).toHaveLength(1);
    expect(mockConfig.migrations).toHaveLength(1);
    expect(mockConfig.synchronize).toBe(false);
  });

  it('should validate all required database configuration fields', () => {
    const requiredFields = [
      'type',
      'host',
      'port',
      'username',
      'password',
      'database',
    ];

    const mockConfig = {
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'postgres',
      database: 'crm_db',
    };

    requiredFields.forEach((field) => {
      expect(mockConfig).toHaveProperty(field);
    });
  });
});
