import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class UsersRepository {
    constructor(private prismaService: PrismaService) {}

    async create(data) {
        return this.prismaService.user.create(data);
    }
}
