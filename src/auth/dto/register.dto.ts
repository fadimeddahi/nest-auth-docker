import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsEmail,
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsEnum,
  ValidateIf,
} from 'class-validator';
import { IsStrongPassword } from '../../common/validators/strong-password.validator';

export enum UserType {
  STUDENT = 'student',
  ENTERPRISE = 'enterprise',
}

export enum StudentUniversity {
  USTHB = 'usthb',
  ESI = 'esi',
  USDB = 'usdb',
  ESTIN = 'estin',
  OTHER = 'other',
}

export enum EnterpriseSize {
  SIZE_1_10 = '1-10',
  SIZE_11_50 = '11-50',
  SIZE_51_200 = '51-200',
  SIZE_201_500 = '201-500',
  SIZE_501_1000 = '501-1000',
  SIZE_1000_PLUS = '1000+',
}

export class RegisterDto {
  @ApiProperty({
    example: 'John',
    description: 'The first name of the user',
  })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({
    example: 'Doe',
    description: 'The last name of the user',
  })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({
    example: 'john@example.com',
    description: 'The email address of the user',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: 'StrongPass123!',
    description: 'The password of the user (must be strong)',
    minLength: 8,
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(100)
  @IsStrongPassword()
  password: string;

  @ApiProperty({
    enum: UserType,
    example: UserType.STUDENT,
    description: 'The type of user (student or enterprise)',
  })
  @IsEnum(UserType)
  @IsNotEmpty()
  userType: UserType;

  @ApiProperty({
    enum: StudentUniversity,
    example: StudentUniversity.ESTIN,
    description: 'The university of the student',
    required: false,
  })
  @IsEnum(StudentUniversity)
  @ValidateIf((obj) => obj.userType === UserType.STUDENT)
  @IsNotEmpty({ message: 'University is required for student registration' })
  university?: StudentUniversity;

  @ApiProperty({
    enum: EnterpriseSize,
    example: EnterpriseSize.SIZE_51_200,
    description: 'The size of the enterprise',
    required: false,
  })
  @IsEnum(EnterpriseSize)
  @ValidateIf((obj) => obj.userType === UserType.ENTERPRISE)
  @IsNotEmpty({ message: 'Enterprise size is required for enterprise registration' })
  enterpriseSize?: EnterpriseSize;
}
