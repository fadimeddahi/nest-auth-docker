import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { ApplicationStatus } from '../application.entity';

export class UpdateApplicationStatusDto {
  @ApiProperty({
    enum: ApplicationStatus,
    example: ApplicationStatus.ACCEPTED,
    description: 'New status of the application',
  })
  @IsEnum(ApplicationStatus)
  @IsNotEmpty()
  status: ApplicationStatus;
}
