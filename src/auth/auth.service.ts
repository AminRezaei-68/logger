/* eslint-disable prettier/prettier */
import { BadRequestException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { RegisterDto } from './common/dtos/register.dto';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './common/dtos/login.dto';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma/prisma.service';
import { ClientProxy } from '@nestjs/microservices';
import { TokensRepository } from 'src/prisma/repositories/tokens.repository';

@Injectable()
export class AuthService {
    constructor(
        private readonly usersServive: UsersService,
        private readonly jwtService: JwtService,
        private readonly prisma: PrismaService,
        private readonly tokensRepository: TokensRepository,
        @Inject('LOGGER_SERVICE') private readonly client: ClientProxy,
    ) {}

    async register(registerDto: RegisterDto) {
        const { email } = registerDto;

        const user = await this.usersServive.findByEmail(email);
        console.log('the user is: ', user);
        if (user) {
            throw new BadRequestException(`The user with email ${email} is exist.`);
        }

        const newUser = await this.usersServive.create(registerDto);

        this.client.emit('log', { action: 'register', email });

        return { message: 'You register successfully.', newUser };
    }

    async login(loginDto: LoginDto) {
        const { email, password } = loginDto;
        const user = await this.usersServive.findByEmail(email);

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Incorrect password.');
        }

        const payload = { id: user.id, email: user.email };

        const response = this.createToken(payload);

        this.client.emit('log', { action: 'login', email });
        console.log('data send to logger.');

        return { response };
    }

    async logout(data: LogOut) {
        const { userId, email } = data;
        console.log(`The user with email : ${email} is logout.`);
        const deletedRefreshToken = await this.prisma.refreshToken.findUnique({ where: { userId: userId } });
        console.log(`the "${deletedRefreshToken}" refresh token deleted.`);

        this.client.emit('log', { action: 'logout', email });
    }

    async createToken(data: CreateToken) {
        const { id, email } = data;
        const payload = { sub: id, email: email };

        const accessToken = await this.jwtService.sign(payload, {
            expiresIn: '3m',
            secret: process.env.JWT_SECRET,
        });
        const refreshToken = await this.jwtService.sign(payload, {
            expiresIn: '7d',
            secret: process.env.JWT_SECRET,
        });

        const saveData = { id: id, token: refreshToken };
        await this.tokensRepository.saveToken(saveData);

        return { accessToken: accessToken, refreshToken: refreshToken };
    }
}
