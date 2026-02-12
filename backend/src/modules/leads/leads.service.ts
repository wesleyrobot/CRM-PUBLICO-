import {
  Injectable,
  NotFoundException,
  Inject,
  forwardRef,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lead } from './entities/lead.entity';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { LeadFilterDto } from './dto/lead-filter.dto';
import { PaginatedResult } from '../../common/dto/pagination.dto';
import { IntegrationsService } from '../integrations/integrations.service';
import { IntegrationEvent } from '../integrations/entities/integration.entity';
import { ImportResultDto } from './dto/import-leads.dto';
import * as XLSX from 'xlsx';

@Injectable()
export class LeadsService {
  constructor(
    @InjectRepository(Lead)
    private leadsRepository: Repository<Lead>,
    @Inject(forwardRef(() => IntegrationsService))
    private integrationsService: IntegrationsService,
  ) {}

  async create(createLeadDto: CreateLeadDto): Promise<Lead> {
    const lead = this.leadsRepository.create(createLeadDto);
    const savedLead = await this.leadsRepository.save(lead);

    // Disparar evento para integrações (fire and forget)
    this.integrationsService
      .triggerEvent(IntegrationEvent.LEAD_CREATED, savedLead)
      .catch((err) => console.error('Erro ao disparar integrações:', err));

    return savedLead;
  }

