import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  private generateTokens(userId: string, email: string) {
    const payload = { sub: userId, email };

    const access_token = this.jwtService.sign(payload, {
      expiresIn: this.configService.get<string>('JWT_EXPIRATION', '1h'),
    });

    const refresh_token = this.jwtService.sign(
      { sub: userId, type: 'refresh' },
      { expiresIn: '7d' },
    );

    return { access_token, refresh_token };
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByEmail(loginDto.email);

    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    if (!user.ativo) {
      throw new UnauthorizedException('Usuário inativo');
    }

    const isPasswordValid = await this.usersService.validatePassword(
      loginDto.senha,
      user.senha,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const tokens = this.generateTokens(user.id, user.email);

    return {
      ...tokens,
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        cargo: user.cargo,
        avatar: user.avatar,
      },
    };
  }

  async register(createUserDto: CreateUserDto) {
    const user = await this.usersService.create(createUserDto);

    const tokens = this.generateTokens(user.id, user.email);

    return {
      ...tokens,
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        cargo: user.cargo,
        avatar: user.avatar,
      },
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken);

      if (payload.type !== 'refresh') {
        throw new UnauthorizedException('Token inválido');
      }

      const user = await this.usersService.findOne(payload.sub);

      if (!user || !user.ativo) {
        throw new UnauthorizedException('Usuário inativo ou não encontrado');
      }

      const tokens = this.generateTokens(user.id, user.email);

      return {
        ...tokens,
        user: {
          id: user.id,
          nome: user.nome,
          email: user.email,
          cargo: user.cargo,
          avatar: user.avatar,
        },
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Refresh token inválido ou expirado');
    }
  }

  async getProfile(userId: string) {
    const user = await this.usersService.findOne(userId);

    return {
      id: user.id,
      nome: user.nome,
      email: user.email,
      cargo: user.cargo,
      avatar: user.avatar,
      telefone: user.telefone,
      criadoEm: user.criadoEm,
    };
  }
}
