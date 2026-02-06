import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lead } from './entities/lead.entity';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { LeadFilterDto } from './dto/lead-filter.dto';
import { PaginatedResult } from '../../common/dto/pagination.dto';

@Injectable()
export class LeadsService {
  constructor(
    @InjectRepository(Lead)
    private leadsRepository: Repository<Lead>,
  ) {}

  async create(createLeadDto: CreateLeadDto): Promise<Lead> {
    const lead = this.leadsRepository.create(createLeadDto);
    return this.leadsRepository.save(lead);
  }

  async findAll(filterDto: LeadFilterDto): Promise<PaginatedResult<Lead>> {
    const { page = 1, limit = 10, search, sortBy = 'criadoEm', sortOrder = 'DESC', status } = filterDto;

    const queryBuilder = this.leadsRepository.createQueryBuilder('lead');

    if (search) {
      queryBuilder.where(
        'lead.nome ILIKE :search OR lead.email ILIKE :search OR lead.telefone ILIKE :search',
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
}
