import { Module } from '@nestjs/common';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

/**
 * Rate Limiting Module
 * Provides protection against brute force attacks, DDoS, and API abuse
 */
@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 60000, // 1 minute
        limit: 60, // 60 requests per minute (increased for normal read operations)
      },
      {
        name: 'long',
        ttl: 3600000, // 1 hour
        limit: 1000, // 1000 requests per hour
      },
      {
        name: 'auth',
        ttl: 60000, // 1 minute
        limit: 10, // 10 attempts per minute for auth endpoints (strict)
      },
    ]),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class RateLimitModule {}
