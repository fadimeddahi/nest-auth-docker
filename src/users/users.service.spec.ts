import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './user.entity';

describe('UsersService', () => {
  let service: UsersService;
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should find a user by username', async () => {
    const mockUser = {
      userId: 1,
      username: 'testuser',
      email: 'test@example.com',
      password: 'hashedpassword',
    };

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-call
    const usersRepository = module.get(getRepositoryToken(User));
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    usersRepository.findOne.mockResolvedValue(mockUser);

    const result = await service.findOne('testuser');
    expect(result).toEqual(mockUser);
  });

  it('should validate user with correct password', async () => {
    const mockUser = {
      userId: 1,
      username: 'testuser',
      email: 'test@example.com',
      password: '$2a$10$h8Z5...hashedpassword',
    };

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-call
    const usersRepository = module.get(getRepositoryToken(User));
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    usersRepository.findOne.mockResolvedValue(mockUser);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const result = await service.validateUser('testuser', 'password');
    expect(result).toBeDefined();
  });
});
