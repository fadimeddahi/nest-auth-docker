import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  UseGuards,
  Request,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ApplicationsService } from './applications.service';
import { StudentsService } from '../students/students.service';
import { JobOffersService } from '../job-offers/job-offers.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationStatusDto } from './dto/update-application-status.dto';
import { ValidationPipe } from '../common/pipes/validation.pipe';
import { Application } from './application.entity';

@ApiTags('Applications')
@Controller('applications')
export class ApplicationsController {
  constructor(
    private applicationsService: ApplicationsService,
    private studentsService: StudentsService,
    private jobOffersService: JobOffersService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Apply for a job offer' })
  @ApiResponse({ status: 201, description: 'Application submitted successfully.' })
  @ApiResponse({ status: 403, description: 'Only students can apply.' })
  @ApiResponse({ status: 404, description: 'Student profile or Job offer not found.' })
  @ApiResponse({ status: 400, description: 'Already applied or invalid data.' })
  async apply(
    @Request() req: any,
    @Body(new ValidationPipe()) createApplicationDto: CreateApplicationDto,
  ): Promise<Application> {
    // Verify user is a student
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (req.user.role !== 'STUDENT') {
      throw new ForbiddenException('Only students can apply for job offers');
    }

    const student = await this.studentsService.findByUserId(req.user.userId);
    if (!student) {
      throw new NotFoundException('Student profile not found');
    }

    if (!createApplicationDto.offerId || isNaN(createApplicationDto.offerId)) {
      throw new BadRequestException('Valid offerId is required');
    }

    const offer = await this.jobOffersService.findById(createApplicationDto.offerId);
    if (!offer) {
      throw new NotFoundException('Job offer not found');
    }

    // Check if already applied
    const existingApplications = await this.applicationsService.findByStudentId(
      student.studentId,
    );
    const alreadyApplied = existingApplications.some(
      (app) => app.jobOffer.offerId === createApplicationDto.offerId,
    );

    if (alreadyApplied) {
      throw new BadRequestException(
        'You have already applied for this job offer',
      );
    }

    return this.applicationsService.apply(
      student.studentId,
      createApplicationDto.offerId,
      createApplicationDto.coverLetter,
      createApplicationDto.cvUrl,
    );
  }

  @Get('my-applications')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get my applications (Student)' })
  @ApiResponse({ status: 200, description: 'Return list of applications.' })
  @ApiResponse({ status: 403, description: 'Only students can view their applications.' })
  async getMyApplications(@Request() req: any): Promise<Application[]> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (req.user.role !== 'STUDENT') {
      throw new ForbiddenException('Only students can view their applications');
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const student = await this.studentsService.findByUserId(req.user.userId);
    if (!student) {
      throw new NotFoundException('Student profile not found');
    }

    return this.applicationsService.findByStudentId(student.studentId);
  }

  @Get('offer/:offerId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get applications by offer ID' })
  @ApiResponse({ status: 200, description: 'Return list of applications.' })
  @ApiResponse({ status: 400, description: 'Invalid offer ID.' })
  async getApplicationsByOffer(
    @Param('offerId') offerId: string,
  ): Promise<Application[]> {
    const id = parseInt(offerId, 10);
    if (isNaN(id)) {
      throw new BadRequestException('Invalid offer ID');
    }

    return this.applicationsService.findByOfferId(id);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get application by ID' })
  @ApiResponse({ status: 200, description: 'Return application details.' })
  @ApiResponse({ status: 400, description: 'Invalid application ID.' })
  async getApplicationById(
    @Param('id') id: string,
  ): Promise<Application | null> {
    const appId = parseInt(id, 10);
    if (isNaN(appId)) {
      throw new BadRequestException('Invalid application ID');
    }

    return this.applicationsService.findById(appId);
  }

  @Put(':id/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update application status' })
  @ApiResponse({ status: 200, description: 'Status updated successfully.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Application not found.' })
  async updateApplicationStatus(
    @Request() req: any,
    @Param('id') id: string,
    @Body(new ValidationPipe()) updateStatusDto: UpdateApplicationStatusDto,
  ): Promise<Application> {
    const appId = parseInt(id, 10);
    if (isNaN(appId)) {
      throw new BadRequestException('Invalid application ID');
    }

    const application = await this.applicationsService.findById(appId);
    if (!application) {
      throw new NotFoundException('Application not found');
    }

    // Only the company that posted the offer can update status
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (application.jobOffer.company.user.userId !== req.user.userId) {
      throw new ForbiddenException(
        'Only the company that posted this offer can update application status',
      );
    }

    const result = await this.applicationsService.updateStatus(
      appId,
      updateStatusDto.status,
    );
    if (!result) {
      throw new NotFoundException('Failed to update application status');
    }

    return result;
  }

  @Put(':id/withdraw')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Withdraw application' })
  @ApiResponse({ status: 200, description: 'Application withdrawn successfully.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Application not found.' })
  async withdrawApplication(
    @Request() req: any,
    @Param('id') id: string,
  ): Promise<{ message: string }> {
    const appId = parseInt(id, 10);
    if (isNaN(appId)) {
      throw new BadRequestException('Invalid application ID');
    }

    const application = await this.applicationsService.findById(appId);
    if (!application) {
      throw new NotFoundException('Application not found');
    }

    // Only the student who applied can withdraw
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const student = await this.studentsService.findByUserId(req.user.userId);
    if (!student || application.student.studentId !== student.studentId) {
      throw new ForbiddenException(
        'Only the student who applied can withdraw the application',
      );
    }

    const result = await this.applicationsService.withdraw(appId);
    if (!result) {
      throw new NotFoundException('Failed to withdraw application');
    }

    return { message: 'Application withdrawn successfully' };
  }
}
