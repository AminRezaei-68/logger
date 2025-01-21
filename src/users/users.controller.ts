import { Controller, Get, Param } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
    constructor (private readonly usersServive: UsersService) {}

    @Get(':id')
    findOne(@Param('id') id: number) {
        return this.usersServive.findOne(id);
    }

    @Get()
    findAll() {
        return this.usersServive.findAll();
    }

    // @Patch(':id')
    // update(@Param('id') id: number, @Body() updateUserDto: UpdateUserDto) {
    //     return this.usersServive.update(id, updateUserDto);
    // }
}
