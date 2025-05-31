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
exports.TripsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const dto_1 = require("../../common/dto");
const constants_1 = require("../../constants");
const decorators_1 = require("../../decorators");
const users_schema_1 = require("../users/schema/users.schema");
const request_1 = require("./dto/request");
const response_1 = require("./dto/response");
const trips_service_1 = require("./trips.service");
let TripsController = class TripsController {
    constructor(tripsService) {
        this.tripsService = tripsService;
    }
    async createTrip(createTripDto, user) {
        var _a, _b;
        const result = await this.tripsService.createTrip(createTripDto, (_a = user.id) !== null && _a !== void 0 ? _a : (_b = user._id) === null || _b === void 0 ? void 0 : _b.toString());
        return (0, class_transformer_1.plainToInstance)(response_1.TripResponseDto, result, {
            excludeExtraneousValues: true
        });
    }
    async getAllTrips(page = 1, limit = 10) {
        const result = await this.tripsService.getAllTrips(page, limit);
        return (0, class_transformer_1.plainToInstance)(response_1.TripResponseDto, result, {
            excludeExtraneousValues: true
        });
    }
    async getMyTrips(user) {
        const result = await this.tripsService.getMyTrips(user._id.toString());
        return (0, class_transformer_1.plainToInstance)(response_1.TripResponseDto, result, {
            excludeExtraneousValues: true
        });
    }
    async searchTrips(destination, startDate, endDate) {
        const result = await this.tripsService.searchTrips(destination, startDate, endDate);
        return (0, class_transformer_1.plainToInstance)(response_1.TripResponseDto, result, {
            excludeExtraneousValues: true
        });
    }
    async getTripById(id) {
        return this.tripsService.getTripById(id);
    }
    async updateTrip(id, updateTripDto, user) {
        const result = await this.tripsService.updateTrip(id, updateTripDto, user._id.toString());
        return (0, class_transformer_1.plainToInstance)(response_1.TripResponseDto, result, {
            excludeExtraneousValues: true
        });
    }
    async deleteTrip(id, user) {
        return this.tripsService.deleteTrip(id, user._id.toString());
    }
    async joinTrip(id, joinTripDto, user) {
        const result = await this.tripsService.joinTrip(id, user._id.toString(), joinTripDto);
        return (0, class_transformer_1.plainToInstance)(response_1.TripResponseDto, result, {
            excludeExtraneousValues: true
        });
    }
    async leaveTrip(id, user) {
        const result = await this.tripsService.leaveTrip(id, user._id.toString());
        return (0, class_transformer_1.plainToInstance)(response_1.TripResponseDto, result, {
            excludeExtraneousValues: true
        });
    }
    async updateMemberStatus(id, memberId, updateMemberStatusDto, user) {
        return this.tripsService.updateMemberStatus(id, memberId, updateMemberStatusDto, user._id.toString());
    }
    async removeMember(id, memberId, user) {
        return this.tripsService.removeMember(id, memberId, user._id.toString());
    }
    async recommendMembers(id, user) {
        const result = await this.tripsService.recommendMembers(id, user._id.toString());
        return (0, class_transformer_1.plainToInstance)(users_schema_1.Users, result, {
            excludeExtraneousValues: true
        });
    }
};
__decorate([
    (0, common_1.Post)(),
    (0, decorators_1.Auth)([constants_1.UserRole.USER, constants_1.UserRole.ADMIN]),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, common_1.UseInterceptors)(common_1.ClassSerializerInterceptor),
    (0, swagger_1.ApiOkResponse)({
        description: 'Create a new trip',
        type: response_1.TripResponseDto
    }),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new trip' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, decorators_1.AuthUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [request_1.CreateTripDto, users_schema_1.Users]),
    __metadata("design:returntype", Promise)
], TripsController.prototype, "createTrip", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.UseInterceptors)(common_1.ClassSerializerInterceptor),
    (0, swagger_1.ApiOkResponse)({
        description: 'Get all trips with pagination',
        type: [response_1.TripResponseDto]
    }),
    (0, swagger_1.ApiOperation)({ summary: 'Get all trips' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], TripsController.prototype, "getAllTrips", null);
