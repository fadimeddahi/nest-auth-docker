import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from './company.entity';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectRepository(Company)
    private companiesRepository: Repository<Company>,
  ) {}

  async findByUserId(userId: number): Promise<Company | null> {
    return this.companiesRepository.findOne({
      where: { user: { userId } },
      relations: ['jobOffers'],
    });
  }

  async create(userId: number, companyData: Partial<Company>): Promise<Company> {
    const company = this.companiesRepository.create({
      ...companyData,
      user: { userId } as any,
    });
    return this.companiesRepository.save(company);
  }

  async update(companyId: number, companyData: Partial<Company>): Promise<Company | null> {
    await this.companiesRepository.update(companyId, companyData);
    return this.companiesRepository.findOne({
      where: { companyId },
      relations: ['jobOffers'],
    });
  }

  async findById(companyId: number): Promise<Company | null> {
    return this.companiesRepository.findOne({
      where: { companyId },
      relations: ['jobOffers'],
    });
  }

  async findAll(): Promise<Company[]> {
    return this.companiesRepository.find({
      relations: ['jobOffers'],
      where: { isVerified: true },
    });
  }
}
