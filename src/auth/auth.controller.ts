import { Controller, Post, Body, BadRequestException, UnauthorizedException, ConflictException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ValidationPipe } from '../common/pipes/validation.pipe';
import * as bcrypt from 'bcryptjs';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User registered successfully.' })
  @ApiResponse({ status: 409, description: 'Username or Email already exists.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @Throttle({ short: { limit: 3, ttl: 60000 } })
  async register(
    @Body(new ValidationPipe()) registerDto: RegisterDto,
  ) {
    // Check if user already exists
    const existingUser = await this.usersService.findOne(registerDto.username);
    if (existingUser) {
      throw new ConflictException('Username already exists');
    }

    const existingEmail = await this.usersService.findByEmail(registerDto.email);
    if (existingEmail) {
      throw new ConflictException('Email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    // Create user
    const user = await this.usersService.create(
      registerDto.username,
      registerDto.email,
      hashedPassword,
      registerDto.role,
    );

    return {
      statusCode: 201,
      message: 'User registered successfully',
      userId: user.userId,
      username: user.username,
      email: user.email,
      role: user.role,
    };
  }

  @Post('login')
  @ApiOperation({ summary: 'User login' })
  @ApiResponse({ status: 200, description: 'Login successful.' })
  @ApiResponse({ status: 401, description: 'Invalid username or password.' })
  @Throttle({ short: { limit: 5, ttl: 60000 } })
  async login(
    @Body(new ValidationPipe()) loginDto: LoginDto,
  ) {
    const user = await this.authService.validateUser(
      loginDto.username,
      loginDto.password,
    );

    if (!user) {
      throw new UnauthorizedException('Invalid username or password');
    }

    const result = await this.authService.login(user);
    return {
      statusCode: 200,
      message: 'Login successful',
      ...result,
    };
  }
}