__decorate([
    (0, common_1.Get)('my-trips'),
    (0, decorators_1.Auth)([constants_1.UserRole.USER, constants_1.UserRole.ADMIN]),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.UseInterceptors)(common_1.ClassSerializerInterceptor),
    (0, swagger_1.ApiOkResponse)({
        description: 'Get current user trips',
        type: [response_1.TripResponseDto]
    }),
    (0, swagger_1.ApiOperation)({ summary: 'Get my trips' }),
    __param(0, (0, decorators_1.AuthUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [users_schema_1.Users]),
    __metadata("design:returntype", Promise)
], TripsController.prototype, "getMyTrips", null);
__decorate([
    (0, common_1.Get)('search'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.UseInterceptors)(common_1.ClassSerializerInterceptor),
    (0, swagger_1.ApiOkResponse)({
        description: 'Search trips',
        type: [response_1.TripResponseDto]
    }),
    (0, swagger_1.ApiOperation)({ summary: 'Search trips by destination and dates' }),
    (0, swagger_1.ApiQuery)({ name: 'destination', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'startDate', required: false, type: Date }),
    (0, swagger_1.ApiQuery)({ name: 'endDate', required: false, type: Date }),
    __param(0, (0, common_1.Query)('destination')),
    __param(1, (0, common_1.Query)('startDate')),
    __param(2, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Date,
        Date]),
    __metadata("design:returntype", Promise)
], TripsController.prototype, "searchTrips", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.UseInterceptors)(common_1.ClassSerializerInterceptor),
    (0, swagger_1.ApiOkResponse)({
        description: 'Get trip by ID',
        type: response_1.TripResponseDto
    }),
    (0, swagger_1.ApiOperation)({ summary: 'Get trip by ID' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TripsController.prototype, "getTripById", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, decorators_1.Auth)([constants_1.UserRole.USER, constants_1.UserRole.ADMIN]),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.UseInterceptors)(common_1.ClassSerializerInterceptor),
    (0, swagger_1.ApiOkResponse)({
        description: 'Update trip',
        type: response_1.TripResponseDto
    }),
    (0, swagger_1.ApiOperation)({ summary: 'Update trip (creator only)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, decorators_1.AuthUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, request_1.UpdateTripDto, users_schema_1.Users]),
    __metadata("design:returntype", Promise)
], TripsController.prototype, "updateTrip", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, decorators_1.Auth)([constants_1.UserRole.USER, constants_1.UserRole.ADMIN]),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOkResponse)({
        description: 'Delete trip',
        type: dto_1.ResponseDto
    }),
    (0, swagger_1.ApiOperation)({ summary: 'Delete trip (creator only)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, decorators_1.AuthUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, users_schema_1.Users]),
    __metadata("design:returntype", Promise)
], TripsController.prototype, "deleteTrip", null);
__decorate([
    (0, common_1.Post)(':id/join'),
    (0, decorators_1.Auth)([constants_1.UserRole.USER, constants_1.UserRole.ADMIN]),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.UseInterceptors)(common_1.ClassSerializerInterceptor),
    (0, swagger_1.ApiOkResponse)({
        description: 'Join trip',
        type: response_1.TripResponseDto
    }),
    (0, swagger_1.ApiOperation)({ summary: 'Request to join a trip' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, decorators_1.AuthUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, request_1.JoinTripDto, users_schema_1.Users]),
    __metadata("design:returntype", Promise)
], TripsController.prototype, "joinTrip", null);
__decorate([
    (0, common_1.Delete)(':id/leave'),
    (0, decorators_1.Auth)([constants_1.UserRole.USER, constants_1.UserRole.ADMIN]),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.UseInterceptors)(common_1.ClassSerializerInterceptor),
    (0, swagger_1.ApiOkResponse)({
        description: 'Leave trip',
        type: response_1.TripResponseDto
    }),
    (0, swagger_1.ApiOperation)({ summary: 'Leave a trip' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, decorators_1.AuthUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, users_schema_1.Users]),
    __metadata("design:returntype", Promise)
], TripsController.prototype, "leaveTrip", null);
__decorate([
    (0, common_1.Patch)(':id/members/:memberId/status'),
    (0, decorators_1.Auth)([constants_1.UserRole.USER, constants_1.UserRole.ADMIN]),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.UseInterceptors)(common_1.ClassSerializerInterceptor),
    (0, swagger_1.ApiOkResponse)({
        description: 'Update member status',
        type: response_1.TripResponseDto
    }),
    (0, swagger_1.ApiOperation)({ summary: 'Update member status (creator only)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('memberId')),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, decorators_1.AuthUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, request_1.UpdateMemberStatusDto,
        users_schema_1.Users]),
    __metadata("design:returntype", Promise)
], TripsController.prototype, "updateMemberStatus", null);
__decorate([
    (0, common_1.Delete)(':id/members/:memberId'),
    (0, decorators_1.Auth)([constants_1.UserRole.USER, constants_1.UserRole.ADMIN]),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.UseInterceptors)(common_1.ClassSerializerInterceptor),
    (0, swagger_1.ApiOkResponse)({
        description: 'Remove member from trip',
        type: response_1.TripResponseDto
    }),
    (0, swagger_1.ApiOperation)({ summary: 'Remove member from trip (creator only)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('memberId')),
    __param(2, (0, decorators_1.AuthUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, users_schema_1.Users]),
    __metadata("design:returntype", Promise)
], TripsController.prototype, "removeMember", null);
__decorate([
    (0, common_1.Get)(':id/recommend'),
    (0, decorators_1.Auth)([constants_1.UserRole.USER, constants_1.UserRole.ADMIN]),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.UseInterceptors)(common_1.ClassSerializerInterceptor),
    (0, swagger_1.ApiOkResponse)({
        description: 'Recommend members for a trip based on keyword',
        type: [users_schema_1.Users]
    }),
    (0, swagger_1.ApiOperation)({ summary: 'Recommend members for a trip' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, decorators_1.AuthUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, users_schema_1.Users]),
    __metadata("design:returntype", Promise)
], TripsController.prototype, "recommendMembers", null);
TripsController = __decorate([
    (0, common_1.Controller)('trips'),
    (0, swagger_1.ApiTags)('Trips'),
    __metadata("design:paramtypes", [trips_service_1.TripsService])
], TripsController);
exports.TripsController = TripsController;
//# sourceMappingURL=trips.controller.js.map