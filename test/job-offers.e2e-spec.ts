import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Job Offers (e2e)', () => {
  let app: INestApplication;
  let companyToken: string;
  let studentToken: string;
  let createdOfferId: number;

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
          email: `company-offers-${Date.now()}@example.com`,
          password: 'Password123!',
          userType: 'enterprise',
          companyName: 'Test Offers Company',
        });
      companyToken = companyRes.body.access_token;

      // Register a student
      const studentRes = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: `student-offers-${Date.now()}@example.com`,
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

  describe('GET /job-offers', () => {
    it('should return all job offers (public)', async () => {
      const response = await request(app.getHttpServer())
        .get('/job-offers')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('GET /job-offers/type/:type', () => {
    it('should return offers filtered by type', async () => {
      const response = await request(app.getHttpServer())
        .get('/job-offers/type/internship')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should fail with invalid type', async () => {
      await request(app.getHttpServer())
        .get('/job-offers/type/invalid')
        .expect(400);
    });
  });

  describe('POST /job-offers', () => {
    it('should create a new job offer (company only)', async () => {
      const response = await request(app.getHttpServer())
        .post('/job-offers')
        .set('Authorization', `Bearer ${companyToken}`)
        .send({
          title: 'Test Developer Position',
          type: 'internship',
          description: 'We are looking for a talented developer',
          location: 'Algiers',
          duration: '3 months',
        })
        .expect(201);

      expect(response.body).toHaveProperty('offerId');
      expect(response.body.title).toBe('Test Developer Position');
      createdOfferId = response.body.offerId;
    });

    it('should fail for student users', async () => {
      await request(app.getHttpServer())
        .post('/job-offers')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          title: 'Test Position',
          type: 'internship',
          description: 'Description',
        })
        .expect(403);
    });

    it('should fail without authentication', async () => {
      await request(app.getHttpServer())
        .post('/job-offers')
        .send({
          title: 'Test Position',
          type: 'internship',
          description: 'Description',
        })
        .expect(401);
    });

    it('should fail with missing required fields', async () => {
      await request(app.getHttpServer())
        .post('/job-offers')
        .set('Authorization', `Bearer ${companyToken}`)
        .send({
          title: 'Test Position',
          // missing type and description
        })
        .expect(400);
    });
  });

  describe('GET /job-offers/:id', () => {
    it('should return job offer by ID', async () => {
      const response = await request(app.getHttpServer())
        .get(`/job-offers/${createdOfferId}`)
        .expect(200);

      expect(response.body.offerId).toBe(createdOfferId);
    });

    it('should fail with invalid ID format', async () => {
      await request(app.getHttpServer())
        .get('/job-offers/invalid')
        .expect(400);
    });
  });

  describe('PUT /job-offers/:id', () => {
    it('should update job offer (owner only)', async () => {
      const response = await request(app.getHttpServer())
        .put(`/job-offers/${createdOfferId}`)
        .set('Authorization', `Bearer ${companyToken}`)
        .send({
          title: 'Updated Developer Position',
        })
        .expect(200);

      expect(response.body.title).toBe('Updated Developer Position');
    });

    it('should fail for non-owner', async () => {
      // Create another company
      const otherCompanyRes = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: `other-company-${Date.now()}@example.com`,
          password: 'Password123!',
          userType: 'enterprise',
          companyName: 'Other Company',
        });

      await request(app.getHttpServer())
        .put(`/job-offers/${createdOfferId}`)
        .set('Authorization', `Bearer ${otherCompanyRes.body.access_token}`)
        .send({
          title: 'Hacked Title',
        })
        .expect(403);
    });
  });

  describe('DELETE /job-offers/:id', () => {
    it('should fail for non-owner', async () => {
      await request(app.getHttpServer())
        .delete(`/job-offers/${createdOfferId}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(403);
    });

    it('should delete job offer (owner only)', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/job-offers/${createdOfferId}`)
        .set('Authorization', `Bearer ${companyToken}`)
        .expect(200);

      expect(response.body.message).toBe('Job offer deleted successfully');
    });

    it('should fail to delete non-existent offer', async () => {
      await request(app.getHttpServer())
        .delete(`/job-offers/${createdOfferId}`)
        .set('Authorization', `Bearer ${companyToken}`)
        .expect(404);
    });
  });
});
