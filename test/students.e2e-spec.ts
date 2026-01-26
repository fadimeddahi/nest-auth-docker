import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Students (e2e)', () => {
  let app: INestApplication;
  let studentToken: string;
  let companyToken: string;
  let studentId: number;
  let skillId: number;
  let experienceId: number;

  beforeAll(async () => {
    try {
      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [AppModule],
      }).compile();

      app = moduleFixture.createNestApplication();
      app.useGlobalPipes(new ValidationPipe());
      await app.init();

      // Register a student
      const studentRes = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: `student-profile-${Date.now()}@example.com`,
          password: 'Password123!',
          userType: 'student',
          firstName: 'Profile',
          lastName: 'Tester',
        });
      studentToken = studentRes.body.access_token;

      // Register a company for role-based testing
      const companyRes = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: `company-students-${Date.now()}@example.com`,
          password: 'Password123!',
          userType: 'enterprise',
          companyName: 'Test Company Students',
        });
      companyToken = companyRes.body.access_token;
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

  describe('GET /students', () => {
    it('should return all students', async () => {
      const response = await request(app.getHttpServer())
        .get('/students')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should work without authentication (public endpoint)', async () => {
      const response = await request(app.getHttpServer())
        .get('/students')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('GET /students/me', () => {
    it('should return current student profile', async () => {
      const response = await request(app.getHttpServer())
        .get('/students/me')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('studentId');
      expect(response.body.firstName).toBe('Profile');
      expect(response.body.lastName).toBe('Tester');
      studentId = response.body.studentId;
    });

    it('should fail without authentication', async () => {
      await request(app.getHttpServer()).get('/students/me').expect(401);
    });

    it('should fail for company users', async () => {
      await request(app.getHttpServer())
        .get('/students/me')
        .set('Authorization', `Bearer ${companyToken}`)
        .expect(403);
    });
  });

  describe('GET /students/:id', () => {
    it('should return a student by id', async () => {
      const response = await request(app.getHttpServer())
        .get(`/students/${studentId}`)
        .expect(200);

      expect(response.body.studentId).toBe(studentId);
      expect(response.body.firstName).toBe('Profile');
    });

    it('should return 404 for non-existent student', async () => {
      await request(app.getHttpServer()).get('/students/99999').expect(404);
    });
  });

  describe('PUT /students/me', () => {
    it('should update current student profile', async () => {
      const response = await request(app.getHttpServer())
        .put('/students/me')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          university: 'Test University',
          fieldOfStudy: 'Computer Science',
          bio: 'A passionate developer',
        })
        .expect(200);

      expect(response.body.university).toBe('Test University');
      expect(response.body.fieldOfStudy).toBe('Computer Science');
      expect(response.body.bio).toBe('A passionate developer');
    });

    it('should fail without authentication', async () => {
      await request(app.getHttpServer())
        .put('/students/me')
        .send({
          university: 'Unauthorized Update',
        })
        .expect(401);
    });

    it('should fail for company users', async () => {
      await request(app.getHttpServer())
        .put('/students/me')
        .set('Authorization', `Bearer ${companyToken}`)
        .send({
          university: 'Company Trying Update',
        })
        .expect(403);
    });
  });

  describe('POST /students/me/skills', () => {
    it('should add a skill to student profile', async () => {
      const response = await request(app.getHttpServer())
        .post('/students/me/skills')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          name: 'TypeScript',
          level: 'Intermediate',
        })
        .expect(201);

      expect(response.body).toHaveProperty('skillId');
      expect(response.body.name).toBe('TypeScript');
      expect(response.body.level).toBe('Intermediate');
      skillId = response.body.skillId;
    });

    it('should add another skill', async () => {
      const response = await request(app.getHttpServer())
        .post('/students/me/skills')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          name: 'NestJS',
          level: 'Advanced',
        })
        .expect(201);

      expect(response.body.name).toBe('NestJS');
    });

    it('should fail without required fields', async () => {
      await request(app.getHttpServer())
        .post('/students/me/skills')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({})
        .expect(400);
    });

    it('should fail for company users', async () => {
      await request(app.getHttpServer())
        .post('/students/me/skills')
        .set('Authorization', `Bearer ${companyToken}`)
        .send({
          name: 'Python',
          level: 'Beginner',
        })
        .expect(403);
    });
  });

  describe('POST /students/me/experiences', () => {
    it('should add an experience to student profile', async () => {
      const response = await request(app.getHttpServer())
        .post('/students/me/experiences')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          title: 'Software Developer Intern',
          company: 'Tech Corp',
          startDate: '2023-01-01',
          endDate: '2023-06-30',
          description: 'Worked on backend development',
        })
        .expect(201);

      expect(response.body).toHaveProperty('experienceId');
      expect(response.body.title).toBe('Software Developer Intern');
      expect(response.body.company).toBe('Tech Corp');
      experienceId = response.body.experienceId;
    });

    it('should add ongoing experience (no end date)', async () => {
      const response = await request(app.getHttpServer())
        .post('/students/me/experiences')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          title: 'Junior Developer',
          company: 'Startup Inc',
          startDate: '2024-01-01',
          description: 'Current position',
        })
        .expect(201);

      expect(response.body.title).toBe('Junior Developer');
      expect(response.body.endDate).toBeNull();
    });

    it('should fail without required fields', async () => {
      await request(app.getHttpServer())
        .post('/students/me/experiences')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          title: 'Missing Company',
        })
        .expect(400);
    });

    it('should fail for company users', async () => {
      await request(app.getHttpServer())
        .post('/students/me/experiences')
        .set('Authorization', `Bearer ${companyToken}`)
        .send({
          title: 'Fake Experience',
          company: 'Company',
          startDate: '2023-01-01',
        })
        .expect(403);
    });
  });

  describe('DELETE /students/me/skills/:skillId', () => {
    it('should delete a skill from student profile', async () => {
      await request(app.getHttpServer())
        .delete(`/students/me/skills/${skillId}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);
    });

    it('should return 404 for non-existent skill', async () => {
      await request(app.getHttpServer())
        .delete('/students/me/skills/99999')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(404);
    });

    it('should fail for company users', async () => {
      await request(app.getHttpServer())
        .delete(`/students/me/skills/${skillId}`)
        .set('Authorization', `Bearer ${companyToken}`)
        .expect(403);
    });
  });

  describe('DELETE /students/me/experiences/:experienceId', () => {
    it('should delete an experience from student profile', async () => {
      await request(app.getHttpServer())
        .delete(`/students/me/experiences/${experienceId}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);
    });

    it('should return 404 for non-existent experience', async () => {
      await request(app.getHttpServer())
        .delete('/students/me/experiences/99999')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(404);
    });

    it('should fail for company users', async () => {
      await request(app.getHttpServer())
        .delete(`/students/me/experiences/${experienceId}`)
        .set('Authorization', `Bearer ${companyToken}`)
        .expect(403);
    });
  });
});
