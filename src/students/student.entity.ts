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
import { Skill } from './skill.entity';
import { Experience } from './experience.entity';
import { Education } from './education.entity';
import { Application } from '../applications/application.entity';

@Entity('students')
export class Student {
  @PrimaryGeneratedColumn()
  studentId: number;

  @OneToOne(() => User, (user) => user.student)
  user: User;

  @Column({ nullable: true })
  firstName?: string;

  @Column({ nullable: true })
  lastName?: string;

  @Column({ nullable: true })
  university?: string;

  @Column({ nullable: true })
  phone?: string;

  @Column({ nullable: true })
  location?: string;

  @Column({ type: 'text', nullable: true })
  bio?: string;

  @Column({ nullable: true })
  portfolioUrl?: string;

  @Column({ nullable: true })
  githubUrl?: string;

  @Column({ nullable: true })
  linkedinUrl?: string;

  @Column({ nullable: true })
  profileImageUrl?: string;

  @OneToMany(() => Skill, (skill) => skill.student, { cascade: true })
  skills: Skill[];

  @OneToMany(() => Experience, (experience) => experience.student, {
    cascade: true,
  })
  experiences: Experience[];

  @OneToMany(() => Education, (education) => education.student, {
    cascade: true,
  })
  education: Education[];

  @OneToMany(() => Application, (application) => application.student)
  applications: Application[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
