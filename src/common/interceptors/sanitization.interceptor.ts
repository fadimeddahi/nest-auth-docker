import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { XssSanitizationService } from '../sanitization/xss-sanitization.service';

/**
 * XSS Sanitization Interceptor
 * Automatically sanitizes request body to prevent Cross-Site Scripting attacks
 * Applies to all POST, PUT, PATCH requests
 */
@Injectable()
export class SanitizationInterceptor implements NestInterceptor {
  constructor(private sanitizationService: XssSanitizationService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();

    // Only sanitize POST, PUT, PATCH requests with body
    if (['POST', 'PUT', 'PATCH'].includes(request.method) && request.body) {
      request.body = this.sanitizationService.sanitizeObject(request.body);
    }

    return next.handle();
  }
}
