import { BadRequestException, CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';
import { AuthService } from 'src/auth/auth.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class JwtGuard implements CanActivate {
    constructor(
        private readonly jwtService: JwtService,
        private readonly prisma: PrismaService,
        private readonly authService: AuthService,
    ) {}
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();

        // try {
        const accessToken = request.cookies['access_token'];
        const refreshToken = request.cookies['refresh_token'];

        console.log('accessToken :', accessToken);

        // const decodedAccessToken = await this.jwtService.verify(access_token, {secret: {process.env.JWT_SECRET}});
        // const decodedAccessToken = this.jwtService.verify(accessToken, { secret: 321321 });
        const decodedAccessToken = this.jwtService.decode(accessToken);
        const decodedRefreshToken = this.jwtService.decode(refreshToken);

        if (decodedAccessToken.sub !== decodedRefreshToken.sub) {
            throw new UnauthorizedException('Invalid Tokens.');
        }

        const currentTime: Date = new Date();
        const accessTokenExpTime: Date = new Date(decodedAccessToken.exp * 1000);
        const refreshTokenExpTime: Date = new Date(decodedRefreshToken.exp * 1000);

        if (accessTokenExpTime > currentTime) {
            console.log('Access Token does not expired go ahead.');
            return true;
        } else {
            console.log('Access Token does expired.');
            if (refreshTokenExpTime > currentTime) {
                console.log('Refresh Token does not expired.');
                console.log('refresh token:', decodedRefreshToken);
                console.log('refresh token:', refreshToken);
                const databaseRefrshToken = await this.prisma.refreshToken.findUnique({ where: { userId: decodedRefreshToken.sub } });

                console.log('database refresh token:', databaseRefrshToken);

                if (!databaseRefrshToken || decodedRefreshToken.sub !== databaseRefrshToken.userId) {
                    throw new UnauthorizedException('Invalid Refresh Token.');
                }

                console.log('database refresh token :', databaseRefrshToken);
                const newTokens = await this.authService.createToken(decodedRefreshToken.sub, decodedRefreshToken.email);
                console.log('new tokens:', newTokens);
                request.res.cookie('access_token', newTokens.access_token, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    maxAge: 3 * 60 * 1000,
                });

                request.res.cookie('refresh_token', newTokens.refresh_token, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    maxAge: 7 * 24 * 60 * 60 * 1000,
                });

                return true;
            } else {
                throw new BadRequestException('You should login again.');
            }
        }
        // } catch (error) {
        //     throw new UnauthorizedException('Invalid or expired tokens.');
        // }
    }
}
