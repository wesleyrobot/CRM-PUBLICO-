import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from './entities/company.entity';
import { CreateCompanyDto } from './dto/create-company.dto';
import type { UpdateCompanyDto } from './dto/update-company.dto';
import { PaginationDto, PaginatedResult } from '../../common/dto/pagination.dto';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectRepository(Company)
    private companiesRepository: Repository<Company>,
  ) {}

  async create(createCompanyDto: CreateCompanyDto): Promise<Company> {
    if (createCompanyDto.cnpj) {
      const existing = await this.companiesRepository.findOne({
        where: { cnpj: createCompanyDto.cnpj },
      });
      if (existing) {
        throw new ConflictException('CNPJ já cadastrado');
      }
    }

    const company = this.companiesRepository.create(createCompanyDto);
    return this.companiesRepository.save(company);
  }

  async findAll(paginationDto: PaginationDto): Promise<PaginatedResult<Company>> {
    const { page = 1, limit = 10, search, sortBy = 'criadoEm', sortOrder = 'DESC' } = paginationDto;

    const queryBuilder = this.companiesRepository.createQueryBuilder('company');

    if (search) {
      queryBuilder.where(
        'company.razaoSocial ILIKE :search OR company.nomeFantasia ILIKE :search OR company.cnpj ILIKE :search',
        { search: `%${search}%` },
      );
    }

    queryBuilder
      .orderBy(`company.${sortBy}`, sortOrder)
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

  async findOne(id: string): Promise<Company> {
    const company = await this.companiesRepository.findOne({
      where: { id },
    });

    if (!company) {
      throw new NotFoundException('Empresa não encontrada');
    }

    return company;
  }

  async update(id: string, updateCompanyDto: UpdateCompanyDto): Promise<Company> {
    const company = await this.findOne(id);

    const dto = updateCompanyDto as CreateCompanyDto;
    if (dto.cnpj && dto.cnpj !== company.cnpj) {
      const existing = await this.companiesRepository.findOne({
        where: { cnpj: dto.cnpj },
      });
      if (existing) {
        throw new ConflictException('CNPJ já cadastrado');
      }
    }

    Object.assign(company, updateCompanyDto);
    return this.companiesRepository.save(company);
  }

  async remove(id: string): Promise<void> {
    const company = await this.findOne(id);
    await this.companiesRepository.remove(company);
  }
}
