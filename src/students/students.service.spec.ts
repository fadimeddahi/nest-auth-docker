import { Test, TestingModule } from '@nestjs/testing';
import { StudentsService } from './students.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Student } from './student.entity';
import { Skill } from './skill.entity';
import { Experience } from './experience.entity';
import { Education } from './education.entity';
import { Repository } from 'typeorm';

describe('StudentsService', () => {
  let service: StudentsService;
  let repository: jest.Mocked<Repository<Student>>;
  let skillRepository: jest.Mocked<Repository<Skill>>;
  let experienceRepository: jest.Mocked<Repository<Experience>>;
  let educationRepository: jest.Mocked<Repository<Education>>;

  const mockStudent = {
    studentId: 1,
    firstName: 'John',
    lastName: 'Doe',
    university: 'Test University',
    bio: 'A dedicated student',
    phone: '1234567890',
    location: 'Algiers',
    user: { userId: 1, email: 'student@example.com', role: 'student' },
    skills: [],
    experiences: [],
    applications: [],
  };

  beforeEach(async () => {
    const mockRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
    };

    const mockSkillRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const mockExperienceRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const mockEducationRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StudentsService,
        {
          provide: getRepositoryToken(Student),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(Skill),
          useValue: mockSkillRepository,
        },
        {
          provide: getRepositoryToken(Experience),
          useValue: mockExperienceRepository,
        },
        {
          provide: getRepositoryToken(Education),
          useValue: mockEducationRepository,
        },
      ],
    }).compile();

    service = module.get<StudentsService>(StudentsService);
    repository = module.get(getRepositoryToken(Student));
    skillRepository = module.get(getRepositoryToken(Skill));
    experienceRepository = module.get(getRepositoryToken(Experience));
    educationRepository = module.get(getRepositoryToken(Education));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new student profile', async () => {
      const createData = { firstName: 'Jane', lastName: 'Smith' };
      const newStudent = { studentId: 2, ...createData };

      repository.create.mockReturnValue(newStudent as any);
      repository.save.mockResolvedValue(newStudent as any);

      const result = await service.create(1, createData);

      expect(result.firstName).toBe('Jane');
      expect(repository.create).toHaveBeenCalled();
      expect(repository.save).toHaveBeenCalledWith(newStudent);
    });
  });

  describe('findById', () => {
    it('should return student by ID', async () => {
      repository.findOne.mockResolvedValue(mockStudent as any);

      const result = await service.findById(1);

      expect(result?.studentId).toBe(1);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { studentId: 1 },
        relations: [
          'user',
          'skills',
          'experiences',
          'education',
          'applications',
          'applications.jobOffer',
          'applications.jobOffer.company',
        ],
      });
    });

    it('should return null if student not found', async () => {
      repository.findOne.mockResolvedValue(null);

      const result = await service.findById(999);

      expect(result).toBeNull();
    });
  });

  describe('findByUserId', () => {
    it('should return student by user ID', async () => {
      repository.findOne.mockResolvedValue(mockStudent as any);

      const result = await service.findByUserId(1);

      expect(result?.studentId).toBe(1);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { user: { userId: 1 } },
        relations: [
          'user',
          'skills',
          'experiences',
          'education',
          'applications',
          'applications.jobOffer',
          'applications.jobOffer.company',
        ],
      });
    });

    it('should return null if student not found for user', async () => {
      repository.findOne.mockResolvedValue(null);

      const result = await service.findByUserId(999);

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    const updateData = {
      university: 'New University',
      bio: 'Updated bio',
    };

    it('should update a student profile', async () => {
      const updatedStudent = { ...mockStudent, ...updateData };
      repository.update.mockResolvedValue({ affected: 1 } as any);
      repository.findOne.mockResolvedValue(updatedStudent as any);

      const result = await service.update(1, updateData);

      expect(result?.university).toBe('New University');
      expect(repository.update).toHaveBeenCalledWith(1, updateData);
    });

    it('should return null if student not found after update', async () => {
      repository.update.mockResolvedValue({ affected: 0 } as any);
      repository.findOne.mockResolvedValue(null);

      const result = await service.update(999, updateData);

      expect(result).toBeNull();
    });
  });

  describe('addSkill', () => {
    it('should add a skill to student profile', async () => {
      const skillData = { name: 'TypeScript', level: 'Advanced' };
      const newSkill = { skillId: 1, ...skillData, createdAt: new Date() };

      skillRepository.create.mockReturnValue(newSkill as any);
      skillRepository.save.mockResolvedValue(newSkill as any);

      const result = await service.addSkill(1, skillData);

      expect(result.name).toBe('TypeScript');
      expect(skillRepository.create).toHaveBeenCalled();
      expect(skillRepository.save).toHaveBeenCalled();
    });
  });

  describe('deleteSkill', () => {
    it('should delete a skill', async () => {
      skillRepository.delete.mockResolvedValue({ affected: 1 } as any);

      const result = await service.deleteSkill(1);

      expect(result).toBe(true);
      expect(skillRepository.delete).toHaveBeenCalledWith(1);
    });

    it('should return false if skill not found', async () => {
      skillRepository.delete.mockResolvedValue({ affected: 0 } as any);

      const result = await service.deleteSkill(999);

      expect(result).toBe(false);
    });
  });

  describe('addExperience', () => {
    it('should add an experience to student profile', async () => {
      const expData = {
        position: 'Senior Developer',
        company: 'TechCorp',
        description: 'Led team projects',
        startDate: '2023-01-01',
        endDate: '2024-12-31',
      };
      const newExp = { experienceId: 1, title: expData.position, company: expData.company, description: expData.description, startDate: new Date(expData.startDate), endDate: new Date(expData.endDate), createdAt: new Date() };

      experienceRepository.create.mockReturnValue(newExp as any);
      experienceRepository.save.mockResolvedValue(newExp as any);

      const result = await service.addExperience(1, expData as any);

      expect(result.title).toBe('Senior Developer');
      expect(experienceRepository.create).toHaveBeenCalled();
      expect(experienceRepository.save).toHaveBeenCalled();
    });
  });

  describe('deleteExperience', () => {
    it('should delete an experience', async () => {
      experienceRepository.delete.mockResolvedValue({ affected: 1 } as any);

      const result = await service.deleteExperience(1);

      expect(result).toBe(true);
      expect(experienceRepository.delete).toHaveBeenCalledWith(1);
    });

    it('should return false if experience not found', async () => {
      experienceRepository.delete.mockResolvedValue({ affected: 0 } as any);

      const result = await service.deleteExperience(999);

      expect(result).toBe(false);
    });
  });
});
