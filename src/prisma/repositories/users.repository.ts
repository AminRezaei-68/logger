import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateUserDto } from 'src/users/common/dtos/create.user.dto';

@Injectable()
export class UsersRepository {
    constructor(private prismaService: PrismaService) {}

    async create(data: CreateUserDto) {
        return this.prismaService.user.create({ data });
    }

    async findOne(data: FindUser) {
        console.log('in user repository:', data);
        const { id, email } = data;
        console.log('id in user repository:', id);
        console.log('email in user repository:', email);

        if (email !== null) {
            return this.prismaService.user.findUnique({ where: { email: email } });
        }
        if (id !== null) {
            // const nummericalItem = parseInt(id);
            return this.prismaService.user.findUnique({ where: { id: id } });
        }
    }

    async findAll() {
        return this.prismaService.user.findMany();
    }
}
