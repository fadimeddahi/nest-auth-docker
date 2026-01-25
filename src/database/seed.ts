import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { UsersService } from '../users/users.service';
import { StudentsService } from '../students/students.service';
import { CompaniesService } from '../companies/companies.service';
import { JobOffersService } from '../job-offers/job-offers.service';
import { ApplicationsService } from '../applications/applications.service';
import { UserRole } from '../users/user.entity';
import { OfferType } from '../job-offers/job-offer.entity';
import * as bcrypt from 'bcryptjs';
import { DataSource } from 'typeorm';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const usersService = app.get(UsersService);
  const studentsService = app.get(StudentsService);
  const companiesService = app.get(CompaniesService);
  const jobOffersService = app.get(JobOffersService);
  const applicationsService = app.get(ApplicationsService);

  console.log('🌱 Starting database seeding...\n');

  // Clear existing data
  console.log('🗑️  Clearing existing data...');
  try {
    const dataSource = app.get(DataSource);
    
    // Delete in correct order to avoid foreign key constraints
    await dataSource.query('TRUNCATE TABLE applications, job_offers, experiences, skills, students, companies, users RESTART IDENTITY CASCADE');
    
    console.log('✓ Database cleared\n');
  } catch (error) {
    console.log('⚠️  Warning: Could not clear database:', error.message);
  }

  // Hash password
  const hashedPassword = await bcrypt.hash('Password123!', 10);

  // Create Students
  console.log('📚 Creating students...');
  const students = [
    {
      email: 'ahmed.benali@student.com',
      firstName: 'Ahmed',
      lastName: 'Benali',
      university: 'estin',
      bio: 'Computer Science student passionate about full-stack development and AI',
      phone: '+213555123456',
      location: 'Algiers',
      githubUrl: 'https://github.com/ahmedbenali',
      linkedinUrl: 'https://linkedin.com/in/ahmedbenali',
    },
    {
      email: 'fatima.salem@student.com',
      firstName: 'Fatima',
      lastName: 'Salem',
      university: 'usthb',
      bio: 'Software engineering student specializing in mobile development',
      phone: '+213556234567',
      location: 'Oran',
      githubUrl: 'https://github.com/fatimasalem',
      linkedinUrl: 'https://linkedin.com/in/fatimasalem',
    },
    {
      email: 'karim.meziane@student.com',
      firstName: 'Karim',
      lastName: 'Meziane',
      university: 'esi',
      bio: 'Data science enthusiast with strong background in machine learning',
      phone: '+213557345678',
      location: 'Constantine',
      githubUrl: 'https://github.com/karimmeziane',
      linkedinUrl: 'https://linkedin.com/in/karimmeziane',
    },
    {
      email: 'sarah.boudiaf@student.com',
      firstName: 'Sarah',
      lastName: 'Boudiaf',
      university: 'usdb',
      bio: 'Cybersecurity student focused on network security and ethical hacking',
      phone: '+213558456789',
      location: 'Algiers',
      githubUrl: 'https://github.com/sarahboudiaf',
      linkedinUrl: 'https://linkedin.com/in/sarahboudiaf',
    },
    {
      email: 'youcef.kaddour@student.com',
      firstName: 'Youcef',
      lastName: 'Kaddour',
      university: 'estin',
      bio: 'Backend developer with expertise in Node.js and microservices',
      phone: '+213559567890',
      location: 'Blida',
      githubUrl: 'https://github.com/youcefkaddour',
      linkedinUrl: 'https://linkedin.com/in/youcefkaddour',
    },
  ];

  for (const studentData of students) {
    const user = await usersService.create(
      studentData.email.split('@')[0],
      studentData.email,
      hashedPassword,
      UserRole.STUDENT,
    );
    await studentsService.create(user.userId, studentData);
    console.log(`✓ Created student: ${studentData.firstName} ${studentData.lastName}`);
  }

  // Create Companies
  console.log('\n🏢 Creating companies...');
  const companies = [
    {
      email: 'hr@condor.dz',
      companyName: 'Condor Electronics',
      enterpriseSize: '1000+',
      website: 'https://condor.dz',
      description: 'Leading Algerian electronics and home appliances manufacturer',
      location: 'Bordj Bou Arreridj',
    },
    {
      email: 'careers@djezzy.dz',
      companyName: 'Djezzy',
      enterpriseSize: '501-1000',
      website: 'https://djezzy.dz',
      description: 'Major telecommunications operator in Algeria',
      location: 'Algiers',
    },
    {
      email: 'jobs@cevital.com',
      companyName: 'Cevital',
      enterpriseSize: '1000+',
      website: 'https://cevital.com',
      description: 'Algeria\'s largest private company in agri-food sector',
      location: 'Bejaia',
    },
    {
      email: 'tech@yassir.com',
      companyName: 'Yassir',
      enterpriseSize: '201-500',
      website: 'https://yassir.com',
      description: 'Super app offering ride-hailing, delivery, and fintech services',
      location: 'Algiers',
    },
    {
      email: 'recruitment@ooredoo.dz',
      companyName: 'Ooredoo Algeria',
      enterpriseSize: '501-1000',
      website: 'https://ooredoo.dz',
      description: 'Telecommunications company providing mobile and internet services',
      location: 'Algiers',
    },
  ];

  const createdCompanies: any[] = [];
  for (const companyData of companies) {
    const user = await usersService.create(
      companyData.email.split('@')[0],
      companyData.email,
      hashedPassword,
      UserRole.COMPANY,
    );
    const company = await companiesService.create(user.userId, companyData);
    createdCompanies.push(company);
    console.log(`✓ Created company: ${companyData.companyName}`);
  }

  // Create Job Offers
  console.log('\n💼 Creating job offers...');
  const jobOffers = [
    {
      companyIndex: 0,
      title: 'Full Stack Developer',
      description: 'We are looking for a talented Full Stack Developer to join our innovation team. You will work on cutting-edge web applications using modern technologies.',
      type: OfferType.JOB,
      location: 'Bordj Bou Arreridj',
      salary: 80000,
      requirements: 'Bachelor in Computer Science, 2+ years experience with React and Node.js, Strong problem-solving skills',
    },
    {
      companyIndex: 1,
      title: 'Mobile App Developer',
      description: 'Join our mobile development team to build innovative apps for millions of users. Experience with React Native or Flutter required.',
      type: OfferType.JOB,
      location: 'Algiers',
      salary: 90000,
      requirements: 'Experience with React Native or Flutter, Knowledge of mobile app architecture, Published apps on App Store or Play Store',
    },
    {
      companyIndex: 2,
      title: 'Data Analyst Intern',
      description: 'Internship opportunity for students interested in data analysis and business intelligence. Learn from experienced professionals.',
      type: OfferType.INTERNSHIP,
      location: 'Bejaia',
      salary: 20000,
      requirements: 'Currently enrolled in university, Knowledge of Python and SQL, Interest in data visualization',
    },
    {
      companyIndex: 3,
      title: 'Backend Engineer',
      description: 'Build scalable microservices for our super app platform. Work with modern cloud technologies and help millions of users.',
      type: OfferType.JOB,
      location: 'Algiers',
      salary: 100000,
      requirements: 'Strong experience with Node.js or Python, Knowledge of microservices architecture, Experience with AWS or GCP',
    },
    {
      companyIndex: 4,
      title: 'Network Security Engineer',
      description: 'Protect our telecommunications infrastructure. Work on network security, threat detection, and incident response.',
      type: OfferType.JOB,
      location: 'Algiers',
      salary: 95000,
      requirements: 'Cybersecurity certification (CEH, CISSP), Experience with network security tools, Knowledge of firewalls and IDS/IPS',
    },
    {
      companyIndex: 0,
      title: 'Frontend Developer Intern',
      description: 'Summer internship for aspiring frontend developers. Work on real projects and learn from senior developers.',
      type: OfferType.INTERNSHIP,
      location: 'Bordj Bou Arreridj',
      salary: 18000,
      requirements: 'Knowledge of HTML, CSS, JavaScript, Familiarity with React or Vue.js, Eager to learn',
    },
    {
      companyIndex: 1,
      title: 'DevOps Engineer',
      description: 'Manage our CI/CD pipelines and cloud infrastructure. Automate deployments and ensure high availability.',
      type: OfferType.JOB,
      location: 'Algiers',
      salary: 105000,
      requirements: 'Experience with Docker and Kubernetes, Knowledge of CI/CD tools (Jenkins, GitLab CI), Cloud platform experience (AWS/Azure)',
    },
    {
      companyIndex: 3,
      title: 'UI/UX Designer',
      description: 'Design beautiful and intuitive interfaces for our mobile and web applications. User-centric approach required.',
      type: OfferType.JOB,
      location: 'Algiers',
      salary: 85000,
      requirements: 'Portfolio of design projects, Proficiency in Figma or Adobe XD, Understanding of user research and testing',
    },
  ];

  const createdJobOffers: any[] = [];
  for (const offerData of jobOffers) {
    const { companyIndex, ...jobData } = offerData;
    const company = createdCompanies[companyIndex];
    const offer = await jobOffersService.create({
      ...jobData,
      company,
    });
    createdJobOffers.push(offer);
    console.log(`✓ Created job offer: ${jobData.title} at ${company.firstName}`);
  }

  // Create Applications
  console.log('\n📝 Creating applications...');
  const applications = [
    { studentIndex: 0, offerIndex: 0, coverLetter: 'I am very excited about this opportunity to work with Condor Electronics...' },
    { studentIndex: 0, offerIndex: 3, coverLetter: 'My experience with Node.js makes me a great fit for this backend role...' },
    { studentIndex: 1, offerIndex: 1, coverLetter: 'I have developed several React Native apps and would love to contribute...' },
    { studentIndex: 1, offerIndex: 7, coverLetter: 'As a UI/UX enthusiast, I believe I can bring fresh perspectives...' },
    { studentIndex: 2, offerIndex: 2, coverLetter: 'I am eager to learn data analysis and contribute to your team...' },
    { studentIndex: 3, offerIndex: 4, coverLetter: 'My cybersecurity background aligns perfectly with this position...' },
    { studentIndex: 4, offerIndex: 3, coverLetter: 'I have extensive experience building microservices architectures...' },
    { studentIndex: 4, offerIndex: 6, coverLetter: 'I am passionate about DevOps practices and automation...' },
  ];

  // Get created students
  const createdStudents: any[] = [];
  for (const studentData of students) {
    const user = await usersService.findByEmail(studentData.email);
    if (user) {
      const student = await studentsService.findByUserId(user.userId);
      if (student) {
        createdStudents.push(student);
      }
    }
  }

  for (const appData of applications) {
    const student = createdStudents[appData.studentIndex];
    const offer = createdJobOffers[appData.offerIndex];
    if (student && offer) {
      await applicationsService.apply(
        student.studentId,
        offer.offerId,
        appData.coverLetter,
      );
      console.log(`✓ Created application: ${student.firstName} → ${offer.title}`);
    }
  }

  console.log('\n✅ Database seeding completed successfully!\n');
  console.log('📊 Summary:');
  console.log(`   - ${students.length} students created`);
  console.log(`   - ${companies.length} companies created`);
  console.log(`   - ${jobOffers.length} job offers created`);
  console.log(`   - ${applications.length} applications created\n`);
  console.log('🔐 Default password for all accounts: Password123!\n');

  await app.close();
  process.exit(0);
}

bootstrap().catch((error) => {
  console.error('❌ Seeding failed:', error);
  process.exit(1);
});
