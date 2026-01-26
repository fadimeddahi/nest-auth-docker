import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { User, UserRole } from '../users/user.entity';
import * as bcrypt from 'bcryptjs';

// Mock bcrypt
jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let jwtService: jest.Mocked<JwtService>;

  const mockUser: User = {
    userId: 1,
    email: 'test@example.com',
    password: '$2a$10$hashedpassword',
    role: UserRole.STUDENT,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const mockUsersService = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      validateUserByEmail: jest.fn(),
    };

    const mockJwtService = {
      sign: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get(UsersService);
    jwtService = module.get(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Service Definition', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });
  });

  describe('validateUser', () => {
    it('should return user without password when credentials are valid', async () => {
      const userWithoutPassword = { ...mockUser };
      delete (userWithoutPassword as any).password;
      usersService.validateUserByEmail.mockResolvedValue(userWithoutPassword);

      const result = await service.validateUser('test@example.com', 'password123');

      expect(result).toBeDefined();
      expect(result?.email).toBe('test@example.com');
      expect(result?.password).toBeUndefined();
    });

    it('should return null when user is not found', async () => {
      usersService.validateUserByEmail.mockResolvedValue(null);

      const result = await service.validateUser('notfound@example.com', 'password123');

      expect(result).toBeNull();
    });

    it('should return null when password is invalid', async () => {
      usersService.validateUserByEmail.mockResolvedValue(null);

      const result = await service.validateUser('test@example.com', 'wrongpassword');

      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should return access token and user data', async () => {
      const userWithoutPassword = { ...mockUser };
      delete (userWithoutPassword as any).password;

      jwtService.sign.mockReturnValue('mock-jwt-token');

      const result = await service.login(userWithoutPassword as any);

      expect(result).toHaveProperty('access_token');
      expect(result.access_token).toBe('mock-jwt-token');
      expect(jwtService.sign).toHaveBeenCalledWith({
        email: mockUser.email,
        sub: mockUser.userId,
        role: mockUser.role,
      });
    });

    it('should include correct payload in JWT', async () => {
      const userWithoutPassword = { ...mockUser };
      delete (userWithoutPassword as any).password;

      jwtService.sign.mockReturnValue('mock-jwt-token');

      await service.login(userWithoutPassword as any);

      expect(jwtService.sign).toHaveBeenCalledWith(
        expect.objectContaining({
          sub: 1,
          email: 'test@example.com',
          role: 'student',
        }),
      );
    });
  });
});
