import { MigrationInterface, QueryRunner } from 'typeorm';

export class AdvancedPostgreSQLFeatures1770200000000 implements MigrationInterface {
  name = 'AdvancedPostgreSQLFeatures1770200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ============================================================================
    // 1. TRIGGERS PARA FULL-TEXT SEARCH AUTOMÁTICO
    // ============================================================================

    // Função para atualizar search_vector em Leads
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION update_leads_search_vector()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.search_vector :=
          setweight(to_tsvector('portuguese', COALESCE(NEW.nome, '')), 'A') ||
          setweight(to_tsvector('portuguese', COALESCE(NEW.email, '')), 'B') ||
          setweight(to_tsvector('portuguese', COALESCE(NEW.telefone, '')), 'C') ||
          setweight(to_tsvector('portuguese', COALESCE(NEW.empresa, '')), 'B') ||
          setweight(to_tsvector('portuguese', COALESCE(NEW.origem, '')), 'D');
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    await queryRunner.query(`
      CREATE TRIGGER leads_search_vector_update
      BEFORE INSERT OR UPDATE ON leads
      FOR EACH ROW
      EXECUTE FUNCTION update_leads_search_vector();
    `);

    // Função para atualizar search_vector em Clientes
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION update_clientes_search_vector()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.search_vector :=
          setweight(to_tsvector('portuguese', COALESCE(NEW.nome, '')), 'A') ||
          setweight(to_tsvector('portuguese', COALESCE(NEW.email, '')), 'B') ||
          setweight(to_tsvector('portuguese', COALESCE(NEW.telefone, '')), 'C');
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    await queryRunner.query(`
      CREATE TRIGGER clientes_search_vector_update
      BEFORE INSERT OR UPDATE ON clientes
      FOR EACH ROW
      EXECUTE FUNCTION update_clientes_search_vector();
    `);

    // Função para atualizar search_vector em Empresas
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION update_empresas_search_vector()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.search_vector :=
          setweight(to_tsvector('portuguese', COALESCE(NEW.nome, '')), 'A') ||
          setweight(to_tsvector('portuguese', COALESCE(NEW.cnpj, '')), 'B') ||
          setweight(to_tsvector('portuguese', COALESCE(NEW.segmento, '')), 'C') ||
          setweight(to_tsvector('portuguese', COALESCE(NEW.cidade, '')), 'D');
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    await queryRunner.query(`
      CREATE TRIGGER empresas_search_vector_update
      BEFORE INSERT OR UPDATE ON empresas
      FOR EACH ROW
      EXECUTE FUNCTION update_empresas_search_vector();
    `);

    // ============================================================================
    // 2. TRIGGERS PARA AUDITORIA AUTOMÁTICA
    // ============================================================================

    // Função genérica de auditoria
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION audit_trigger_function()
      RETURNS TRIGGER AS $$
      DECLARE
        dados_anteriores JSONB;
        dados_novos JSONB;
        usuario_atual UUID;
      BEGIN
        -- Pega o usuário do contexto (se disponível)
        usuario_atual := current_setting('app.current_user_id', TRUE)::UUID;

