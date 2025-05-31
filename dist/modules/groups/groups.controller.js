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
exports.GroupsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const constants_1 = require("../../constants");
const decorators_1 = require("../../decorators");
const users_schema_1 = require("../users/schema/users.schema");
const request_1 = require("./dto/request");
const response_1 = require("./dto/response");
const groups_service_1 = require("./groups.service");
let GroupsController = class GroupsController {
    constructor(groupsService) {
        this.groupsService = groupsService;
    }
    async getMyGroups(user) {
        var _a, _b;
        const result = await this.groupsService.getMyGroups(((_a = user.id) !== null && _a !== void 0 ? _a : (_b = user._id) === null || _b === void 0 ? void 0 : _b.toString()));
        return result.map((group) => (0, class_transformer_1.plainToInstance)(response_1.GroupResponseDto, group, {
            excludeExtraneousValues: true
        }));
    }
    async getGroupById(id) {
        const result = await this.groupsService.getGroupById(id);
        return (0, class_transformer_1.plainToInstance)(response_1.GroupResponseDto, result, {
            excludeExtraneousValues: true
        });
    }
    async recommendGroups(recommendDto, user) {
        var _a, _b;
        const result = await this.groupsService.recommendGroups(((_a = user.id) !== null && _a !== void 0 ? _a : (_b = user._id) === null || _b === void 0 ? void 0 : _b.toString()), recommendDto);
        return result.map((group) => (0, class_transformer_1.plainToInstance)(response_1.GroupResponseDto, group, {
            excludeExtraneousValues: true
        }));
    }
};
__decorate([
    (0, common_1.Get)('my-groups'),
    (0, decorators_1.Auth)([constants_1.UserRole.USER, constants_1.UserRole.ADMIN]),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOkResponse)({
        description: 'Get current user groups',
        type: [response_1.GroupResponseDto]
    }),
    (0, swagger_1.ApiOperation)({ summary: 'Get my groups' }),
    __param(0, (0, decorators_1.AuthUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [users_schema_1.Users]),
    __metadata("design:returntype", Promise)
], GroupsController.prototype, "getMyGroups", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOkResponse)({
        description: 'Get group by id',
        type: response_1.GroupResponseDto
    }),
    (0, swagger_1.ApiOperation)({ summary: 'Get group by id' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], GroupsController.prototype, "getGroupById", null);
__decorate([
    (0, common_1.Post)('recommend'),
    (0, decorators_1.Auth)([constants_1.UserRole.USER, constants_1.UserRole.ADMIN]),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOkResponse)({
        description: 'Recommend groups based on keyword',
        type: [response_1.GroupResponseDto]
    }),
    (0, swagger_1.ApiOperation)({ summary: 'Recommend groups based on keyword' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, decorators_1.AuthUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [request_1.RecommendGroupsDto, users_schema_1.Users]),
    __metadata("design:returntype", Promise)
], GroupsController.prototype, "recommendGroups", null);
GroupsController = __decorate([
    (0, common_1.Controller)('groups'),
    (0, swagger_1.ApiTags)('Groups'),
    (0, common_1.UseInterceptors)(common_1.ClassSerializerInterceptor),
    __metadata("design:paramtypes", [groups_service_1.GroupsService])
], GroupsController);
exports.GroupsController = GroupsController;
//# sourceMappingURL=groups.controller.js.map