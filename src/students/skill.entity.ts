import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Student } from '../students/student.entity';

@Entity('skills')
export class Skill {
  @PrimaryGeneratedColumn()
  skillId: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  proficiency?: string; // e.g., "Beginner", "Intermediate", "Advanced"

  @ManyToOne(() => Student, (student) => student.skills, { onDelete: 'CASCADE' })
  student: Student;

  @CreateDateColumn()
  createdAt: Date;
}
