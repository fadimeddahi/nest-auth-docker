import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Companies (e2e)', () => {
  let app: INestApplication;
  let companyToken: string;
  let studentToken: string;
  let companyId: number;

  beforeAll(async () => {
    try {
      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [AppModule],
      }).compile();

      app = moduleFixture.createNestApplication();
      app.useGlobalPipes(new ValidationPipe());
      await app.init();

      // Register a company
      const companyRes = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: `company-profile-${Date.now()}@example.com`,
          password: 'Password123!',
          userType: 'enterprise',
          companyName: 'Profile Test Company',
        });
      companyToken = companyRes.body.access_token;

      // Register a student for role-based testing
      const studentRes = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: `student-companies-${Date.now()}@example.com`,
          password: 'Password123!',
          userType: 'student',
          firstName: 'Test',
          lastName: 'Student',
        });
      studentToken = studentRes.body.access_token;
    } catch (error) {
      console.error('Failed to initialize app:', error.message);
      throw error;
    }
  }, 60000);

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  describe('GET /companies', () => {
    it('should return all companies', async () => {
      const response = await request(app.getHttpServer())
        .get('/companies')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should work without authentication (public endpoint)', async () => {
      const response = await request(app.getHttpServer())
        .get('/companies')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('GET /companies/me', () => {
    it('should return current company profile', async () => {
      const response = await request(app.getHttpServer())
        .get('/companies/me')
        .set('Authorization', `Bearer ${companyToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('companyId');
      expect(response.body.companyName).toBe('Profile Test Company');
      companyId = response.body.companyId;
    });

    it('should fail without authentication', async () => {
      await request(app.getHttpServer()).get('/companies/me').expect(401);
    });

    it('should fail for student users', async () => {
      await request(app.getHttpServer())
        .get('/companies/me')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(403);
    });
  });

  describe('GET /companies/:id', () => {
    it('should return a company by id', async () => {
      const response = await request(app.getHttpServer())
        .get(`/companies/${companyId}`)
        .expect(200);

      expect(response.body.companyId).toBe(companyId);
      expect(response.body.companyName).toBe('Profile Test Company');
    });

    it('should return 404 for non-existent company', async () => {
      await request(app.getHttpServer()).get('/companies/99999').expect(404);
    });
  });

  describe('PUT /companies/me', () => {
    it('should update current company profile', async () => {
      const response = await request(app.getHttpServer())
        .put('/companies/me')
        .set('Authorization', `Bearer ${companyToken}`)
        .send({
          industry: 'Technology',
          description: 'A leading tech company',
          website: 'https://company.example.com',
        })
        .expect(200);

      expect(response.body.industry).toBe('Technology');
      expect(response.body.description).toBe('A leading tech company');
      expect(response.body.website).toBe('https://company.example.com');
    });

    it('should update only specific fields', async () => {
      const response = await request(app.getHttpServer())
        .put('/companies/me')
        .set('Authorization', `Bearer ${companyToken}`)
        .send({
          industry: 'FinTech',
        })
        .expect(200);

      expect(response.body.industry).toBe('FinTech');
      // Other fields should remain unchanged
      expect(response.body.description).toBe('A leading tech company');
    });

    it('should fail without authentication', async () => {
      await request(app.getHttpServer())
        .put('/companies/me')
        .send({
          industry: 'Unauthorized',
        })
        .expect(401);
    });

    it('should fail for student users', async () => {
      await request(app.getHttpServer())
        .put('/companies/me')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          industry: 'Student Trying Update',
        })
        .expect(403);
    });
  });

  describe('GET /companies/:id/job-offers', () => {
    let jobOfferId: number;

    beforeAll(async () => {
      if (!app) return;
      // Create a job offer for the company
      const offerRes = await request(app.getHttpServer())
        .post('/job-offers')
        .set('Authorization', `Bearer ${companyToken}`)
        .send({
          title: 'Company Job Offer',
          type: 'job',
          description: 'A job offer from this company',
        });
      jobOfferId = offerRes.body.offerId;
    });

    it('should return job offers for a company', async () => {
      const response = await request(app.getHttpServer())
        .get(`/companies/${companyId}/job-offers`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('offerId');
    });

    it('should return empty array for company with no offers', async () => {
      // Register another company without offers
      const newCompanyRes = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: `no-offers-company-${Date.now()}@example.com`,
          password: 'Password123!',
          userType: 'enterprise',
          companyName: 'No Offers Company',
        });

      // Get the company profile to get the ID
      const profileRes = await request(app.getHttpServer())
        .get('/companies/me')
        .set('Authorization', `Bearer ${newCompanyRes.body.access_token}`);

      const response = await request(app.getHttpServer())
        .get(`/companies/${profileRes.body.companyId}/job-offers`)
        .expect(200);

      expect(response.body).toEqual([]);
    });
  });
});
