import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, MaxLength, IsDateString } from 'class-validator';

export class CreateExperienceDto {
  @ApiProperty({ example: 'Google', description: 'Company name' })
  @IsString()
  @MaxLength(150)
  company: string;

  @ApiProperty({ example: 'Software Engineer', description: 'Job position' })
  @IsString()
  @MaxLength(100)
  position: string;

  @ApiProperty({
    example: 'Worked on backend services',
    description: 'Job description',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @ApiProperty({
    example: '2023-01-15',
    description: 'Start date (YYYY-MM-DD)',
    required: false,
  })
  @IsOptional()
  startDate?: string;

  @ApiProperty({
    example: '2024-06-30',
    description: 'End date (YYYY-MM-DD), leave null for ongoing',
    required: false,
  })
  @IsOptional()
  endDate?: string;
}

