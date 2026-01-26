import { Test, TestingModule } from '@nestjs/testing';
import { CompaniesController } from './companies.controller';
import { CompaniesService } from './companies.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('CompaniesController', () => {
  let controller: CompaniesController;
  let companiesService: jest.Mocked<CompaniesService>;

  const mockCompany = {
    companyId: 1,
    companyName: 'Tech Corp',
    industry: 'Technology',
    description: 'A leading tech company',
    website: 'https://techcorp.com',
    logoUrl: null,
    user: { userId: 1, email: 'company@example.com', role: 'company' },
  };

  beforeEach(async () => {
    const mockCompaniesService = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findByUserId: jest.fn(),
      update: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CompaniesController],
      providers: [
        {
          provide: CompaniesService,
          useValue: mockCompaniesService,
        },
      ],
    }).compile();

    controller = module.get<CompaniesController>(CompaniesController);
    companiesService = module.get(CompaniesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAllCompanies', () => {
    it('should return all companies', async () => {
      const companies = [mockCompany];
      companiesService.findAll.mockResolvedValue(companies as any);

      const result = await controller.getAllCompanies();

      expect(result).toEqual(companies);
      expect(companiesService.findAll).toHaveBeenCalled();
    });
  });

  describe('getProfile', () => {
    it('should return the current user company profile', async () => {
      const req = { user: { userId: 1, role: 'company' } };
      companiesService.findByUserId.mockResolvedValue(mockCompany as any);

      const result = await controller.getProfile(req);

      expect(result).toEqual(mockCompany);
      expect(companiesService.findByUserId).toHaveBeenCalledWith(1);
    });

    it('should return null if profile not found', async () => {
      const req = { user: { userId: 999, role: 'company' } };
      companiesService.findByUserId.mockResolvedValue(null);

      const result = await controller.getProfile(req);

      expect(result).toBeNull();
    });
  });

  describe('updateProfile', () => {
    const updateDto = {
      industry: 'FinTech',
      description: 'Updated description',
    };

    it('should update the current user company profile', async () => {
      const req = { user: { userId: 1, role: 'company' } };
      const updatedCompany = { ...mockCompany, ...updateDto };
      companiesService.findByUserId.mockResolvedValue(mockCompany as any);
      companiesService.update.mockResolvedValue(updatedCompany as any);

      const result = await controller.updateProfile(req, updateDto as any);

      expect(result).toEqual(updatedCompany);
      expect(companiesService.update).toHaveBeenCalledWith(
        mockCompany.companyId,
        updateDto,
      );
    });

    it('should throw NotFoundException if profile not found', async () => {
      const req = { user: { userId: 999, role: 'company' } };
      companiesService.findByUserId.mockResolvedValue(null);

      await expect(
        controller.updateProfile(req, updateDto as any),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if update fails', async () => {
      const req = { user: { userId: 1, role: 'company' } };
      companiesService.findByUserId.mockResolvedValue(mockCompany as any);
      companiesService.update.mockResolvedValue(null);

      await expect(
        controller.updateProfile(req, updateDto as any),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getCompanyById', () => {
    it('should return a company by id', async () => {
      companiesService.findById.mockResolvedValue(mockCompany as any);

      const result = await controller.getCompanyById('1');

      expect(result).toEqual(mockCompany);
      expect(companiesService.findById).toHaveBeenCalledWith(1);
    });

    it('should throw BadRequestException for invalid id', async () => {
      await expect(controller.getCompanyById('invalid')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should return null if company not found', async () => {
      companiesService.findById.mockResolvedValue(null);

      const result = await controller.getCompanyById('999');

      expect(result).toBeNull();
    });
  });
});
