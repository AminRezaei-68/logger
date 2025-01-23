/* eslint-disable prettier/prettier */
import { BadRequestException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { RegisterDto } from './dtos/register.dto';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dtos/login.dto';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma/prisma.service';
import { ClientProxy, ClientTCP } from '@nestjs/microservices';

@Injectable()
export class AuthService {
    constructor(
        private readonly usersServive: UsersService,
        private readonly jwtService: JwtService,
        private readonly prisma: PrismaService,
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

        // const payload = {sub: user.id, email: user.email};

        // const access_token = await this.jwtService.sign(payload, {expiresIn: '3m'})
        // const refresh_token = await this.jwtService.sign(payload, {expiresIn: '7d'});

        // const database_refresh_token = await this.prisma.refreshToken.upsert({
        //   where:{userId: user.id},
        //   update: {token: refresh_token},
        //   create: {userId: user.id,token: refresh_token
        //   }
        // });

        const response = this.createToken(user.id, user.email);

        this.client.emit('log', { action: 'login', email });
        console.log('data send to logger.');

        return { response };
    }

    async logout(email: string, userId: number) {
        console.log(`The user with email : ${email} is logout.`);
        const deletedRefreshToken = await this.prisma.refreshToken.findUnique({ where: { userId: userId } });
        console.log(`the "${deletedRefreshToken}" refresh token deleted.`);
        this.client.emit('log', { action: 'logout', email });
    }

    async createToken(id: number, email: string) {
        const payload = { sub: id, email: email };

        const access_token = await this.jwtService.sign(payload, {
            expiresIn: '3m',
        });
        const refresh_token = await this.jwtService.sign(payload, {
            expiresIn: '7d',
        });

        await this.prisma.refreshToken.upsert({
            where: { userId: id },
            update: { token: refresh_token },
            create: { userId: id, token: refresh_token },
        });

        return { access_token, refresh_token };
    }
}
// function InjectClient(arg0: string): (target: typeof AuthService, propertyKey: undefined, parameterIndex: 3) => void {
//     throw new Error('Function not implemented.');
// }
