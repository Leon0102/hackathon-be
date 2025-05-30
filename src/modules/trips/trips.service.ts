import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Trips, TripsDocument } from './schema/trips.schema';
import { CreateTripDto, UpdateTripDto, UpdateMemberStatusDto, JoinTripDto } from './dto/request';
import { RecommendMembersDto } from './dto/request/recommend-members.dto';
import { TripStatus, MemberStatus } from '../../constants';
import { RecommendationLog } from './schema/recommendation-log.schema';
import { Users } from '../users/schema/users.schema';
import { AzureOpenAI } from 'openai';
import { DefaultAzureCredential, getBearerTokenProvider } from '@azure/identity';
import '@azure/openai/types';

@Injectable()
export class TripsService {
    private openai: AzureOpenAI;

    constructor(
        @InjectModel(Trips.name) private readonly tripsModel: Model<TripsDocument>,
        @InjectModel(RecommendationLog.name) private readonly recLogModel: Model<RecommendationLog>,
        @InjectModel(Users.name) private readonly userModel: Model<Users>
    ) {
        // Initialize Azure OpenAI client with proper authentication
        const apiKey = process.env.AZURE_OPENAI_KEY;
        const endpoint = `https://${process.env.AZURE_OPENAI_RESOURCE_NAME}.openai.azure.com`;
        const deployment = process.env.AZURE_OPENAI_DEPLOYMENT_NAME;
        const apiVersion = "2024-10-21";

        if (!apiKey || !process.env.AZURE_OPENAI_RESOURCE_NAME || !deployment) {
            throw new Error('Azure OpenAI configuration is missing. Please check AZURE_OPENAI_KEY, AZURE_OPENAI_RESOURCE_NAME, and AZURE_OPENAI_DEPLOYMENT_NAME environment variables.');
        }

        // For key-based authentication (suitable for development)
        this.openai = new AzureOpenAI({
            apiKey,
            endpoint,
            deployment,
            apiVersion
        });
    }

    async createTrip(createTripDto: CreateTripDto, creatorId: string): Promise<TripsDocument> {
        const trip = new this.tripsModel({
            ...createTripDto,
            createdBy: creatorId,
            members: [{
                user: new Types.ObjectId(creatorId),
                status: MemberStatus.JOINED,
                joinedAt: new Date()
            }]
        });

        const savedTrip = await trip.save();
        const populatedTrip = await this.tripsModel
            .findById(savedTrip._id)
            .populate('createdBy', 'fullName email profilePictureUrl')
            .populate('members.user', 'fullName email profilePictureUrl')
            .exec();

        if (!populatedTrip) {
            throw new NotFoundException('Failed to create trip');
        }

        return populatedTrip;
    }

    async getAllTrips(page: number = 1, limit: number = 10): Promise<any[]> {
        const skip = (page - 1) * limit;

        const trips = await this.tripsModel
            .find({ status: TripStatus.OPEN })
            .populate('createdBy', 'fullName email profilePictureUrl')
            .populate('members.user', 'fullName email profilePictureUrl')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean()
            .exec();

        return trips;
    }

    async getTripById(id: string): Promise<TripsDocument> {
        const trip = await this.tripsModel
            .findById(id)
            .populate('createdBy', 'fullName email profilePictureUrl')
            .populate('members.user', 'fullName email profilePictureUrl')
            .exec();

        if (!trip) {
            throw new NotFoundException('Trip not found');
        }

        return trip;
    }

    async getMyTrips(userId: string): Promise<TripsDocument[]> {
        const trips = await this.tripsModel
            .find({
                $or: [
                    { createdBy: userId },
                    { 'members.user': userId, 'members.status': { $in: [MemberStatus.JOINED, MemberStatus.INVITED] } }
                ]
            })
            .populate('createdBy', 'fullName email profilePictureUrl')
            .populate('members.user', 'fullName email profilePictureUrl')
            .sort({ createdAt: -1 })
            .exec();

        return trips;
    }

    async updateTrip(id: string, updateTripDto: UpdateTripDto, userId: string): Promise<TripsDocument> {
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

        await this.tripsModel.findByIdAndDelete(id);
        return { message: 'Trip deleted successfully' };
    }

    async searchTrips(destination?: string, startDate?: Date, endDate?: Date): Promise<TripsDocument[]> {
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

        const trips = await this.tripsModel
            .find(query)
            .populate('createdBy', 'fullName email profilePictureUrl')
            .populate('members.user', 'fullName email profilePictureUrl')
            .sort({ createdAt: -1 })
            .exec();

        return trips;
    }

