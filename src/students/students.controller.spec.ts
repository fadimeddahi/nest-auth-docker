import { Test, TestingModule } from '@nestjs/testing';
import { StudentsController } from './students.controller';
import { StudentsService } from './students.service';
import { ApplicationsService } from '../applications/applications.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('StudentsController', () => {
  let controller: StudentsController;
  let studentsService: jest.Mocked<StudentsService>;
  let applicationsService: jest.Mocked<ApplicationsService>;

  const mockStudent = {
    studentId: 1,
    firstName: 'John',
    lastName: 'Doe',
    university: 'Test University',
    bio: 'A dedicated student',
    phone: '1234567890',
    location: 'Algiers',
    portfolioUrl: null,
    githubUrl: null,
    linkedinUrl: null,
    createdAt: new Date(),
    user: { userId: 1, email: 'john@example.com', role: 'student' },
    skills: [],
    experiences: [],
    applications: [],
  };

  beforeEach(async () => {
    const mockStudentsService = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findByUserId: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    };

    const mockApplicationsService = {
      findByStudentId: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [StudentsController],
      providers: [
        {
          provide: StudentsService,
          useValue: mockStudentsService,
        },
        {
          provide: ApplicationsService,
          useValue: mockApplicationsService,
        },
      ],
    }).compile();

    controller = module.get<StudentsController>(StudentsController);
    studentsService = module.get(StudentsService);
    applicationsService = module.get(ApplicationsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getProfile', () => {
    it('should return the current user student profile', async () => {
      const req = { user: { userId: 1, role: 'student' } };
      studentsService.findByUserId.mockResolvedValue(mockStudent as any);

      const result = await controller.getProfile(req);

      expect(result).toHaveProperty('statusCode', 200);
      expect(result).toHaveProperty('firstName', 'John');
      expect(result).toHaveProperty('lastName', 'Doe');
      expect(studentsService.findByUserId).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException if profile not found', async () => {
      const req = { user: { userId: 999, role: 'student' } };
      studentsService.findByUserId.mockResolvedValue(null);

      await expect(controller.getProfile(req)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateProfile', () => {
    const updateDto = {
      university: 'New University',
      bio: 'Updated bio',
    };

    it('should update the current user profile', async () => {
      const req = { user: { userId: 1, role: 'student' } };
      const updatedStudent = { ...mockStudent, ...updateDto };
      studentsService.findByUserId.mockResolvedValue(mockStudent as any);
      studentsService.update.mockResolvedValue(updatedStudent as any);

      const result = await controller.updateProfile(req, updateDto as any);

      expect(result).toHaveProperty('statusCode', 200);
      expect(result).toHaveProperty('message', 'Profile updated successfully');
      expect(studentsService.update).toHaveBeenCalledWith(
        mockStudent.studentId,
        updateDto,
      );
    });

    it('should throw NotFoundException if profile not found', async () => {
      const req = { user: { userId: 999, role: 'student' } };
      studentsService.findByUserId.mockResolvedValue(null);

      await expect(
        controller.updateProfile(req, updateDto as any),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if update fails', async () => {
      const req = { user: { userId: 1, role: 'student' } };
      studentsService.findByUserId.mockResolvedValue(mockStudent as any);
      studentsService.update.mockResolvedValue(null);

      await expect(
        controller.updateProfile(req, updateDto as any),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getStudentById', () => {
    it('should return a student by id', async () => {
      studentsService.findById.mockResolvedValue(mockStudent as any);

      const result = await controller.getStudentById('1');

      expect(result).toEqual(mockStudent);
      expect(studentsService.findById).toHaveBeenCalledWith(1);
    });

    it('should throw BadRequestException for invalid id', async () => {
      await expect(controller.getStudentById('invalid')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('getDashboardStats', () => {
    it('should return dashboard statistics', async () => {
      const req = { user: { userId: 1, role: 'student' } };
      const studentWithApps = {
        ...mockStudent,
        applications: [
          { applicationId: 1, status: 'pending', jobOffer: { title: 'Dev' } },
          { applicationId: 2, status: 'accepted', jobOffer: { title: 'QA' } },
        ],
      };
      studentsService.findByUserId.mockResolvedValue(studentWithApps as any);

      const result = await controller.getDashboardStats(req);

      expect(result).toHaveProperty('statusCode', 200);
      expect(result).toHaveProperty('totalApplications', 2);
      expect(result).toHaveProperty('pendingReviews', 1);
      expect(result).toHaveProperty('offers', 1);
    });

    it('should throw NotFoundException if profile not found', async () => {
      const req = { user: { userId: 999, role: 'student' } };
      studentsService.findByUserId.mockResolvedValue(null);

      await expect(controller.getDashboardStats(req)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getApplications', () => {
    it('should return student applications', async () => {
      const req = { user: { userId: 1, role: 'student' } };
      const mockApplications = [
        {
          applicationId: 1,
          status: 'pending',
          jobOffer: {
            offerId: 1,
            title: 'Developer',
            company: { companyName: 'Tech Corp' },
          },
        },
      ];
      studentsService.findByUserId.mockResolvedValue(mockStudent as any);
      applicationsService.findByStudentId.mockResolvedValue(
        mockApplications as any,
      );

      const result = await controller.getApplications(req);

      expect(result).toHaveProperty('statusCode', 200);
      expect(result.applications).toHaveLength(1);
      expect(applicationsService.findByStudentId).toHaveBeenCalledWith(
        mockStudent.studentId,
      );
    });

    it('should throw NotFoundException if profile not found', async () => {
      const req = { user: { userId: 999, role: 'student' } };
      studentsService.findByUserId.mockResolvedValue(null);

      await expect(controller.getApplications(req)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
