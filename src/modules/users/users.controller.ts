import {
    Body,
    ClassSerializerInterceptor,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Patch,
    Post,
    Put,
    UploadedFile,
    UseInterceptors
} from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { Connection } from 'mongoose';
import { memoryStorage } from 'multer';

import { ResponseDto } from '../../common/dto';
import { UserRole } from '../../constants';
import { Auth, AuthUser } from '../../decorators';
import { ChangePasswordDto, UpdateUserDto } from './dto/request';
import { UserResponseDto } from './dto/response/user-response.dto';
import { Users } from './schema';
import { UsersService } from './users.service';

@Controller('users')
@ApiTags('Users')
export class UsersController {
    constructor(
        @InjectConnection() private readonly mongoConnection: Connection,
        private usersService: UsersService
    ) {}

    @Get(':id([0-9a-fA-F]{24})')
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse({
        description: 'Get user by id',
        type: Users
    })
    @ApiOperation({ summary: 'Get user by id' })
    async getUser(@Param('id') id: string) {
        const user = await this.usersService.getUserById(id);

        return plainToInstance(UserResponseDto, user, { excludeExtraneousValues: true });
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
        const users = await this.usersService.getAllUsers();

        return users.map((u) => plainToInstance(UserResponseDto, u, { excludeExtraneousValues: true }));
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
        const profile = await this.usersService.getUserByEmail(user.email);

        return profile ? plainToInstance(UserResponseDto, profile, { excludeExtraneousValues: true }) : null;
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
        const updated = await this.usersService.updateUserByEmail(user.email, updateUserDto);

        return plainToInstance(UserResponseDto, updated.toObject(), { excludeExtraneousValues: true });
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
        const updated = await this.usersService.updateTrustScore(id, trustScore);

        return plainToInstance(UserResponseDto, updated.toObject(), { excludeExtraneousValues: true });
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
        const updated = await this.usersService.verifyUser(id);

        return plainToInstance(UserResponseDto, updated.toObject(), { excludeExtraneousValues: true });
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

    @Post('avatar')
    @Auth([UserRole.USER, UserRole.ADMIN])
    @HttpCode(HttpStatus.OK)
    @UseInterceptors(
        FileInterceptor('file', {
            storage: memoryStorage(),
            limits: { fileSize: 5 * 1024 * 1024 } // 5MB
        })
    )
    @ApiOperation({ summary: 'Upload user avatar' })
    @ApiOkResponse({ description: 'Uploaded avatar URL', type: UserResponseDto })
    async uploadAvatar(@UploadedFile() file: Express.Multer.File, @AuthUser() user: Users) {
        const updatedUser = await this.usersService.uploadAvatar(user._id.toString()! as string, file);

        return { profilePictureUrl: updatedUser.profilePictureUrl };
    }
}