    async joinTrip(id: string, userId: string, joinTripDto: JoinTripDto): Promise<TripsDocument> {
        const trip = await this.tripsModel.findById(id);

        if (!trip) {
            throw new NotFoundException('Trip not found');
        }

        if (trip.status !== TripStatus.OPEN) {
            throw new BadRequestException('Trip is not open for joining');
        }

        // Check if user is already a member
        const existingMember = trip.members.find(member => member.user.toString() === userId);
        if (existingMember) {
            throw new BadRequestException('You are already a member of this trip');
        }

        // Check if trip is full
        const joinedMembers = trip.members.filter(member => member.status === MemberStatus.JOINED);
        if (joinedMembers.length >= trip.maxParticipants) {
            throw new BadRequestException('Trip is full');
        }

        // Add new member with requested status or joined status
        const memberStatus = trip.createdBy.toString() === userId ? MemberStatus.JOINED : MemberStatus.REQUESTED;

        trip.members.push({
            user: new Types.ObjectId(userId),
            status: memberStatus,
            joinedAt: new Date(),
            message: joinTripDto.message
        });

        await trip.save();

        const updatedTrip = await this.tripsModel
            .findById(id)
            .populate('createdBy', 'fullName email profilePictureUrl')
            .populate('members.user', 'fullName email profilePictureUrl')
            .exec();

        if (!updatedTrip) {
            throw new NotFoundException('Trip not found after join');
        }

        return updatedTrip;
    }

    async leaveTrip(id: string, userId: string): Promise<TripsDocument> {
        const trip = await this.tripsModel.findById(id);

        if (!trip) {
            throw new NotFoundException('Trip not found');
        }

        if (trip.createdBy.toString() === userId) {
            throw new BadRequestException('Trip creator cannot leave the trip. Please delete the trip instead.');
        }

        const memberIndex = trip.members.findIndex(member => member.user.toString() === userId);
        if (memberIndex === -1) {
            throw new BadRequestException('You are not a member of this trip');
        }

        trip.members.splice(memberIndex, 1);
        await trip.save();

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

        const member = trip.members.find(member => member.user.toString() === memberId);
        if (!member) {
            throw new NotFoundException('Member not found in this trip');
        }

        // Check capacity when approving a member
        if (updateMemberStatusDto.status === MemberStatus.JOINED) {
            const joinedMembers = trip.members.filter(m => m.status === MemberStatus.JOINED);
            if (joinedMembers.length >= trip.maxParticipants && member.status !== MemberStatus.JOINED) {
                throw new BadRequestException('Trip is full');
            }
        }

        member.status = updateMemberStatusDto.status;
        if (updateMemberStatusDto.status === MemberStatus.JOINED) {
            member.joinedAt = new Date();
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

        const memberIndex = trip.members.findIndex(member => member.user.toString() === memberId);
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
        const excludedIds = trip.members.map(m => m.user.toString()).concat(trip.createdBy.toString(), userId);

        // Fetch candidate users not already on the trip
        const candidates = await this.userModel.find({ _id: { $nin: excludedIds } }).exec();

        // Use Azure OpenAI to recommend best matching user IDs
        const profiles = candidates.map(u => `ID: ${u._id}, Name: ${u.fullName}, Tags: ${(u.tags||[]).join(', ')}, Bio: ${u.bio}`).join('\n');
        const prompt = `Recommend up to 5 user IDs best matching keyword "${dto.keyword}" from the users list:\n${profiles}`;

        try {
            const completion = await this.openai.chat.completions.create({
                messages: [{ role: 'user', content: prompt }],
                model: "", // Empty string when using deployment
                max_tokens: 128
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
                recommendedIds = candidates.filter(u =>
                    Array.isArray(u.tags) && u.tags.some(tag => tag.toLowerCase().includes(keywordLower))
                ).map(u => u._id.toString());
            }

            let recommended = candidates.filter(u => recommendedIds.includes(u._id.toString()));
            if (recommended.length === 0) {
                // fallback to simple search
                recommended = candidates.slice(0, 5);
            }
            return recommended;
        } catch (error) {
            console.error('Azure OpenAI API error:', error);
            // fallback to simple tag match
            const keywordLower = dto.keyword.toLowerCase();
            const recommended = candidates.filter(u =>
                Array.isArray(u.tags) && u.tags.some(tag => tag.toLowerCase().includes(keywordLower))
            ).slice(0, 5);

            if (recommended.length === 0) {
                return candidates.slice(0, 5);
            }
            return recommended;
        }
    }

}
