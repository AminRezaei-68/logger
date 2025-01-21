import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { RegisterDto } from './dtos/register.dto';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dtos/login.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(private readonly usersServive: UsersService,
    private readonly jwtService: JwtService
  ) {}

    async register(registerDto: RegisterDto) {
        const {email} = registerDto;
        
        const user = await this.usersServive.findByEmail(email);
        console.log('the user is: ', user);
        if (user) {
          throw new BadRequestException(`The user with email ${email} is exist.`);
        }

        const newUser = await this.usersServive.create(registerDto);

        return {message: 'You register successfully.', newUser}
    }

    async login(loginDto: LoginDto) {
      const { email, password} = loginDto;
      const user = await this.usersServive.findByEmail(email);

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new UnauthorizedException('Incorrect password.');
      }

      const payload = {email: user.email};

      const token = await this.jwtService.sign(payload);

      return {mesage: 'Login successful', token};
    }


    async logout() {}


}
