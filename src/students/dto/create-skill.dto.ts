import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, MaxLength, IsUrl } from 'class-validator';

export class CreateSkillDto {
  @ApiProperty({ example: 'TypeScript', description: 'Skill name' })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiProperty({
    example: 'Expert',
    description: 'Skill level',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(10)
  level?: string;
}
