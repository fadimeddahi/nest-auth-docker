import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, MaxLength } from 'class-validator';

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

  @ApiProperty({ example: '2 years', description: 'Duration of employment' })
  @IsString()
  @MaxLength(50)
  duration: string;
}
