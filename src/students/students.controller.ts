import { Controller, Get, Put, Post, Body, UseGuards, Request, NotFoundException, BadRequestException, Param, HttpCode, ConflictException, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { StudentsService } from './students.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateStudentDto } from './dto/update-student.dto';
import { CreateSkillDto } from './dto/create-skill.dto';
import { CreateExperienceDto } from './dto/create-experience.dto';
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
      profileImageUrl: student.profileImageUrl,
      skills: student.skills || [],
      experiences: student.experiences || [],
      createdAt: student.createdAt,
    };
  }

  @Post('profile/create')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create or complete student profile (for users without profile)' })
  @ApiResponse({ status: 201, description: 'Student profile created successfully.' })
  @ApiResponse({ status: 409, description: 'Student profile already exists.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  async createProfile(
    @Request() req,
    @Body(new ValidationPipe()) createStudentDto: any,
  ): Promise<any> {
    // Check if profile already exists
    const existingStudent = await this.studentsService.findByUserId(req.user.userId);
    if (existingStudent) {
      throw new ConflictException('Student profile already exists. Use PUT /students/profile to update.');
    }

    // Create new student profile
    const result = await this.studentsService.create(req.user.userId, {
      firstName: createStudentDto.firstName,
      lastName: createStudentDto.lastName,
      university: createStudentDto.university,
      bio: createStudentDto.bio,
      phone: createStudentDto.phone,
      location: createStudentDto.location,
      portfolioUrl: createStudentDto.portfolioUrl,
      githubUrl: createStudentDto.githubUrl,
      linkedinUrl: createStudentDto.linkedinUrl,
    });

    return {
      statusCode: 201,
      message: 'Student profile created successfully',
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
      profileImageUrl: result.profileImageUrl,
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
      profileImageUrl: result.profileImageUrl,
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

  @Post('skills')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add a skill to student profile' })
  @ApiResponse({ status: 201, description: 'Skill added successfully.' })
  @ApiResponse({ status: 404, description: 'Student profile not found.' })
  async addSkill(
    @Request() req,
    @Body(new ValidationPipe()) createSkillDto: CreateSkillDto,
  ): Promise<any> {
    const student = await this.studentsService.findByUserId(req.user.userId);
    if (!student) {
      throw new NotFoundException('Student profile not found');
    }

    const skill = await this.studentsService.addSkill(student.studentId, createSkillDto);
    return {
      statusCode: 201,
      message: 'Skill added successfully',
      skill,
    };
  }

  @Put('skills/:skillId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a skill' })
  @ApiResponse({ status: 200, description: 'Skill updated successfully.' })
  @ApiResponse({ status: 404, description: 'Skill not found.' })
  async updateSkill(
    @Request() req,
    @Param('skillId') skillId: string,
    @Body(new ValidationPipe()) createSkillDto: CreateSkillDto,
  ): Promise<any> {
    const id = parseInt(skillId, 10);
    if (isNaN(id)) {
      throw new BadRequestException('Invalid skill ID');
    }

    const skill = await this.studentsService.updateSkill(id, createSkillDto);
    if (!skill) {
      throw new NotFoundException('Skill not found');
    }

    return {
      statusCode: 200,
      message: 'Skill updated successfully',
      skill,
    };
  }

  @Delete('skills/:skillId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a skill' })
  @ApiResponse({ status: 200, description: 'Skill deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Skill not found.' })
  async deleteSkill(
    @Request() req,
    @Param('skillId') skillId: string,
  ): Promise<any> {
    const id = parseInt(skillId, 10);
    if (isNaN(id)) {
      throw new BadRequestException('Invalid skill ID');
    }

    const deleted = await this.studentsService.deleteSkill(id);
    if (!deleted) {
      throw new NotFoundException('Skill not found');
    }

    return {
      statusCode: 200,
      message: 'Skill deleted successfully',
    };
  }

  @Post('experiences')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add an experience to student profile' })
  @ApiResponse({ status: 201, description: 'Experience added successfully.' })
  @ApiResponse({ status: 404, description: 'Student profile not found.' })
  async addExperience(
    @Request() req,
    @Body(new ValidationPipe()) createExperienceDto: CreateExperienceDto,
  ): Promise<any> {
    const student = await this.studentsService.findByUserId(req.user.userId);
    if (!student) {
      throw new NotFoundException('Student profile not found');
    }

    const experience = await this.studentsService.addExperience(student.studentId, createExperienceDto);
    return {
      statusCode: 201,
      message: 'Experience added successfully',
      experience,
    };
  }

  @Put('experiences/:experienceId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update an experience' })
  @ApiResponse({ status: 200, description: 'Experience updated successfully.' })
  @ApiResponse({ status: 404, description: 'Experience not found.' })
  async updateExperience(
    @Request() req,
    @Param('experienceId') experienceId: string,
    @Body(new ValidationPipe()) createExperienceDto: CreateExperienceDto,
  ): Promise<any> {
    const id = parseInt(experienceId, 10);
    if (isNaN(id)) {
      throw new BadRequestException('Invalid experience ID');
    }

    const experience = await this.studentsService.updateExperience(id, createExperienceDto);
    if (!experience) {
      throw new NotFoundException('Experience not found');
    }

    return {
      statusCode: 200,
      message: 'Experience updated successfully',
      experience,
    };
  }

  @Delete('experiences/:experienceId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete an experience' })
  @ApiResponse({ status: 200, description: 'Experience deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Experience not found.' })
  async deleteExperience(
    @Request() req,
    @Param('experienceId') experienceId: string,
  ): Promise<any> {
    const id = parseInt(experienceId, 10);
    if (isNaN(id)) {
      throw new BadRequestException('Invalid experience ID');
    }

    const deleted = await this.studentsService.deleteExperience(id);
    if (!deleted) {
      throw new NotFoundException('Experience not found');
    }

    return {
      statusCode: 200,
      message: 'Experience deleted successfully',
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
