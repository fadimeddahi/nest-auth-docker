import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { StudentsService } from '../students/students.service';
import { CompaniesService } from '../companies/companies.service';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { UserRole } from '../users/user.entity';
import { RegisterDto, UserType } from './dto/register.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<AuthService>;
  let usersService: jest.Mocked<UsersService>;
  let studentsService: jest.Mocked<StudentsService>;
  let companiesService: jest.Mocked<CompaniesService>;

  const mockUser = {
    userId: 1,
    email: 'test@example.com',
    role: UserRole.STUDENT,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const mockAuthService = {
      validateUser: jest.fn(),
      login: jest.fn(),
    };

    const mockUsersService = {
      findByEmail: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    };

    const mockStudentsService = {
      create: jest.fn(),
    };

    const mockCompaniesService = {
      create: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: UsersService, useValue: mockUsersService },
        { provide: StudentsService, useValue: mockStudentsService },
        { provide: CompaniesService, useValue: mockCompaniesService },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get(AuthService);
    usersService = module.get(UsersService);
    studentsService = module.get(StudentsService);
    companiesService = module.get(CompaniesService);
  });

  describe('Controller Definition', () => {
    it('should be defined', () => {
      expect(controller).toBeDefined();
    });
  });

  describe('register', () => {
    const studentRegisterDto: RegisterDto = {
      email: 'student@example.com',
      password: 'Password123!',
      userType: UserType.STUDENT,
      firstName: 'John',
      lastName: 'Doe',
    };

    const companyRegisterDto: RegisterDto = {
      email: 'company@example.com',
      password: 'Password123!',
      userType: UserType.ENTERPRISE,
      companyName: 'Test Company',
    };

    it('should register a new student successfully', async () => {
      usersService.findByEmail.mockResolvedValue(null);
      usersService.create.mockResolvedValue(mockUser as any);
      studentsService.create.mockResolvedValue({ studentId: 1 } as any);

      const result = await controller.register(studentRegisterDto);

      expect(result).toHaveProperty('statusCode', 201);
      expect(result).toHaveProperty('message', 'User registered successfully');
      expect(result).toHaveProperty('userId');
      expect(result).toHaveProperty('email');
      expect(usersService.create).toHaveBeenCalled();
      expect(studentsService.create).toHaveBeenCalled();
    });

    it('should register a new company successfully', async () => {
      const companyUser = { ...mockUser, role: UserRole.COMPANY };
      usersService.findByEmail.mockResolvedValue(null);
      usersService.create.mockResolvedValue(companyUser as any);
      companiesService.create.mockResolvedValue({ companyId: 1 } as any);

      const result = await controller.register(companyRegisterDto);

      expect(result).toHaveProperty('statusCode', 201);
      expect(result).toHaveProperty('userId');
      expect(companiesService.create).toHaveBeenCalled();
    });

    it('should throw ConflictException when email already exists', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser as any);

      await expect(controller.register(studentRegisterDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should rollback user creation if profile creation fails', async () => {
      usersService.findByEmail.mockResolvedValue(null);
      usersService.create.mockResolvedValue(mockUser as any);
      studentsService.create.mockRejectedValue(new Error('Profile creation failed'));
      usersService.delete.mockResolvedValue(undefined);

      await expect(controller.register(studentRegisterDto)).rejects.toThrow();
      expect(usersService.delete).toHaveBeenCalledWith(mockUser.userId);
    });
  });

  describe('login', () => {
    const loginDto = {
      email: 'test@example.com',
      password: 'Password123!',
    };

    it('should login successfully with valid credentials', async () => {
      authService.validateUser.mockResolvedValue(mockUser as any);
      authService.login.mockResolvedValue({ access_token: 'jwt-token' });

      const result = await controller.login(loginDto);

      expect(result).toHaveProperty('statusCode', 200);
      expect(result).toHaveProperty('message', 'Login successful');
      expect(result).toHaveProperty('access_token');
      expect(result.user).toHaveProperty('email', 'test@example.com');
    });

    it('should throw UnauthorizedException with invalid credentials', async () => {
      authService.validateUser.mockResolvedValue(null);

      await expect(controller.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should return user data without password', async () => {
      authService.validateUser.mockResolvedValue(mockUser as any);
      authService.login.mockResolvedValue({ access_token: 'jwt-token' });

      const result = await controller.login(loginDto);

      expect(result.user).not.toHaveProperty('password');
      expect(result.user).toHaveProperty('userId');
      expect(result.user).toHaveProperty('email');
      expect(result.user).toHaveProperty('role');
    });
  });
});
