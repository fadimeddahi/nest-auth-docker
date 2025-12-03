import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { StudentsModule } from './students/students.module';
import { CompaniesModule } from './companies/companies.module';
import { JobOffersModule } from './job-offers/job-offers.module';
import { ApplicationsModule } from './applications/applications.module';
import { UploadModule } from './upload/upload.module';
import { RateLimitModule } from './common/rate-limit/rate-limit.module';
import { SanitizationModule } from './common/sanitization/sanitization.module';
import { SanitizationInterceptor } from './common/interceptors/sanitization.interceptor';
import { User } from './users/user.entity';
import { Student } from './students/student.entity';
import { Company } from './companies/company.entity';
import { Skill } from './students/skill.entity';
import { Experience } from './students/experience.entity';
import { JobOffer } from './job-offers/job-offer.entity';
import { Application } from './applications/application.entity';
import { envValidationSchema } from './config/env.validation';

@Module({
  imports: [
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      validationSchema: envValidationSchema as any,
      validationOptions: {
        abortEarly: true,
      },
    }),
    RateLimitModule,
    SanitizationModule,
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService) => {
        const isProduction = configService.get<string>('NODE_ENV') === 'production';
        return {
          type: 'postgres',
          host: configService.get<string>('POSTGRES_HOST'),
          port: configService.get<number>('POSTGRES_PORT'),
          username: configService.get<string>('POSTGRES_USER'),
          password: configService.get<string>('POSTGRES_PASSWORD'),
          database: configService.get<string>('POSTGRES_DB'),
          entities: [User, Student, Company, Skill, Experience, JobOffer, Application],
          synchronize: !isProduction,
          logging: !isProduction,
          migrations: ['dist/migrations/*.js'],
          migrationsRun: true,
          ssl: isProduction ? { rejectUnauthorized: false } : false,
        };
      },
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    StudentsModule,
    CompaniesModule,
    JobOffersModule,
    ApplicationsModule,
    UploadModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: SanitizationInterceptor,
    },
  ],
})
export class AppModule {}
