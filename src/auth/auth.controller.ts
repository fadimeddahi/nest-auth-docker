import { Controller, Post, Body, BadRequestException, UnauthorizedException, ConflictException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { StudentsService } from '../students/students.service';
import { CompaniesService } from '../companies/companies.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto, UserType } from './dto/register.dto';
import { ValidationPipe } from '../common/pipes/validation.pipe';
import { UserRole } from '../users/user.entity';
import * as bcrypt from 'bcryptjs';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
    private studentsService: StudentsService,
    private companiesService: CompaniesService,
  ) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User registered successfully.' })
  @ApiResponse({ status: 409, description: 'Email already exists.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @Throttle({ short: { limit: 20, ttl: 60000 } })
  async register(
    @Body(new ValidationPipe()) registerDto: RegisterDto,
  ) {
    // Check if email already exists
    const existingEmail = await this.usersService.findByEmail(registerDto.email);
    if (existingEmail) {
      throw new ConflictException('Email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    // Determine user role based on userType
    const role = registerDto.userType === UserType.STUDENT ? UserRole.STUDENT : UserRole.COMPANY;

    // Generate unique username from email
    const username = registerDto.email.split('@')[0] + Date.now();

    // Create user
    const user = await this.usersService.create(
      username,
      registerDto.email,
      hashedPassword,
      role,
    );

    // Create student or company profile based on userType
    if (registerDto.userType === UserType.STUDENT) {
      await this.studentsService.create(user.userId, {
        firstName: registerDto.firstName,
        lastName: registerDto.lastName,
        university: registerDto.university,
      });
    } else {
      await this.companiesService.create(user.userId, {
        firstName: registerDto.firstName,
        lastName: registerDto.lastName,
        enterpriseSize: registerDto.enterpriseSize,
      });
    }

    return {
      statusCode: 201,
      message: 'User registered successfully',
      userId: user.userId,
      email: user.email,
      userType: registerDto.userType,
      firstName: registerDto.firstName,
      lastName: registerDto.lastName,
    };
  }

  @Post('login')
  @ApiOperation({ summary: 'User login' })
  @ApiResponse({ status: 200, description: 'Login successful.' })
  @ApiResponse({ status: 401, description: 'Invalid email or password.' })
  @Throttle({ short: { limit: 20, ttl: 60000 } })
  async login(
    @Body(new ValidationPipe()) loginDto: LoginDto,
  ) {
    const user = await this.authService.validateUser(
      loginDto.email,
      loginDto.password,
    );

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const result = await this.authService.login(user);
    return {
      statusCode: 200,
      message: 'Login successful',
      ...result,
      user: {
        userId: user.userId,
        email: user.email,
        role: user.role,
      },
    };
  }
}
