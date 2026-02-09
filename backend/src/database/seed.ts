import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import * as bcrypt from 'bcryptjs';

config();

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 5433,
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || 'crm_db',
  synchronize: false,
  logging: false,
});

async function seed() {
  console.log('🌱 Iniciando seed do banco de dados...\n');

  await AppDataSource.initialize();
  console.log('✅ Conectado ao banco de dados\n');

  const qr = AppDataSource.createQueryRunner();

  try {
    // Hash da senha padrão
    const senhaHash = await bcrypt.hash('Admin@123', 10);
    console.log('🔐 Hash gerado para senha padrão\n');

    // Limpar dados existentes
    console.log('🗑️  Limpando dados existentes...');
    await qr.query('DELETE FROM auditoria');
    await qr.query('DELETE FROM clientes');
    await qr.query('DELETE FROM leads');
    await qr.query('DELETE FROM empresas');
    await qr.query('DELETE FROM usuarios');
    console.log('✅ Dados limpos\n');

    // =====================================================
    // 1. USUÁRIOS
    // =====================================================
    console.log('👥 Inserindo usuários...');
    const usuarios = [
      { id: 'a0000001-0000-0000-0000-000000000001', nome: 'Wesley Administrador', email: 'admin@crm.com', cargo: 'admin', telefone: '(11) 99999-0001', dias: 90 },
      { id: 'a0000001-0000-0000-0000-000000000002', nome: 'Ana Costa', email: 'ana.costa@crm.com', cargo: 'gerente', telefone: '(11) 99999-0002', dias: 85 },
      { id: 'a0000001-0000-0000-0000-000000000003', nome: 'Carlos Mendes', email: 'carlos.mendes@crm.com', cargo: 'vendedor', telefone: '(11) 99999-0003', dias: 80 },
      { id: 'a0000001-0000-0000-0000-000000000004', nome: 'Pedro Lima', email: 'pedro.lima@crm.com', cargo: 'vendedor', telefone: '(21) 99999-0004', dias: 75 },
      { id: 'a0000001-0000-0000-0000-000000000005', nome: 'Julia Santos', email: 'julia.santos@crm.com', cargo: 'vendedor', telefone: '(11) 99999-0005', dias: 70 },
      { id: 'a0000001-0000-0000-0000-000000000006', nome: 'Rafael Oliveira', email: 'rafael.oliveira@crm.com', cargo: 'vendedor', telefone: '(31) 99999-0006', dias: 65 },
    ];

    for (const u of usuarios) {
      await qr.query(
        `INSERT INTO usuarios (id, nome, email, senha, cargo, ativo, telefone, criado_em, atualizado_em)
         VALUES ($1, $2, $3, $4, $5, true, $6, NOW() - INTERVAL '${u.dias} days', NOW())`,
        [u.id, u.nome, u.email, senhaHash, u.cargo, u.telefone]
      );
    }
    console.log(`✅ ${usuarios.length} usuários inseridos\n`);

    // =====================================================
    // 2. EMPRESAS
    // =====================================================
    console.log('🏢 Inserindo empresas...');
    const empresas = [
      { id: 'b0000001-0000-0000-0000-000000000001', razao: 'TechCorp Solutions Ltda', fantasia: 'TechCorp', cnpj: '12.345.678/0001-01', segmento: 'Tecnologia', cidade: 'São Paulo', estado: 'SP', funcionarios: 250, faturamento: 15000000, dias: 88 },
      { id: 'b0000001-0000-0000-0000-000000000002', razao: 'InnovaTech Sistemas S.A.', fantasia: 'InnovaTech', cnpj: '23.456.789/0001-02', segmento: 'Tecnologia', cidade: 'Rio de Janeiro', estado: 'RJ', funcionarios: 180, faturamento: 12000000, dias: 82 },
      { id: 'b0000001-0000-0000-0000-000000000003', razao: 'Digital Minds Consultoria', fantasia: 'Digital Minds', cnpj: '34.567.890/0001-03', segmento: 'Consultoria', cidade: 'São Paulo', estado: 'SP', funcionarios: 75, faturamento: 8500000, dias: 78 },
      { id: 'b0000001-0000-0000-0000-000000000004', razao: 'StartupX Ventures', fantasia: 'StartupX', cnpj: '45.678.901/0001-04', segmento: 'Startup', cidade: 'São Paulo', estado: 'SP', funcionarios: 30, faturamento: 3200000, dias: 70 },
      { id: 'b0000001-0000-0000-0000-000000000005', razao: 'GlobalTech Incorporações', fantasia: 'GlobalTech', cnpj: '56.789.012/0001-05', segmento: 'Tecnologia', cidade: 'São Paulo', estado: 'SP', funcionarios: 500, faturamento: 45000000, dias: 85 },
      { id: 'b0000001-0000-0000-0000-000000000006', razao: 'MedSaúde Hospital Digital', fantasia: 'MedSaúde', cnpj: '67.890.123/0001-06', segmento: 'Saúde', cidade: 'São Paulo', estado: 'SP', funcionarios: 1200, faturamento: 85000000, dias: 80 },
      { id: 'b0000001-0000-0000-0000-000000000007', razao: 'EduTech Plataforma', fantasia: 'EduTech', cnpj: '78.901.234/0001-07', segmento: 'Educação', cidade: 'Belo Horizonte', estado: 'MG', funcionarios: 95, faturamento: 6700000, dias: 60 },
      { id: 'b0000001-0000-0000-0000-000000000008', razao: 'FinanceBank Digital', fantasia: 'FinanceBank', cnpj: '89.012.345/0001-08', segmento: 'Fintech', cidade: 'São Paulo', estado: 'SP', funcionarios: 350, faturamento: 28000000, dias: 75 },
      { id: 'b0000001-0000-0000-0000-000000000009', razao: 'LogiTrans Transportes', fantasia: 'LogiTrans', cnpj: '90.123.456/0001-09', segmento: 'Logística', cidade: 'Curitiba', estado: 'PR', funcionarios: 420, faturamento: 22000000, dias: 55 },
      { id: 'b0000001-0000-0000-0000-000000000010', razao: 'AgroSmart Soluções', fantasia: 'AgroSmart', cnpj: '01.234.567/0001-10', segmento: 'Agronegócio', cidade: 'Goiânia', estado: 'GO', funcionarios: 150, faturamento: 18000000, dias: 50 },
      { id: 'b0000001-0000-0000-0000-000000000011', razao: 'RetailMax Comércio', fantasia: 'RetailMax', cnpj: '11.222.333/0001-11', segmento: 'Varejo', cidade: 'São Paulo', estado: 'SP', funcionarios: 800, faturamento: 55000000, dias: 45 },
      { id: 'b0000001-0000-0000-0000-000000000012', razao: 'CloudBase Infra', fantasia: 'CloudBase', cnpj: '22.333.444/0001-12', segmento: 'Tecnologia', cidade: 'São Paulo', estado: 'SP', funcionarios: 60, faturamento: 9500000, dias: 40 },
      { id: 'b0000001-0000-0000-0000-000000000013', razao: 'GreenEnergy Solar', fantasia: 'GreenEnergy', cnpj: '33.444.555/0001-13', segmento: 'Energia', cidade: 'Florianópolis', estado: 'SC', funcionarios: 110, faturamento: 14000000, dias: 35 },
      { id: 'b0000001-0000-0000-0000-000000000014', razao: 'Construtora Horizonte', fantasia: 'Horizonte', cnpj: '44.555.666/0001-14', segmento: 'Construção', cidade: 'Rio de Janeiro', estado: 'RJ', funcionarios: 650, faturamento: 42000000, dias: 30 },
      { id: 'b0000001-0000-0000-0000-000000000015', razao: 'FoodTech Delivery', fantasia: 'FoodTech', cnpj: '55.666.777/0001-15', segmento: 'Food Tech', cidade: 'São Paulo', estado: 'SP', funcionarios: 200, faturamento: 11000000, dias: 25 },
    ];

    for (const e of empresas) {
      await qr.query(
        `INSERT INTO empresas (id, razao_social, nome_fantasia, cnpj, segmento, cidade, estado, funcionarios, faturamento_anual, ativo, criado_em, atualizado_em)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, true, NOW() - INTERVAL '${e.dias} days', NOW())`,
        [e.id, e.razao, e.fantasia, e.cnpj, e.segmento, e.cidade, e.estado, e.funcionarios, e.faturamento]
      );
    }
    console.log(`✅ ${empresas.length} empresas inseridas\n`);

    // =====================================================
    // 3. LEADS (50 leads distribuídos)
    // =====================================================
    console.log('📋 Inserindo leads...');
    const responsaveis = [
      'a0000001-0000-0000-0000-000000000002', // Ana Costa
      'a0000001-0000-0000-0000-000000000003', // Carlos Mendes
      'a0000001-0000-0000-0000-000000000004', // Pedro Lima
      'a0000001-0000-0000-0000-000000000005', // Julia Santos
      'a0000001-0000-0000-0000-000000000006', // Rafael Oliveira
    ];

    const empresaIds = empresas.map(e => e.id);
    const statusOptions: Array<'novo' | 'em_contato' | 'qualificado' | 'perdido'> = ['novo', 'em_contato', 'qualificado', 'perdido'];
    const origemOptions = ['Indicação', 'Website', 'LinkedIn', 'Google Ads', 'Evento', 'Cold Call', 'Email Marketing', 'Parceiro'];
    const cargoOptions = ['CTO', 'CEO', 'Diretor de TI', 'Gerente de Projetos', 'Head de Growth', 'VP de Vendas', 'Gerente Comercial', 'Product Manager', 'Head de Inovação', 'Diretor Operacional', 'Coordenador de TI', 'Analista de Sistemas', 'Gerente de Marketing', 'Head de Engenharia', 'Diretor Financeiro'];

    interface LeadData {
      nome: string;
      email: string;
      telefone: string;
      cargo: string;
      status: string;
      origem: string;
      pontuacao: number;
      observacoes: string;
      empresaIdx: number;
      responsavelIdx: number;
      diasCriado: number;
      horasContato: number | null;
    }

    const leadsData: LeadData[] = [
      // Leads antigos (2-3 meses) - para cálculo de growth
      { nome: 'Ricardo Ferreira', email: 'ricardo@techcorp.com.br', telefone: '(11) 98001-0001', cargo: 'CTO', status: 'qualificado', origem: 'Indicação', pontuacao: 92, observacoes: 'Interessado em integração completa', empresaIdx: 0, responsavelIdx: 0, diasCriado: 75, horasContato: 2 },
      { nome: 'Marina Santos', email: 'marina@innovatech.com.br', telefone: '(21) 98001-0002', cargo: 'Gerente de Projetos', status: 'em_contato', origem: 'Website', pontuacao: 85, observacoes: 'Quer agendar demo', empresaIdx: 1, responsavelIdx: 2, diasCriado: 70, horasContato: 5 },
      { nome: 'Roberto Alves', email: 'roberto@digitalminds.io', telefone: '(11) 98001-0003', cargo: 'CEO', status: 'qualificado', origem: 'LinkedIn', pontuacao: 95, observacoes: 'Contrato grande, prioridade alta', empresaIdx: 2, responsavelIdx: 0, diasCriado: 65, horasContato: 24 },
      { nome: 'Julia Mendes', email: 'julia@startupx.com.br', telefone: '(11) 98001-0004', cargo: 'Head de Growth', status: 'em_contato', origem: 'Evento', pontuacao: 68, observacoes: 'Conhecemos no Web Summit', empresaIdx: 3, responsavelIdx: 2, diasCriado: 60, horasContato: 72 },
      { nome: 'Fernando Torres', email: 'fernando@globaltech.com.br', telefone: '(11) 98001-0005', cargo: 'VP de Vendas', status: 'qualificado', origem: 'Indicação', pontuacao: 98, observacoes: 'Negociação avançada, deal grande', empresaIdx: 4, responsavelIdx: 1, diasCriado: 80, horasContato: 4 },
      { nome: 'Camila Rodrigues', email: 'camila@medsaude.com.br', telefone: '(11) 98001-0006', cargo: 'Diretora de TI', status: 'perdido', origem: 'Google Ads', pontuacao: 45, observacoes: 'Optou pelo concorrente', empresaIdx: 5, responsavelIdx: 3, diasCriado: 72, horasContato: 360 },
      { nome: 'Lucas Barbosa', email: 'lucas@edutech.com.br', telefone: '(31) 98001-0007', cargo: 'Product Manager', status: 'em_contato', origem: 'Cold Call', pontuacao: 72, observacoes: 'Gostou da proposta inicial', empresaIdx: 6, responsavelIdx: 4, diasCriado: 55, horasContato: 48 },
      { nome: 'Gabriela Lima', email: 'gabriela@financebank.com.br', telefone: '(11) 98001-0008', cargo: 'Head de Inovação', status: 'qualificado', origem: 'LinkedIn', pontuacao: 90, observacoes: 'Pediu proposta formal', empresaIdx: 7, responsavelIdx: 0, diasCriado: 68, horasContato: 6 },
      { nome: 'André Souza', email: 'andre@logitrans.com.br', telefone: '(41) 98001-0009', cargo: 'Diretor Comercial', status: 'perdido', origem: 'Parceiro', pontuacao: 38, observacoes: 'Budget cortado', empresaIdx: 8, responsavelIdx: 1, diasCriado: 50, horasContato: 480 },
      { nome: 'Beatriz Moura', email: 'beatriz@agrosmart.com.br', telefone: '(62) 98001-0010', cargo: 'CEO', status: 'novo', origem: 'Email Marketing', pontuacao: 55, observacoes: 'Abriu email e clicou no link', empresaIdx: 9, responsavelIdx: 2, diasCriado: 48, horasContato: null },

      // Leads do mês passado
      { nome: 'Paulo Henrique', email: 'paulo@retailmax.com.br', telefone: '(11) 98002-0011', cargo: 'Gerente de E-commerce', status: 'qualificado', origem: 'Google Ads', pontuacao: 88, observacoes: 'Quer solução integrada com marketplace', empresaIdx: 10, responsavelIdx: 0, diasCriado: 35, horasContato: 3 },
      { nome: 'Tatiana Cruz', email: 'tatiana@cloudbase.com.br', telefone: '(11) 98002-0012', cargo: 'CTO', status: 'em_contato', origem: 'Website', pontuacao: 78, observacoes: 'Comparando com outras soluções', empresaIdx: 11, responsavelIdx: 1, diasCriado: 32, horasContato: 24 },
      { nome: 'Diego Martins', email: 'diego@greenenergy.com.br', telefone: '(48) 98002-0013', cargo: 'Diretor Operacional', status: 'novo', origem: 'Evento', pontuacao: 62, observacoes: 'Cartão coletado no EnergySummit', empresaIdx: 12, responsavelIdx: 3, diasCriado: 28, horasContato: null },
      { nome: 'Mariana Oliveira', email: 'mariana@horizonte.com.br', telefone: '(21) 98002-0014', cargo: 'Gerente de TI', status: 'em_contato', origem: 'LinkedIn', pontuacao: 75, observacoes: 'Interessada em módulo de gestão', empresaIdx: 13, responsavelIdx: 4, diasCriado: 25, horasContato: 8 },
      { nome: 'Thiago Nascimento', email: 'thiago@foodtech.com.br', telefone: '(11) 98002-0015', cargo: 'Head de Tecnologia', status: 'qualificado', origem: 'Indicação', pontuacao: 93, observacoes: 'Indicação do Ricardo da TechCorp', empresaIdx: 14, responsavelIdx: 0, diasCriado: 22, horasContato: 24 },
      { nome: 'Amanda Vieira', email: 'amanda@techcorp.com.br', telefone: '(11) 98002-0016', cargo: 'Gerente Comercial', status: 'perdido', origem: 'Cold Call', pontuacao: 42, observacoes: 'Sem resposta nas últimas tentativas', empresaIdx: 0, responsavelIdx: 2, diasCriado: 38, horasContato: 432 },

      // Leads deste mês (recentes - mostram crescimento)
      { nome: 'Bruno Gomes', email: 'bruno@techcorp.com.br', telefone: '(11) 98003-0017', cargo: 'Analista de Sistemas', status: 'novo', origem: 'Website', pontuacao: 58, observacoes: 'Preencheu formulário de contato', empresaIdx: 0, responsavelIdx: 1, diasCriado: 8, horasContato: null },
      { nome: 'Carla Pereira', email: 'carla@innovatech.com.br', telefone: '(21) 98003-0018', cargo: 'Coordenadora de Projetos', status: 'em_contato', origem: 'LinkedIn', pontuacao: 80, observacoes: 'Agendou call para sexta', empresaIdx: 1, responsavelIdx: 0, diasCriado: 7, horasContato: 24 },
      { nome: 'Daniel Costa', email: 'daniel@digitalminds.io', telefone: '(11) 98003-0019', cargo: 'Diretor Financeiro', status: 'qualificado', origem: 'Indicação', pontuacao: 91, observacoes: 'Pediu proposta detalhada com pricing', empresaIdx: 2, responsavelIdx: 0, diasCriado: 6, horasContato: 3 },
      { nome: 'Elisa Ribeiro', email: 'elisa@globaltech.com.br', telefone: '(11) 98003-0020', cargo: 'Head de Compras', status: 'em_contato', origem: 'Google Ads', pontuacao: 74, observacoes: 'Baixou whitepaper', empresaIdx: 4, responsavelIdx: 3, diasCriado: 5, horasContato: 48 },
      { nome: 'Felipe Cardoso', email: 'felipe@medsaude.com.br', telefone: '(11) 98003-0021', cargo: 'Gerente de Inovação', status: 'novo', origem: 'Evento', pontuacao: 60, observacoes: 'Conhecemos na Hospitalar 2026', empresaIdx: 5, responsavelIdx: 4, diasCriado: 4, horasContato: null },
      { nome: 'Guilherme Santos', email: 'guilherme@financebank.com.br', telefone: '(11) 98003-0022', cargo: 'VP de Engenharia', status: 'qualificado', origem: 'LinkedIn', pontuacao: 96, observacoes: 'Muito interessado, quer fechar rápido', empresaIdx: 7, responsavelIdx: 0, diasCriado: 3, horasContato: 1 },
      { nome: 'Helena Duarte', email: 'helena@edutech.com.br', telefone: '(31) 98003-0023', cargo: 'Diretora Acadêmica', status: 'em_contato', origem: 'Email Marketing', pontuacao: 70, observacoes: 'Reagendou para próxima semana', empresaIdx: 6, responsavelIdx: 2, diasCriado: 3, horasContato: 6 },
      { nome: 'Igor Fonseca', email: 'igor@retailmax.com.br', telefone: '(11) 98003-0024', cargo: 'Diretor de Marketing', status: 'novo', origem: 'Google Ads', pontuacao: 65, observacoes: 'Clicou no anúncio e cadastrou', empresaIdx: 10, responsavelIdx: 1, diasCriado: 2, horasContato: null },
      { nome: 'Juliana Almeida', email: 'juliana@logitrans.com.br', telefone: '(41) 98003-0025', cargo: 'Gerente de Logística', status: 'em_contato', origem: 'Parceiro', pontuacao: 77, observacoes: 'Parceiro indicou, muito potencial', empresaIdx: 8, responsavelIdx: 4, diasCriado: 2, horasContato: 4 },
      { nome: 'Karen Nascimento', email: 'karen@agrosmart.com.br', telefone: '(62) 98003-0026', cargo: 'CFO', status: 'novo', origem: 'Website', pontuacao: 52, observacoes: 'Pediu contato pelo site', empresaIdx: 9, responsavelIdx: 3, diasCriado: 1, horasContato: null },
      { nome: 'Leonardo Ramos', email: 'leonardo@cloudbase.com.br', telefone: '(11) 98003-0027', cargo: 'DevOps Lead', status: 'novo', origem: 'LinkedIn', pontuacao: 63, observacoes: 'Conectou após webinar', empresaIdx: 11, responsavelIdx: 1, diasCriado: 0, horasContato: null },
      { nome: 'Monica Teixeira', email: 'monica@greenenergy.com.br', telefone: '(48) 98003-0028', cargo: 'Gerente de Sustentabilidade', status: 'novo', origem: 'Evento', pontuacao: 57, observacoes: 'Encontrada no Green Summit', empresaIdx: 12, responsavelIdx: 2, diasCriado: 0, horasContato: null },
      { nome: 'Nathan Araujo', email: 'nathan@horizonte.com.br', telefone: '(21) 98003-0029', cargo: 'Engenheiro Chefe', status: 'em_contato', origem: 'Cold Call', pontuacao: 71, observacoes: 'Respondeu positivamente à ligação', empresaIdx: 13, responsavelIdx: 4, diasCriado: 1, horasContato: 2 },
      { nome: 'Olivia Campos', email: 'olivia@foodtech.com.br', telefone: '(11) 98003-0030', cargo: 'COO', status: 'em_contato', origem: 'Indicação', pontuacao: 83, observacoes: 'Indicada pelo Thiago', empresaIdx: 14, responsavelIdx: 0, diasCriado: 1, horasContato: 3 },

      // Mais leads para volume
      { nome: 'Patricia Moreira', email: 'patricia@techcorp.com.br', telefone: '(11) 98004-0031', cargo: 'Analista de Negócios', status: 'qualificado', origem: 'Website', pontuacao: 87, observacoes: 'Pediu demo técnica', empresaIdx: 0, responsavelIdx: 1, diasCriado: 18, horasContato: 120 },
      { nome: 'Renato Silva', email: 'renato@innovatech.com.br', telefone: '(21) 98004-0032', cargo: 'Gerente de TI', status: 'perdido', origem: 'Google Ads', pontuacao: 40, observacoes: 'Não tinha fit com produto', empresaIdx: 1, responsavelIdx: 3, diasCriado: 20, horasContato: 288 },
      { nome: 'Sandra Lopes', email: 'sandra@globaltech.com.br', telefone: '(11) 98004-0033', cargo: 'Head de RH', status: 'em_contato', origem: 'Email Marketing', pontuacao: 73, observacoes: 'Abriu 5 emails seguidos', empresaIdx: 4, responsavelIdx: 4, diasCriado: 15, horasContato: 72 },
      { nome: 'Tiago Freitas', email: 'tiago@medsaude.com.br', telefone: '(11) 98004-0034', cargo: 'Coordenador de Sistemas', status: 'novo', origem: 'Cold Call', pontuacao: 50, observacoes: 'Precisa validar internamente', empresaIdx: 5, responsavelIdx: 2, diasCriado: 10, horasContato: null },
      { nome: 'Vanessa Costa', email: 'vanessa@financebank.com.br', telefone: '(11) 98004-0035', cargo: 'Product Owner', status: 'qualificado', origem: 'LinkedIn', pontuacao: 89, observacoes: 'Board aprovou budget', empresaIdx: 7, responsavelIdx: 0, diasCriado: 14, horasContato: 48 },
      { nome: 'Wagner Pereira', email: 'wagner@retailmax.com.br', telefone: '(11) 98004-0036', cargo: 'Gerente de Operações', status: 'em_contato', origem: 'Parceiro', pontuacao: 76, observacoes: 'Parceiro comercial referenciou', empresaIdx: 10, responsavelIdx: 1, diasCriado: 12, horasContato: 96 },
      { nome: 'Ximena Garcia', email: 'ximena@cloudbase.com.br', telefone: '(11) 98004-0037', cargo: 'DevOps Manager', status: 'perdido', origem: 'Website', pontuacao: 35, observacoes: 'Decidiu desenvolver internamente', empresaIdx: 11, responsavelIdx: 3, diasCriado: 16, horasContato: 192 },
      { nome: 'Yuri Monteiro', email: 'yuri@greenenergy.com.br', telefone: '(48) 98004-0038', cargo: 'Diretor Técnico', status: 'qualificado', origem: 'Evento', pontuacao: 94, observacoes: 'Quer implementar no Q1', empresaIdx: 12, responsavelIdx: 4, diasCriado: 11, horasContato: 24 },
      { nome: 'Zilda Fernandes', email: 'zilda@horizonte.com.br', telefone: '(21) 98004-0039', cargo: 'Gerente de Projetos', status: 'em_contato', origem: 'Google Ads', pontuacao: 69, observacoes: 'Segundo contato agendado', empresaIdx: 13, responsavelIdx: 2, diasCriado: 9, horasContato: 144 },
      { nome: 'Alexandre Dias', email: 'alexandre@foodtech.com.br', telefone: '(11) 98004-0040', cargo: 'CTO', status: 'novo', origem: 'Indicação', pontuacao: 60, observacoes: 'Amigo da Olivia indicou', empresaIdx: 14, responsavelIdx: 0, diasCriado: 7, horasContato: null },
      { nome: 'Bianca Rocha', email: 'bianca@logitrans.com.br', telefone: '(41) 98005-0041', cargo: 'Analista Comercial', status: 'qualificado', origem: 'Email Marketing', pontuacao: 86, observacoes: 'Proposta em análise', empresaIdx: 8, responsavelIdx: 1, diasCriado: 19, horasContato: 72 },
      { nome: 'Cesar Abreu', email: 'cesar@agrosmart.com.br', telefone: '(62) 98005-0042', cargo: 'Gerente Agrícola', status: 'novo', origem: 'Cold Call', pontuacao: 48, observacoes: 'Primeira conversa promissora', empresaIdx: 9, responsavelIdx: 3, diasCriado: 6, horasContato: null },
      { nome: 'Debora Matos', email: 'debora@techcorp.com.br', telefone: '(11) 98005-0043', cargo: 'Gerente de Produto', status: 'em_contato', origem: 'Website', pontuacao: 79, observacoes: 'Quer conhecer integrações', empresaIdx: 0, responsavelIdx: 2, diasCriado: 4, horasContato: 8 },
      { nome: 'Eduardo Neves', email: 'eduardo@globaltech.com.br', telefone: '(11) 98005-0044', cargo: 'Gerente de Sistemas', status: 'qualificado', origem: 'LinkedIn', pontuacao: 91, observacoes: 'Board aprovou budget', empresaIdx: 4, responsavelIdx: 4, diasCriado: 5, horasContato: 5 },
      { nome: 'Fabiana Leal', email: 'fabiana@edutech.com.br', telefone: '(31) 98005-0045', cargo: 'Coord. Pedagógica', status: 'perdido', origem: 'Email Marketing', pontuacao: 33, observacoes: 'Sem budget este ano', empresaIdx: 6, responsavelIdx: 3, diasCriado: 21, horasContato: 336 },
      { nome: 'Gustavo Pinto', email: 'gustavo@financebank.com.br', telefone: '(11) 98005-0046', cargo: 'Scrum Master', status: 'em_contato', origem: 'Parceiro', pontuacao: 74, observacoes: 'Indicação via parceiro tech', empresaIdx: 7, responsavelIdx: 1, diasCriado: 8, horasContato: 48 },
      { nome: 'Heloisa Cunha', email: 'heloisa@retailmax.com.br', telefone: '(11) 98005-0047', cargo: 'Head de Marketing', status: 'qualificado', origem: 'Google Ads', pontuacao: 88, observacoes: 'Demo realizada com sucesso', empresaIdx: 10, responsavelIdx: 0, diasCriado: 9, horasContato: 24 },
      { nome: 'Ivan Santos', email: 'ivan@cloudbase.com.br', telefone: '(11) 98005-0048', cargo: 'Tech Lead', status: 'novo', origem: 'Website', pontuacao: 56, observacoes: 'Baixou trial', empresaIdx: 11, responsavelIdx: 2, diasCriado: 3, horasContato: null },
      { nome: 'Joana Ribeiro', email: 'joana@greenenergy.com.br', telefone: '(48) 98005-0049', cargo: 'Engenheira Ambiental', status: 'em_contato', origem: 'Evento', pontuacao: 71, observacoes: 'Segundo contato após evento', empresaIdx: 12, responsavelIdx: 4, diasCriado: 5, horasContato: 4 },
      { nome: 'Kevin Luz', email: 'kevin@horizonte.com.br', telefone: '(21) 98005-0050', cargo: 'Gerente de Obras', status: 'novo', origem: 'Cold Call', pontuacao: 44, observacoes: 'Pediu para ligar na próxima semana', empresaIdx: 13, responsavelIdx: 1, diasCriado: 1, horasContato: null },
    ];

    let leadCount = 0;
    for (const l of leadsData) {
      const empresaId = empresaIds[l.empresaIdx];
      const responsavelId = responsaveis[l.responsavelIdx];
      const contatoSql = l.horasContato !== null ? `NOW() - INTERVAL '${l.horasContato} hours'` : 'NULL';

      await qr.query(
        `INSERT INTO leads (nome, email, telefone, cargo, status, origem, pontuacao, observacoes, empresa_id, responsavel_id, data_ultimo_contato, criado_em, atualizado_em)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, ${contatoSql}, NOW() - INTERVAL '${l.diasCriado} days', NOW())`,
        [l.nome, l.email, l.telefone, l.cargo, l.status, l.origem, l.pontuacao, l.observacoes, empresaId, responsavelId]
      );
      leadCount++;
    }
    console.log(`✅ ${leadCount} leads inseridos\n`);

    // =====================================================
    // 4. CLIENTES (25 clientes)
    // =====================================================
    console.log('🤝 Inserindo clientes...');
    interface ClienteData {
      nome: string;
      email: string;
      telefone: string;
      celular: string;
      cargo: string;
      departamento: string;
      observacoes: string;
      empresaIdx: number;
      responsavelIdx: number;
      diasCriado: number;
    }

    const clientesData: ClienteData[] = [
      { nome: 'Ricardo Ferreira', email: 'ricardo@techcorp.com.br', telefone: '(11) 3000-0001', celular: '(11) 98001-0001', cargo: 'CTO', departamento: 'Tecnologia', observacoes: 'Cliente Enterprise - contrato anual', empresaIdx: 0, responsavelIdx: 0, diasCriado: 60 },
      { nome: 'Fernando Torres', email: 'fernando@globaltech.com.br', telefone: '(11) 3000-0005', celular: '(11) 98001-0005', cargo: 'VP de Vendas', departamento: 'Comercial', observacoes: 'Maior conta da carteira', empresaIdx: 4, responsavelIdx: 1, diasCriado: 55 },
      { nome: 'Gabriela Lima', email: 'gabriela@financebank.com.br', telefone: '(11) 3000-0008', celular: '(11) 98001-0008', cargo: 'Head de Inovação', departamento: 'Inovação', observacoes: 'Expandindo para mais módulos', empresaIdx: 7, responsavelIdx: 0, diasCriado: 50 },
      { nome: 'Roberto Alves', email: 'roberto@digitalminds.io', telefone: '(11) 3000-0003', celular: '(11) 98001-0003', cargo: 'CEO', departamento: 'Diretoria', observacoes: 'Contrato premium com suporte 24/7', empresaIdx: 2, responsavelIdx: 0, diasCriado: 45 },
      { nome: 'Amanda Silva', email: 'amanda.s@techcorp.com.br', telefone: '(11) 3000-0001', celular: '(11) 98006-0001', cargo: 'Gerente de Projetos', departamento: 'Projetos', observacoes: 'Segundo contato na TechCorp', empresaIdx: 0, responsavelIdx: 2, diasCriado: 58 },
      { nome: 'Paulo Henrique', email: 'paulo@retailmax.com.br', telefone: '(11) 3000-0011', celular: '(11) 98002-0011', cargo: 'Gerente de E-commerce', departamento: 'Digital', observacoes: 'Integração com marketplace', empresaIdx: 10, responsavelIdx: 0, diasCriado: 28 },
      { nome: 'Thiago Nascimento', email: 'thiago@foodtech.com.br', telefone: '(11) 3000-0015', celular: '(11) 98002-0015', cargo: 'Head de Tecnologia', departamento: 'Tecnologia', observacoes: 'Implantação fase 1 concluída', empresaIdx: 14, responsavelIdx: 0, diasCriado: 20 },
      { nome: 'Patricia Moreira', email: 'patricia@techcorp.com.br', telefone: '(11) 3000-0001', celular: '(11) 98004-0031', cargo: 'Analista de Negócios', departamento: 'Comercial', observacoes: 'Terceiro contato na TechCorp', empresaIdx: 0, responsavelIdx: 1, diasCriado: 15 },
      { nome: 'Bianca Rocha', email: 'bianca@logitrans.com.br', telefone: '(41) 3000-0009', celular: '(41) 98005-0041', cargo: 'Analista Comercial', departamento: 'Comercial', observacoes: 'Módulo de rastreamento ativo', empresaIdx: 8, responsavelIdx: 1, diasCriado: 14 },
      { nome: 'Vanessa Costa', email: 'vanessa@financebank.com.br', telefone: '(11) 3000-0008', celular: '(11) 98004-0035', cargo: 'Product Owner', departamento: 'Produto', observacoes: 'Segunda conta no FinanceBank', empresaIdx: 7, responsavelIdx: 0, diasCriado: 10 },
      { nome: 'Daniel Costa', email: 'daniel@digitalminds.io', telefone: '(11) 3000-0003', celular: '(11) 98003-0019', cargo: 'Diretor Financeiro', departamento: 'Financeiro', observacoes: 'Contrato de consultoria fechado', empresaIdx: 2, responsavelIdx: 0, diasCriado: 5 },
      { nome: 'Guilherme Santos', email: 'guilherme@financebank.com.br', telefone: '(11) 3000-0008', celular: '(11) 98003-0022', cargo: 'VP de Engenharia', departamento: 'Engenharia', observacoes: 'Contrato enterprise assinado', empresaIdx: 7, responsavelIdx: 0, diasCriado: 2 },
      { nome: 'Yuri Monteiro', email: 'yuri@greenenergy.com.br', telefone: '(48) 3000-0013', celular: '(48) 98004-0038', cargo: 'Diretor Técnico', departamento: 'Técnico', observacoes: 'Implementação Q1 em andamento', empresaIdx: 12, responsavelIdx: 4, diasCriado: 3 },
      { nome: 'Heloisa Cunha', email: 'heloisa@retailmax.com.br', telefone: '(11) 3000-0011', celular: '(11) 98005-0047', cargo: 'Head de Marketing', departamento: 'Marketing', observacoes: 'Módulo de analytics contratado', empresaIdx: 10, responsavelIdx: 0, diasCriado: 4 },
      { nome: 'Eduardo Neves', email: 'eduardo@globaltech.com.br', telefone: '(11) 3000-0005', celular: '(11) 98005-0044', cargo: 'Gerente de Sistemas', departamento: 'Sistemas', observacoes: 'Segundo contato na GlobalTech', empresaIdx: 4, responsavelIdx: 4, diasCriado: 3 },
      { nome: 'Heloisa Ferreira', email: 'heloisa.f@techcorp.com.br', telefone: '(11) 3000-0001', celular: '(11) 98007-0001', cargo: 'Diretora de Operações', departamento: 'Operações', observacoes: 'Quarto contato TechCorp', empresaIdx: 0, responsavelIdx: 1, diasCriado: 52 },
      { nome: 'Marco Antonio', email: 'marco@innovatech.com.br', telefone: '(21) 3000-0002', celular: '(21) 98007-0002', cargo: 'Diretor de TI', departamento: 'TI', observacoes: 'Contrato de suporte avançado', empresaIdx: 1, responsavelIdx: 2, diasCriado: 48 },
      { nome: 'Lucia Mendes', email: 'lucia@globaltech.com.br', telefone: '(11) 3000-0005', celular: '(11) 98007-0003', cargo: 'Analista de BI', departamento: 'Business Intelligence', observacoes: 'Módulo de BI contratado', empresaIdx: 4, responsavelIdx: 3, diasCriado: 40 },
      { nome: 'Pedro Augusto', email: 'pedro.a@medsaude.com.br', telefone: '(11) 3000-0006', celular: '(11) 98007-0004', cargo: 'Gerente de Sistemas', departamento: 'Sistemas', observacoes: 'Projeto de telemedicina', empresaIdx: 5, responsavelIdx: 4, diasCriado: 35 },
      { nome: 'Clara Souza', email: 'clara@financebank.com.br', telefone: '(11) 3000-0008', celular: '(11) 98007-0005', cargo: 'Analista de Dados', departamento: 'Data', observacoes: 'Terceira conta FinanceBank', empresaIdx: 7, responsavelIdx: 0, diasCriado: 30 },
      { nome: 'Rodrigo Campos', email: 'rodrigo@retailmax.com.br', telefone: '(11) 3000-0011', celular: '(11) 98007-0006', cargo: 'Head de Supply Chain', departamento: 'Supply Chain', observacoes: 'Integração com ERP', empresaIdx: 10, responsavelIdx: 1, diasCriado: 22 },
      { nome: 'Fernanda Gomes', email: 'fernanda@edutech.com.br', telefone: '(31) 3000-0007', celular: '(31) 98007-0007', cargo: 'Coordenadora de EAD', departamento: 'Educação', observacoes: 'Plataforma LMS integrada', empresaIdx: 6, responsavelIdx: 4, diasCriado: 18 },
      { nome: 'Marcelo Dias', email: 'marcelo@horizonte.com.br', telefone: '(21) 3000-0014', celular: '(21) 98007-0008', cargo: 'Gerente de Engenharia', departamento: 'Engenharia', observacoes: 'Módulo de gestão de obras', empresaIdx: 13, responsavelIdx: 2, diasCriado: 12 },
      { nome: 'Isabela Tavares', email: 'isabela@agrosmart.com.br', telefone: '(62) 3000-0010', celular: '(62) 98007-0009', cargo: 'Gerente de Inovação', departamento: 'Inovação', observacoes: 'Monitoramento IoT contratado', empresaIdx: 9, responsavelIdx: 3, diasCriado: 25 },
      { nome: 'Rafael Costa', email: 'rafael.c@foodtech.com.br', telefone: '(11) 3000-0015', celular: '(11) 98007-0010', cargo: 'Gerente de Produto', departamento: 'Produto', observacoes: 'Segundo contato FoodTech', empresaIdx: 14, responsavelIdx: 0, diasCriado: 8 },
    ];

    let clienteCount = 0;
    for (const c of clientesData) {
      const empresaId = empresaIds[c.empresaIdx];
      const responsavelId = responsaveis[c.responsavelIdx];

      await qr.query(
        `INSERT INTO clientes (nome, email, telefone, celular, cargo, departamento, ativo, observacoes, empresa_id, responsavel_id, criado_em, atualizado_em)
         VALUES ($1, $2, $3, $4, $5, $6, true, $7, $8, $9, NOW() - INTERVAL '${c.diasCriado} days', NOW())`,
        [c.nome, c.email, c.telefone, c.celular, c.cargo, c.departamento, c.observacoes, empresaId, responsavelId]
      );
      clienteCount++;
    }
    console.log(`✅ ${clienteCount} clientes inseridos\n`);

    // =====================================================
    // 5. REFRESH MATERIALIZED VIEW
    // =====================================================
    console.log('🔄 Atualizando materialized view...');
    await qr.query('REFRESH MATERIALIZED VIEW mv_dashboard_stats');
    console.log('✅ View atualizada\n');

    // =====================================================
    // RESUMO
    // =====================================================
    const [leadsCount] = await qr.query('SELECT COUNT(*) as total FROM leads WHERE deletado_em IS NULL');
    const [clientesCount] = await qr.query('SELECT COUNT(*) as total FROM clientes WHERE deletado_em IS NULL');
    const [empresasCount] = await qr.query('SELECT COUNT(*) as total FROM empresas WHERE deletado_em IS NULL');
    const [usuariosCount] = await qr.query('SELECT COUNT(*) as total FROM usuarios WHERE deletado_em IS NULL');

    console.log('═══════════════════════════════════════');
    console.log('  🎉 SEED CONCLUÍDO COM SUCESSO!');
    console.log('═══════════════════════════════════════');
    console.log(`  👥 Usuários:  ${usuariosCount.total}`);
    console.log(`  🏢 Empresas:  ${empresasCount.total}`);
    console.log(`  📋 Leads:     ${leadsCount.total}`);
    console.log(`  🤝 Clientes:  ${clientesCount.total}`);
    console.log('═══════════════════════════════════════');
    console.log('  📧 Login: admin@crm.com');
    console.log('  🔑 Senha: Admin@123');
    console.log('═══════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Erro ao executar seed:', error);
    throw error;
  } finally {
    await qr.release();
    await AppDataSource.destroy();
  }
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
