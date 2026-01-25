import { Controller, Get, Put, Body, UseGuards, Request, NotFoundException, BadRequestException, Param, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { StudentsService } from './students.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateStudentDto } from './dto/update-student.dto';
import { ValidationPipe } from '../common/pipes/validation.pipe';
import { Student } from './student.entity';
import { ApplicationsService } from '../applications/applications.service';

@ApiTags('Students')
@Controller('students')
export class StudentsController {
  constructor(
    private studentsService: StudentsService,
    private applicationsService: ApplicationsService,
  ) {}

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

  @Get('dashboard/stats')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get student dashboard statistics' })
  @ApiResponse({ status: 200, description: 'Return dashboard stats.' })
  @ApiResponse({ status: 404, description: 'Student profile not found.' })
  async getDashboardStats(@Request() req): Promise<any> {
    const student = await this.studentsService.findByUserId(req.user.userId);
    if (!student) {
      throw new NotFoundException('Student profile not found');
    }

    const applications = student.applications || [];
    const totalApplications = applications.length;
    const pendingReviews = applications.filter((app: any) => app.status === 'pending').length;
    const interviews = applications.filter((app: any) => app.status === 'interview').length;
    const offers = applications.filter((app: any) => app.status === 'accepted').length;

    return {
      statusCode: 200,
      totalApplications,
      pendingReviews,
      interviews,
      offers,
      applications: applications.map((app: any) => ({
        applicationId: app.applicationId,
        jobTitle: app.jobOffer?.title,
        company: app.jobOffer?.company?.companyName,
        status: app.status,
        appliedDate: app.createdAt,
      })),
    };
  }

  @Get('applications')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get student applications' })
  @ApiResponse({ status: 200, description: 'Return list of applications.' })
  @ApiResponse({ status: 404, description: 'Student profile not found.' })
  async getApplications(@Request() req): Promise<any> {
    const student = await this.studentsService.findByUserId(req.user.userId);
    if (!student) {
      throw new NotFoundException('Student profile not found');
    }

    const applications = await this.applicationsService.findByStudentId(student.studentId);

    return {
      statusCode: 200,
      applications: applications.map((app: any) => ({
        applicationId: app.applicationId,
        jobOffer: {
          offerId: app.jobOffer?.offerId,
          title: app.jobOffer?.title,
          type: app.jobOffer?.type,
          location: app.jobOffer?.location,
          salary: app.jobOffer?.salary,
          company: {
            companyId: app.jobOffer?.company?.companyId,
            companyName: app.jobOffer?.company?.companyName,
            location: app.jobOffer?.company?.location,
            logoUrl: app.jobOffer?.company?.logoUrl,
          },
        },
        status: app.status,
        coverLetter: app.coverLetter,
        cvUrl: app.cvUrl,
        appliedDate: app.createdAt,
        updatedDate: app.updatedAt,
      })),
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
