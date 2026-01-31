import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
import { JwtStrategy } from './jwt.strategy';
import { UsersService } from '../../users/users.service';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let usersService: UsersService;

  const mockConfigService = {
    get: jest.fn().mockReturnValue('test-secret'),
  };

  const mockUsersService = {
    findOne: jest.fn(),
  };

  const mockUser = {
    id: '123',
    nome: 'Test User',
    email: 'test@example.com',
    cargo: 'vendedor',
    ativo: true,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
    usersService = module.get<UsersService>(UsersService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  it('should return user when valid', async () => {
    const payload = { sub: '123', email: 'test@example.com' };
    mockUsersService.findOne.mockResolvedValue(mockUser);

    const result = await strategy.validate(payload);

    expect(result).toBeDefined();
    expect(result.id).toBe('123');
    expect(mockUsersService.findOne).toHaveBeenCalledWith('123');
  });

  it('should throw UnauthorizedException when user not found', async () => {
    const payload = { sub: '123', email: 'test@example.com' };
    mockUsersService.findOne.mockResolvedValue(null);

    await expect(strategy.validate(payload)).rejects.toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException when user is inactive', async () => {
    const payload = { sub: '123', email: 'test@example.com' };
    const inactiveUser = { ...mockUser, ativo: false };
    mockUsersService.findOne.mockResolvedValue(inactiveUser);

    await expect(strategy.validate(payload)).rejects.toThrow(UnauthorizedException);
  });
});
