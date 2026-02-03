import { MigrationInterface, QueryRunner } from 'typeorm';

export class AdvancedAnalytics1770078500000 implements MigrationInterface {
  name = 'AdvancedAnalytics1770078500000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ÍNDICES DE PERFORMANCE
    await queryRunner.query(`CREATE INDEX "idx_usuarios_ativo" ON "usuarios"("ativo")`);
    await queryRunner.query(`CREATE INDEX "idx_usuarios_cargo" ON "usuarios"("cargo")`);
    await queryRunner.query(`CREATE INDEX "idx_empresas_segmento" ON "empresas"("segmento")`);
    await queryRunner.query(`CREATE INDEX "idx_empresas_ativo" ON "empresas"("ativo")`);
    await queryRunner.query(`CREATE INDEX "idx_leads_origem" ON "leads"("origem")`);
    await queryRunner.query(`CREATE INDEX "idx_leads_email" ON "leads"("email")`);
    await queryRunner.query(`CREATE INDEX "idx_leads_empresa_id" ON "leads"("empresa_id")`);
    await queryRunner.query(`CREATE INDEX "idx_leads_responsavel_id" ON "leads"("responsavel_id")`);
    await queryRunner.query(`CREATE INDEX "idx_clientes_email" ON "clientes"("email")`);
    await queryRunner.query(`CREATE INDEX "idx_clientes_ativo" ON "clientes"("ativo")`);
    await queryRunner.query(`CREATE INDEX "idx_clientes_empresa_id" ON "clientes"("empresa_id")`);
    await queryRunner.query(`CREATE INDEX "idx_clientes_responsavel_id" ON "clientes"("responsavel_id")`);
    await queryRunner.query(`CREATE INDEX "idx_leads_criado_em" ON "leads"("criado_em")`);
    await queryRunner.query(`CREATE INDEX "idx_clientes_criado_em" ON "clientes"("criado_em")`);

    // FULL-TEXT SEARCH
    await queryRunner.query(`ALTER TABLE "leads" ADD COLUMN "search_vector" tsvector`);
    await queryRunner.query(`ALTER TABLE "clientes" ADD COLUMN "search_vector" tsvector`);
    await queryRunner.query(`ALTER TABLE "empresas" ADD COLUMN "search_vector" tsvector`);
    await queryRunner.query(`CREATE INDEX "idx_leads_search" ON "leads" USING GIN("search_vector")`);
    await queryRunner.query(`CREATE INDEX "idx_clientes_search" ON "clientes" USING GIN("search_vector")`);
    await queryRunner.query(`CREATE INDEX "idx_empresas_search" ON "empresas" USING GIN("search_vector")`);

    // AUDITORIA
    await queryRunner.query(`
      CREATE TABLE "auditoria" (
        "id" SERIAL PRIMARY KEY,
        "tabela" VARCHAR(50) NOT NULL,
        "acao" VARCHAR(20) NOT NULL,
        "registro_id" UUID NOT NULL,
        "dados_anteriores" JSONB,
        "dados_novos" JSONB,
        "usuario_id" UUID,
        "criado_em" TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
    await queryRunner.query(`CREATE INDEX "idx_auditoria_tabela" ON "auditoria"("tabela")`);
    await queryRunner.query(`CREATE INDEX "idx_auditoria_registro_id" ON "auditoria"("registro_id")`);

    // VIEWS MATERIALIZADAS
    await queryRunner.query(`
      CREATE MATERIALIZED VIEW "mv_dashboard_stats" AS
      SELECT 
        (SELECT COUNT(*) FROM leads WHERE deletado_em IS NULL) as total_leads,
        (SELECT COUNT(*) FROM clientes WHERE deletado_em IS NULL) as total_clientes,
        (SELECT COUNT(*) FROM empresas WHERE deletado_em IS NULL) as total_empresas
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP MATERIALIZED VIEW IF EXISTS "mv_dashboard_stats"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "auditoria"`);
    await queryRunner.query(`ALTER TABLE "empresas" DROP COLUMN IF EXISTS "search_vector"`);
    await queryRunner.query(`ALTER TABLE "clientes" DROP COLUMN IF EXISTS "search_vector"`);
    await queryRunner.query(`ALTER TABLE "leads" DROP COLUMN IF EXISTS "search_vector"`);
  }
}
