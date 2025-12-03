import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsEmail,
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsEnum,
} from 'class-validator';
import { UserRole } from '../../users/user.entity';
import { IsStrongPassword } from '../../common/validators/strong-password.validator';

export class RegisterDto {
  @ApiProperty({
    example: 'john_doe',
    description: 'The username of the user',
    minLength: 3,
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(50)
  username: string;

  @ApiProperty({
    example: 'john@example.com',
    description: 'The email address of the user',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: 'StrongPass123!',
    description: 'The password of the user (must be strong)',
    minLength: 8,
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(100)
  @IsStrongPassword()
  password: string;

  @ApiProperty({
    enum: UserRole,
    example: UserRole.STUDENT,
    description: 'The role of the user',
  })
  @IsEnum(UserRole)
  @IsNotEmpty()
  role: UserRole;
}
