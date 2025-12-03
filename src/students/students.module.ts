import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentsService } from './students.service';
import { StudentsController } from './students.controller';
import { Student } from './student.entity';
import { Skill } from './skill.entity';
import { Experience } from './experience.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Student, Skill, Experience])],
  providers: [StudentsService],
  controllers: [StudentsController],
  exports: [StudentsService],
})
export class StudentsModule {}
