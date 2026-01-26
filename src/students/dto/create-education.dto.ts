import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, MaxLength, IsNotEmpty } from 'class-validator';

export class CreateEducationDto {
  @ApiProperty({ example: 'Harvard University', description: 'School/University name' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  school: string;

  @ApiProperty({ example: "Bachelor's", description: 'Degree type' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  degree: string;

  @ApiProperty({
    example: 'Computer Science',
    description: 'Field of study',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  fieldOfStudy?: string;

  @ApiProperty({
    example: '2020-09-15',
    description: 'Start date (YYYY-MM-DD)',
  })
  @IsNotEmpty()
  startDate: string;

  @ApiProperty({
    example: '2024-06-30',
    description: 'End date (YYYY-MM-DD), leave null if currently studying',
    required: false,
  })
  @IsOptional()
  endDate?: string;
}
