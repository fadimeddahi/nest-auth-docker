import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  MaxLength,
  IsNumber,
  Min,
} from 'class-validator';
import { OfferType } from '../job-offer.entity';

export class CreateJobOfferDto {
  @ApiProperty({
    example: 'Senior Backend Developer',
    description: 'Job title',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string;

  @ApiProperty({
    example: 'We are looking for...',
    description: 'Job description',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  description: string;

  @ApiProperty({
    enum: OfferType,
    example: OfferType.JOB,
    description: 'Type of job offer',
  })
  @IsEnum(OfferType)
  @IsNotEmpty()
  type: OfferType;

  @ApiProperty({
    example: 'Node.js, NestJS, PostgreSQL',
    description: 'Required skills',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  requiredSkills: string;

  @ApiProperty({
    example: 'Remote',
    description: 'Job location',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  location: string;

  @ApiProperty({
    example: 80000,
    description: 'Annual salary',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  salary?: number;

  @ApiProperty({
    example: 'Permanent',
    description: 'Duration of the job',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  duration?: string;

  @ApiProperty({
    example: '2023-12-31T23:59:59.999Z',
    description: 'Application deadline',
    required: false,
  })
  @IsOptional()
  deadline?: Date;
}
