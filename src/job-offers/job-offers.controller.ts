import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { JobOffersService } from './job-offers.service';
import { CompaniesService } from '../companies/companies.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateJobOfferDto } from './dto/create-job-offer.dto';
import { UpdateJobOfferDto } from './dto/update-job-offer.dto';
import { ValidationPipe } from '../common/pipes/validation.pipe';
import { JobOffer, OfferType } from './job-offer.entity';

@ApiTags('Job Offers')
@Controller('job-offers')
export class JobOffersController {
  constructor(
    private jobOffersService: JobOffersService,
    private companiesService: CompaniesService,
  ) {}

  @Get()
  @SkipThrottle()
  @ApiOperation({ summary: 'List all job offers' })
  @ApiResponse({ status: 200, description: 'Return list of job offers.' })
  async getAllOffers(): Promise<JobOffer[]> {
    return this.jobOffersService.findAll();
  }

  @Get('type/:type')
  @SkipThrottle()
  @ApiOperation({ summary: 'List job offers by type' })
  @ApiParam({ name: 'type', enum: OfferType })
  @ApiResponse({ status: 200, description: 'Return list of job offers.' })
  @ApiResponse({ status: 400, description: 'Invalid offer type.' })
  async getOffersByType(@Param('type') type: string): Promise<JobOffer[]> {
    if (!Object.values(OfferType).includes(type as OfferType)) {
      throw new BadRequestException(
        `Invalid offer type. Must be one of: ${Object.values(OfferType).join(
          ', ',
        )}`,
      );
    }

    return this.jobOffersService.findAll(type as OfferType);
  }

  @Get('company/:companyId')
  @SkipThrottle()
  @ApiOperation({ summary: 'List job offers by company' })
  @ApiResponse({ status: 200, description: 'Return list of job offers.' })
  @ApiResponse({ status: 400, description: 'Invalid company ID.' })
  async getOffersByCompany(
    @Param('companyId') companyId: string,
  ): Promise<JobOffer[]> {
    const id = parseInt(companyId, 10);
    if (isNaN(id)) {
      throw new BadRequestException('Invalid company ID');
    }

    return this.jobOffersService.findByCompanyId(id);
  }

  @Get(':id')
  @SkipThrottle()
  @ApiOperation({ summary: 'Get job offer by ID' })
  @ApiResponse({ status: 200, description: 'Return job offer details.' })
  @ApiResponse({ status: 400, description: 'Invalid offer ID.' })
  async getOfferById(@Param('id') id: string): Promise<JobOffer | null> {
    const offerId = parseInt(id, 10);
    if (isNaN(offerId)) {
      throw new BadRequestException('Invalid offer ID');
    }

    return this.jobOffersService.findById(offerId);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new job offer' })
  @ApiResponse({ status: 201, description: 'Job offer created successfully.' })
  @ApiResponse({ status: 403, description: 'Only companies can create job offers.' })
  @ApiResponse({ status: 404, description: 'Company profile not found.' })
  async createOffer(
    @Request() req: any,
    @Body(new ValidationPipe()) createJobOfferDto: CreateJobOfferDto,
  ): Promise<JobOffer> {
    // Verify user is a company
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (req.user.role !== 'company') {
      throw new ForbiddenException('Only companies can create job offers');
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const company = await this.companiesService.findByUserId(req.user.userId);
    if (!company) {
      throw new NotFoundException('Company profile not found');
    }

    const jobOfferData = {
      ...createJobOfferDto,
      company,
    };

    return this.jobOffersService.create(jobOfferData);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a job offer' })
  @ApiResponse({ status: 200, description: 'Job offer updated successfully.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Job offer not found.' })
  async updateOffer(
    @Request() req: any,
    @Param('id') id: string,
    @Body(new ValidationPipe()) updateJobOfferDto: UpdateJobOfferDto,
  ): Promise<JobOffer> {
    const offerId = parseInt(id, 10);
    if (isNaN(offerId)) {
      throw new BadRequestException('Invalid offer ID');
    }

    const offer = await this.jobOffersService.findById(offerId);
    if (!offer) {
      throw new NotFoundException('Job offer not found');
    }

    // Verify user is the owner of the offer
    if (offer.company.user.userId !== req.user.userId) {
      throw new ForbiddenException('You can only update your own job offers');
    }

    const result = await this.jobOffersService.update(
      offerId,
      updateJobOfferDto,
    );
    if (!result) {
      throw new NotFoundException('Failed to update job offer');
    }

    return result;
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a job offer' })
  @ApiResponse({ status: 200, description: 'Job offer deleted successfully.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Job offer not found.' })
  async deleteOffer(
    @Request() req: any,
    @Param('id') id: string,
  ): Promise<{ message: string }> {
    const offerId = parseInt(id, 10);
    if (isNaN(offerId)) {
      throw new BadRequestException('Invalid offer ID');
    }

    const offer = await this.jobOffersService.findById(offerId);
    if (!offer) {
      throw new NotFoundException('Job offer not found');
    }

    // Verify user is the owner of the offer
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (offer.company.user.userId !== req.user.userId) {
      throw new ForbiddenException('You can only delete your own job offers');
    }

    await this.jobOffersService.delete(offerId);
    return { message: 'Job offer deleted successfully' };
  }
}
