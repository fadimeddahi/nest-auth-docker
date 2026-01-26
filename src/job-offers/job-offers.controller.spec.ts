import { Test, TestingModule } from '@nestjs/testing';
import { JobOffersController } from './job-offers.controller';
import { JobOffersService } from './job-offers.service';
import { CompaniesService } from '../companies/companies.service';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { JobOffer, OfferType } from './job-offer.entity';

describe('JobOffersController', () => {
  let controller: JobOffersController;
  let jobOffersService: jest.Mocked<JobOffersService>;
  let companiesService: jest.Mocked<CompaniesService>;

  const mockCompany = {
    companyId: 1,
    companyName: 'Test Company',
    user: { userId: 1 },
  };

  const mockJobOffer: JobOffer = {
    offerId: 1,
    title: 'Software Developer Intern',
    type: OfferType.INTERNSHIP,
    description: 'Looking for a talented intern',
    requiredSkills: 'JavaScript, TypeScript',
    location: 'Algiers',
    salary: 50000,
    duration: '3 months',
    isActive: true,
    deadline: new Date('2026-06-01'),
    company: mockCompany as any,
    applications: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockRequest = {
    user: { userId: 1, role: 'company' },
  };

  beforeEach(async () => {
    const mockJobOffersService = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findByCompanyId: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const mockCompaniesService = {
      findByUserId: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [JobOffersController],
      providers: [
        { provide: JobOffersService, useValue: mockJobOffersService },
        { provide: CompaniesService, useValue: mockCompaniesService },
      ],
    }).compile();

    controller = module.get<JobOffersController>(JobOffersController);
    jobOffersService = module.get(JobOffersService);
    companiesService = module.get(CompaniesService);
  });

  describe('Controller Definition', () => {
    it('should be defined', () => {
      expect(controller).toBeDefined();
    });
  });

  describe('getAllOffers', () => {
    it('should return all job offers', async () => {
      jobOffersService.findAll.mockResolvedValue([mockJobOffer]);

      const result = await controller.getAllOffers();

      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('Software Developer Intern');
    });
  });

  describe('getOffersByType', () => {
    it('should return offers filtered by type', async () => {
      jobOffersService.findAll.mockResolvedValue([mockJobOffer]);

      const result = await controller.getOffersByType('internship');

      expect(result).toHaveLength(1);
      expect(jobOffersService.findAll).toHaveBeenCalledWith(OfferType.INTERNSHIP);
    });

    it('should throw BadRequestException for invalid type', async () => {
      await expect(controller.getOffersByType('invalid')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('getOffersByCompany', () => {
    it('should return offers for a specific company', async () => {
      jobOffersService.findByCompanyId.mockResolvedValue([mockJobOffer]);

      const result = await controller.getOffersByCompany('1');

      expect(result).toHaveLength(1);
      expect(jobOffersService.findByCompanyId).toHaveBeenCalledWith(1);
    });

    it('should throw BadRequestException for invalid company ID', async () => {
      await expect(controller.getOffersByCompany('invalid')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('getOfferById', () => {
    it('should return job offer by ID', async () => {
      jobOffersService.findById.mockResolvedValue(mockJobOffer);

      const result = await controller.getOfferById('1');

      expect(result?.offerId).toBe(1);
    });

    it('should throw BadRequestException for invalid ID', async () => {
      await expect(controller.getOfferById('invalid')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('createOffer', () => {
    const createDto = {
      title: 'New Job',
      type: OfferType.JOB,
      description: 'Full time position',
    };

    it('should create a new job offer', async () => {
      companiesService.findByUserId.mockResolvedValue(mockCompany as any);
      jobOffersService.create.mockResolvedValue(mockJobOffer);

      const result = await controller.createOffer(mockRequest, createDto as any);

      expect(result.offerId).toBe(1);
      expect(jobOffersService.create).toHaveBeenCalled();
    });

    it('should throw ForbiddenException for non-company users', async () => {
      const studentRequest = { user: { userId: 1, role: 'student' } };

      await expect(
        controller.createOffer(studentRequest, createDto as any),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException if company profile not found', async () => {
      companiesService.findByUserId.mockResolvedValue(null);

      await expect(
        controller.createOffer(mockRequest, createDto as any),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateOffer', () => {
    const updateDto = { title: 'Updated Title' };

    it('should update job offer', async () => {
      jobOffersService.findById.mockResolvedValue(mockJobOffer);
      jobOffersService.update.mockResolvedValue({ ...mockJobOffer, ...updateDto });

      const result = await controller.updateOffer(mockRequest, '1', updateDto as any);

      expect(result.title).toBe('Updated Title');
    });

    it('should throw NotFoundException if offer not found', async () => {
      jobOffersService.findById.mockResolvedValue(null);

      await expect(
        controller.updateOffer(mockRequest, '1', updateDto as any),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if not owner', async () => {
      const otherUserRequest = { user: { userId: 999, role: 'company' } };
      jobOffersService.findById.mockResolvedValue(mockJobOffer);

      await expect(
        controller.updateOffer(otherUserRequest, '1', updateDto as any),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('deleteOffer', () => {
    it('should delete job offer', async () => {
      jobOffersService.findById.mockResolvedValue(mockJobOffer);
      jobOffersService.delete.mockResolvedValue(undefined);

      const result = await controller.deleteOffer(mockRequest, '1');

      expect(result.message).toBe('Job offer deleted successfully');
      expect(jobOffersService.delete).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException if offer not found', async () => {
      jobOffersService.findById.mockResolvedValue(null);

      await expect(controller.deleteOffer(mockRequest, '1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException if not owner', async () => {
      const otherUserRequest = { user: { userId: 999, role: 'company' } };
      jobOffersService.findById.mockResolvedValue(mockJobOffer);

      await expect(controller.deleteOffer(otherUserRequest, '1')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});
