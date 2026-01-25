import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student } from './student.entity';

@Injectable()
export class StudentsService {
  constructor(
    @InjectRepository(Student)
    private studentsRepository: Repository<Student>,
  ) {}

  async findByUserId(userId: number): Promise<Student | null> {
    return this.studentsRepository.findOne({
      where: { user: { userId } },
      relations: ['user', 'skills', 'experiences', 'applications'],
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
      relations: ['user', 'skills', 'experiences', 'applications'],
    });
  }

  async findById(studentId: number): Promise<Student | null> {
    return this.studentsRepository.findOne({
      where: { studentId },
      relations: ['user', 'skills', 'experiences', 'applications'],
    });
  }
}
