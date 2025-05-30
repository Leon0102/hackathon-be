import { BadRequestException, Injectable } from '@nestjs/common';
import { ConflictException, NotFoundException } from '@nestjs/common/exceptions';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { ResponseDto } from '../../common/dto';
import { ErrorCode, SuccessCode } from '../../constants';
import type { UserRegisterDto } from '../auth/dto';
import type { ChangePasswordDto, ResetPasswordDto } from './dto/request';
import { Users } from './schema';
@Injectable()
export class UsersService {
    constructor(@InjectModel(Users.name) private readonly usersModel: Model<Users>) {}

    async createUser(createUserDto: UserRegisterDto): Promise<Users> {
        const user = await this.usersModel.findOne({ email: createUserDto.email });

        if (user) {
            throw new BadRequestException('User already exists');
        }

        const createdUser = new this.usersModel(createUserDto);

        return createdUser.save();
    }

    async findOne(query: { id?: string; email?: string; role?: string }): Promise<Users | null> {
        return this.usersModel.findOne(query);
    }

    async getUserByEmail(email: string): Promise<Users | null> {
        return this.usersModel.findOne({ email });
    }

    async findByIdOrEmail({ id, email }: { id?: string; email?: string }) {
        const user = await this.usersModel.findOne({ $or: [{ _id: id }, { email }] });

        if (!user) {
            throw new NotFoundException(ErrorCode.USER_NOT_FOUND);
        }

        return user;
    }

    async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<ResponseDto> {
        const user = await this.findByIdOrEmail({
            email: resetPasswordDto.email
        });

        if (!user) {
            throw new NotFoundException(ErrorCode.USER_NOT_FOUND);
        }

        await this.updatePassword(user.email, resetPasswordDto.newPassword);

        return new ResponseDto({ messageCode: SuccessCode.PASSWORD_CHANGED });
    }

    async updatePassword(email: string, password: string) {
        return this.usersModel.updateOne({ email }, { passwordHash: password });
    }

    async checkExistingEmail(email: string) {
        const result = await this.usersModel.exists({ email });

        if (result) {
            throw new ConflictException(ErrorCode.AUTH_EMAIL_EXISTED);
        }

        return new ResponseDto({ messageCode: SuccessCode.EMAIL_VALID });
    }

    async changePassword(userEmail: string, changePasswordDto: ChangePasswordDto) {
        const user = await this.findByIdOrEmail({ email: userEmail });

        if (changePasswordDto.newPassword === changePasswordDto.newPasswordConfirmed) {
            await this.updatePassword(user.email, changePasswordDto.newPassword);

            return new ResponseDto({ messageCode: SuccessCode.PASSWORD_UPDATED });
        }

        throw new BadRequestException(ErrorCode.PASSWORD_NOT_UPDATED);
    }

    async getAllUsers(): Promise<Users[]> {
        return this.usersModel.find().select('-passwordHash').exec();
    }

    async getUserById(userId: string): Promise<Users> {
        const user = await this.usersModel.findById(userId).select('-passwordHash').exec();

        if (!user) {
            throw new NotFoundException(ErrorCode.USER_NOT_FOUND);
        }

        return user;
    }

    async updateUser(userId: string, updateUserDto: any): Promise<Users> {
        const user = await this.usersModel.findByIdAndUpdate(
            userId,
            updateUserDto,
            { new: true, runValidators: true }
        ).select('-passwordHash').exec();

        if (!user) {
            throw new NotFoundException(ErrorCode.USER_NOT_FOUND);
        }

        return user;
    }

    async updateUserByEmail(email: string, updateUserDto: any): Promise<Users> {
        const user = await this.usersModel.findOneAndUpdate(
            { email },
            updateUserDto,
            { new: true, runValidators: true }
        ).select('-passwordHash').exec();

        if (!user) {
            throw new NotFoundException(ErrorCode.USER_NOT_FOUND);
        }

        return user;
    }

    async updateTrustScore(userId: string, newScore: number): Promise<Users> {
        const user = await this.usersModel.findByIdAndUpdate(
            userId,
            { trustScore: newScore },
            { new: true }
        ).select('-passwordHash').exec();

        if (!user) {
            throw new NotFoundException(ErrorCode.USER_NOT_FOUND);
        }

        return user;
    }

    async verifyUser(userId: string): Promise<Users> {
        const user = await this.usersModel.findByIdAndUpdate(
            userId,
            { isVerified: true },
            { new: true }
        ).select('-passwordHash').exec();

        if (!user) {
            throw new NotFoundException(ErrorCode.USER_NOT_FOUND);
        }

        return user;
    }

    async deleteUser(userId: string): Promise<ResponseDto> {
        const result = await this.usersModel.findByIdAndDelete(userId).exec();

        if (!result) {
            throw new NotFoundException(ErrorCode.USER_NOT_FOUND);
        }

        return new ResponseDto({ messageCode: SuccessCode.USER_DELETED || 'USER_DELETED' });
    }
}
