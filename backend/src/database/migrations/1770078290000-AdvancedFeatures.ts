import { MigrationInterface, QueryRunner } from 'typeorm';

export class AdvancedFeatures1770078290000 implements MigrationInterface {
  name = 'AdvancedFeatures1770078290000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Soft Delete
    await queryRunner.query(`ALTER TABLE "usuarios" ADD COLUMN "deletado_em" TIMESTAMP`);
    await queryRunner.query(`ALTER TABLE "empresas" ADD COLUMN "deletado_em" TIMESTAMP`);
    await queryRunner.query(`ALTER TABLE "leads" ADD COLUMN "deletado_em" TIMESTAMP`);
    await queryRunner.query(`ALTER TABLE "clientes" ADD COLUMN "deletado_em" TIMESTAMP`);

    // Índices básicos
    await queryRunner.query(`CREATE INDEX "idx_usuarios_email" ON "usuarios"("email")`);
    await queryRunner.query(`CREATE INDEX "idx_leads_status" ON "leads"("status")`);
    await queryRunner.query(`CREATE INDEX "idx_empresas_cnpj" ON "empresas"("cnpj")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_empresas_cnpj"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_leads_status"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_usuarios_email"`);
    await queryRunner.query(`ALTER TABLE "clientes" DROP COLUMN IF EXISTS "deletado_em"`);
    await queryRunner.query(`ALTER TABLE "leads" DROP COLUMN IF EXISTS "deletado_em"`);
    await queryRunner.query(`ALTER TABLE "empresas" DROP COLUMN IF EXISTS "deletado_em"`);
    await queryRunner.query(`ALTER TABLE "usuarios" DROP COLUMN IF EXISTS "deletado_em"`);
  }
}
