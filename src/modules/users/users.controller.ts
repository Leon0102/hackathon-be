import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Patch,
    Put,
    Delete,
    UseInterceptors,
    ClassSerializerInterceptor
} from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Connection } from 'mongoose';

import { ResponseDto } from '../../common/dto';
import { UserRole } from '../../constants';
import { Auth, AuthUser } from '../../decorators';
import { ChangePasswordDto, UpdateUserDto } from './dto/request';
import { UserResponseDto } from './dto/response';
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

    @Get()
    @Auth([UserRole.ADMIN])
    @HttpCode(HttpStatus.OK)
    @UseInterceptors(ClassSerializerInterceptor)
    @ApiOkResponse({
        description: 'Get all users',
        type: [UserResponseDto]
    })
    @ApiOperation({ summary: 'Get all users (Admin only)' })
    async getAllUsers() {
        return this.usersService.getAllUsers();
    }

    @Get('profile')
    @Auth([UserRole.USER, UserRole.ADMIN])
    @HttpCode(HttpStatus.OK)
    @UseInterceptors(ClassSerializerInterceptor)
    @ApiOkResponse({
        description: 'Get current user profile',
        type: UserResponseDto
    })
    @ApiOperation({ summary: 'Get current user profile' })
    async getCurrentUserProfile(@AuthUser() user: Users) {
        return this.usersService.getUserByEmail(user.email);
    }

    @Put('profile')
    @Auth([UserRole.USER, UserRole.ADMIN])
    @HttpCode(HttpStatus.OK)
    @UseInterceptors(ClassSerializerInterceptor)
    @ApiOkResponse({
        description: 'Update user profile',
        type: UserResponseDto
    })
    @ApiOperation({ summary: 'Update user profile' })
    async updateProfile(@AuthUser() user: Users, @Body() updateUserDto: UpdateUserDto) {
        return this.usersService.updateUserByEmail(user.email, updateUserDto);
    }

    @Patch(':id/trust-score')
    @Auth([UserRole.ADMIN])
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse({
        description: 'Update user trust score',
        type: UserResponseDto
    })
    @ApiOperation({ summary: 'Update user trust score (Admin only)' })
    async updateTrustScore(@Param('id') id: string, @Body('trustScore') trustScore: number) {
        return this.usersService.updateTrustScore(id, trustScore);
    }

    @Patch(':id/verify')
    @Auth([UserRole.ADMIN])
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse({
        description: 'Verify user',
        type: UserResponseDto
    })
    @ApiOperation({ summary: 'Verify user (Admin only)' })
    async verifyUser(@Param('id') id: string) {
        return this.usersService.verifyUser(id);
    }

    @Delete(':id')
    @Auth([UserRole.ADMIN])
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse({
        description: 'Delete user',
        type: ResponseDto
    })
    @ApiOperation({ summary: 'Delete user (Admin only)' })
    async deleteUser(@Param('id') id: string) {
        return this.usersService.deleteUser(id);
    }
}
