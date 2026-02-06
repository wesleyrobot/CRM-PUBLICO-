import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client } from './entities/client.entity';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { ClientFilterDto } from './dto/client-filter.dto';
import { PaginatedResult } from '../../common/dto/pagination.dto';

@Injectable()
export class ClientsService {
  constructor(
    @InjectRepository(Client)
    private clientsRepository: Repository<Client>,
  ) {}

  async create(createClientDto: CreateClientDto): Promise<Client> {
    const client = this.clientsRepository.create(createClientDto);
    return this.clientsRepository.save(client);
  }

  async findAll(filterDto: ClientFilterDto): Promise<PaginatedResult<Client>> {
    const { page = 1, limit = 10, search, sortBy = 'criadoEm', sortOrder = 'DESC', ativo } = filterDto;

    const queryBuilder = this.clientsRepository.createQueryBuilder('client');

    if (search) {
      queryBuilder.where(
        'client.nome ILIKE :search OR client.email ILIKE :search OR client.telefone ILIKE :search',
        { search: `%${search}%` },
      );
    }

    if (ativo !== undefined) {
      queryBuilder.andWhere('client.ativo = :ativo', { ativo });
    }

    queryBuilder
      .orderBy(`client.${sortBy}`, sortOrder)
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

  async findOne(id: string): Promise<Client> {
    const client = await this.clientsRepository.findOne({
      where: { id },
    });

    if (!client) {
      throw new NotFoundException('Cliente não encontrado');
    }

    return client;
  }

  async update(id: string, updateClientDto: UpdateClientDto): Promise<Client> {
    const client = await this.findOne(id);
    Object.assign(client, updateClientDto);
    return this.clientsRepository.save(client);
  }

  async remove(id: string): Promise<void> {
    const client = await this.findOne(id);
    await this.clientsRepository.remove(client);
  }
}
