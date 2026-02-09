import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  private toResponseDto(user: User): UserResponseDto {
    const { senha, ...userWithoutPassword } = user;
    return userWithoutPassword as UserResponseDto;
  }

  private toResponseDtoArray(users: User[]): UserResponseDto[] {
    return users.map(user => this.toResponseDto(user));
  }

  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    // Verificar se email já existe
    const existingUser = await this.usersRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email já está em uso');
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(createUserDto.senha, 10);

    const user = this.usersRepository.create({
      ...createUserDto,
      senha: hashedPassword,
    });

    const savedUser = await this.usersRepository.save(user);
    return this.toResponseDto(savedUser);
  }

  async findAll(paginationDto: PaginationDto) {
    const { page = 1, limit = 10, search } = paginationDto;
    const skip = (page - 1) * limit;

    const queryBuilder = this.usersRepository.createQueryBuilder('user');

    if (search) {
      queryBuilder.where(
        'user.nome ILIKE :search OR user.email ILIKE :search',
        { search: `%${search}%` },
      );
    }

    queryBuilder.orderBy('user.criadoEm', 'DESC').skip(skip).take(limit);

    const [users, total] = await queryBuilder.getManyAndCount();

    return {
      data: this.toResponseDtoArray(users),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<UserResponseDto> {
    const user = await this.usersRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`Usuário com ID ${id} não encontrado`);
    }

    return this.toResponseDto(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.usersRepository.findOne({
      where: { email },
      select: ['id', 'nome', 'email', 'senha', 'cargo', 'ativo', 'avatar', 'telefone'],
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserResponseDto> {
    const user = await this.usersRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`Usuário com ID ${id} não encontrado`);
    }

    // Se estiver atualizando a senha, fazer hash
    if (updateUserDto.senha) {
      updateUserDto.senha = await bcrypt.hash(updateUserDto.senha, 10);
    }

    Object.assign(user, updateUserDto);
    const updatedUser = await this.usersRepository.save(user);
    return this.toResponseDto(updatedUser);
  }

  async remove(id: string): Promise<void> {
    const user = await this.usersRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`Usuário com ID ${id} não encontrado`);
    }

    await this.usersRepository.remove(user);
  }

  async validatePassword(password: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
  }
}
