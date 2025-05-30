import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Group, GroupDocument } from './schema/group.schema';
import { CreateGroupDto } from './dto/request/create-group.dto';

@Injectable()
export class GroupsService {
  constructor(
    @InjectModel(Group.name) private readonly groupModel: Model<GroupDocument>,
  ) {}

  async createGroup(createGroupDto: CreateGroupDto, userId: string): Promise<Group> {
    const group = new this.groupModel({
      ...createGroupDto,
      owner: new Types.ObjectId(userId),
      trip: new Types.ObjectId(createGroupDto.tripId),
      members: [new Types.ObjectId(userId)],
    });
    return group.save();
  }

  async joinGroup(groupId: string, userId: string): Promise<Group> {
    const group = await this.groupModel.findById(groupId);
    if (!group) throw new NotFoundException('Group not found');
    if (group.members.includes(userId as any)) {
      throw new BadRequestException('Already a member');
    }
    group.members.push(new Types.ObjectId(userId));
    return group.save();
  }

  async leaveGroup(groupId: string, userId: string): Promise<Group> {
    const group = await this.groupModel.findById(groupId);
    if (!group) throw new NotFoundException('Group not found');
    if (group.owner.toString() === userId) {
      throw new ForbiddenException('Owner cannot leave the group');
    }
    group.members = group.members.filter(m => m.toString() !== userId);
    return group.save();
  }

  async getMyGroups(userId: string): Promise<Group[]> {
    return this.groupModel.find({ members: userId }).exec();
  }

  async getGroupById(groupId: string): Promise<Group> {
    const group = await this.groupModel.findById(groupId).exec();
    if (!group) throw new NotFoundException('Group not found');
    return group;
  }
}
