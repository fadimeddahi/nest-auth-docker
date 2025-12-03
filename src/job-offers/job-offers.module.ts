import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobOffersService } from './job-offers.service';
import { JobOffersController } from './job-offers.controller';
import { JobOffer } from './job-offer.entity';
import { CompaniesModule } from '../companies/companies.module';

@Module({
  imports: [TypeOrmModule.forFeature([JobOffer]), CompaniesModule],
  providers: [JobOffersService],
  controllers: [JobOffersController],
  exports: [JobOffersService],
})
export class JobOffersModule {}
