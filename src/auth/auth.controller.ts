/* eslint-disable prettier/prettier */
import { Body, Controller, Post, Res, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dtos/register.dto';
import { LoginDto } from './dtos/login.dto';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtGuard } from 'src/guards/jwt.guard';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly jwtService: JwtService,
        private readonly prisma: PrismaService,
    ) {}

    @Post('register')
    async register(@Body() registerDto: RegisterDto) {
        return this.authService.register(registerDto);
    }

    @Post('login')
    async login(@Body() loginDto: LoginDto, @Res() res: Response) {
        const { response } = await this.authService.login(loginDto);

        const { access_token, refresh_token } = await response;

        console.log('hit auth controller- access token :', access_token);
        console.log('hit auth controller- refresh_token :', refresh_token);

        res.cookie('access_token', access_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 3 * 60 * 1000,
        });

        res.cookie('refresh_token', refresh_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        return res.send({ message: 'Login successful' });
    }

    @UseGuards(JwtGuard)
    @Post('logout')
    async logout(@Req() req: Request, @Res() res: Response) {
        const refreshToken = req.cookies['refresh_token'];
        const decodedRefreshToken = await this.jwtService.decode(refreshToken);

        await this.authService.logout(decodedRefreshToken.email, decodedRefreshToken.sub);
        res.cookie('access_token', '', { expires: new Date(0) });
        res.cookie('refresh_token', '', { expires: new Date(0) });
        return res.send({ message: 'Logout successful' });
    }

    // @Post('refresh-token')
    // async refreshToken(@Req() req: Request, @Res() res: Response) {
    //     const access_token = req.cookies['access_token'];
    //     const refresh_token = req.cookies['refresh_token'];

    //     // const decodedAccessToken = await this.jwtService.verify(access_token, {secret: {process.env.JWT_SECRET}});
    //     const decodedAccessToken = await this.jwtService.verify(access_token);
    //     const decodedRefreshToken = await this.jwtService.verify(refresh_token);

    //     if (decodedAccessToken.sub !== decodedRefreshToken.sub) {
    //         throw new UnauthorizedException('Access Denied.');
    //     }

    //     const currentTime: Date = new Date();
    //     const accessTokenExpTime: Date = new Date(decodedAccessToken.exp * 1000);
    //     const refreshTokenExpTime: Date = new Date(decodedRefreshToken.exp * 1000);

    //     if (accessTokenExpTime > currentTime) {
    //         console.log('Access Token does not expired go ahead.');
    //     } else {
    //         console.log('Access Token does expired.');
    //         if (refreshTokenExpTime > currentTime) {
    //             console.log('Refresh Token does not expired.');
    //             console.log('refresh token:', decodedRefreshToken);
    //             const databaseRefrshToken = await this.prisma.refreshToken.findFirst({ where: { token: refresh_token } });
    //             // console.log('databaseRefrshToken:', databaseRefrshToken);
    //             // const user = await this.prisma.user.findUnique({ where: { id: databaseRefrshToken.id } });
    //             // console.log('the user:', user);
    //             if (!databaseRefrshToken) {
    //                 throw new UnauthorizedException('Access Denied.');
    //             }
    //             if (decodedRefreshToken.sub === databaseRefrshToken.userId) {
    //                 const { access_token, refresh_token } = await this.authService.createToken(
    //                     decodedRefreshToken.id,
    //                     decodedRefreshToken.email,
    //                 );
    //                 console.log('Tokens regenerate.');

    //                 res.cookie('access_token', access_token, {
    //                     httpOnly: true,
    //                     secure: process.env.NODE_ENV === 'production',
    //                     maxAge: 3 * 60 * 1000,
    //                 });

    //                 res.cookie('refresh_token', refresh_token, {
    //                     httpOnly: true,
    //                     secure: process.env.NODE_ENV === 'production',
    //                     maxAge: 7 * 24 * 60 * 60 * 1000,
    //                 });
    //                 return res.send({ message: 'Access token refreshed successfully.' });
    //             } else {
    //                 console.log('Access Denied.');
    //                 throw new UnauthorizedException('Access Denied.');
    //             }
    //         } else {
    //             console.log('Refresh Token does expired.');
    //             return res.send({ message: 'Please Login again.' });
    //         }
    //     }
    // }
}
