import { Injectable } from '@nestjs/common';
import xss from 'xss';

/**
 * XSS Sanitization Service
 * Sanitizes user input to prevent Cross-Site Scripting (XSS) attacks
 * Removes malicious HTML/JavaScript while preserving safe content
 */
@Injectable()
export class XssSanitizationService {
  /**
   * Sanitize a single string value
   */
  sanitize(value: string): string {
    if (!value || typeof value !== 'string') {
      return value;
    }

    return xss(value, {
      whiteList: {}, // No HTML tags allowed by default
      stripIgnoreTag: true,
      onTagAttr: (tag: string, name: string, value: string) => {
        return ''; // Remove all attributes
      },
    });
  }

  /**
   * Sanitize an object by sanitizing all string properties
   */
  sanitizeObject(obj: any): any {
    if (!obj || typeof obj !== 'object') {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map((item) => this.sanitizeObject(item));
    }

    const sanitized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        sanitized[key] = this.sanitize(value);
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = this.sanitizeObject(value);
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }

  /**
   * Sanitize specific fields in an object
   */
  sanitizeFields(obj: any, fields: string[]): any {
    if (!obj || typeof obj !== 'object') {
      return obj;
    }

    const sanitized = { ...obj };
    for (const field of fields) {
      if (field in sanitized && typeof sanitized[field] === 'string') {
        sanitized[field] = this.sanitize(sanitized[field]);
      }
    }

    return sanitized;
  }
}
