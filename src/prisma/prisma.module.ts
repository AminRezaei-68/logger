/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { UsersRepository } from './repositories/users.repository';
import { TokensRepository } from './repositories/tokens.repository';

@Module({
    providers: [PrismaService, UsersRepository, TokensRepository],
    exports: [PrismaService, UsersRepository, TokensRepository],
})
export class PrismaModule {}
