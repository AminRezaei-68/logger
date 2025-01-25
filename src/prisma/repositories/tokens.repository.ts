import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class TokensRepository {
    constructor(private readonly prismaService: PrismaService) {}

    async saveToken(data: SaveToken) {
        const { id, token } = data;
        console.log('the id is:', id);
        console.log('the refresh token is:', token);

        return await this.prismaService.refreshToken.upsert({
            where: { userId: id },
            update: { token: token },
            create: { userId: id, token: token },
        });
    }

    async findOne(data: FindOne) {
        const { id } = data;
        return await this.prismaService.refreshToken.findUnique({ where: { userId: id } });
    }
}
