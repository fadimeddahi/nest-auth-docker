import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Authentication (e2e)', () => {
  let app: INestApplication;
  let authToken: string;
  const testEmail = `test-${Date.now()}@example.com`;

  beforeAll(async () => {
    try {
      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [AppModule],
      }).compile();

      app = moduleFixture.createNestApplication();
      app.useGlobalPipes(new ValidationPipe());
      await app.init();
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

  describe('POST /auth/register', () => {
    it('should register a new student', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: testEmail,
          password: 'Password123!',
          userType: 'student',
          firstName: 'Test',
          lastName: 'User',
        })
        .expect(201);

      expect(response.body).toHaveProperty('access_token');
      expect(response.body).toHaveProperty('statusCode', 201);
      expect(response.body).toHaveProperty('message', 'User registered successfully');
      authToken = response.body.access_token;
    });

    it('should fail with duplicate email', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: testEmail,
          password: 'Password123!',
          userType: 'student',
          firstName: 'Test',
          lastName: 'User',
        })
        .expect(409);
    });

    it('should fail with weak password', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'weak@example.com',
          password: '123456',
          userType: 'student',
          firstName: 'Test',
          lastName: 'User',
        })
        .expect(400);
    });

    it('should fail with invalid email format', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'invalidemail',
          password: 'Password123!',
          userType: 'student',
          firstName: 'Test',
          lastName: 'User',
        })
        .expect(400);
    });

    it('should register a new company', async () => {
      const companyEmail = `company-${Date.now()}@example.com`;
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: companyEmail,
          password: 'Password123!',
          userType: 'enterprise',
          companyName: 'Test Company',
        })
        .expect(201);

      expect(response.body).toHaveProperty('access_token');
    });
  });

  describe('POST /auth/login', () => {
    it('should login with valid credentials', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testEmail,
          password: 'Password123!',
        })
        .expect(200);

      expect(response.body).toHaveProperty('access_token');
      expect(response.body).toHaveProperty('statusCode', 200);
      expect(response.body).toHaveProperty('message', 'Login successful');
      expect(response.body.user).toHaveProperty('email', testEmail);
    });

    it('should fail with invalid password', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testEmail,
          password: 'WrongPassword123!',
        })
        .expect(401);
    });

    it('should fail with non-existent email', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'Password123!',
        })
        .expect(401);
    });
  });

  describe('Protected Routes', () => {
    it('should access protected route with valid token', async () => {
      const response = await request(app.getHttpServer())
        .get('/students/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('firstName');
    });

    it('should reject access without token', async () => {
      await request(app.getHttpServer())
        .get('/students/profile')
        .expect(401);
    });

    it('should reject access with invalid token', async () => {
      await request(app.getHttpServer())
        .get('/students/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });
});
