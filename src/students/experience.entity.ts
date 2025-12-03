import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Student } from '../students/student.entity';

@Entity('experiences')
export class Experience {
  @PrimaryGeneratedColumn()
  experienceId: number;

  @Column()
  title: string;

  @Column()
  company: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ nullable: true })
  startDate?: Date;

  @Column({ nullable: true })
  endDate?: Date;

  @ManyToOne(() => Student, (student) => student.experiences, { onDelete: 'CASCADE' })
  student: Student;

  @CreateDateColumn()
  createdAt: Date;
}
