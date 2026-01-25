import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JobOffer, OfferType } from './job-offer.entity';

@Injectable()
export class JobOffersService {
  constructor(
    @InjectRepository(JobOffer)
    private jobOffersRepository: Repository<JobOffer>,
  ) {}

  async create(jobOfferData: Partial<JobOffer>): Promise<JobOffer> {
    const offer = this.jobOffersRepository.create(jobOfferData);
    return this.jobOffersRepository.save(offer);
  }

  async findAll(type?: OfferType): Promise<JobOffer[]> {
    const query = this.jobOffersRepository
      .createQueryBuilder('offer')
      .leftJoinAndSelect('offer.company', 'company')
      .where('offer.isActive = :active', { active: true });

    if (type) {
      query.andWhere('offer.type = :type', { type });
    }

    return query.getMany();
  }

  async findById(offerId: number): Promise<JobOffer | null> {
    return this.jobOffersRepository.findOne({
      where: { offerId },
      relations: ['company', 'company.user', 'applications'],
    });
  }

  async findByCompanyId(companyId: number): Promise<JobOffer[]> {
    return this.jobOffersRepository.find({
      where: { company: { companyId } },
      relations: ['applications'],
    });
  }

  async update(offerId: number, jobOfferData: Partial<JobOffer>): Promise<JobOffer | null> {
    await this.jobOffersRepository.update(offerId, jobOfferData);
    return this.findById(offerId);
  }

  async delete(offerId: number): Promise<void> {
    await this.jobOffersRepository.delete(offerId);
  }
}
