/* eslint-disable @typescript-eslint/no-unsafe-call */
import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsUrl,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpdateCompanyDto {
  @ApiProperty({
    example: 'Tech Corp',
    description: 'Company name',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MinLength(3)
  @MaxLength(150)
  companyName?: string;

  @ApiProperty({
    example: 'Technology',
    description: 'Industry sector',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  industry?: string;

  @ApiProperty({
    example: 'San Francisco, CA',
    description: 'Company location',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  location?: string;

  @ApiProperty({
    example: 'https://techcorp.com',
    description: 'Company website',
    required: false,
  })
  @IsUrl()
  @IsOptional()
  website?: string;

  @ApiProperty({
    example: 'Leading tech company...',
    description: 'Company description',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  description?: string;

  @ApiProperty({
    example: 'https://techcorp.com/logo.png',
    description: 'Company logo URL',
    required: false,
  })
  @IsUrl()
  @IsOptional()
  logoUrl?: string;

  @ApiProperty({
    example: '+1234567890',
    description: 'Contact phone',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  phone?: string;
}
