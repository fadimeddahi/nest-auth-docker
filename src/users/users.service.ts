import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User, UserRole } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findOne(username: string): Promise<User | null> {
    if (!username) {
      return null;
    }
    return await this.usersRepository.findOne({
      where: { username },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    if (!email) {
      return null;
    }
    return await this.usersRepository.findOne({
      where: { email },
    });
  }

  async create(
    username: string,
    email: string,
    password: string,
    role: UserRole = UserRole.STUDENT,
  ): Promise<User> {
    const user = this.usersRepository.create({
      username,
      email,
      password,
      role,
    });
    return await this.usersRepository.save(user);
  }

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.findOne(username);
    if (user && (await bcrypt.compare(pass, user.password))) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = user;
      return result;
    }
    return null;
  }
}
