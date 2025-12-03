import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

@Injectable()
export class OwnershipGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const { user } = request;
    const { userId } = request.params;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // Check if user is trying to access their own resource
    if (user.userId !== parseInt(userId, 10)) {
      throw new ForbiddenException('You do not have permission to access this resource');
    }

    return true;
  }
}
