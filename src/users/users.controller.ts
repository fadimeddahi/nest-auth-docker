import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateUserDto } from './dto/create-user.dto';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user (Alternative)' })
  @ApiResponse({ status: 201, description: 'User registered successfully.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  async register(@Body() createUserDto: CreateUserDto) {
    try {
      const user = await this.usersService.create(
        String(createUserDto.username ?? ''),
        String(createUserDto.email ?? ''),
        String(createUserDto.password ?? ''),
      );
      return {
        statusCode: 201,
        message: 'User registered successfully',
        userId: user.userId,
        username: user.username,
        email: user.email,
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Registration failed';
      throw new BadRequestException(message);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Return current user profile.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async getProfile(@Request() req: any) {
    return {
      statusCode: 200,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      user: req.user,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({ status: 200, description: 'Return user details.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  async getUser(@Param('id') id: number) {
    const user = await this.usersService.findOne(String(id));
    if (!user) {
      return {
        statusCode: 404,
        message: 'User not found',
      };
    }

    return {
      statusCode: 200,
      userId: user.userId,
      username: user.username,
      email: user.email,
      createdAt: user.createdAt,
    };
  }
}
