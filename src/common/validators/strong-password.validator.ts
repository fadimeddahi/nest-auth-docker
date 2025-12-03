import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
  registerDecorator,
} from 'class-validator';

/**
 * Strong Password Validator
 * Enforces password complexity requirements:
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character (@$!%*?&)
 */
@ValidatorConstraint({ name: 'isStrongPassword', async: false })
export class IsStrongPasswordConstraint
  implements ValidatorConstraintInterface
{
  validate(value: string): boolean {
    if (!value || value.length < 8) {
      return false;
    }

    // Check for uppercase
    if (!/[A-Z]/.test(value)) {
      return false;
    }

    // Check for lowercase
    if (!/[a-z]/.test(value)) {
      return false;
    }

    // Check for number
    if (!/\d/.test(value)) {
      return false;
    }

    // Check for special character
    if (!/[@$!%*?&]/.test(value)) {
      return false;
    }

    return true;
  }

  defaultMessage(args: ValidationArguments): string {
    return (
      'Password must contain at least 8 characters with uppercase, lowercase, number, and special character (@$!%*?&)'
    );
  }
}

/**
 * Decorator to apply strong password validation
 * @example
 * @IsStrongPassword()
 * password: string;
 */
export function IsStrongPassword(options?: any) {
  return function (target: Object, propertyName: string) {
    registerDecorator({
      target: target.constructor,
      propertyName: propertyName,
      options,
      constraints: [],
      validator: IsStrongPasswordConstraint,
    });
  };
}
