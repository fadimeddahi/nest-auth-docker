import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Student } from '../students/student.entity';
import { JobOffer } from '../job-offers/job-offer.entity';

export enum ApplicationStatus {
  PENDING = 'pending',
  VIEWED = 'viewed',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  WITHDRAWN = 'withdrawn',
}

@Entity('applications')
export class Application {
  @PrimaryGeneratedColumn()
  applicationId: number;

  @ManyToOne(() => Student, (student) => student.applications, { onDelete: 'CASCADE' })
  student: Student;

  @ManyToOne(() => JobOffer, (offer) => offer.applications, { onDelete: 'CASCADE' })
  jobOffer: JobOffer;

  @Column({ type: 'enum', enum: ApplicationStatus, default: ApplicationStatus.PENDING })
  status: ApplicationStatus;

  @Column({ type: 'text', nullable: true })
  coverLetter?: string;

  @Column({ nullable: true })
  cvUrl?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
