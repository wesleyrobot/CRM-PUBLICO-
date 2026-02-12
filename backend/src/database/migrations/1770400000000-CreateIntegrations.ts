import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateIntegrations1770400000000 implements MigrationInterface {
  name = 'CreateIntegrations1770400000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Criar tipos enum
    await queryRunner.query(`
      CREATE TYPE "integration_type_enum" AS ENUM (
        'webhook', 'api_rest', 'zapier', 'make', 'n8n', 'custom'
      )
    `);

    await queryRunner.query(`
      CREATE TYPE "integration_event_enum" AS ENUM (
        'lead_created', 'lead_updated', 'lead_deleted',
        'client_created', 'client_updated'
      )
    `);

    // Criar tabela integrations
    await queryRunner.query(`
      CREATE TABLE "integrations" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "name" VARCHAR(100) NOT NULL,
        "description" TEXT,
        "type" integration_type_enum DEFAULT 'webhook',
        "url" TEXT NOT NULL,
        "method" VARCHAR(20) DEFAULT 'POST',
        "auth_token" TEXT,
        "headers" JSONB DEFAULT '{}',
        "config" JSONB DEFAULT '{}',
        "events" integration_event_enum[] DEFAULT ARRAY['lead_created']::integration_event_enum[],
        "active" BOOLEAN DEFAULT true,
        "last_triggered_at" TIMESTAMP,
        "success_count" INTEGER DEFAULT 0,
        "error_count" INTEGER DEFAULT 0,
        "last_error" TEXT,
        "user_id" UUID NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT NOW(),
        "deleted_at" TIMESTAMP,
        CONSTRAINT "fk_integrations_user" FOREIGN KEY ("user_id") REFERENCES "usuarios"("id") ON DELETE CASCADE
      )
    `);

    // Criar tabela de logs de integração
    await queryRunner.query(`
      CREATE TABLE "integration_logs" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "integration_id" UUID NOT NULL,
        "event" integration_event_enum NOT NULL,
        "payload" JSONB NOT NULL,
        "response_status" INTEGER,
        "response_body" TEXT,
        "error" TEXT,
        "success" BOOLEAN DEFAULT false,
        "duration_ms" INTEGER,
        "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
        CONSTRAINT "fk_integration_logs_integration" FOREIGN KEY ("integration_id") REFERENCES "integrations"("id") ON DELETE CASCADE
      )
    `);

    // Índices
    await queryRunner.query(`CREATE INDEX "idx_integrations_user_id" ON "integrations"("user_id")`);
    await queryRunner.query(`CREATE INDEX "idx_integrations_active" ON "integrations"("active")`);
    await queryRunner.query(`CREATE INDEX "idx_integrations_events" ON "integrations" USING GIN("events")`);
    await queryRunner.query(`CREATE INDEX "idx_integration_logs_integration_id" ON "integration_logs"("integration_id")`);
    await queryRunner.query(`CREATE INDEX "idx_integration_logs_created_at" ON "integration_logs"("created_at")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "integration_logs" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "integrations" CASCADE`);
    await queryRunner.query(`DROP TYPE IF EXISTS "integration_event_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "integration_type_enum"`);
  }
}
