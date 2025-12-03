import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Company } from '../companies/company.entity';
import { Application } from '../applications/application.entity';

export enum OfferType {
  INTERNSHIP = 'internship',
  PFE = 'pfe', // Projet de fin d'études
  JOB = 'job',
}

@Entity('job_offers')
export class JobOffer {
  @PrimaryGeneratedColumn()
  offerId: number;

  @Column()
  title: string;

  @Column({ type: 'enum', enum: OfferType })
  type: OfferType;

  @Column({ type: 'text' })
  description: string;

  @Column({ nullable: true })
  requiredSkills?: string; // JSON array stored as string

  @Column({ nullable: true })
  location?: string;

  @Column({ type: 'decimal', nullable: true })
  salary?: number;

  @Column({ nullable: true })
  duration?: string; // e.g., "3 months", "6 months"

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  deadline?: Date;

  @ManyToOne(() => Company, (company) => company.jobOffers, { onDelete: 'CASCADE' })
  company: Company;

  @OneToMany(() => Application, (application) => application.jobOffer, {
    cascade: true,
  })
  applications: Application[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
