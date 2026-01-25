import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Application, ApplicationStatus } from './application.entity';

@Injectable()
export class ApplicationsService {
  constructor(
    @InjectRepository(Application)
    private applicationsRepository: Repository<Application>,
  ) {}

  async apply(
    studentId: number,
    offerId: number,
    coverLetter?: string,
    cvUrl?: string,
  ): Promise<Application> {
    const application = this.applicationsRepository.create({
      student: { studentId },
      jobOffer: { offerId },
      coverLetter,
      cvUrl,
    });
    return this.applicationsRepository.save(application);
  }

  async findByStudentId(studentId: number): Promise<Application[]> {
    return this.applicationsRepository.find({
      where: { student: { studentId } },
      relations: ['jobOffer', 'jobOffer.company'],
    });
  }

  async findByOfferId(offerId: number): Promise<Application[]> {
    return this.applicationsRepository.find({
      where: { jobOffer: { offerId } },
      relations: ['student'],
    });
  }

  async updateStatus(applicationId: number, status: ApplicationStatus): Promise<Application | null> {
    await this.applicationsRepository.update(applicationId, { status });
    return this.applicationsRepository.findOne({
      where: { applicationId },
      relations: ['student', 'jobOffer', 'jobOffer.company'],
    });
  }

  async findById(applicationId: number): Promise<Application | null> {
    return this.applicationsRepository.findOne({
      where: { applicationId },
      relations: ['student', 'jobOffer', 'jobOffer.company'],
    });
  }

  async withdraw(applicationId: number): Promise<Application | null> {
    return this.updateStatus(applicationId, ApplicationStatus.WITHDRAWN);
  }

  async findByCompanyId(companyId: number): Promise<Application[]> {
    return this.applicationsRepository.find({
      where: { jobOffer: { company: { companyId } } },
      relations: ['student', 'student.user', 'jobOffer', 'jobOffer.company'],
    });
  }
}