  async findAll(filterDto: LeadFilterDto): Promise<PaginatedResult<Lead>> {
    const { page = 1, limit = 10, search, sortBy = 'criadoEm', sortOrder = 'DESC', status } = filterDto;

    const queryBuilder = this.leadsRepository.createQueryBuilder('lead');

    if (search) {
      queryBuilder.where(
        'lead.nome ILIKE :search OR lead.email ILIKE :search OR lead.telefone ILIKE :search OR lead.razao_social ILIKE :search',
        { search: `%${search}%` },
      );
    }

    if (status) {
      queryBuilder.andWhere('lead.status = :status', { status });
    }

    queryBuilder
      .orderBy(`lead.${sortBy}`, sortOrder)
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<Lead> {
    const lead = await this.leadsRepository.findOne({
      where: { id },
    });

    if (!lead) {
      throw new NotFoundException('Lead não encontrado');
    }

    return lead;
  }

  async update(id: string, updateLeadDto: UpdateLeadDto): Promise<Lead> {
    const lead = await this.findOne(id);
    Object.assign(lead, updateLeadDto);
    return this.leadsRepository.save(lead);
  }

  async remove(id: string): Promise<void> {
    const lead = await this.findOne(id);
    await this.leadsRepository.remove(lead);
  }

  async importFromExcel(file: Express.Multer.File): Promise<ImportResultDto> {
    if (!file) {
      throw new BadRequestException('Nenhum arquivo enviado');
    }

    // Validar extensão
    const allowedExtensions = ['.xlsx', '.xls', '.csv'];
    const fileExtension = file.originalname.toLowerCase().slice(file.originalname.lastIndexOf('.'));

    if (!allowedExtensions.includes(fileExtension)) {
      throw new BadRequestException('Formato de arquivo inválido. Use .xlsx, .xls ou .csv');
    }

    try {
      // Ler arquivo Excel
      const workbook = XLSX.read(file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      // Converter para JSON
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      if (jsonData.length === 0) {
        throw new BadRequestException('Arquivo vazio ou sem dados válidos');
      }

      const resultado: ImportResultDto = {
        total: jsonData.length,
        sucesso: 0,
        erros: 0,
        detalhes: [],
      };

      // Processar cada linha
      for (let i = 0; i < jsonData.length; i++) {
        const row: any = jsonData[i];
        const linha = i + 2; // +2 porque Excel começa em 1 e tem header

        try {
          // DETECÇÃO INTELIGENTE DE COLUNAS com múltiplas variações
          const nomeRaw = this.detectColumn(row, [
            'nome', 'Nome', 'NOME', 'name', 'Name', 'NAME',
            'cliente', 'Cliente', 'CLIENTE', 'contact', 'Contact',
            'pessoa', 'Pessoa', 'contato', 'Contato'
          ]);

          const emailRaw = this.detectColumn(row, [
            'email', 'Email', 'EMAIL', 'E-mail', 'e-mail', 'E-MAIL',
            'mail', 'Mail', 'correo', 'Correo'
          ]);

          const telefoneRaw = this.detectColumn(row, [
            'telefone', 'Telefone', 'TELEFONE', 'phone', 'Phone', 'PHONE',
            'celular', 'Celular', 'CELULAR', 'cel', 'Cel', 'CEL',
            'whatsapp', 'WhatsApp', 'WHATSAPP', 'zap', 'Zap',
            'fone', 'Fone', 'FONE', 'tel', 'Tel', 'TEL',
            'mobile', 'Mobile', 'numero', 'Numero', 'número', 'Número'
          ]);

          const empresaRaw = this.detectColumn(row, [
            'empresa', 'Empresa', 'EMPRESA', 'company', 'Company', 'COMPANY',
            'organizacao', 'Organização', 'organization', 'Organization'
          ]);

          const razaoSocialRaw = this.detectColumn(row, [
            'razao social', 'Razao Social', 'RAZAO SOCIAL',
            'razão social', 'Razão Social', 'RAZÃO SOCIAL',
            'razao_social', 'razão_social', 'RAZAO_SOCIAL',
            'corporate name', 'Corporate Name', 'legal name', 'Legal Name',
            'empresa', 'Empresa', 'EMPRESA' // Fallback para empresa
          ]);

          const cargoRaw = this.detectColumn(row, [
            'cargo', 'Cargo', 'CARGO', 'position', 'Position', 'POSITION',
            'funcao', 'Função', 'FUNÇÃO', 'role', 'Role', 'ROLE',
            'titulo', 'Título', 'title', 'Title'
          ]);

          const origemRaw = this.detectColumn(row, [
            'origem', 'Origem', 'ORIGEM', 'source', 'Source', 'SOURCE',
            'canal', 'Canal', 'CANAL', 'channel', 'Channel',
            'midia', 'Mídia', 'media', 'Media'
          ]);

          const observacoesRaw = this.detectColumn(row, [
            'observacoes', 'Observações', 'OBSERVAÇÕES', 'observações',
            'obs', 'Obs', 'OBS', 'notes', 'Notes', 'NOTES',
            'comentarios', 'Comentários', 'comments', 'Comments',
            'descricao', 'Descrição', 'description', 'Description'
          ]);

          // NORMALIZAÇÃO E LIMPEZA DE DADOS
          const nome = nomeRaw ? this.capitalizeName(this.cleanText(nomeRaw)) : null;
          const email = emailRaw ? this.cleanText(emailRaw).toLowerCase() : null;
          const razaoSocial = razaoSocialRaw ? this.cleanText(razaoSocialRaw).toUpperCase() : null;
          const empresa = empresaRaw ? this.cleanText(empresaRaw) : null;
          const cargo = cargoRaw ? this.cleanText(cargoRaw) : null;
          const origem = origemRaw ? this.cleanText(origemRaw) : 'importacao_excel';
          const observacoes = observacoesRaw ? this.cleanText(observacoesRaw) : null;

          // NORMALIZAÇÃO DE TELEFONE PARA WHATSAPP
          let whatsapp = null;
          let ddd = null;
          let telefone = null;

          if (telefoneRaw) {
            const phoneNormalized = this.normalizePhoneToWhatsApp(telefoneRaw);
            if (phoneNormalized) {
              whatsapp = phoneNormalized.whatsapp;
              ddd = phoneNormalized.ddd;
              telefone = telefoneRaw; // Manter original também
            }
          }

          // Validar campo obrigatório
          if (!nome) {
            throw new Error('Campo "nome" é obrigatório e não foi encontrado');
          }

          // Validar email se fornecido
          if (email && !this.isValidEmail(email)) {
            throw new Error(`Email inválido: ${email}`);
          }

          // Criar lead com dados normalizados
          const leadData: any = {
            nome,
            email,
            telefone,
            whatsapp,
            ddd,
            razaoSocial,
            empresa,
            cargo,
            origem,
            observacoes,
            status: 'novo',
            pontuacao: 0,
          };

          const lead = this.leadsRepository.create(leadData);
          await this.leadsRepository.save(lead);

          // Disparar evento para integrações (fire and forget)
          this.integrationsService
            .triggerEvent(IntegrationEvent.LEAD_CREATED, lead)
            .catch((err) => console.error('Erro ao disparar integrações:', err));

          resultado.sucesso++;
          resultado.detalhes.push({
            linha,
            dados: {
              nome,
              email,
              telefone: whatsapp || telefone,
              ddd,
              razaoSocial,
              empresa,
            },
            status: 'sucesso',
          });
        } catch (error) {
          resultado.erros++;
          resultado.detalhes.push({
            linha,
            dados: row,
            erro: error.message,
            status: 'erro',
          });
        }
      }

      return resultado;
    } catch (error) {
      throw new BadRequestException(`Erro ao processar arquivo: ${error.message}`);
    }
  }

  /**
   * Detecta automaticamente o valor de uma coluna baseado em múltiplas variações de nomes
   */
  private detectColumn(row: any, variations: string[]): string | undefined {
    for (const variation of variations) {
      const value = row[variation];
      if (value !== undefined && value !== null && value.toString().trim() !== '') {
        return value.toString().trim();
      }
    }
    return undefined;
  }

  /**
   * Normaliza número de telefone para formato WhatsApp: +55 (DDD) 9XXXX-XXXX
   */
  private normalizePhoneToWhatsApp(phone: string): { whatsapp: string; ddd: string } | null {
    if (!phone) return null;

    // Remover todos os caracteres não numéricos
    let cleaned = phone.toString().replace(/\D/g, '');

    // Se começar com 0, remover (telefone fixo antigo)
    if (cleaned.startsWith('0')) {
      cleaned = cleaned.substring(1);
    }

    // Se começar com 55 (código do Brasil), remover para processar
    if (cleaned.startsWith('55')) {
      cleaned = cleaned.substring(2);
    }

    // Deve ter no mínimo 10 dígitos (DDD + número)
    if (cleaned.length < 10) {
      return null;
    }

    // Extrair DDD (primeiros 2 dígitos)
    const ddd = cleaned.substring(0, 2);

    // Pegar o resto do número
    let numero = cleaned.substring(2);

    // Se for celular e não tiver o 9 na frente, adicionar
    if (numero.length === 8 && !numero.startsWith('9')) {
      // Verificar se parece ser celular (começa com 6, 7, 8, 9)
      const firstDigit = parseInt(numero[0]);
      if (firstDigit >= 6) {
        numero = '9' + numero;
      }
    }

    // Formatar: +55 (DD) 9XXXX-XXXX ou +55 (DD) XXXX-XXXX
    let formatted: string;
    if (numero.length === 9) {
      // Celular: +55 (DD) 9XXXX-XXXX
      formatted = `+55 (${ddd}) ${numero.substring(0, 5)}-${numero.substring(5)}`;
    } else if (numero.length === 8) {
      // Fixo: +55 (DD) XXXX-XXXX
      formatted = `+55 (${ddd}) ${numero.substring(0, 4)}-${numero.substring(4)}`;
    } else {
      // Número não padrão, retornar com código de país
      formatted = `+55${ddd}${numero}`;
    }

    return {
      whatsapp: formatted,
      ddd: ddd,
    };
  }

  /**
   * Limpa e normaliza texto (remove espaços extras, capitaliza, etc)
   */
  private cleanText(text: string): string {
    if (!text) return '';
    return text
      .toString()
      .trim()
      .replace(/\s+/g, ' ') // Remove espaços extras
      .replace(/\n/g, ' ') // Remove quebras de linha
      .replace(/\r/g, ''); // Remove retorno de carro
  }

  /**
   * Capitaliza nome próprio
   */
  private capitalizeName(name: string): string {
    if (!name) return '';
    return name
      .toLowerCase()
      .split(' ')
      .map((word) => {
        // Não capitalizar preposições
        if (['de', 'da', 'do', 'dos', 'das', 'e'].includes(word)) {
          return word;
        }
        return word.charAt(0).toUpperCase() + word.slice(1);
      })
      .join(' ');
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  async downloadTemplate(): Promise<Buffer> {
    // Criar template Excel com novos campos
    const template = [
      {
        nome: 'João Silva',
        email: 'joao@exemplo.com',
        telefone: '(11) 99999-9999',
        razao_social: 'EMPRESA EXEMPLO LTDA',
        empresa: 'Empresa Exemplo',
        cargo: 'Gerente de TI',
        origem: 'website',
        observacoes: 'Lead qualificado - Interessado em automação',
      },
      {
        nome: 'Maria Santos',
        email: 'maria@exemplo.com',
        telefone: '11988888888',
        razao_social: 'TECH CORP SA',
        empresa: 'Tech Corp',
        cargo: 'Diretora de Operações',
        origem: 'indicacao',
        observacoes: 'Indicação de parceiro - Agendar reunião',
      },
      {
        nome: 'Carlos Oliveira',
        email: 'carlos@exemplo.com',
        telefone: '+55 21 97777-7777',
        razao_social: '',
        empresa: 'Inovação Digital',
        cargo: 'CTO',
        origem: 'linkedin',
        observacoes: '',
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(template);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Leads');

    // Ajustar largura das colunas
    worksheet['!cols'] = [
      { wch: 25 }, // nome
      { wch: 30 }, // email
      { wch: 20 }, // telefone
      { wch: 35 }, // razao_social
      { wch: 25 }, // empresa
      { wch: 25 }, // cargo
      { wch: 15 }, // origem
      { wch: 40 }, // observacoes
    ];

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    return buffer;
  }
}