        IF (TG_OP = 'DELETE') THEN
          dados_anteriores := to_jsonb(OLD);
          dados_novos := NULL;
          INSERT INTO auditoria (tabela, acao, registro_id, dados_anteriores, dados_novos, usuario_id)
          VALUES (TG_TABLE_NAME, 'DELETE', OLD.id, dados_anteriores, dados_novos, usuario_atual);
          RETURN OLD;
        ELSIF (TG_OP = 'UPDATE') THEN
          dados_anteriores := to_jsonb(OLD);
          dados_novos := to_jsonb(NEW);
          -- Remove senha dos dados se existir
          IF dados_anteriores ? 'senha' THEN
            dados_anteriores := dados_anteriores - 'senha';
          END IF;
          IF dados_novos ? 'senha' THEN
            dados_novos := dados_novos - 'senha';
          END IF;
          INSERT INTO auditoria (tabela, acao, registro_id, dados_anteriores, dados_novos, usuario_id)
          VALUES (TG_TABLE_NAME, 'UPDATE', NEW.id, dados_anteriores, dados_novos, usuario_atual);
          RETURN NEW;
        ELSIF (TG_OP = 'INSERT') THEN
          dados_novos := to_jsonb(NEW);
          -- Remove senha dos dados se existir
          IF dados_novos ? 'senha' THEN
            dados_novos := dados_novos - 'senha';
          END IF;
          INSERT INTO auditoria (tabela, acao, registro_id, dados_anteriores, dados_novos, usuario_id)
          VALUES (TG_TABLE_NAME, 'INSERT', NEW.id, NULL, dados_novos, usuario_atual);
          RETURN NEW;
        END IF;
        RETURN NULL;
      END;
      $$ LANGUAGE plpgsql;
    `);

    // Triggers de auditoria para cada tabela
    await queryRunner.query(`
      CREATE TRIGGER usuarios_audit_trigger
      AFTER INSERT OR UPDATE OR DELETE ON usuarios
      FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
    `);

    await queryRunner.query(`
      CREATE TRIGGER leads_audit_trigger
      AFTER INSERT OR UPDATE OR DELETE ON leads
      FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
    `);

    await queryRunner.query(`
      CREATE TRIGGER clientes_audit_trigger
      AFTER INSERT OR UPDATE OR DELETE ON clientes
      FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
    `);

    await queryRunner.query(`
      CREATE TRIGGER empresas_audit_trigger
      AFTER INSERT OR UPDATE OR DELETE ON empresas
      FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
    `);

    // ============================================================================
    // 3. MATERIALIZED VIEWS AVANÇADAS
    // ============================================================================

    // View para estatísticas de conversão por período
    await queryRunner.query(`
      CREATE MATERIALIZED VIEW mv_conversion_stats AS
      SELECT
        DATE_TRUNC('month', l.criado_em) as mes,
        COUNT(DISTINCT l.id) as total_leads,
        COUNT(DISTINCT c.id) as total_convertidos,
        ROUND(
          (COUNT(DISTINCT c.id)::numeric / NULLIF(COUNT(DISTINCT l.id), 0) * 100),
          2
        ) as taxa_conversao
      FROM leads l
      LEFT JOIN clientes c ON c.id::text = l.id::text
      WHERE l.deletado_em IS NULL
      GROUP BY DATE_TRUNC('month', l.criado_em)
      ORDER BY mes DESC;
    `);

    await queryRunner.query(`
      CREATE INDEX idx_mv_conversion_stats_mes ON mv_conversion_stats(mes);
    `);

    // View para performance de usuários
    await queryRunner.query(`
      CREATE MATERIALIZED VIEW mv_user_performance AS
      SELECT
        u.id as usuario_id,
        u.nome as usuario_nome,
        u.email as usuario_email,
        u.cargo,
        COUNT(DISTINCT l.id) as total_leads,
        COUNT(DISTINCT c.id) as total_clientes,
        ROUND(
          (COUNT(DISTINCT c.id)::numeric / NULLIF(COUNT(DISTINCT l.id), 0) * 100),
          2
        ) as taxa_conversao
      FROM usuarios u
      LEFT JOIN leads l ON l.responsavel_id = u.id AND l.deletado_em IS NULL
      LEFT JOIN clientes c ON c.responsavel_id = u.id AND c.deletado_em IS NULL
      WHERE u.deletado_em IS NULL AND u.ativo = true
      GROUP BY u.id, u.nome, u.email, u.cargo
      ORDER BY total_clientes DESC;
    `);

    await queryRunner.query(`
      CREATE INDEX idx_mv_user_performance_usuario_id ON mv_user_performance(usuario_id);
    `);

    // View para distribuição por segmento
    await queryRunner.query(`
      CREATE MATERIALIZED VIEW mv_segment_distribution AS
      SELECT
        e.segmento,
        COUNT(DISTINCT l.id) as total_leads,
        COUNT(DISTINCT c.id) as total_clientes,
        COUNT(DISTINCT e.id) as total_empresas,
        ROUND(
          (COUNT(DISTINCT c.id)::numeric / NULLIF(COUNT(DISTINCT l.id), 0) * 100),
          2
        ) as taxa_conversao
      FROM empresas e
      LEFT JOIN clientes c ON c.empresa_id = e.id AND c.deletado_em IS NULL
      LEFT JOIN leads l ON l.empresa_id = e.id AND l.deletado_em IS NULL
      WHERE e.deletado_em IS NULL
      GROUP BY e.segmento
      ORDER BY total_clientes DESC;
    `);

    await queryRunner.query(`
      CREATE INDEX idx_mv_segment_distribution_segmento ON mv_segment_distribution(segmento);
    `);

    // ============================================================================
    // 4. ÍNDICES PARCIAIS PARA OTIMIZAÇÃO
    // ============================================================================

    // Índices parciais para registros ativos (mais eficientes)
    await queryRunner.query(`
      CREATE INDEX idx_leads_ativos ON leads(status, criado_em)
      WHERE deletado_em IS NULL;
    `);

    await queryRunner.query(`
      CREATE INDEX idx_clientes_ativos ON clientes(ativo, criado_em)
      WHERE deletado_em IS NULL;
    `);

    await queryRunner.query(`
      CREATE INDEX idx_empresas_ativas ON empresas(segmento, criado_em)
      WHERE deletado_em IS NULL AND ativo = true;
    `);

    // Índice composto para queries de dashboard
    await queryRunner.query(`
      CREATE INDEX idx_leads_dashboard ON leads(status, criado_em, responsavel_id)
      WHERE deletado_em IS NULL;
    `);

    // ============================================================================
    // 5. CONSTRAINTS E VALIDAÇÕES
    // ============================================================================

    // Constraint para garantir email único em leads ativos
    await queryRunner.query(`
      CREATE UNIQUE INDEX idx_leads_email_unique
      ON leads(LOWER(email))
      WHERE deletado_em IS NULL;
    `);

    // Constraint para garantir email único em clientes ativos
    await queryRunner.query(`
      CREATE UNIQUE INDEX idx_clientes_email_unique
      ON clientes(LOWER(email))
      WHERE deletado_em IS NULL;
    `);

    // Constraint para garantir CNPJ único em empresas ativas
    await queryRunner.query(`
      CREATE UNIQUE INDEX idx_empresas_cnpj_unique
      ON empresas(cnpj)
      WHERE deletado_em IS NULL;
    `);

    // ============================================================================
    // 6. FUNÇÃO PARA REFRESH DE MATERIALIZED VIEWS
    // ============================================================================

    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION refresh_all_materialized_views()
      RETURNS void AS $$
      BEGIN
        REFRESH MATERIALIZED VIEW CONCURRENTLY mv_dashboard_stats;
        REFRESH MATERIALIZED VIEW CONCURRENTLY mv_conversion_stats;
        REFRESH MATERIALIZED VIEW CONCURRENTLY mv_user_performance;
        REFRESH MATERIALIZED VIEW CONCURRENTLY mv_segment_distribution;
      END;
      $$ LANGUAGE plpgsql;
    `);

    // ============================================================================
    // 7. ESTATÍSTICAS E ANÁLISES AUTOMÁTICAS
    // ============================================================================

    // Atualiza estatísticas nas tabelas principais
    await queryRunner.query(`ANALYZE leads;`);
    await queryRunner.query(`ANALYZE clientes;`);
    await queryRunner.query(`ANALYZE empresas;`);
    await queryRunner.query(`ANALYZE usuarios;`);

    // ============================================================================
    // 8. POPULA SEARCH VECTORS PARA DADOS EXISTENTES
    // ============================================================================

    await queryRunner.query(`
      UPDATE leads SET search_vector =
        setweight(to_tsvector('portuguese', COALESCE(nome, '')), 'A') ||
        setweight(to_tsvector('portuguese', COALESCE(email, '')), 'B') ||
        setweight(to_tsvector('portuguese', COALESCE(telefone, '')), 'C') ||
        setweight(to_tsvector('portuguese', COALESCE(empresa, '')), 'B') ||
        setweight(to_tsvector('portuguese', COALESCE(origem, '')), 'D')
      WHERE search_vector IS NULL;
    `);

    await queryRunner.query(`
      UPDATE clientes SET search_vector =
        setweight(to_tsvector('portuguese', COALESCE(nome, '')), 'A') ||
        setweight(to_tsvector('portuguese', COALESCE(email, '')), 'B') ||
        setweight(to_tsvector('portuguese', COALESCE(telefone, '')), 'C')
      WHERE search_vector IS NULL;
    `);

    await queryRunner.query(`
      UPDATE empresas SET search_vector =
        setweight(to_tsvector('portuguese', COALESCE(nome, '')), 'A') ||
        setweight(to_tsvector('portuguese', COALESCE(cnpj, '')), 'B') ||
        setweight(to_tsvector('portuguese', COALESCE(segmento, '')), 'C') ||
        setweight(to_tsvector('portuguese', COALESCE(cidade, '')), 'D')
      WHERE search_vector IS NULL;
    `);

    // ============================================================================
    // 9. REFRESH INICIAL DAS MATERIALIZED VIEWS
    // ============================================================================

    await queryRunner.query(`REFRESH MATERIALIZED VIEW mv_dashboard_stats;`);
    await queryRunner.query(`REFRESH MATERIALIZED VIEW mv_conversion_stats;`);
    await queryRunner.query(`REFRESH MATERIALIZED VIEW mv_user_performance;`);
    await queryRunner.query(`REFRESH MATERIALIZED VIEW mv_segment_distribution;`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop materialized views
    await queryRunner.query(`DROP MATERIALIZED VIEW IF EXISTS mv_segment_distribution;`);
    await queryRunner.query(`DROP MATERIALIZED VIEW IF EXISTS mv_user_performance;`);
    await queryRunner.query(`DROP MATERIALIZED VIEW IF EXISTS mv_conversion_stats;`);

    // Drop functions
    await queryRunner.query(`DROP FUNCTION IF EXISTS refresh_all_materialized_views();`);
    await queryRunner.query(`DROP FUNCTION IF EXISTS audit_trigger_function() CASCADE;`);
    await queryRunner.query(`DROP FUNCTION IF EXISTS update_empresas_search_vector() CASCADE;`);
    await queryRunner.query(`DROP FUNCTION IF EXISTS update_clientes_search_vector() CASCADE;`);
    await queryRunner.query(`DROP FUNCTION IF EXISTS update_leads_search_vector() CASCADE;`);

    // Drop indexes
    await queryRunner.query(`DROP INDEX IF EXISTS idx_empresas_cnpj_unique;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_clientes_email_unique;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_leads_email_unique;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_leads_dashboard;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_empresas_ativas;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_clientes_ativos;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_leads_ativos;`);
  }
}
