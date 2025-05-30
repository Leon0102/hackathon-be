"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const exceptions_1 = require("@nestjs/common/exceptions");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const dto_1 = require("../../common/dto");
const constants_1 = require("../../constants");
const schema_1 = require("./schema");
let UsersService = class UsersService {
    constructor(usersModel) {
        this.usersModel = usersModel;
    }
    async createUser(createUserDto) {
        const user = await this.usersModel.findOne({ email: createUserDto.email });
        if (user) {
            throw new common_1.BadRequestException('User already exists');
        }
        const createdUser = new this.usersModel(createUserDto);
        return createdUser.save();
    }
    async findOne(query) {
        return this.usersModel.findOne(query);
    }
    async getUserByEmail(email) {
        return this.usersModel.findOne({ email });
    }
    async findByIdOrEmail({ id, email }) {
        const user = await this.usersModel.findOne({ $or: [{ _id: id }, { email }] });
        if (!user) {
            throw new exceptions_1.NotFoundException(constants_1.ErrorCode.USER_NOT_FOUND);
        }
        return user;
    }
    async resetPassword(resetPasswordDto) {
        const user = await this.findByIdOrEmail({
            email: resetPasswordDto.email
        });
        if (!user) {
            throw new exceptions_1.NotFoundException(constants_1.ErrorCode.USER_NOT_FOUND);
        }
        await this.updatePassword(user.email, resetPasswordDto.newPassword);
        return new dto_1.ResponseDto({ messageCode: constants_1.SuccessCode.PASSWORD_CHANGED });
    }
    async updatePassword(email, password) {
        return this.usersModel.updateOne({ email }, { passwordHash: password });
    }
    async checkExistingEmail(email) {
        const result = await this.usersModel.exists({ email });
        if (result) {
            throw new exceptions_1.ConflictException(constants_1.ErrorCode.AUTH_EMAIL_EXISTED);
        }
        return new dto_1.ResponseDto({ messageCode: constants_1.SuccessCode.EMAIL_VALID });
    }
    async changePassword(userEmail, changePasswordDto) {
        const user = await this.findByIdOrEmail({ email: userEmail });
        if (changePasswordDto.newPassword === changePasswordDto.newPasswordConfirmed) {
            await this.updatePassword(user.email, changePasswordDto.newPassword);
            return new dto_1.ResponseDto({ messageCode: constants_1.SuccessCode.PASSWORD_UPDATED });
        }
        throw new common_1.BadRequestException(constants_1.ErrorCode.PASSWORD_NOT_UPDATED);
    }
    async getAllUsers() {
        return this.usersModel.find().select('-passwordHash').exec();
    }
    async getUserById(userId) {
        const user = await this.usersModel.findById(userId).select('-passwordHash').exec();
        if (!user) {
            throw new exceptions_1.NotFoundException(constants_1.ErrorCode.USER_NOT_FOUND);
        }
        return user;
    }
    async updateUser(userId, updateUserDto) {
        const user = await this.usersModel.findByIdAndUpdate(userId, updateUserDto, { new: true, runValidators: true }).select('-passwordHash').exec();
        if (!user) {
            throw new exceptions_1.NotFoundException(constants_1.ErrorCode.USER_NOT_FOUND);
        }
        return user;
    }
    async updateUserByEmail(email, updateUserDto) {
        const user = await this.usersModel.findOneAndUpdate({ email }, updateUserDto, { new: true, runValidators: true }).select('-passwordHash').exec();
        if (!user) {
            throw new exceptions_1.NotFoundException(constants_1.ErrorCode.USER_NOT_FOUND);
        }
        return user;
    }
    async updateTrustScore(userId, newScore) {
        const user = await this.usersModel.findByIdAndUpdate(userId, { trustScore: newScore }, { new: true }).select('-passwordHash').exec();
        if (!user) {
            throw new exceptions_1.NotFoundException(constants_1.ErrorCode.USER_NOT_FOUND);
        }
        return user;
    }
    async verifyUser(userId) {
        const user = await this.usersModel.findByIdAndUpdate(userId, { isVerified: true }, { new: true }).select('-passwordHash').exec();
        if (!user) {
            throw new exceptions_1.NotFoundException(constants_1.ErrorCode.USER_NOT_FOUND);
        }
        return user;
    }
    async deleteUser(userId) {
        const result = await this.usersModel.findByIdAndDelete(userId).exec();
        if (!result) {
            throw new exceptions_1.NotFoundException(constants_1.ErrorCode.USER_NOT_FOUND);
        }
        return new dto_1.ResponseDto({ messageCode: constants_1.SuccessCode.USER_DELETED || 'USER_DELETED' });
    }
};
UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(schema_1.Users.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], UsersService);
exports.UsersService = UsersService;
//# sourceMappingURL=users.service.js.map