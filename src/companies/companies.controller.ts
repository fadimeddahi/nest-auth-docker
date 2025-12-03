import {
  Controller,
  Get,
  Put,
  Body,
  UseGuards,
  Request,
  NotFoundException,
  BadRequestException,
  Param,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CompaniesService } from './companies.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { ValidationPipe } from '../common/pipes/validation.pipe';
import { Company } from './company.entity';

@ApiTags('Companies')
@Controller('companies')
export class CompaniesController {
  constructor(private companiesService: CompaniesService) {}

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current company profile' })
  @ApiResponse({ status: 200, description: 'Return company profile.' })
  @ApiResponse({ status: 404, description: 'Company profile not found.' })
  async getProfile(@Request() req: any): Promise<Company | null> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    return this.companiesService.findByUserId(req.user.userId);
  }

  @Put('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update company profile' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully.' })
  @ApiResponse({ status: 404, description: 'Company profile not found.' })
  async updateProfile(
    @Request() req: any,
    @Body(new ValidationPipe()) updateCompanyDto: UpdateCompanyDto,
  ): Promise<Company> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const company = await this.companiesService.findByUserId(req.user.userId);
    if (!company) {
      throw new NotFoundException('Company profile not found');
    }

    const result = await this.companiesService.update(
      company.companyId,
      updateCompanyDto,
    );
    if (!result) {
      throw new NotFoundException('Failed to update company profile');
    }

    return result;
  }

  @Get()
  @ApiOperation({ summary: 'List all companies' })
  @ApiResponse({ status: 200, description: 'Return list of companies.' })
  async getAllCompanies(): Promise<Company[]> {
    return this.companiesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get company by ID' })
  @ApiResponse({ status: 200, description: 'Return company details.' })
  @ApiResponse({ status: 400, description: 'Invalid company ID.' })
  async getCompanyById(@Param('id') id: string): Promise<Company | null> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const companyId = parseInt(id, 10);
    if (isNaN(companyId)) {
      throw new BadRequestException('Invalid company ID');
    }

    return this.companiesService.findById(companyId);
  }
}
