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
exports.UsersController = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const swagger_1 = require("@nestjs/swagger");
const mongoose_2 = require("mongoose");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const class_transformer_1 = require("class-transformer");
const dto_1 = require("../../common/dto");
const constants_1 = require("../../constants");
const decorators_1 = require("../../decorators");
const request_1 = require("./dto/request");
const user_response_dto_1 = require("./dto/response/user-response.dto");
const schema_1 = require("./schema");
const users_service_1 = require("./users.service");
let UsersController = class UsersController {
    constructor(mongoConnection, usersService) {
        this.mongoConnection = mongoConnection;
        this.usersService = usersService;
    }
    async getUser(id) {
        const user = await this.usersService.findByIdOrEmail({ id });
        return (0, class_transformer_1.plainToInstance)(user_response_dto_1.UserResponseDto, user.toObject(), { excludeExtraneousValues: true });
    }
    changePassword(changePasswordDto, user) {
        return this.usersService.changePassword(user.email, changePasswordDto);
    }
    async getAllUsers() {
        const users = await this.usersService.getAllUsers();
        return users.map(u => (0, class_transformer_1.plainToInstance)(user_response_dto_1.UserResponseDto, u.toObject(), { excludeExtraneousValues: true }));
    }
    async getCurrentUserProfile(user) {
        const profile = await this.usersService.getUserByEmail(user.email);
        return profile ? (0, class_transformer_1.plainToInstance)(user_response_dto_1.UserResponseDto, profile, { excludeExtraneousValues: true }) : null;
    }
    async updateProfile(user, updateUserDto) {
        const updated = await this.usersService.updateUserByEmail(user.email, updateUserDto);
        return (0, class_transformer_1.plainToInstance)(user_response_dto_1.UserResponseDto, updated.toObject(), { excludeExtraneousValues: true });
    }
    async updateTrustScore(id, trustScore) {
        const updated = await this.usersService.updateTrustScore(id, trustScore);
        return (0, class_transformer_1.plainToInstance)(user_response_dto_1.UserResponseDto, updated.toObject(), { excludeExtraneousValues: true });
    }
    async verifyUser(id) {
        const updated = await this.usersService.verifyUser(id);
        return (0, class_transformer_1.plainToInstance)(user_response_dto_1.UserResponseDto, updated.toObject(), { excludeExtraneousValues: true });
    }
    async deleteUser(id) {
        return this.usersService.deleteUser(id);
    }
    async uploadAvatar(file, user) {
        const updatedUser = await this.usersService.uploadAvatar(user._id.toString(), file);
        return { profilePictureUrl: updatedUser.profilePictureUrl };
    }
};
__decorate([
    (0, common_1.Get)(':id([0-9a-fA-F]{24})'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOkResponse)({
        description: 'Get user by id',
        type: schema_1.Users
    }),
    (0, swagger_1.ApiOperation)({ summary: 'Get user by id' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getUser", null);
__decorate([
    (0, common_1.Patch)('change-password'),
    (0, decorators_1.Auth)([constants_1.UserRole.USER, constants_1.UserRole.ADMIN]),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOkResponse)({
        type: dto_1.ResponseDto,
        description: 'Change password successfully'
    }),
    (0, swagger_1.ApiOperation)({ summary: 'Change password' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, decorators_1.AuthUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [request_1.ChangePasswordDto, schema_1.Users]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "changePassword", null);
__decorate([
    (0, common_1.Get)(),
    (0, decorators_1.Auth)([constants_1.UserRole.ADMIN]),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.UseInterceptors)(common_1.ClassSerializerInterceptor),
    (0, swagger_1.ApiOkResponse)({
        description: 'Get all users',
        type: [user_response_dto_1.UserResponseDto]
    }),
    (0, swagger_1.ApiOperation)({ summary: 'Get all users (Admin only)' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getAllUsers", null);
__decorate([
    (0, common_1.Get)('profile'),
    (0, decorators_1.Auth)([constants_1.UserRole.USER, constants_1.UserRole.ADMIN]),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.UseInterceptors)(common_1.ClassSerializerInterceptor),
    (0, swagger_1.ApiOkResponse)({
        description: 'Get current user profile',
        type: user_response_dto_1.UserResponseDto
    }),
    (0, swagger_1.ApiOperation)({ summary: 'Get current user profile' }),
    __param(0, (0, decorators_1.AuthUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [schema_1.Users]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getCurrentUserProfile", null);
__decorate([
    (0, common_1.Put)('profile'),
    (0, decorators_1.Auth)([constants_1.UserRole.USER, constants_1.UserRole.ADMIN]),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.UseInterceptors)(common_1.ClassSerializerInterceptor),
    (0, swagger_1.ApiOkResponse)({
        description: 'Update user profile',
        type: user_response_dto_1.UserResponseDto
    }),
    (0, swagger_1.ApiOperation)({ summary: 'Update user profile' }),
    __param(0, (0, decorators_1.AuthUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [schema_1.Users, request_1.UpdateUserDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "updateProfile", null);
__decorate([
    (0, common_1.Patch)(':id/trust-score'),
    (0, decorators_1.Auth)([constants_1.UserRole.ADMIN]),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOkResponse)({
        description: 'Update user trust score',
        type: user_response_dto_1.UserResponseDto
    }),
    (0, swagger_1.ApiOperation)({ summary: 'Update user trust score (Admin only)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('trustScore')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "updateTrustScore", null);
__decorate([
    (0, common_1.Patch)(':id/verify'),
    (0, decorators_1.Auth)([constants_1.UserRole.ADMIN]),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOkResponse)({
        description: 'Verify user',
        type: user_response_dto_1.UserResponseDto
    }),
    (0, swagger_1.ApiOperation)({ summary: 'Verify user (Admin only)' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "verifyUser", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, decorators_1.Auth)([constants_1.UserRole.ADMIN]),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOkResponse)({
        description: 'Delete user',
        type: dto_1.ResponseDto
    }),
    (0, swagger_1.ApiOperation)({ summary: 'Delete user (Admin only)' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "deleteUser", null);
__decorate([
    (0, common_1.Post)('avatar'),
    (0, decorators_1.Auth)([constants_1.UserRole.USER, constants_1.UserRole.ADMIN]),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        storage: (0, multer_1.memoryStorage)(),
        limits: { fileSize: 5 * 1024 * 1024 }
    })),
    (0, swagger_1.ApiOperation)({ summary: 'Upload user avatar' }),
    (0, swagger_1.ApiOkResponse)({ description: 'Uploaded avatar URL', type: user_response_dto_1.UserResponseDto }),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, decorators_1.AuthUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, schema_1.Users]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "uploadAvatar", null);
UsersController = __decorate([
    (0, common_1.Controller)('users'),
    (0, swagger_1.ApiTags)('Users'),
    __param(0, (0, mongoose_1.InjectConnection)()),
    __metadata("design:paramtypes", [mongoose_2.Connection,
        users_service_1.UsersService])
], UsersController);
exports.UsersController = UsersController;
//# sourceMappingURL=users.controller.js.map