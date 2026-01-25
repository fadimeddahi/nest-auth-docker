import { Controller, Get, Put, Body, UseGuards, Request, NotFoundException, BadRequestException, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { StudentsService } from './students.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateStudentDto } from './dto/update-student.dto';
import { ValidationPipe } from '../common/pipes/validation.pipe';
import { Student } from './student.entity';

@ApiTags('Students')
@Controller('students')
export class StudentsController {
  constructor(private studentsService: StudentsService) {}

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current student profile' })
  @ApiResponse({ status: 200, description: 'Return student profile.' })
  @ApiResponse({ status: 404, description: 'Student profile not found.' })
  async getProfile(@Request() req): Promise<any> {
    const student = await this.studentsService.findByUserId(req.user.userId);
    if (!student) {
      throw new NotFoundException('Student profile not found');
    }

    return {
      statusCode: 200,
      id: student.studentId,
      userId: student.user?.userId,
      firstName: student.firstName,
      lastName: student.lastName,
      email: student.user?.email,
      university: student.university,
      bio: student.bio,
      phone: student.phone,
      location: student.location,
      portfolioUrl: student.portfolioUrl,
      githubUrl: student.githubUrl,
      linkedinUrl: student.linkedinUrl,
      skills: student.skills || [],
      experiences: student.experiences || [],
      createdAt: student.createdAt,
    };
  }

  @Put('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update student profile' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully.' })
  @ApiResponse({ status: 404, description: 'Student profile not found.' })
  async updateProfile(
    @Request() req,
    @Body(new ValidationPipe()) updateStudentDto: UpdateStudentDto,
  ): Promise<any> {
    const student = await this.studentsService.findByUserId(req.user.userId);
    if (!student) {
      throw new NotFoundException('Student profile not found');
    }

    const result = await this.studentsService.update(student.studentId, updateStudentDto);
    if (!result) {
      throw new NotFoundException('Failed to update student profile');
    }

    return {
      statusCode: 200,
      message: 'Profile updated successfully',
      id: result.studentId,
      userId: result.user?.userId,
      firstName: result.firstName,
      lastName: result.lastName,
      email: result.user?.email,
      university: result.university,
      bio: result.bio,
      phone: result.phone,
      location: result.location,
      portfolioUrl: result.portfolioUrl,
      githubUrl: result.githubUrl,
      linkedinUrl: result.linkedinUrl,
      skills: result.skills || [],
      experiences: result.experiences || [],
      createdAt: result.createdAt,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get student by ID' })
  @ApiResponse({ status: 200, description: 'Return student details.' })
  @ApiResponse({ status: 400, description: 'Invalid student ID.' })
  async getStudentById(@Param('id') id: string): Promise<Student | null> {
    const studentId = parseInt(id, 10);
    if (isNaN(studentId)) {
      throw new BadRequestException('Invalid student ID');
    }

    return this.studentsService.findById(studentId);
  }
}
