import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  const mockAuthResponse = {
    access_token: 'jwt.token.here',
    refresh_token: 'jwt.refresh.token.here',
    user: {
      id: '123',
      nome: 'Test User',
      email: 'test@example.com',
      cargo: 'vendedor',
      avatar: null,
    },
  };

  const mockProfileResponse = {
    id: '123',
    nome: 'Test User',
    email: 'test@example.com',
    cargo: 'vendedor',
    avatar: null,
    telefone: '11999999999',
    criadoEm: new Date(),
  };

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
    refreshToken: jest.fn(),
    getProfile: jest.fn(),
    validateUser: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should register a new user', async () => {
      const createUserDto: CreateUserDto = {
        nome: 'New User',
        email: 'new@example.com',
        senha: 'Password123',
        cargo: 'vendedor',
      };

      mockAuthService.register.mockResolvedValue(mockAuthResponse);

      const result = await controller.register(createUserDto);

      expect(result).toEqual(mockAuthResponse);
      expect(result.refresh_token).toBeDefined();
      expect(mockAuthService.register).toHaveBeenCalledWith(createUserDto);
    });
  });

  describe('login', () => {
    it('should login a user', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        senha: 'Password123',
      };

      mockAuthService.login.mockResolvedValue(mockAuthResponse);

      const result = await controller.login(loginDto);

      expect(result).toEqual(mockAuthResponse);
      expect(result.refresh_token).toBeDefined();
      expect(mockAuthService.login).toHaveBeenCalledWith(loginDto);
    });
  });

  describe('refresh', () => {
    it('should refresh tokens', async () => {
      mockAuthService.refreshToken.mockResolvedValue(mockAuthResponse);

      const result = await controller.refresh({ refresh_token: 'valid.refresh.token' });

      expect(result).toEqual(mockAuthResponse);
      expect(mockAuthService.refreshToken).toHaveBeenCalledWith('valid.refresh.token');
    });
  });

  describe('getProfile', () => {
    it('should return user profile', async () => {
      mockAuthService.getProfile.mockResolvedValue(mockProfileResponse);

      const mockUser = { id: '123', email: 'test@example.com', nome: 'Test', cargo: 'vendedor' as const };
      const result = await controller.getProfile(mockUser);

      expect(result).toEqual(mockProfileResponse);
      expect(mockAuthService.getProfile).toHaveBeenCalledWith('123');
    });
  });
});
