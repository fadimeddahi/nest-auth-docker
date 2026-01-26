import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Student } from './student.entity';

@Entity('education')
export class Education {
  @PrimaryGeneratedColumn()
  educationId: number;

  @Column({ length: 150 })
  school: string;

  @Column({ length: 100 })
  degree: string;

  @Column({ length: 100, nullable: true })
  fieldOfStudy?: string;

  @Column({ type: 'date' })
  startDate: Date;

  @Column({ type: 'date', nullable: true })
  endDate?: Date;

  @ManyToOne(() => Student, (student) => student.education, { onDelete: 'CASCADE' })
  student: Student;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
