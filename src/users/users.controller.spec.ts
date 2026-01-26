import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { BadRequestException } from '@nestjs/common';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: jest.Mocked<UsersService>;

  const mockUser = {
    userId: 1,
    username: 'testuser',
    email: 'test@example.com',
    role: 'student',
  };

  beforeEach(async () => {
    const mockUsersService = {
      create: jest.fn(),
      findByEmail: jest.fn(),
      findById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    usersService = module.get(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    const createUserDto = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'Password123!',
    };

    it('should register a new user', async () => {
      usersService.create.mockResolvedValue(mockUser as any);

      const result = await controller.register(createUserDto as any);

      expect(result).toHaveProperty('statusCode', 201);
      expect(result).toHaveProperty('message', 'User registered successfully');
      expect(result).toHaveProperty('userId');
    });

    it('should throw BadRequestException on failure', async () => {
      usersService.create.mockRejectedValue(new Error('Registration failed'));

      await expect(controller.register(createUserDto as any)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('getProfile', () => {
    it('should return user profile', async () => {
      const req = { user: { userId: 1, email: 'test@example.com', role: 'student' } };

      const result = await controller.getProfile(req);

      expect(result).toHaveProperty('statusCode', 200);
      expect(result.user).toHaveProperty('userId', 1);
      expect(result.user).toHaveProperty('email', 'test@example.com');
    });
  });
});
