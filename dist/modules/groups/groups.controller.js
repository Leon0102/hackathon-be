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
const decorators_1 = require("../../decorators");
const constants_1 = require("../../constants");
const groups_service_1 = require("./groups.service");
const create_group_dto_1 = require("./dto/request/create-group.dto");
const swagger_1 = require("@nestjs/swagger");
let GroupsController = class GroupsController {
    constructor(groupsService) {
        this.groupsService = groupsService;
    }
    createGroup(dto, user) {
        return this.groupsService.createGroup(dto, user._id.toString());
    }
    joinGroup(id, user) {
        return this.groupsService.joinGroup(id, user._id.toString());
    }
    leaveGroup(id, user) {
        return this.groupsService.leaveGroup(id, user._id.toString());
    }
    getMyGroups(user) {
        return this.groupsService.getMyGroups(user._id.toString());
    }
    getGroupById(id) {
        return this.groupsService.getGroupById(id);
    }
};
__decorate([
    (0, common_1.Post)(),
    (0, decorators_1.Auth)([constants_1.UserRole.USER, constants_1.UserRole.ADMIN]),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, decorators_1.AuthUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_group_dto_1.CreateGroupDto, Object]),
    __metadata("design:returntype", void 0)
], GroupsController.prototype, "createGroup", null);
__decorate([
    (0, common_1.Post)(':id/join'),
    (0, decorators_1.Auth)([constants_1.UserRole.USER, constants_1.UserRole.ADMIN]),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, decorators_1.AuthUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], GroupsController.prototype, "joinGroup", null);
__decorate([
    (0, common_1.Delete)(':id/leave'),
    (0, decorators_1.Auth)([constants_1.UserRole.USER, constants_1.UserRole.ADMIN]),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, decorators_1.AuthUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], GroupsController.prototype, "leaveGroup", null);
__decorate([
    (0, common_1.Get)('my-groups'),
    (0, decorators_1.Auth)([constants_1.UserRole.USER, constants_1.UserRole.ADMIN]),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, decorators_1.AuthUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], GroupsController.prototype, "getMyGroups", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], GroupsController.prototype, "getGroupById", null);
GroupsController = __decorate([
    (0, common_1.Controller)('groups'),
    (0, swagger_1.ApiTags)('Groups'),
    (0, common_1.UseInterceptors)(common_1.ClassSerializerInterceptor),
    __metadata("design:paramtypes", [groups_service_1.GroupsService])
], GroupsController);
exports.GroupsController = GroupsController;
//# sourceMappingURL=groups.controller.js.map