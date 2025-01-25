import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersRepository } from 'src/prisma/repositories/users.repository';
import { CreateUserDto } from './common/dtos/create.user.dto';

@Injectable()
export class UsersService {
    constructor(private readonly usersRepository: UsersRepository) {}

    private async hashPassword(password: string): Promise<string> {
        const salt = await bcrypt.genSalt(10);
        return bcrypt.hash(password, salt);
    }

    async create(createUserDto: CreateUserDto) {
        const { email, password } = createUserDto;

        const hashedPassword = await this.hashPassword(password);

        const createData = { email: email, password: hashedPassword };
        return await this.usersRepository.create(createData);
    }

    async findByEmail(email: string) {
        const data = { id: null, email: email };
        // const user = await this.prisma.user.findUnique({ where: { email } });
        const user = await this.usersRepository.findOne(data);
        return user;
    }

    async findOne(id: number) {
        const data = { id: id, email: null };
        // const user = await this.prisma.user.findUnique({ where: { id } });
        const user = await this.usersRepository.findOne(data);

        return user;
    }

    async findAll() {
        return await this.usersRepository.findAll();
    }
}
