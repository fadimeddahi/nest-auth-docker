/* eslint-disable @typescript-eslint/no-unsafe-call */
import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  MinLength,
  MaxLength,
  IsUrl,
} from 'class-validator';

export class UpdateStudentDto {
  @ApiProperty({
    example: 'John',
    description: 'First name',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(50)
  firstName?: string;

  @ApiProperty({
    example: 'Doe',
    description: 'Last name',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(50)
  lastName?: string;

  @ApiProperty({
    example: '+1234567890',
    description: 'Phone number',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MinLength(10)
  @MaxLength(20)
  phone?: string;

  @ApiProperty({
    example: 'New York, USA',
    description: 'Location',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  location?: string;

  @ApiProperty({
    example: 'Passionate developer...',
    description: 'Biography',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  bio?: string;

  @ApiProperty({
    example: 'https://portfolio.com',
    description: 'Portfolio URL',
    required: false,
  })
  @IsUrl()
  @IsOptional()
  portfolioUrl?: string;

  @ApiProperty({
    example: 'https://github.com/johndoe',
    description: 'GitHub URL',
    required: false,
  })
  @IsUrl()
  @IsOptional()
  githubUrl?: string;

  @ApiProperty({
    example: 'https://linkedin.com/in/johndoe',
    description: 'LinkedIn URL',
    required: false,
  })
  @IsUrl()
  @IsOptional()
  linkedinUrl?: string;

  @ApiProperty({
    example: 'https://res.cloudinary.com/...image.jpg',
    description: 'Profile image URL',
    required: false,
  })
  @IsUrl()
  @IsOptional()
  profileImageUrl?: string;
}
