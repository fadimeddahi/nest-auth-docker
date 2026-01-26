import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, MaxLength } from 'class-validator';

export class CreateSkillDto {
  @ApiProperty({ example: 'TypeScript', description: 'Skill name' })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiProperty({
    example: 'Advanced',
    description: 'Proficiency level (Beginner, Intermediate, Advanced, Expert)',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  level?: string;
}
