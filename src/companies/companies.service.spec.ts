import { Test, TestingModule } from '@nestjs/testing';
import { CompaniesService } from './companies.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Company } from './company.entity';
import { Repository } from 'typeorm';

describe('CompaniesService', () => {
  let service: CompaniesService;
  let repository: jest.Mocked<Repository<Company>>;

  const mockCompany = {
    companyId: 1,
    companyName: 'Tech Corp',
    industry: 'Technology',
    description: 'A leading tech company',
    website: 'https://techcorp.com',
    logoUrl: null,
    isVerified: true,
    user: { userId: 1, email: 'company@example.com', role: 'company' },
    jobOffers: [],
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
        CompaniesService,
        {
          provide: getRepositoryToken(Company),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<CompaniesService>(CompaniesService);
    repository = module.get(getRepositoryToken(Company));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new company', async () => {
      const newCompany = { companyId: 2, companyName: 'New Company' };
      repository.create.mockReturnValue(newCompany as any);
      repository.save.mockResolvedValue(newCompany as any);

      const result = await service.create(2, { companyName: 'New Company' });

      expect(result).toEqual(newCompany);
      expect(repository.create).toHaveBeenCalled();
      expect(repository.save).toHaveBeenCalledWith(newCompany);
    });
  });

  describe('findAll', () => {
    it('should return all verified companies', async () => {
      const companies = [mockCompany];
      repository.find.mockResolvedValue(companies as any);

      const result = await service.findAll();

      expect(result).toEqual(companies);
      expect(repository.find).toHaveBeenCalledWith({
        relations: ['jobOffers'],
        where: { isVerified: true },
      });
    });
  });

  describe('findById', () => {
    it('should return a company by id', async () => {
      repository.findOne.mockResolvedValue(mockCompany as any);

      const result = await service.findById(1);

      expect(result).toEqual(mockCompany);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { companyId: 1 },
        relations: ['jobOffers'],
      });
    });

    it('should return null if company not found', async () => {
      repository.findOne.mockResolvedValue(null);

      const result = await service.findById(999);

      expect(result).toBeNull();
    });
  });

  describe('findByUserId', () => {
    it('should return a company by user id', async () => {
      repository.findOne.mockResolvedValue(mockCompany as any);

      const result = await service.findByUserId(1);

      expect(result).toEqual(mockCompany);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { user: { userId: 1 } },
        relations: ['jobOffers'],
      });
    });

    it('should return null if company not found for user', async () => {
      repository.findOne.mockResolvedValue(null);

      const result = await service.findByUserId(999);

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    const updateData = {
      industry: 'FinTech',
      description: 'Updated description',
    };

    it('should update a company', async () => {
      const updatedCompany = { ...mockCompany, ...updateData };
      repository.update.mockResolvedValue({ affected: 1 } as any);
      repository.findOne.mockResolvedValue(updatedCompany as any);

      const result = await service.update(1, updateData);

      expect(result).toEqual(updatedCompany);
      expect(repository.update).toHaveBeenCalledWith(1, updateData);
    });

    it('should return null if company not found after update', async () => {
      repository.update.mockResolvedValue({ affected: 0 } as any);
      repository.findOne.mockResolvedValue(null);

      const result = await service.update(999, updateData);

      expect(result).toBeNull();
    });
  });
});
