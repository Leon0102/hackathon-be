import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AzureOpenAI } from 'openai';

import { MemberStatus, TripStatus } from '../../constants';
import type { Users } from '../users/schema/users.schema';
import type { GroupDocument } from '../groups/schema/group.schema';
import type { CreateTripDto, JoinTripDto, UpdateMemberStatusDto, UpdateTripDto } from './dto/request';
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

        const savedGroup = await group.save();

        // Update trip with group reference
        savedTrip.group = savedGroup._id;
        await savedTrip.save();

        const populatedTrip = await this.tripsModel
            .findById(savedTrip._id)
            .populate('createdBy', 'fullName email profilePictureUrl')
            .populate('members.user', 'fullName email profilePictureUrl')
            .populate('group', 'name members maxParticipants')
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
            .populate('group', 'name members maxParticipants')
            .populate('itinerary')
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
            .populate('group', 'name members maxParticipants')
            .populate('itinerary')
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
            .populate('group', 'name members maxParticipants')
            .populate('itinerary')
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
            .populate('group', 'name members maxParticipants')
            .populate('itinerary')
            .lean()
            .exec();

        if (!updatedTrip) {
            throw new NotFoundException('Trip not found after update');
        }

        // Sync group maxParticipants to match updated trip
        if (updatedTrip.group) {
            await this.groupModel.findByIdAndUpdate(
                updatedTrip.group,
                { maxParticipants: updatedTrip.maxParticipants }
            ).exec();
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
            .populate('group', 'name members maxParticipants')
            .populate('itinerary')
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
        if (!trip.group) {
            throw new NotFoundException('No group available for this trip');
        }
        const group = await this.groupModel.findById(trip.group).exec();

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
            .populate('group', 'name members maxParticipants')
            .populate('itinerary')
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
        if (!trip.group) {
            // No group linked
        } else {
            const group = await this.groupModel.findById(trip.group).exec();
            if (group) {
                const groupMemberIndex = group.members.findIndex((member) => member.toString() === userId);
                if (groupMemberIndex !== -1) {
                    group.members.splice(groupMemberIndex, 1);
                    await group.save();
                }
            }
        }

        const updatedTrip = await this.tripsModel
            .findById(id)
            .populate('createdBy', 'fullName email profilePictureUrl')
            .populate('members.user', 'fullName email profilePictureUrl')
            .populate('group', 'name members maxParticipants')
            .populate('itinerary')
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
            .populate('group', 'name members maxParticipants')
            .populate('itinerary')
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
            .populate('group', 'name members maxParticipants')
            .populate('itinerary')
            .exec();

        if (!updatedTrip) {
            throw new NotFoundException('Trip not found after member removal');
        }

        return updatedTrip;
    }

    async addUserToTrip(tripId: string, userIdToAdd: string, requestingUserId: string, message?: string): Promise<any> {
        // Find the trip
        const trip = await this.tripsModel.findById(tripId);

        if (!trip) {
            throw new NotFoundException('Trip not found');
        }

        // Only trip creator can add users directly
        if (trip.createdBy.toString() !== requestingUserId) {
            throw new ForbiddenException('Only trip creator can add users to the trip');
        }

        console.log(`Adding user ${userIdToAdd} to trip ${tripId} by user ${requestingUserId}`);


        // Check if the user exists
        const userToAdd = await this.userModel.findById({ _id: userIdToAdd }).select('fullName email profilePictureUrl').exec();
        if (!userToAdd) {
            throw new NotFoundException('User to add not found');
        }

        // Check if user is already a member of the trip
        const isAlreadyMember = trip.members.some((member) => member.user.toString() === userIdToAdd);
        if (isAlreadyMember) {
            throw new BadRequestException('User is already a member of this trip');
        }

        // Check if trip is full
        const joinedMembers = trip.members.filter((m) => m.status === MemberStatus.JOINED);
        if (joinedMembers.length >= trip.maxParticipants) {
            throw new BadRequestException('Trip is full');
        }

        // Find the associated group for this trip
        if (!trip.group) {
            throw new NotFoundException('No group available for this trip');
        }
        const group = await this.groupModel.findById(trip.group).exec();

        if (!group) {
            throw new NotFoundException('No group available for this trip');
        }

        // Check if group is full
        if (group.members.length >= group.maxParticipants) {
            throw new BadRequestException('Group for this trip is full');
        }

        // Add user to the trip members with INVITED status
        trip.members.push({
            user: new Types.ObjectId(userIdToAdd),
            status: MemberStatus.INVITED,
            message: message
        });
        await trip.save();

        // Add user to the group
        group.members.push(new Types.ObjectId(userIdToAdd));
        await group.save();

        // Return the updated trip with populated members
        const updatedTrip = await this.tripsModel
            .findById(tripId)
            .populate('createdBy', 'fullName email profilePictureUrl')
            .populate('members.user', 'fullName email profilePictureUrl')
            .populate('group', 'name members maxParticipants')
            .populate('itinerary')
            .lean()
            .exec();

        if (!updatedTrip) {
            throw new NotFoundException('Trip not found after adding user');
        }

        return updatedTrip;
    }

    async recommendMembers(tripId: string, userId: string): Promise<Users[]> {
        // Log the recommendation request
        await this.recLogModel.create({
            user: userId,
            trip: tripId,
            keyword: 'trip_member_recommendation', // Default keyword for this type of recommendation
            recommendationType: 'trip_members',
            context: {
                source: 'trip_recommendation'
            }
        });

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

        // Safety check for candidates
        if (!candidates || candidates.length === 0) {
            return []; // Return empty array if no candidates found
        }

        // Use Azure OpenAI to recommend best matching user IDs
        const profiles = candidates
            .map(
                (u) => `ID: ${u._id}, Name: ${u.fullName || 'Unknown'}, Tags: ${(u.tags || []).join(', ')}, Bio: ${u.bio || 'No bio'}`
            )
            .join('\n');

        // Safety check for profiles
        if (!profiles || profiles.trim().length === 0) {
            return candidates.slice(0, 30); // Return first 30 candidates if profiles are empty
        }

        const prompt = `You are a recommendation system. Based on the user profiles below, return ONLY a JSON array of up to 30 user IDs that would be best matches for a trip. Consider factors like similar tags, interests, and compatibility. Respond with ONLY the JSON array, no explanation.

Users:
${profiles}

Example response format: ["user_id_1", "user_id_2", "user_id_3"]`;

        try {
            const completion = await this.openai.chat.completions.create({
                messages: [
                    {
                        role: 'system',
                        content: 'You are a travel recommendation system. Always respond with only a JSON array of user IDs, no additional text or explanation.'
                    },
                    { role: 'user', content: prompt }
                ],
                model: 'gpt-4o',
                max_tokens: 256,
                temperature: 0.3
            });

            let recommendedIds: string[] = [];

            // Add proper null checks for the OpenAI response
            if (completion && completion.choices && completion.choices.length > 0) {
                const responseContent = completion.choices[0]?.message?.content;

                if (responseContent) {
                    try {
                        // Clean the response to extract JSON
                        const cleanedContent = responseContent.trim();

                        // Try to find JSON array in the response
                        const jsonRegex = /\[.*\]/;
                        const jsonMatch = jsonRegex.exec(cleanedContent);
                        if (jsonMatch) {
                            recommendedIds = JSON.parse(jsonMatch[0]);

                            // Validate that we got an array of strings
                            if (!Array.isArray(recommendedIds)) {
                                throw new Error('Response is not an array');
                            }

                            // Ensure all items are strings and filter out invalid IDs
                            recommendedIds = recommendedIds
                                .filter(id => typeof id === 'string' && id.length > 0)
                                .slice(0, 30);
                        } else {
                            throw new Error('No JSON array found in response');
                        }
                    } catch (parseError) {
                        console.warn('Failed to parse OpenAI response as JSON:', parseError);
                        console.warn('Raw response:', responseContent);
                        // fallback to return all candidates
                        recommendedIds = candidates.map((u) => u._id.toString());
                    }
                }
            } else {
                console.warn('Invalid OpenAI response structure');
                // fallback to return all candidates
                recommendedIds = candidates.map((u) => u._id.toString());
            }

            let recommended = candidates.filter((u) => recommendedIds.includes((u._id as Types.ObjectId).toString()));

            if (recommended.length === 0) {
                // fallback to simple search
                recommended = candidates.slice(0, 30);
            }

            return recommended.slice(0, 30);
        } catch (error) {
            console.error('Azure OpenAI API error:', error);
            // fallback to return first 30 candidates
            const recommended = candidates.slice(0, 30);

            return recommended;
        }
    }

    // Recommend trips to a user based on profile and preferences
    async recommendTrips(userId: string, maxResults = 10): Promise<any[]> {
        // Log the recommendation request
        await this.recLogModel.create({
            user: userId,
            trip: null,
            keyword: 'trip_recommendation',
            recommendationType: 'trips',
            context: { source: 'trip_recommendation' }
        });

        // Fetch user profile
        const user = await this.userModel.findById(userId).lean().exec();
        if (!user) {
            throw new NotFoundException('User not found');
        }

        // Fetch open trips the user is not part of
        const candidates = await this.tripsModel
            .find({ status: TripStatus.OPEN, 'members.user': { $ne: userId } })
            .populate('createdBy', 'fullName email')
            .lean()
            .exec();

        if (!candidates.length) {
            return [];
        }

        // Build profiles and trip summaries for AI
        const userProfile = `Tags: ${(user.tags || []).join(', ')}; TravelStyle: ${user.travelStyle}; Budget: ${user.budget}; Preferred: ${(user.preferredDestinations || []).join(', ')}`;
        const tripList = candidates
            .map(t => `ID: ${t._id}, Dest: ${t.destination}, Purposes: ${(t.travelPurposes || []).join(', ')}, Interests: ${(t.interests || []).join(', ')}`)
            .join('\n');

        const prompt = `You are a travel recommendation system. Given a user profile and a list of upcoming trips, return a JSON array of up to ${maxResults} trip IDs that best match the user's preferences. Respond with ONLY the JSON array.`;

        // Call Azure OpenAI
        const completion = await this.openai.chat.completions.create({
            messages: [
                { role: 'system', content: 'Travel recommendation agent.' },
                { role: 'user', content: `${prompt}\nUser:\n${userProfile}\nTrips:\n${tripList}` }
            ],
            model: 'gpt-4o',
            max_tokens: 256,
            temperature: 0.3
        });

        // Parse recommended IDs
        let recIds: string[] = [];
        try {
            const content = completion.choices?.[0]?.message?.content?.trim();
            const match = content?.match(/\[.*\]/);
            if (match) {
                const arr = JSON.parse(match[0]);
                recIds = Array.isArray(arr) ? arr.map(String) : [];
            }
        } catch {
            recIds = candidates.map(t => t._id.toString());
        }

        // Filter and return top matches
        const recommended = candidates.filter(t => recIds.includes(t._id.toString()));
        return recommended.slice(0, maxResults);
    }
}
