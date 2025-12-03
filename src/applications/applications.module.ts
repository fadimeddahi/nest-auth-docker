import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApplicationsService } from './applications.service';
import { ApplicationsController } from './applications.controller';
import { Application } from './application.entity';
import { StudentsModule } from '../students/students.module';
import { JobOffersModule } from '../job-offers/job-offers.module';

@Module({
  imports: [TypeOrmModule.forFeature([Application]), StudentsModule, JobOffersModule],
  providers: [ApplicationsService],
  controllers: [ApplicationsController],
  exports: [ApplicationsService],
})
export class ApplicationsModule {}
