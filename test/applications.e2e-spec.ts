import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Applications (e2e)', () => {
  let app: INestApplication;
  let companyToken: string;
  let studentToken: string;
  let jobOfferId: number;
  let applicationId: number;

  beforeAll(async () => {
    try {
      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [AppModule],
      }).compile();

      app = moduleFixture.createNestApplication();
      app.useGlobalPipes(new ValidationPipe());
      await app.init();

      // Register a company and create a job offer
      const companyRes = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: `company-apps-${Date.now()}@example.com`,
          password: 'Password123!',
          userType: 'enterprise',
          companyName: 'Test Apps Company',
        });
      companyToken = companyRes.body.access_token;

      // Create a job offer
      const offerRes = await request(app.getHttpServer())
        .post('/job-offers')
        .set('Authorization', `Bearer ${companyToken}`)
        .send({
          title: 'Test Position for Applications',
          type: 'internship',
          description: 'A position for testing applications',
          location: 'Algiers',
        });
      jobOfferId = offerRes.body.offerId;

      // Register a student
      const studentRes = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: `student-apps-${Date.now()}@example.com`,
          password: 'Password123!',
          userType: 'student',
          firstName: 'Test',
          lastName: 'Applicant',
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

  describe('POST /applications/:offerId', () => {
    it('should create a new application (student only)', async () => {
      const response = await request(app.getHttpServer())
        .post(`/applications/${jobOfferId}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          coverLetter: 'I am very interested in this position',
        })
        .expect(201);

      expect(response.body).toHaveProperty('applicationId');
      expect(response.body.status).toBe('pending');
      applicationId = response.body.applicationId;
    });

    it('should fail for duplicate application', async () => {
      await request(app.getHttpServer())
        .post(`/applications/${jobOfferId}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          coverLetter: 'Trying to apply again',
        })
        .expect(409);
    });

    it('should fail for company users', async () => {
      await request(app.getHttpServer())
        .post(`/applications/${jobOfferId}`)
        .set('Authorization', `Bearer ${companyToken}`)
        .send({
          coverLetter: 'Company trying to apply',
        })
        .expect(403);
    });

    it('should fail without authentication', async () => {
      await request(app.getHttpServer())
        .post(`/applications/${jobOfferId}`)
        .send({
          coverLetter: 'No auth',
        })
        .expect(401);
    });

    it('should fail for non-existent job offer', async () => {
      await request(app.getHttpServer())
        .post('/applications/99999')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          coverLetter: 'Applying to non-existent offer',
        })
        .expect(404);
    });
  });

  describe('GET /applications/my-applications', () => {
    it('should return student applications', async () => {
      const response = await request(app.getHttpServer())
        .get('/applications/my-applications')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('applicationId');
    });

    it('should fail for company users', async () => {
      await request(app.getHttpServer())
        .get('/applications/my-applications')
        .set('Authorization', `Bearer ${companyToken}`)
        .expect(403);
    });
  });

  describe('GET /applications/offer/:offerId', () => {
    it('should return applications for offer (company only)', async () => {
      const response = await request(app.getHttpServer())
        .get(`/applications/offer/${jobOfferId}`)
        .set('Authorization', `Bearer ${companyToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('should fail for student users', async () => {
      await request(app.getHttpServer())
        .get(`/applications/offer/${jobOfferId}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(403);
    });
  });

  describe('GET /applications/company/all', () => {
    it('should return all company applications', async () => {
      const response = await request(app.getHttpServer())
        .get('/applications/company/all')
        .set('Authorization', `Bearer ${companyToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should fail for student users', async () => {
      await request(app.getHttpServer())
        .get('/applications/company/all')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(403);
    });
  });

  describe('PUT /applications/:id/status', () => {
    it('should update application status (company only)', async () => {
      const response = await request(app.getHttpServer())
        .put(`/applications/${applicationId}/status`)
        .set('Authorization', `Bearer ${companyToken}`)
        .send({
          status: 'viewed',
        })
        .expect(200);

      expect(response.body.status).toBe('viewed');
    });

    it('should accept an application', async () => {
      const response = await request(app.getHttpServer())
        .put(`/applications/${applicationId}/status`)
        .set('Authorization', `Bearer ${companyToken}`)
        .send({
          status: 'accepted',
        })
        .expect(200);

      expect(response.body.status).toBe('accepted');
    });

    it('should fail for student users', async () => {
      await request(app.getHttpServer())
        .put(`/applications/${applicationId}/status`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          status: 'rejected',
        })
        .expect(403);
    });

    it('should fail with invalid status', async () => {
      await request(app.getHttpServer())
        .put(`/applications/${applicationId}/status`)
        .set('Authorization', `Bearer ${companyToken}`)
        .send({
          status: 'invalid_status',
        })
        .expect(400);
    });
  });

  describe('PUT /applications/:id/withdraw', () => {
    let withdrawableApplicationId: number;

    beforeAll(async () => {
      if (!app) return;
      // Create another job offer and application for withdraw testing
      const offerRes = await request(app.getHttpServer())
        .post('/job-offers')
        .set('Authorization', `Bearer ${companyToken}`)
        .send({
          title: 'Another Position',
          type: 'job',
          description: 'For withdraw testing',
        });

      // Register another student for this test
      const newStudentRes = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: `student-withdraw-${Date.now()}@example.com`,
          password: 'Password123!',
          userType: 'student',
          firstName: 'Withdraw',
          lastName: 'Tester',
        });

      const appRes = await request(app.getHttpServer())
        .post(`/applications/${offerRes.body.offerId}`)
        .set('Authorization', `Bearer ${newStudentRes.body.access_token}`)
        .send({
          coverLetter: 'Application to withdraw',
        });

      withdrawableApplicationId = appRes.body.applicationId;
    });

    it('should withdraw application (student only)', async () => {
      // First, we need the student who created this application
      const withdrawStudentRes = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: `withdraw-student-${Date.now()}@example.com`,
          password: 'Password123!',
          userType: 'student',
          firstName: 'New',
          lastName: 'Student',
        });

      // Create another job and apply
      const newOfferRes = await request(app.getHttpServer())
        .post('/job-offers')
        .set('Authorization', `Bearer ${companyToken}`)
        .send({
          title: 'Position for Withdraw',
          type: 'pfe',
          description: 'Testing withdrawal',
        });

      const newAppRes = await request(app.getHttpServer())
        .post(`/applications/${newOfferRes.body.offerId}`)
        .set('Authorization', `Bearer ${withdrawStudentRes.body.access_token}`)
        .send({
          coverLetter: 'I will withdraw this',
        });

      const response = await request(app.getHttpServer())
        .put(`/applications/${newAppRes.body.applicationId}/withdraw`)
        .set('Authorization', `Bearer ${withdrawStudentRes.body.access_token}`)
        .expect(200);

      expect(response.body.status).toBe('withdrawn');
    });

    it('should fail for company users', async () => {
      await request(app.getHttpServer())
        .put(`/applications/${applicationId}/withdraw`)
        .set('Authorization', `Bearer ${companyToken}`)
        .expect(403);
    });

    it('should fail for non-owner student', async () => {
      // Register a different student
      const otherStudentRes = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: `other-student-${Date.now()}@example.com`,
          password: 'Password123!',
          userType: 'student',
          firstName: 'Other',
          lastName: 'Student',
        });

      await request(app.getHttpServer())
        .put(`/applications/${applicationId}/withdraw`)
        .set('Authorization', `Bearer ${otherStudentRes.body.access_token}`)
        .expect(403);
    });
  });
});
