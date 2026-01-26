import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student } from './student.entity';
import { Skill } from './skill.entity';
import { Experience } from './experience.entity';
import { Education } from './education.entity';
import { CreateSkillDto } from './dto/create-skill.dto';
import { CreateExperienceDto } from './dto/create-experience.dto';
import { CreateEducationDto } from './dto/create-education.dto';

@Injectable()
export class StudentsService {
  constructor(
    @InjectRepository(Student)
    private studentsRepository: Repository<Student>,
    @InjectRepository(Skill)
    private skillsRepository: Repository<Skill>,
    @InjectRepository(Experience)
    private experiencesRepository: Repository<Experience>,
    @InjectRepository(Education)
    private educationRepository: Repository<Education>,
  ) {}

  async findByUserId(userId: number): Promise<Student | null> {
    return this.studentsRepository.findOne({
      where: { user: { userId } },
      relations: ['user', 'skills', 'experiences', 'education', 'applications', 'applications.jobOffer', 'applications.jobOffer.company'],
    });
  }

  async create(userId: number, studentData: Partial<Student>): Promise<Student> {
    const student = this.studentsRepository.create({
      ...studentData,
      user: { userId } as any,
    });
    return this.studentsRepository.save(student);
  }

  async update(studentId: number, studentData: Partial<Student>): Promise<Student | null> {
    await this.studentsRepository.update(studentId, studentData);
    return this.studentsRepository.findOne({
      where: { studentId },
      relations: ['user', 'skills', 'experiences', 'education', 'applications', 'applications.jobOffer', 'applications.jobOffer.company'],
    });
  }

  async findById(studentId: number): Promise<Student | null> {
    return this.studentsRepository.findOne({
      where: { studentId },
      relations: ['user', 'skills', 'experiences', 'education', 'applications', 'applications.jobOffer', 'applications.jobOffer.company'],
    });
  }

  async addSkill(studentId: number, createSkillDto: CreateSkillDto): Promise<Skill> {
    const skill = this.skillsRepository.create({
      name: createSkillDto.name,
      proficiency: createSkillDto.level || 'Intermediate',
      student: { studentId } as any,
    });
    return this.skillsRepository.save(skill);
  }

  async updateSkill(skillId: number, createSkillDto: CreateSkillDto): Promise<Skill | null> {
    await this.skillsRepository.update(skillId, {
      name: createSkillDto.name,
      proficiency: createSkillDto.level || 'Intermediate',
    });
    return this.skillsRepository.findOne({
      where: { skillId },
    });
  }

  async deleteSkill(skillId: number): Promise<boolean> {
    const result = await this.skillsRepository.delete(skillId);
    return (result.affected ?? 0) > 0;
  }

  async addExperience(studentId: number, createExperienceDto: CreateExperienceDto): Promise<Experience> {
    const experience = this.experiencesRepository.create({
      title: createExperienceDto.position,
      company: createExperienceDto.company,
      description: createExperienceDto.description,
      startDate: createExperienceDto.startDate ? new Date(createExperienceDto.startDate) : undefined,
      endDate: createExperienceDto.endDate ? new Date(createExperienceDto.endDate) : undefined,
      student: { studentId } as any,
    });
    return this.experiencesRepository.save(experience);
  }

  async updateExperience(experienceId: number, createExperienceDto: CreateExperienceDto): Promise<Experience | null> {
    const updateData: any = {
      title: createExperienceDto.position,
      company: createExperienceDto.company,
      description: createExperienceDto.description,
    };
    
    if (createExperienceDto.startDate) {
      updateData.startDate = new Date(createExperienceDto.startDate);
    }
    if (createExperienceDto.endDate) {
      updateData.endDate = new Date(createExperienceDto.endDate);
    }
    
    await this.experiencesRepository.update(experienceId, updateData);
    return this.experiencesRepository.findOne({
      where: { experienceId },
    });
  }

  async deleteExperience(experienceId: number): Promise<boolean> {
    const result = await this.experiencesRepository.delete(experienceId);
    return (result.affected ?? 0) > 0;
  }

  async addEducation(studentId: number, createEducationDto: CreateEducationDto): Promise<Education> {
    const education = this.educationRepository.create({
      school: createEducationDto.school,
      degree: createEducationDto.degree,
      fieldOfStudy: createEducationDto.fieldOfStudy,
      startDate: new Date(createEducationDto.startDate),
      endDate: createEducationDto.endDate ? new Date(createEducationDto.endDate) : undefined,
      student: { studentId } as any,
    });
    return this.educationRepository.save(education);
  }

  async updateEducation(educationId: number, createEducationDto: CreateEducationDto): Promise<Education | null> {
    const updateData: any = {
      school: createEducationDto.school,
      degree: createEducationDto.degree,
      fieldOfStudy: createEducationDto.fieldOfStudy,
      startDate: new Date(createEducationDto.startDate),
    };
    
    if (createEducationDto.endDate) {
      updateData.endDate = new Date(createEducationDto.endDate);
    }
    
    await this.educationRepository.update(educationId, updateData);
    return this.educationRepository.findOne({
      where: { educationId },
    });
  }

  async deleteEducation(educationId: number): Promise<boolean> {
    const result = await this.educationRepository.delete(educationId);
    return (result.affected ?? 0) > 0;
  }
}
