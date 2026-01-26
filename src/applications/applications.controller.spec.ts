import { Test, TestingModule } from '@nestjs/testing';
import { ApplicationsController } from './applications.controller';
import { ApplicationsService } from './applications.service';
import { StudentsService } from '../students/students.service';
import { JobOffersService } from '../job-offers/job-offers.service';
import { CompaniesService } from '../companies/companies.service';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';

describe('ApplicationsController', () => {
  let controller: ApplicationsController;
  let applicationsService: jest.Mocked<ApplicationsService>;
  let studentsService: jest.Mocked<StudentsService>;
  let jobOffersService: jest.Mocked<JobOffersService>;
  let companiesService: jest.Mocked<CompaniesService>;

  const mockStudent = {
    studentId: 1,
    firstName: 'John',
    lastName: 'Doe',
    user: { userId: 1 },
  };

  const mockCompany = {
    companyId: 1,
    companyName: 'Tech Corp',
    user: { userId: 2 },
  };

  const mockJobOffer = {
    offerId: 1,
    title: 'Developer',
    company: mockCompany,
    isActive: true,
  };

  const mockApplication = {
    applicationId: 1,
    status: 'pending',
    coverLetter: 'Test cover letter',
    student: mockStudent,
    jobOffer: {
      ...mockJobOffer,
      company: { ...mockCompany, user: { userId: 2 } },
    },
  };

  const studentRequest = { user: { userId: 1, role: 'student' } };
  const companyRequest = { user: { userId: 2, role: 'company' } };

  beforeEach(async () => {
    const mockApplicationsService = {
      apply: jest.fn(),
      findByStudentId: jest.fn(),
      findByOfferId: jest.fn(),
      findByCompanyId: jest.fn(),
      findById: jest.fn(),
      updateStatus: jest.fn(),
      withdraw: jest.fn(),
    };

    const mockStudentsService = {
      findByUserId: jest.fn(),
    };

    const mockJobOffersService = {
      findById: jest.fn(),
    };

    const mockCompaniesService = {
      findByUserId: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ApplicationsController],
      providers: [
        { provide: ApplicationsService, useValue: mockApplicationsService },
        { provide: StudentsService, useValue: mockStudentsService },
        { provide: JobOffersService, useValue: mockJobOffersService },
        { provide: CompaniesService, useValue: mockCompaniesService },
      ],
    }).compile();

    controller = module.get<ApplicationsController>(ApplicationsController);
    applicationsService = module.get(ApplicationsService);
    studentsService = module.get(StudentsService);
    jobOffersService = module.get(JobOffersService);
    companiesService = module.get(CompaniesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('apply', () => {
    const applyDto = { coverLetter: 'I am interested in this position' };

    it('should create a new application', async () => {
      studentsService.findByUserId.mockResolvedValue(mockStudent as any);
      jobOffersService.findById.mockResolvedValue(mockJobOffer as any);
      applicationsService.findByStudentId.mockResolvedValue([]);
      applicationsService.apply.mockResolvedValue(mockApplication as any);

      const result = await controller.apply(
        studentRequest,
        '1',
        applyDto as any,
      );

      expect(result).toEqual(mockApplication);
      expect(applicationsService.apply).toHaveBeenCalledWith(
        mockStudent.studentId,
        1,
        applyDto.coverLetter,
        undefined,
      );
    });

    it('should throw ForbiddenException for non-student users', async () => {
      await expect(
        controller.apply(companyRequest, '1', applyDto as any),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException if student profile not found', async () => {
      studentsService.findByUserId.mockResolvedValue(null);

      await expect(
        controller.apply(studentRequest, '1', applyDto as any),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException for invalid offerId', async () => {
      studentsService.findByUserId.mockResolvedValue(mockStudent as any);

      await expect(
        controller.apply(studentRequest, 'invalid', applyDto as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if job offer not found', async () => {
      studentsService.findByUserId.mockResolvedValue(mockStudent as any);
      jobOffersService.findById.mockResolvedValue(null);

      await expect(
        controller.apply(studentRequest, '1', applyDto as any),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if already applied', async () => {
      studentsService.findByUserId.mockResolvedValue(mockStudent as any);
      jobOffersService.findById.mockResolvedValue(mockJobOffer as any);
      applicationsService.findByStudentId.mockResolvedValue([
        { jobOffer: { offerId: 1 } },
      ] as any);

      await expect(
        controller.apply(studentRequest, '1', applyDto as any),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getMyApplications', () => {
    it('should return student applications', async () => {
      studentsService.findByUserId.mockResolvedValue(mockStudent as any);
      applicationsService.findByStudentId.mockResolvedValue([
        mockApplication,
      ] as any);

      const result = await controller.getMyApplications(studentRequest);

      expect(result).toHaveLength(1);
      expect(applicationsService.findByStudentId).toHaveBeenCalledWith(
        mockStudent.studentId,
      );
    });

    it('should throw ForbiddenException for non-student users', async () => {
      await expect(
        controller.getMyApplications(companyRequest),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException if student profile not found', async () => {
      studentsService.findByUserId.mockResolvedValue(null);

      await expect(
        controller.getMyApplications(studentRequest),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getCompanyApplications', () => {
    it('should return all company applications', async () => {
      companiesService.findByUserId.mockResolvedValue(mockCompany as any);
      applicationsService.findByCompanyId.mockResolvedValue([
        mockApplication,
      ] as any);

      const result = await controller.getCompanyApplications(companyRequest);

      expect(result).toHaveLength(1);
      expect(applicationsService.findByCompanyId).toHaveBeenCalledWith(
        mockCompany.companyId,
      );
    });

    it('should throw ForbiddenException for non-company users', async () => {
      await expect(
        controller.getCompanyApplications(studentRequest),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException if company profile not found', async () => {
      companiesService.findByUserId.mockResolvedValue(null);

      await expect(
        controller.getCompanyApplications(companyRequest),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getApplicationsByOffer', () => {
    it('should return applications for an offer', async () => {
      applicationsService.findByOfferId.mockResolvedValue([
        mockApplication,
      ] as any);

      const result = await controller.getApplicationsByOffer('1');

      expect(result).toHaveLength(1);
      expect(applicationsService.findByOfferId).toHaveBeenCalledWith(1);
    });

    it('should throw BadRequestException for invalid offerId', async () => {
      await expect(
        controller.getApplicationsByOffer('invalid'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getApplicationById', () => {
    it('should return an application by id', async () => {
      applicationsService.findById.mockResolvedValue(mockApplication as any);

      const result = await controller.getApplicationById('1');

      expect(result).toEqual(mockApplication);
      expect(applicationsService.findById).toHaveBeenCalledWith(1);
    });

    it('should throw BadRequestException for invalid id', async () => {
      await expect(controller.getApplicationById('invalid')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('updateApplicationStatus', () => {
    const updateDto = { status: 'accepted' };

    it('should update application status', async () => {
      const applicationWithCompanyUser = {
        ...mockApplication,
        jobOffer: {
          ...mockJobOffer,
          company: { ...mockCompany, user: { userId: 2 } },
        },
      };
      applicationsService.findById.mockResolvedValue(
        applicationWithCompanyUser as any,
      );
      applicationsService.updateStatus.mockResolvedValue({
        ...mockApplication,
        status: 'accepted',
      } as any);

      const result = await controller.updateApplicationStatus(
        companyRequest,
        '1',
        updateDto as any,
      );

      expect(result.status).toBe('accepted');
    });

    it('should throw NotFoundException if application not found', async () => {
      applicationsService.findById.mockResolvedValue(null);

      await expect(
        controller.updateApplicationStatus(
          companyRequest,
          '1',
          updateDto as any,
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if not offer owner', async () => {
      const applicationWithDifferentOwner = {
        ...mockApplication,
        jobOffer: {
          ...mockJobOffer,
          company: { ...mockCompany, user: { userId: 999 } },
        },
      };
      applicationsService.findById.mockResolvedValue(
        applicationWithDifferentOwner as any,
      );

      await expect(
        controller.updateApplicationStatus(
          companyRequest,
          '1',
          updateDto as any,
        ),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('withdrawApplication', () => {
    it('should withdraw an application', async () => {
      studentsService.findByUserId.mockResolvedValue(mockStudent as any);
      applicationsService.findById.mockResolvedValue(mockApplication as any);
      applicationsService.withdraw.mockResolvedValue({
        ...mockApplication,
        status: 'withdrawn',
      } as any);

      const result = await controller.withdrawApplication(studentRequest, '1');

      expect(result).toHaveProperty(
        'message',
        'Application withdrawn successfully',
      );
    });

    it('should throw NotFoundException if application not found', async () => {
      applicationsService.findById.mockResolvedValue(null);

      await expect(
        controller.withdrawApplication(studentRequest, '1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if not application owner', async () => {
      const otherStudent = { studentId: 999, user: { userId: 999 } };
      studentsService.findByUserId.mockResolvedValue(otherStudent as any);
      applicationsService.findById.mockResolvedValue(mockApplication as any);

      await expect(
        controller.withdrawApplication(
          { user: { userId: 999, role: 'student' } },
          '1',
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException if withdraw fails', async () => {
      studentsService.findByUserId.mockResolvedValue(mockStudent as any);
      applicationsService.findById.mockResolvedValue(mockApplication as any);
      applicationsService.withdraw.mockResolvedValue(null);

      await expect(
        controller.withdrawApplication(studentRequest, '1'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
