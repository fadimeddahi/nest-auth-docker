import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { JobOffer } from '../job-offers/job-offer.entity';

@Entity('companies')
export class Company {
  @PrimaryGeneratedColumn()
  companyId: number;

  @OneToOne(() => User, (user) => user.company)
  user: User;

  @Column()
  companyName: string;

  @Column({ nullable: true })
  industry?: string;

  @Column({ nullable: true })
  location?: string;

  @Column({ nullable: true })
  website?: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ nullable: true })
  logoUrl?: string;

  @Column({ nullable: true })
  phone?: string;

  @Column({ default: false })
  isVerified: boolean;

  @Column({ nullable: true })
  enterpriseSize?: string;

  @OneToMany(() => JobOffer, (offer) => offer.company, { cascade: true })
  jobOffers: JobOffer[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
