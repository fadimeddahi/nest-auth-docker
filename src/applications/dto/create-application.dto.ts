import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsUrl, MaxLength } from 'class-validator';

export class CreateApplicationDto {
  @ApiProperty({
    example: 'I am very interested in this position...',
    description: 'Cover letter',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  coverLetter?: string;

  @ApiProperty({
    example: 'https://my-cv.com/cv.pdf',
    description: 'URL to CV',
    required: false,
  })
  @IsUrl()
  @IsOptional()
  cvUrl?: string;
}
