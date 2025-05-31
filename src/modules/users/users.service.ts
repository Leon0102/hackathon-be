import { BadRequestException, HttpStatus, Injectable } from '@nestjs/common';
import { ConflictException, NotFoundException } from '@nestjs/common/exceptions';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { ResponseDto } from '../../common/dto';
import { ErrorCode, SuccessCode } from '../../constants';
import type { IFile } from '../../interfaces';
import { AwsS3Service } from '../../shared/services/aws-s3.service';
import type { UserRegisterDto } from '../auth/dto';
import type { ChangePasswordDto, ResetPasswordDto } from './dto/request';
import { Users } from './schema/users.schema';
@Injectable()
export class UsersService {
    constructor(
        @InjectModel(Users.name) private readonly usersModel: Model<Users>,
        private readonly awsS3Service: AwsS3Service
    ) {}

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

    // Returns plain user object without Mongoose methods
    async getUserByEmail(email: string): Promise<any | null> {
        return this.usersModel.findOne({ email }).lean().exec();
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

    // Returns list of plain user objects
    async getAllUsers(): Promise<any[]> {
        return this.usersModel.find().select('-passwordHash').lean().exec();
    }

    // Returns plain user object by ID
    async getUserById(userId: string): Promise<any> {
        const user = await this.usersModel.findById(userId).select('-passwordHash').lean().exec();

        if (!user) {
            throw new NotFoundException(ErrorCode.USER_NOT_FOUND);
        }

        return user;
    }

    async updateUser(userId: string, updateUserDto: any): Promise<Users> {
        const user = await this.usersModel
            .findByIdAndUpdate(userId, updateUserDto, { new: true, runValidators: true })
            .select('-passwordHash')
            .exec();

        if (!user) {
            throw new NotFoundException(ErrorCode.USER_NOT_FOUND);
        }

        return user;
    }

    async updateUserByEmail(email: string, updateUserDto: any): Promise<Users> {
        const user = await this.usersModel
            .findOneAndUpdate({ email }, updateUserDto, { new: true, runValidators: true })
            .select('-passwordHash')
            .exec();

        if (!user) {
            throw new NotFoundException(ErrorCode.USER_NOT_FOUND);
        }

        return user;
    }

    async updateTrustScore(userId: string, newScore: number): Promise<Users> {
        const user = await this.usersModel
            .findByIdAndUpdate(userId, { trustScore: newScore }, { new: true })
            .select('-passwordHash')
            .exec();

        if (!user) {
            throw new NotFoundException(ErrorCode.USER_NOT_FOUND);
        }

        return user;
    }

    async verifyUser(userId: string): Promise<Users> {
        const user = await this.usersModel
            .findByIdAndUpdate(userId, { isVerified: true }, { new: true })
            .select('-passwordHash')
            .exec();

        if (!user) {
            throw new NotFoundException(ErrorCode.USER_NOT_FOUND);
        }

        return user.toObject();
    }

    async deleteUser(userId: string): Promise<ResponseDto> {
        const result = await this.usersModel.findByIdAndDelete(userId).exec();

        if (!result) {
            throw new NotFoundException(ErrorCode.USER_NOT_FOUND);
        }

        return new ResponseDto({ statusCode: HttpStatus.OK, messageCode: SuccessCode.USER_DELETED });
    }

    async uploadAvatar(userId: string, file: Express.Multer.File): Promise<Users> {
        if (!file) {
            throw new BadRequestException('No file provided');
        }

        // Convert Express.Multer.File to IFile format
        const fileData: IFile = {
            encoding: file.encoding,
            buffer: file.buffer,
            fieldname: file.fieldname,
            mimetype: file.mimetype,
            originalname: file.originalname,
            size: file.size
        };

        // Upload using AwsS3Service
        const url = await this.awsS3Service.uploadImage(fileData);

        // Update user record
        const updated = await this.usersModel
            .findByIdAndUpdate(userId, { profilePictureUrl: url }, { new: true })
            .select('-passwordHash')
            .exec();

        if (!updated) {
            throw new NotFoundException('User not found');
        }

        return updated.toObject();
    }

    /**
     * Search users for recommendations based on keyword and user patterns
     */
    async searchUsersForRecommendations(
        keyword: string,
        excludeUserId: string,
        userPatterns?: any,
        limit: number = 20
    ): Promise<any[]> {
        try {
            const excludeIds = [excludeUserId];

            // Build search query
            const searchQuery: any = {
                _id: { $nin: excludeIds },
                isVerified: true, // Only recommend verified users
            };

            // Search in multiple fields
            if (keyword && keyword.trim()) {
                const keywordRegex = new RegExp(keyword.trim(), 'i');
                searchQuery.$or = [
                    { fullName: keywordRegex },
                    { bio: keywordRegex },
                    { tags: { $in: [keywordRegex] } },
                    { preferredDestinations: { $in: [keywordRegex] } },
                    { languages: { $in: [keywordRegex] } }
                ];
            }

            const users = await this.usersModel
                .find(searchQuery)
                .select('fullName email profilePictureUrl age gender bio languages travelStyle preferredDestinations tags trustScore')
                .limit(limit)
                .lean()
                .exec();

            // Add recommendation-specific fields
            return users.map(user => ({
                ...user,
                commonInterests: this.calculateCommonInterests(user, userPatterns),
                mutualConnections: this.calculateMutualConnections(user, excludeUserId),
                lastActiveAt: new Date() // Simplified for now
            }));

        } catch (error) {
            console.error('Error searching users for recommendations:', error);
            return [];
        }
    }

    /**
     * Calculate common interests between users (simplified)
     */
    private calculateCommonInterests(user: any, userPatterns?: any): string[] {
        if (!userPatterns?.topKeywords || !user.tags) {
            return [];
        }

        return user.tags.filter(tag =>
            userPatterns.topKeywords.some(keyword =>
                tag.toLowerCase().includes(keyword.toLowerCase())
            )
        );
    }

    /**
     * Calculate mutual connections (simplified - would need actual connection data)
     */
    private calculateMutualConnections(user: any, currentUserId: string): number {
        // This would typically require a connections/friends collection
        // For now, return a random number for demonstration
        return Math.floor(Math.random() * 10);
    }
}
