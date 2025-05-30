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
const dto_1 = require("../../common/dto");
const constants_1 = require("../../constants");
const decorators_1 = require("../../decorators");
const request_1 = require("./dto/request");
const response_1 = require("./dto/response");
const schema_1 = require("./schema");
const users_service_1 = require("./users.service");
let UsersController = class UsersController {
    constructor(mongoConnection, usersService) {
        this.mongoConnection = mongoConnection;
        this.usersService = usersService;
    }
    async getUser(id) {
        return this.usersService.findByIdOrEmail({ id });
    }
    changePassword(changePasswordDto, user) {
        return this.usersService.changePassword(user.email, changePasswordDto);
    }
    async getAllUsers() {
        return this.usersService.getAllUsers();
    }
    async getCurrentUserProfile(user) {
        return this.usersService.getUserByEmail(user.email);
    }
    async updateProfile(user, updateUserDto) {
        return this.usersService.updateUserByEmail(user.email, updateUserDto);
    }
    async updateTrustScore(id, trustScore) {
        return this.usersService.updateTrustScore(id, trustScore);
    }
    async verifyUser(id) {
        return this.usersService.verifyUser(id);
    }
    async deleteUser(id) {
        return this.usersService.deleteUser(id);
    }
};
__decorate([
    (0, common_1.Get)(':id'),
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
        type: [response_1.UserResponseDto]
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
        type: response_1.UserResponseDto
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
        type: response_1.UserResponseDto
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
        type: response_1.UserResponseDto
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
        type: response_1.UserResponseDto
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
UsersController = __decorate([
    (0, common_1.Controller)('users'),
    (0, swagger_1.ApiTags)('Users'),
    __param(0, (0, mongoose_1.InjectConnection)()),
    __metadata("design:paramtypes", [mongoose_2.Connection,
        users_service_1.UsersService])
], UsersController);
exports.UsersController = UsersController;
//# sourceMappingURL=users.controller.js.map