import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, pass: string): Promise<any> {
    return await this.usersService.validateUser(username, pass);
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async login(user: any): Promise<any> {
    const payload = {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      username: user.username as string,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      sub: user.userId as number,
    };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
