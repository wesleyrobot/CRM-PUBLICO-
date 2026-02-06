import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { UnauthorizedException } from '@nestjs/common';

// Mock bcrypt antes de tudo
jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashedPassword123'),
  compare: jest.fn().mockResolvedValue(true),
}));

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  const mockUser = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    nome: 'Test User',
    email: 'test@example.com',
    senha: '$2b$10$hashedPassword',
    cargo: 'vendedor' as const,
    ativo: true,
    avatar: null,
    telefone: null,
    criadoEm: new Date(),
    atualizadoEm: new Date(),
    leads: [],
    clients: [],
  };

  const mockUsersService = {
    create: jest.fn(),
    findByEmail: jest.fn(),
    findOne: jest.fn(),
    validatePassword: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('jwt.token.here'),
    verify: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn().mockReturnValue('1h'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);

    jest.clearAllMocks();
    mockJwtService.sign.mockReturnValue('jwt.token.here');
    mockConfigService.get.mockReturnValue('1h');
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should create a new user and return tokens', async () => {
      const createUserDto = {
        nome: 'New User',
        email: 'newuser@example.com',
        senha: 'password123',
        cargo: 'vendedor' as const,
      };

      const createdUser = { ...mockUser, ...createUserDto };
      mockUsersService.create.mockResolvedValue(createdUser);

      const result = await service.register(createUserDto);

      expect(result.access_token).toEqual('jwt.token.here');
      expect(result.refresh_token).toEqual('jwt.token.here');
      expect(result.user.id).toEqual(createdUser.id);
      expect(result.user.nome).toEqual(createdUser.nome);
      expect(result.user.email).toEqual(createdUser.email);
      expect(mockUsersService.create).toHaveBeenCalledWith(createUserDto);
    });
  });

  describe('login', () => {
    it('should return tokens for valid credentials', async () => {
      const loginDto = {
        email: 'test@example.com',
        senha: 'password123',
      };

      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      mockUsersService.validatePassword.mockResolvedValue(true);

      const result = await service.login(loginDto);

      expect(result.access_token).toEqual('jwt.token.here');
      expect(result.refresh_token).toEqual('jwt.token.here');
      expect(mockUsersService.validatePassword).toHaveBeenCalledWith('password123', mockUser.senha);
    });

    it('should throw UnauthorizedException for invalid email', async () => {
      const loginDto = {
        email: 'invalid@example.com',
        senha: 'password123',
      };

      mockUsersService.findByEmail.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for invalid password', async () => {
      const loginDto = {
        email: 'test@example.com',
        senha: 'wrongpassword',
      };

      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      mockUsersService.validatePassword.mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for inactive user', async () => {
      const loginDto = {
        email: 'test@example.com',
        senha: 'password123',
      };

      const inactiveUser = { ...mockUser, ativo: false };
      mockUsersService.findByEmail.mockResolvedValue(inactiveUser);
      mockUsersService.validatePassword.mockResolvedValue(true);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('refreshToken', () => {
    it('should return new tokens for valid refresh token', async () => {
      mockJwtService.verify.mockReturnValue({
        sub: mockUser.id,
        type: 'refresh',
      });
      mockUsersService.findOne.mockResolvedValue(mockUser);

      const result = await service.refreshToken('valid.refresh.token');

      expect(result.access_token).toBeDefined();
      expect(result.refresh_token).toBeDefined();
      expect(result.user.id).toEqual(mockUser.id);
    });

    it('should throw UnauthorizedException for invalid token type', async () => {
      mockJwtService.verify.mockReturnValue({
        sub: mockUser.id,
        type: 'access',
      });

      await expect(service.refreshToken('invalid.token')).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for inactive user', async () => {
      mockJwtService.verify.mockReturnValue({
        sub: mockUser.id,
        type: 'refresh',
      });
      const inactiveUser = { ...mockUser, ativo: false };
      mockUsersService.findOne.mockResolvedValue(inactiveUser);

      await expect(service.refreshToken('valid.refresh.token')).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for expired token', async () => {
      mockJwtService.verify.mockImplementation(() => {
        throw new Error('jwt expired');
      });

      await expect(service.refreshToken('expired.token')).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('getProfile', () => {
    it('should return user profile', async () => {
      mockUsersService.findOne.mockResolvedValue(mockUser);

      const result = await service.getProfile(mockUser.id);

      expect(result.id).toEqual(mockUser.id);
      expect(result.nome).toEqual(mockUser.nome);
      expect(result.email).toEqual(mockUser.email);
      expect(result.cargo).toEqual(mockUser.cargo);
    });
  });
});
