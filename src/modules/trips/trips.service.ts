import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AzureOpenAI } from 'openai';

import { MemberStatus, TripStatus } from '../../constants';
import type { Users } from '../users/schema/users.schema';
import type { GroupDocument } from '../groups/schema/group.schema';
import type { CreateTripDto, JoinTripDto, UpdateMemberStatusDto, UpdateTripDto } from './dto/request';
import type { RecommendMembersDto } from './dto/request/recommend-members.dto';
import type { RecommendationLog } from './schema/recommendation-log.schema';
import type { TripsDocument } from './schema/trips.schema';

@Injectable()
export class TripsService {
    private readonly openai: AzureOpenAI;

    constructor(
        @InjectModel('Trips') private readonly tripsModel: Model<TripsDocument>,
        @InjectModel('RecommendationLog') private readonly recLogModel: Model<RecommendationLog>,
        @InjectModel('Users') private readonly userModel: Model<Users>,
        @InjectModel('Group') private readonly groupModel: Model<GroupDocument>
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

    async createTrip(createTripDto: CreateTripDto, creatorId: string): Promise<any> {
        const trip = new this.tripsModel({
            ...createTripDto,
            createdBy: creatorId,
            members: [
                {
                    user: new Types.ObjectId(creatorId),
                    status: MemberStatus.JOINED,
                    joinedAt: new Date()
                }
            ]
        });

        const savedTrip = await trip.save();

        // Automatically create a linked group for the trip
        const group = new this.groupModel({
            trip: savedTrip._id,
            name: `${savedTrip.destination} Group`,
            owner: new Types.ObjectId(creatorId),
            members: [new Types.ObjectId(creatorId)],
            maxParticipants: savedTrip.maxParticipants
        });

        await group.save();

        const populatedTrip = await this.tripsModel
            .findById(savedTrip._id)
            .populate('createdBy', 'fullName email profilePictureUrl')
            .populate('members.user', 'fullName email profilePictureUrl')
            .lean()
            .exec();

        if (!populatedTrip) {
            throw new NotFoundException('Failed to create trip');
        }

        return populatedTrip;
    }

    async getAllTrips(page = 1, limit = 10): Promise<any[]> {
        const skip = (page - 1) * limit;

        return await this.tripsModel
            .find({ status: TripStatus.OPEN })
            .populate('createdBy', 'fullName email profilePictureUrl')
            .populate('members.user', 'fullName email profilePictureUrl')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean()
            .exec();
    }

    async getTripById(id: string): Promise<any> {
        const trip = await this.tripsModel
            .findById(id)
            .populate('createdBy', 'fullName email profilePictureUrl')
            .populate('members.user', 'fullName email profilePictureUrl')
            .lean()
            .exec();

        if (!trip) {
            throw new NotFoundException('Trip not found');
        }

        return trip;
    }

    async getMyTrips(userId: string): Promise<any> {
        return await this.tripsModel
            .find({
                $or: [
                    { createdBy: userId },
                    {
                        'members.user': userId,
                        'members.status': { $in: [MemberStatus.JOINED, MemberStatus.INVITED] }
                    }
                ]
            })
            .populate('createdBy', 'fullName email profilePictureUrl')
            .populate('members.user', 'fullName email profilePictureUrl')
            .sort({ createdAt: -1 })
            .lean()
            .exec();
    }

    async updateTrip(id: string, updateTripDto: UpdateTripDto, userId: string): Promise<any> {
        const trip = await this.tripsModel.findById(id);

        if (!trip) {
            throw new NotFoundException('Trip not found');
        }

        if (trip.createdBy.toString() !== userId) {
            throw new ForbiddenException('Only trip creator can update the trip');
        }

        const updatedTrip = await this.tripsModel
            .findByIdAndUpdate(id, updateTripDto, { new: true })
            .populate('createdBy', 'fullName email profilePictureUrl')
            .populate('members.user', 'fullName email profilePictureUrl')
            .lean()
            .exec();

        if (!updatedTrip) {
            throw new NotFoundException('Trip not found after update');
        }

        return updatedTrip;
    }

    async deleteTrip(id: string, userId: string): Promise<{ message: string }> {
        const trip = await this.tripsModel.findById(id);

        if (!trip) {
            throw new NotFoundException('Trip not found');
        }

        if (trip.createdBy.toString() !== userId) {
            throw new ForbiddenException('Only trip creator can delete the trip');
        }

        // Delete the associated group first
        await this.groupModel.deleteOne({ trip: id });

        // Delete the trip
        await this.tripsModel.findByIdAndDelete(id);

        return { message: 'Trip deleted successfully' };
    }

    async searchTrips(destination?: string, startDate?: Date, endDate?: Date): Promise<any> {
        const query: any = { status: TripStatus.OPEN };

        if (destination) {
            query.destination = { $regex: destination, $options: 'i' };
        }

        if (startDate || endDate) {
            query.$and = [];

            if (startDate) {
                query.$and.push({ startDate: { $gte: startDate } });
            }

            if (endDate) {
                query.$and.push({ endDate: { $lte: endDate } });
            }
        }

        return this.tripsModel
            .find(query)
            .populate('createdBy', 'fullName email profilePictureUrl')
            .populate('members.user', 'fullName email profilePictureUrl')
            .sort({ createdAt: -1 })
            .lean()
            .exec();
    }

    async joinTrip(id: string, userId: string, joinTripDto: JoinTripDto): Promise<any> {
        const trip = await this.tripsModel.findById(id);

        if (!trip) {
            throw new NotFoundException('Trip not found');
        }

        if (trip.status !== TripStatus.OPEN) {
            throw new BadRequestException('Trip is not open for joining');
        }

        // Check if user is already a member of the trip
        const isAlreadyMember = trip.members.some((member) => member.user.toString() === userId);
        if (isAlreadyMember) {
            throw new BadRequestException('You are already a member of this trip');
        }

        // Check if trip is full
        if (trip.members.length >= trip.maxParticipants) {
            throw new BadRequestException('Trip is full');
        }

        // Find the associated group for this trip
        const group = await this.groupModel.findOne({ trip: id });

        if (!group) {
            throw new NotFoundException('No group available for this trip');
        }

        // Check if group is full
        if (group.members.length >= group.maxParticipants) {
            throw new BadRequestException('Group for this trip is full');
        }

        // Add user to the trip members
        trip.members.push({
            user: new Types.ObjectId(userId),
            status: MemberStatus.REQUESTED,
            joinedAt: new Date()
        });
        await trip.save();

        // Add user to the group
        group.members.push(new Types.ObjectId(userId));
        await group.save();

        // Return the updated trip
        return this.tripsModel
            .findById(id)
            .populate('createdBy', 'fullName email profilePictureUrl')
            .populate('members.user', 'fullName email profilePictureUrl')
            .lean()
            .exec();
    }

    async leaveTrip(id: string, userId: string): Promise<TripsDocument> {
        const trip = await this.tripsModel.findById(id);

        if (!trip) {
            throw new NotFoundException('Trip not found');
        }

        if (trip.createdBy.toString() === userId) {
            throw new BadRequestException(
                'Trip creator cannot leave the trip. Please delete the trip instead.'
            );
        }

        const memberIndex = trip.members.findIndex((member) => member.user.toString() === userId);

        if (memberIndex === -1) {
            throw new BadRequestException('You are not a member of this trip');
        }

        // Remove user from trip members
        trip.members.splice(memberIndex, 1);
        await trip.save();

        // Also remove user from the associated group
        const group = await this.groupModel.findOne({ trip: id });
        if (group) {
            const groupMemberIndex = group.members.findIndex((member) => member.toString() === userId);
            if (groupMemberIndex !== -1) {
                group.members.splice(groupMemberIndex, 1);
                await group.save();
            }
        }

        const updatedTrip = await this.tripsModel
            .findById(id)
            .populate('createdBy', 'fullName email profilePictureUrl')
            .populate('members.user', 'fullName email profilePictureUrl')
            .exec();

        if (!updatedTrip) {
            throw new NotFoundException('Trip not found after leave');
        }

        return updatedTrip;
    }

    async updateMemberStatus(
        id: string,
        memberId: string,
        updateMemberStatusDto: UpdateMemberStatusDto,
        userId: string
    ): Promise<TripsDocument> {
        const trip = await this.tripsModel.findById(id);

        if (!trip) {
            throw new NotFoundException('Trip not found');
        }

        if (trip.createdBy.toString() !== userId) {
            throw new ForbiddenException('Only trip creator can update member status');
        }

        const memberToUpdate = trip.members.find((member) => member.user.toString() === memberId);

        if (!memberToUpdate) {
            throw new NotFoundException('Member not found in this trip');
        }

        // Check capacity when approving a member
        if (updateMemberStatusDto.status === MemberStatus.JOINED) {
            const joinedMembers = trip.members.filter((m) => m.status === MemberStatus.JOINED);

            if (joinedMembers.length >= trip.maxParticipants && memberToUpdate.status !== MemberStatus.JOINED) {
                throw new BadRequestException('Trip is full');
            }
        }

        memberToUpdate.status = updateMemberStatusDto.status;

        if (updateMemberStatusDto.status === MemberStatus.JOINED) {
            memberToUpdate.joinedAt = new Date();
        }

        await trip.save();

        const updatedTrip = await this.tripsModel
            .findById(id)
            .populate('createdBy', 'fullName email profilePictureUrl')
            .populate('members.user', 'fullName email profilePictureUrl')
            .exec();

        if (!updatedTrip) {
            throw new NotFoundException('Trip not found after status update');
        }

        return updatedTrip;
    }

    async removeMember(id: string, memberId: string, userId: string): Promise<TripsDocument> {
        const trip = await this.tripsModel.findById(id);

        if (!trip) {
            throw new NotFoundException('Trip not found');
        }

        if (trip.createdBy.toString() !== userId) {
            throw new ForbiddenException('Only trip creator can remove members');
        }

        if (trip.createdBy.toString() === memberId) {
            throw new BadRequestException('Cannot remove trip creator');
        }

        const memberIndex = trip.members.findIndex((member) => member.user.toString() === memberId);

        if (memberIndex === -1) {
            throw new NotFoundException('Member not found in this trip');
        }

        trip.members.splice(memberIndex, 1);
        await trip.save();

        const updatedTrip = await this.tripsModel
            .findById(id)
            .populate('createdBy', 'fullName email profilePictureUrl')
            .populate('members.user', 'fullName email profilePictureUrl')
            .exec();

        if (!updatedTrip) {
            throw new NotFoundException('Trip not found after member removal');
        }

        return updatedTrip;
    }

    async recommendMembers(tripId: string, userId: string, dto: RecommendMembersDto): Promise<Users[]> {
        // Log the recommendation request
        await this.recLogModel.create({ user: userId, trip: tripId, keyword: dto.keyword });

        // Fetch the trip to exclude its members and creator
        const trip = await this.tripsModel.findById(tripId).exec();

        if (!trip) {
            throw new NotFoundException('Trip not found');
        }

        const excludedIds = [
            ...trip.members.map((m) => m.user.toString()),
            trip.createdBy.toString(),
            userId
        ];

        // Fetch candidate users not already on the trip
        const candidates = await this.userModel.find({ _id: { $nin: excludedIds } }).exec();

        // Use Azure OpenAI to recommend best matching user IDs
        const profiles = candidates
            .map(
                (u) => `ID: ${u._id}, Name: ${u.fullName}, Tags: ${(u.tags || []).join(', ')}, Bio: ${u.bio}`
            )
            .join('\n');
        const prompt = `Recommend up to 10 user IDs best matching keyword "${dto.keyword}" from the users list:\n${profiles}`;

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
                // fallback to simple tag match
                const keywordLower = dto.keyword.toLowerCase();
                recommendedIds = candidates
                    .filter(
                        (u) =>
                            Array.isArray(u.tags) &&
                            u.tags.some((tag) => tag.toLowerCase().includes(keywordLower))
                    )
                    .map((u) => u._id.toString());
            }

            let recommended = candidates.filter((u) => recommendedIds.includes((u._id as Types.ObjectId).toString()));

            if (recommended.length === 0) {
                // fallback to simple search
                recommended = candidates.slice(0, 10);
            }

            return recommended.slice(0, 10);
        } catch (error) {
            console.error('Azure OpenAI API error:', error);
            // fallback to simple tag match
            const keywordLower = dto.keyword.toLowerCase();
            const recommended = candidates
                .filter(
                    (u) =>
                        Array.isArray(u.tags) &&
                        u.tags.some((tag) => tag.toLowerCase().includes(keywordLower))
                )
                .slice(0, 10);

            if (recommended.length === 0) {
                return candidates.slice(0, 10);
            }

            return recommended;
        }
    }
}
