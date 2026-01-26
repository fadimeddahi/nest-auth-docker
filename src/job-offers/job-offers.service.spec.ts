import { Test, TestingModule } from '@nestjs/testing';
import { JobOffersService } from './job-offers.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JobOffer, OfferType } from './job-offer.entity';

describe('JobOffersService', () => {
  let service: JobOffersService;
  let repository: jest.Mocked<Repository<JobOffer>>;

  const mockJobOffer: JobOffer = {
    offerId: 1,
    title: 'Software Developer Intern',
    type: OfferType.INTERNSHIP,
    description: 'Looking for a talented intern',
    requiredSkills: 'JavaScript, TypeScript, NestJS',
    location: 'Algiers',
    salary: 50000,
    duration: '3 months',
    isActive: true,
    deadline: new Date('2026-06-01'),
    company: { companyId: 1 } as any,
    applications: [],
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
      delete: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JobOffersService,
        {
          provide: getRepositoryToken(JobOffer),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<JobOffersService>(JobOffersService);
    repository = module.get(getRepositoryToken(JobOffer));
  });

  describe('Service Definition', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });
  });

  describe('create', () => {
    it('should create a new job offer', async () => {
      const createData = {
        title: 'New Position',
        type: OfferType.JOB,
        description: 'Full time position',
      };

      repository.create.mockReturnValue({ ...mockJobOffer, ...createData } as JobOffer);
      repository.save.mockResolvedValue({ ...mockJobOffer, ...createData } as JobOffer);

      const result = await service.create(createData);

      expect(result.title).toBe('New Position');
      expect(repository.create).toHaveBeenCalledWith(createData);
      expect(repository.save).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return all active job offers', async () => {
      const queryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockJobOffer]),
      };
      repository.createQueryBuilder.mockReturnValue(queryBuilder as any);

      const result = await service.findAll();

      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('Software Developer Intern');
    });

    it('should filter by type when provided', async () => {
      const queryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockJobOffer]),
      };
      repository.createQueryBuilder.mockReturnValue(queryBuilder as any);

      await service.findAll(OfferType.INTERNSHIP);

      expect(queryBuilder.andWhere).toHaveBeenCalledWith('offer.type = :type', {
        type: OfferType.INTERNSHIP,
      });
    });
  });

  describe('findById', () => {
    it('should return job offer by ID', async () => {
      repository.findOne.mockResolvedValue(mockJobOffer);

      const result = await service.findById(1);

      expect(result?.offerId).toBe(1);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { offerId: 1 },
        relations: ['company', 'company.user', 'applications'],
      });
    });

    it('should return null if not found', async () => {
      repository.findOne.mockResolvedValue(null);

      const result = await service.findById(999);

      expect(result).toBeNull();
    });
  });

  describe('findByCompanyId', () => {
    it('should return job offers for a specific company', async () => {
      repository.find.mockResolvedValue([mockJobOffer]);

      const result = await service.findByCompanyId(1);

      expect(result).toHaveLength(1);
      expect(repository.find).toHaveBeenCalledWith({
        where: { company: { companyId: 1 } },
        relations: ['applications'],
      });
    });
  });

  describe('update', () => {
    it('should update job offer', async () => {
      repository.update.mockResolvedValue({ affected: 1 } as any);
      repository.findOne.mockResolvedValue({
        ...mockJobOffer,
        title: 'Updated Title',
      });

      const result = await service.update(1, { title: 'Updated Title' });

      expect(result?.title).toBe('Updated Title');
      expect(repository.update).toHaveBeenCalledWith(1, { title: 'Updated Title' });
    });
  });

  describe('delete', () => {
    it('should delete job offer', async () => {
      repository.delete.mockResolvedValue({ affected: 1 } as any);

      await service.delete(1);

      expect(repository.delete).toHaveBeenCalledWith(1);
    });
  });
});
