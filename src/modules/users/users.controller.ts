import { Body, Controller, Get, HttpCode, HttpStatus, Param, Patch } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Connection } from 'mongoose';

import { ResponseDto } from '../../common/dto';
import { UserRole } from '../../constants';
import { Auth, AuthUser } from '../../decorators';
import { ChangePasswordDto } from './dto/request';
import { Users } from './schema';
import { UsersService } from './users.service';

@Controller('users')
@ApiTags('Users')
export class UsersController {
    constructor(
        @InjectConnection() private readonly mongoConnection: Connection,
        private usersService: UsersService
    ) {}

    @Get(':id')
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse({
        description: 'Get user by id',
        type: Users
    })
    @ApiOperation({ summary: 'Get user by id' })
    async getUser(@Param('id') id: string) {
        return this.usersService.findByIdOrEmail({ id });
    }

    @Patch('change-password')
    @Auth([UserRole.USER, UserRole.ADMIN])
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse({
        type: ResponseDto,
        description: 'Change password successfully'
    })
    @ApiOperation({ summary: 'Change password' })
    changePassword(@Body() changePasswordDto: ChangePasswordDto, @AuthUser() user: Users) {
        return this.usersService.changePassword(user.email, changePasswordDto);
    }
}
