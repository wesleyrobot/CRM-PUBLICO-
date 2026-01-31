import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1738202400000 implements MigrationInterface {
  name = 'InitialSchema1738202400000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Criar extensão UUID
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    // Criar tabela usuarios
    await queryRunner.query(`
      CREATE TABLE "usuarios" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "nome" character varying(100) NOT NULL,
        "email" character varying(150) NOT NULL,
        "senha" character varying NOT NULL,
        "cargo" character varying(20) NOT NULL DEFAULT 'vendedor',
        "ativo" boolean NOT NULL DEFAULT true,
        "avatar" character varying(255),
        "telefone" character varying(20),
        "criado_em" TIMESTAMP NOT NULL DEFAULT now(),
        "atualizado_em" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_usuarios_email" UNIQUE ("email"),
        CONSTRAINT "PK_usuarios" PRIMARY KEY ("id")
      )
    `);

    // Criar tabela empresas
    await queryRunner.query(`
      CREATE TABLE "empresas" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "razao_social" character varying(200) NOT NULL,
        "nome_fantasia" character varying(200),
        "cnpj" character varying(18),
        "segmento" character varying(100),
        "website" character varying(255),
        "telefone" character varying(20),
        "endereco" character varying(255),
        "cidade" character varying(100),
        "estado" character varying(2),
        "cep" character varying(9),
        "funcionarios" integer,
        "faturamento_anual" numeric(15,2),
        "ativo" boolean NOT NULL DEFAULT true,
        "criado_em" TIMESTAMP NOT NULL DEFAULT now(),
        "atualizado_em" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_empresas_cnpj" UNIQUE ("cnpj"),
        CONSTRAINT "PK_empresas" PRIMARY KEY ("id")
      )
    `);

    // Criar tabela leads
    await queryRunner.query(`
      CREATE TABLE "leads" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "nome" character varying(100) NOT NULL,
        "email" character varying(150),
        "telefone" character varying(20),
        "cargo" character varying(100),
        "status" character varying(20) NOT NULL DEFAULT 'novo',
        "origem" character varying(100),
        "observacoes" text,
        "pontuacao" integer NOT NULL DEFAULT 0,
        "data_ultimo_contato" TIMESTAMP,
        "empresa_id" uuid,
        "responsavel_id" uuid,
        "criado_em" TIMESTAMP NOT NULL DEFAULT now(),
        "atualizado_em" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_leads" PRIMARY KEY ("id")
      )
    `);

    // Criar tabela clientes
    await queryRunner.query(`
      CREATE TABLE "clientes" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "nome" character varying(100) NOT NULL,
        "email" character varying(150),
        "telefone" character varying(20),
        "celular" character varying(20),
        "cargo" character varying(100),
        "departamento" character varying(100),
        "data_nascimento" date,
        "ativo" boolean NOT NULL DEFAULT true,
        "observacoes" text,
        "empresa_id" uuid,
        "responsavel_id" uuid,
        "criado_em" TIMESTAMP NOT NULL DEFAULT now(),
        "atualizado_em" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_clientes" PRIMARY KEY ("id")
      )
    `);

    // Adicionar Foreign Keys
    await queryRunner.query(`
      ALTER TABLE "leads"
      ADD CONSTRAINT "FK_leads_empresa" 
      FOREIGN KEY ("empresa_id") REFERENCES "empresas"("id") 
      ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "leads"
      ADD CONSTRAINT "FK_leads_responsavel" 
      FOREIGN KEY ("responsavel_id") REFERENCES "usuarios"("id") 
      ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "clientes"
      ADD CONSTRAINT "FK_clientes_empresa" 
      FOREIGN KEY ("empresa_id") REFERENCES "empresas"("id") 
      ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "clientes"
      ADD CONSTRAINT "FK_clientes_responsavel" 
      FOREIGN KEY ("responsavel_id") REFERENCES "usuarios"("id") 
      ON DELETE NO ACTION ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remover Foreign Keys
    await queryRunner.query(`ALTER TABLE "clientes" DROP CONSTRAINT "FK_clientes_responsavel"`);
    await queryRunner.query(`ALTER TABLE "clientes" DROP CONSTRAINT "FK_clientes_empresa"`);
    await queryRunner.query(`ALTER TABLE "leads" DROP CONSTRAINT "FK_leads_responsavel"`);
    await queryRunner.query(`ALTER TABLE "leads" DROP CONSTRAINT "FK_leads_empresa"`);

    // Dropar tabelas
    await queryRunner.query(`DROP TABLE "clientes"`);
    await queryRunner.query(`DROP TABLE "leads"`);
    await queryRunner.query(`DROP TABLE "empresas"`);
    await queryRunner.query(`DROP TABLE "usuarios"`);
  }
}
