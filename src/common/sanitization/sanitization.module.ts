import { Global, Module } from '@nestjs/common';
import { XssSanitizationService } from './xss-sanitization.service';

/**
 * XSS Sanitization Module
 * Provides global XSS sanitization service to prevent Cross-Site Scripting attacks
 */
@Global()
@Module({
  providers: [XssSanitizationService],
  exports: [XssSanitizationService],
})
export class SanitizationModule {}
