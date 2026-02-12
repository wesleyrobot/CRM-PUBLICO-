import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateApiKeys1770300000000 implements MigrationInterface {
  name = 'CreateApiKeys1770300000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Criar tabela api_keys
    await queryRunner.query(`
      CREATE TABLE "api_keys" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "nome" VARCHAR(100) NOT NULL,
        "chave" VARCHAR(64) UNIQUE NOT NULL,
        "descricao" TEXT,
        "ativo" BOOLEAN DEFAULT true,
        "expira_em" TIMESTAMP,
        "ultimo_uso" TIMESTAMP,
        "permissoes" JSONB DEFAULT '{}',
        "usuario_id" UUID NOT NULL,
        "criado_em" TIMESTAMP NOT NULL DEFAULT NOW(),
        "atualizado_em" TIMESTAMP NOT NULL DEFAULT NOW(),
        "deletado_em" TIMESTAMP,
        CONSTRAINT "fk_api_keys_usuario" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE
      )
    `);

    // Índices
    await queryRunner.query(`CREATE INDEX "idx_api_keys_chave" ON "api_keys"("chave")`);
    await queryRunner.query(`CREATE INDEX "idx_api_keys_usuario_id" ON "api_keys"("usuario_id")`);
    await queryRunner.query(`CREATE INDEX "idx_api_keys_ativo" ON "api_keys"("ativo")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "api_keys" CASCADE`);
  }
}
