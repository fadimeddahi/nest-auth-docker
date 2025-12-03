import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Student } from '../students/student.entity';
import { Company } from '../companies/company.entity';

export enum UserRole {
  STUDENT = 'student',
  COMPANY = 'company',
  ADMIN = 'admin',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  userId: number;

  @Column({ unique: true })
  username: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.STUDENT })
  role: UserRole;

  @Column({ default: false })
  isVerified: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToOne(() => Student, (student) => student.user, { nullable: true })
  @JoinColumn()
  student?: Student;

  @OneToOne(() => Company, (company) => company.user, { nullable: true })
  @JoinColumn()
  company?: Company;
}
