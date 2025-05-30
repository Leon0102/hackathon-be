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
exports.GroupsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const group_schema_1 = require("./schema/group.schema");
let GroupsService = class GroupsService {
    constructor(groupModel) {
        this.groupModel = groupModel;
    }
    async createGroup(createGroupDto, userId) {
        const group = new this.groupModel(Object.assign(Object.assign({}, createGroupDto), { owner: new mongoose_2.Types.ObjectId(userId), trip: new mongoose_2.Types.ObjectId(createGroupDto.tripId), members: [new mongoose_2.Types.ObjectId(userId)] }));
        return group.save();
    }
    async joinGroup(groupId, userId) {
        const group = await this.groupModel.findById(groupId);
        if (!group)
            throw new common_1.NotFoundException('Group not found');
        if (group.members.includes(userId)) {
            throw new common_1.BadRequestException('Already a member');
        }
        group.members.push(new mongoose_2.Types.ObjectId(userId));
        return group.save();
    }
    async leaveGroup(groupId, userId) {
        const group = await this.groupModel.findById(groupId);
        if (!group)
            throw new common_1.NotFoundException('Group not found');
        if (group.owner.toString() === userId) {
            throw new common_1.ForbiddenException('Owner cannot leave the group');
        }
        group.members = group.members.filter(m => m.toString() !== userId);
        return group.save();
    }
    async getMyGroups(userId) {
        return this.groupModel.find({ members: userId }).exec();
    }
    async getGroupById(groupId) {
        const group = await this.groupModel.findById(groupId).exec();
        if (!group)
            throw new common_1.NotFoundException('Group not found');
        return group;
    }
};
GroupsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(group_schema_1.Group.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], GroupsService);
exports.GroupsService = GroupsService;
//# sourceMappingURL=groups.service.js.map