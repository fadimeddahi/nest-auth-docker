import { Test, TestingModule } from '@nestjs/testing';
import { ApplicationsService } from './applications.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Application, ApplicationStatus } from './application.entity';
import { Repository } from 'typeorm';

describe('ApplicationsService', () => {
  let service: ApplicationsService;
  let repository: jest.Mocked<Repository<Application>>;

  const mockApplication = {
    applicationId: 1,
    status: ApplicationStatus.PENDING,
    coverLetter: 'Test cover letter',
    cvUrl: null,
    student: { studentId: 1, firstName: 'John' },
    jobOffer: { offerId: 1, title: 'Developer', company: { companyId: 1 } },
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const mockRepository = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicationsService,
        {
          provide: getRepositoryToken(Application),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<ApplicationsService>(ApplicationsService);
    repository = module.get(getRepositoryToken(Application));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('apply', () => {
    it('should create a new application', async () => {
      repository.create.mockReturnValue(mockApplication as any);
      repository.save.mockResolvedValue(mockApplication as any);

      const result = await service.apply(1, 1, 'Cover letter', undefined);

      expect(result.applicationId).toBe(1);
      expect(result.status).toBe(ApplicationStatus.PENDING);
      expect(repository.create).toHaveBeenCalled();
      expect(repository.save).toHaveBeenCalledWith(mockApplication);
    });
  });

  describe('findByStudentId', () => {
    it('should return applications for a student', async () => {
      repository.find.mockResolvedValue([mockApplication] as any);

      const result = await service.findByStudentId(1);

      expect(result).toHaveLength(1);
      expect(result[0].student.studentId).toBe(1);
      expect(repository.find).toHaveBeenCalledWith({
        where: { student: { studentId: 1 } },
        relations: ['jobOffer', 'jobOffer.company'],
      });
    });
  });

  describe('findByOfferId', () => {
    it('should return applications for an offer', async () => {
      repository.find.mockResolvedValue([mockApplication] as any);

      const result = await service.findByOfferId(1);

      expect(result).toHaveLength(1);
      expect(repository.find).toHaveBeenCalledWith({
        where: { jobOffer: { offerId: 1 } },
        relations: ['student'],
      });
    });
  });

  describe('findByCompanyId', () => {
    it('should return all applications for a company', async () => {
      repository.find.mockResolvedValue([mockApplication] as any);

      const result = await service.findByCompanyId(1);

      expect(result).toHaveLength(1);
      expect(repository.find).toHaveBeenCalledWith({
        where: { jobOffer: { company: { companyId: 1 } } },
        relations: ['student', 'student.user', 'jobOffer', 'jobOffer.company'],
      });
    });
  });

  describe('findById', () => {
    it('should return application by ID', async () => {
      repository.findOne.mockResolvedValue(mockApplication as any);

      const result = await service.findById(1);

      expect(result?.applicationId).toBe(1);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { applicationId: 1 },
        relations: ['student', 'jobOffer', 'jobOffer.company'],
      });
    });

    it('should return null if application not found', async () => {
      repository.findOne.mockResolvedValue(null);

      const result = await service.findById(999);

      expect(result).toBeNull();
    });
  });

  describe('updateStatus', () => {
    it('should update application status', async () => {
      const updatedApplication = {
        ...mockApplication,
        status: ApplicationStatus.ACCEPTED,
      };
      repository.update.mockResolvedValue({ affected: 1 } as any);
      repository.findOne.mockResolvedValue(updatedApplication as any);

      const result = await service.updateStatus(1, ApplicationStatus.ACCEPTED);

      expect(result?.status).toBe(ApplicationStatus.ACCEPTED);
      expect(repository.update).toHaveBeenCalledWith(1, {
        status: ApplicationStatus.ACCEPTED,
      });
    });

    it('should return null if application not found', async () => {
      repository.update.mockResolvedValue({ affected: 0 } as any);
      repository.findOne.mockResolvedValue(null);

      const result = await service.updateStatus(
        999,
        ApplicationStatus.ACCEPTED,
      );

      expect(result).toBeNull();
    });
  });

  describe('withdraw', () => {
    it('should withdraw an application', async () => {
      const withdrawnApplication = {
        ...mockApplication,
        status: ApplicationStatus.WITHDRAWN,
      };
      repository.update.mockResolvedValue({ affected: 1 } as any);
      repository.findOne.mockResolvedValue(withdrawnApplication as any);

      const result = await service.withdraw(1);

      expect(result?.status).toBe(ApplicationStatus.WITHDRAWN);
    });
  });
});
