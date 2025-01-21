import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma/prisma.service';


@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) {}

    private async hashPassword(password: string): Promise<string> {
       const salt = await bcrypt.genSalt(10);
      return bcrypt.hash(password, salt);
    }
  
    async create(data: {email: string, password: string}) {
      const {email, password} = data;
  
      const hashedPassword = await this.hashPassword(password);
  
      return await this.prisma.user.create({data: {email: email, password: hashedPassword}});
    }

    async findByEmail(email: string) {
      const user = await this.prisma.user.findUnique({where: {email}});

      return user;
    }

    async findOne(id: number) {
      const user = await this.prisma.user.findUnique({where: {id}});

      return user;
    }

    async findAll() {
      return await this.prisma.user.findMany()
    }
}
