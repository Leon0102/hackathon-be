import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AzureOpenAI } from 'openai';

import { Users } from '../users/schema/users.schema';
import { Trips } from '../trips/schema/trips.schema';
import type { CreateGroupDto } from './dto/request/create-group.dto';
import type { RecommendGroupsDto } from './dto/request/recommend-groups.dto';
import type { GroupDocument } from './schema/group.schema';
import { Group } from './schema/group.schema';

@Injectable()
export class GroupsService {
    private readonly openai: AzureOpenAI;

    constructor(
        @InjectModel(Group.name) private readonly groupModel: Model<GroupDocument>,
        @InjectModel(Users.name) private readonly userModel: Model<Users>,
        @InjectModel(Trips.name) private readonly tripsModel: Model<Trips>
    ) {
        // Initialize Azure OpenAI client with proper authentication
        const apiKey = process.env.AZURE_OPENAI_KEY;
        const endpoint = `https://${process.env.AZURE_OPENAI_RESOURCE_NAME}.openai.azure.com`;
        const deployment = process.env.AZURE_OPENAI_DEPLOYMENT_NAME;
        const apiVersion = '2024-10-21';

        if (!apiKey || !process.env.AZURE_OPENAI_RESOURCE_NAME || !deployment) {
            throw new Error(
                'Azure OpenAI configuration is missing. Please check AZURE_OPENAI_KEY, AZURE_OPENAI_RESOURCE_NAME, and AZURE_OPENAI_DEPLOYMENT_NAME environment variables.'
            );
        }

        // For key-based authentication (suitable for development)
        this.openai = new AzureOpenAI({
            apiKey,
            endpoint,
            deployment,
            apiVersion
        });
    }

    async createGroup(createGroupDto: CreateGroupDto, userId: string): Promise<Group> {
        const group = new this.groupModel({
            ...createGroupDto,
            owner: new Types.ObjectId(userId),
            trip: new Types.ObjectId(createGroupDto.tripId),
            members: [new Types.ObjectId(userId)]
        });

        return group.save();
    }

    async joinGroup(groupId: string, userId: string): Promise<Group> {
        const group = await this.groupModel.findById(groupId);

        if (!group) {
            throw new NotFoundException('Group not found');
        }

        if (group.members.some((member) => member.toString() === userId)) {
            throw new BadRequestException('Already a member');
        }

        // Check if group is full
        if (group.members.length >= group.maxParticipants) {
            throw new BadRequestException('Group is full');
        }

        group.members.push(new Types.ObjectId(userId));

        return group.save();
    }

    async leaveGroup(groupId: string, userId: string): Promise<Group> {
        const group = await this.groupModel.findById(groupId);

        if (!group) {
            throw new NotFoundException('Group not found');
        }

        if (group.owner.toString() === userId) {
            throw new ForbiddenException('Owner cannot leave the group');
        }

        group.members = group.members.filter((m) => m.toString() !== userId);

        return group.save();
    }

    async getMyGroups(userId: string): Promise<Group[]> {
        return this.groupModel.find({ members: new Types.ObjectId(userId) }).exec();
    }

    async getGroupById(groupId: string): Promise<Group> {
        const group = await this.groupModel.findById(groupId).exec();

        if (!group) {
            throw new NotFoundException('Group not found');
        }

        return group;
    }

    async recommendGroups(userId: string, dto: RecommendGroupsDto): Promise<Group[]> {
        // Fetch the user's current groups to exclude them
        const userGroups = await this.groupModel.find({ members: new Types.ObjectId(userId) }).exec();
        const excludedGroupIds = userGroups.map((g) => g._id.toString());

        // Fetch candidate groups not already joined by the user
        const candidates = await this.groupModel
            .find({ _id: { $nin: excludedGroupIds } })
            .populate('owner', 'fullName email profilePictureUrl')
            .populate('trip', 'destination startDate endDate')
            .exec();

        // Use Azure OpenAI to recommend best matching group IDs
        const profiles = candidates
            .map((g) => {
                const trip = g.trip as { destination?: string };

                return `ID: ${g._id}, Name: ${g.name}, Destination: ${trip?.destination ?? 'N/A'}, Owner: ${
                    (g.owner as { fullName?: string })?.fullName ?? 'Unknown'
                }`;
            })
            .join('\n');

        const prompt = `Recommend up to 10 group IDs best matching keyword "${dto.keyword}" from the groups list:\n${profiles}`;

        try {
            const completion = await this.openai.chat.completions.create({
                messages: [{ role: 'user', content: prompt }],
                model: '', // Empty string when using deployment
                max_tokens: 256
            });

            let recommendedIds: string[] = [];

            try {
                const responseContent = completion.choices[0]?.message?.content;

                if (responseContent) {
                    recommendedIds = JSON.parse(responseContent);
                }
            } catch {
                // fallback to simple name/destination match
                const keywordLower = dto.keyword.toLowerCase();
                recommendedIds = candidates
                    .filter((g) => {
                        const trip = g.trip as { destination?: string };

                        return (
                            g.name.toLowerCase().includes(keywordLower) ||
                            trip?.destination?.toLowerCase().includes(keywordLower)
                        );
                    })
                    .map((g) => g._id?.toString() ?? '');
            }

            let recommended = candidates.filter((g) => recommendedIds.includes((g._id as Types.ObjectId)?.toString() ?? ''));

            if (recommended.length === 0) {
                // fallback to simple search
                recommended = candidates.slice(0, 10);
            }

            return recommended.slice(0, 10);
        } catch (error) {
            console.error('Azure OpenAI API error:', error);
            // fallback to simple name/destination match
            const keywordLower = dto.keyword.toLowerCase();
            const recommended = candidates
                .filter((g) => {
                    const trip = g.trip as { destination?: string };

                    return (
                        g.name.toLowerCase().includes(keywordLower) ||
                        trip?.destination?.toLowerCase().includes(keywordLower)
                    );
                })
                .slice(0, 10);

            if (recommended.length === 0) {
                return candidates.slice(0, 10);
            }

            return recommended;
        }
    }
}
