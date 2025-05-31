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
exports.TripsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const openai_1 = require("openai");
const constants_1 = require("../../constants");
let TripsService = class TripsService {
    constructor(tripsModel, recLogModel, userModel, groupModel) {
        this.tripsModel = tripsModel;
        this.recLogModel = recLogModel;
        this.userModel = userModel;
        this.groupModel = groupModel;
        const apiKey = process.env.AZURE_OPENAI_KEY;
        const endpoint = `https://${process.env.AZURE_OPENAI_RESOURCE_NAME}.openai.azure.com`;
        const deployment = process.env.AZURE_OPENAI_DEPLOYMENT_NAME;
        const apiVersion = '2024-10-21';
        if (!apiKey || !process.env.AZURE_OPENAI_RESOURCE_NAME || !deployment) {
            throw new Error('Azure OpenAI configuration is missing. Please check AZURE_OPENAI_KEY, AZURE_OPENAI_RESOURCE_NAME, and AZURE_OPENAI_DEPLOYMENT_NAME environment variables.');
        }
        this.openai = new openai_1.AzureOpenAI({
            apiKey,
            endpoint,
            deployment,
            apiVersion
        });
    }
    async createTrip(createTripDto, creatorId) {
        const trip = new this.tripsModel(Object.assign(Object.assign({}, createTripDto), { createdBy: creatorId, members: [
                {
                    user: new mongoose_2.Types.ObjectId(creatorId),
                    status: constants_1.MemberStatus.JOINED,
                    joinedAt: new Date()
                }
            ] }));
        const savedTrip = await trip.save();
        const group = new this.groupModel({
            trip: savedTrip._id,
            name: `${savedTrip.destination} Group`,
            owner: new mongoose_2.Types.ObjectId(creatorId),
            members: [new mongoose_2.Types.ObjectId(creatorId)],
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
            throw new common_1.NotFoundException('Failed to create trip');
        }
        return populatedTrip;
    }
    async getAllTrips(page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        return await this.tripsModel
            .find({ status: constants_1.TripStatus.OPEN })
            .populate('createdBy', 'fullName email profilePictureUrl')
            .populate('members.user', 'fullName email profilePictureUrl')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean()
            .exec();
    }
    async getTripById(id) {
        const trip = await this.tripsModel
            .findById(id)
            .populate('createdBy', 'fullName email profilePictureUrl')
            .populate('members.user', 'fullName email profilePictureUrl')
            .lean()
            .exec();
        if (!trip) {
            throw new common_1.NotFoundException('Trip not found');
        }
        return trip;
    }
    async getMyTrips(userId) {
        return await this.tripsModel
            .find({
            $or: [
                { createdBy: userId },
                {
                    'members.user': userId,
                    'members.status': { $in: [constants_1.MemberStatus.JOINED, constants_1.MemberStatus.INVITED] }
                }
            ]
        })
            .populate('createdBy', 'fullName email profilePictureUrl')
            .populate('members.user', 'fullName email profilePictureUrl')
            .sort({ createdAt: -1 })
            .lean()
            .exec();
    }
    async updateTrip(id, updateTripDto, userId) {
        const trip = await this.tripsModel.findById(id);
        if (!trip) {
            throw new common_1.NotFoundException('Trip not found');
        }
        if (trip.createdBy.toString() !== userId) {
            throw new common_1.ForbiddenException('Only trip creator can update the trip');
        }
        const updatedTrip = await this.tripsModel
            .findByIdAndUpdate(id, updateTripDto, { new: true })
            .populate('createdBy', 'fullName email profilePictureUrl')
            .populate('members.user', 'fullName email profilePictureUrl')
            .lean()
            .exec();
        if (!updatedTrip) {
            throw new common_1.NotFoundException('Trip not found after update');
        }
        return updatedTrip;
    }
    async deleteTrip(id, userId) {
        const trip = await this.tripsModel.findById(id);
        if (!trip) {
            throw new common_1.NotFoundException('Trip not found');
        }
        if (trip.createdBy.toString() !== userId) {
            throw new common_1.ForbiddenException('Only trip creator can delete the trip');
        }
        await this.groupModel.deleteOne({ trip: id });
        await this.tripsModel.findByIdAndDelete(id);
        return { message: 'Trip deleted successfully' };
    }
    async searchTrips(destination, startDate, endDate) {
        const query = { status: constants_1.TripStatus.OPEN };
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
    async joinTrip(id, userId, joinTripDto) {
        const trip = await this.tripsModel.findById(id);
        if (!trip) {
            throw new common_1.NotFoundException('Trip not found');
        }
        if (trip.status !== constants_1.TripStatus.OPEN) {
            throw new common_1.BadRequestException('Trip is not open for joining');
        }
        const isAlreadyMember = trip.members.some((member) => member.user.toString() === userId);
        if (isAlreadyMember) {
            throw new common_1.BadRequestException('You are already a member of this trip');
        }
        if (trip.members.length >= trip.maxParticipants) {
            throw new common_1.BadRequestException('Trip is full');
        }
        const group = await this.groupModel.findOne({ trip: id });
        if (!group) {
            throw new common_1.NotFoundException('No group available for this trip');
        }
        if (group.members.length >= group.maxParticipants) {
            throw new common_1.BadRequestException('Group for this trip is full');
        }
        trip.members.push({
            user: new mongoose_2.Types.ObjectId(userId),
            status: constants_1.MemberStatus.REQUESTED,
            joinedAt: new Date()
        });
        await trip.save();
        group.members.push(new mongoose_2.Types.ObjectId(userId));
        await group.save();
        return this.tripsModel
            .findById(id)
            .populate('createdBy', 'fullName email profilePictureUrl')
            .populate('members.user', 'fullName email profilePictureUrl')
            .lean()
            .exec();
    }
    async leaveTrip(id, userId) {
        const trip = await this.tripsModel.findById(id);
        if (!trip) {
            throw new common_1.NotFoundException('Trip not found');
        }
        if (trip.createdBy.toString() === userId) {
            throw new common_1.BadRequestException('Trip creator cannot leave the trip. Please delete the trip instead.');
        }
        const memberIndex = trip.members.findIndex((member) => member.user.toString() === userId);
        if (memberIndex === -1) {
            throw new common_1.BadRequestException('You are not a member of this trip');
        }
        trip.members.splice(memberIndex, 1);
        await trip.save();
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
            throw new common_1.NotFoundException('Trip not found after leave');
        }
        return updatedTrip;
    }
    async updateMemberStatus(id, memberId, updateMemberStatusDto, userId) {
        const trip = await this.tripsModel.findById(id);
        if (!trip) {
            throw new common_1.NotFoundException('Trip not found');
        }
        if (trip.createdBy.toString() !== userId) {
            throw new common_1.ForbiddenException('Only trip creator can update member status');
        }
        const memberToUpdate = trip.members.find((member) => member.user.toString() === memberId);
        if (!memberToUpdate) {
            throw new common_1.NotFoundException('Member not found in this trip');
        }
        if (updateMemberStatusDto.status === constants_1.MemberStatus.JOINED) {
            const joinedMembers = trip.members.filter((m) => m.status === constants_1.MemberStatus.JOINED);
            if (joinedMembers.length >= trip.maxParticipants && memberToUpdate.status !== constants_1.MemberStatus.JOINED) {
                throw new common_1.BadRequestException('Trip is full');
            }
        }
        memberToUpdate.status = updateMemberStatusDto.status;
        if (updateMemberStatusDto.status === constants_1.MemberStatus.JOINED) {
            memberToUpdate.joinedAt = new Date();
        }
        await trip.save();
        const updatedTrip = await this.tripsModel
            .findById(id)
            .populate('createdBy', 'fullName email profilePictureUrl')
            .populate('members.user', 'fullName email profilePictureUrl')
            .exec();
        if (!updatedTrip) {
            throw new common_1.NotFoundException('Trip not found after status update');
        }
        return updatedTrip;
    }
    async removeMember(id, memberId, userId) {
        const trip = await this.tripsModel.findById(id);
        if (!trip) {
            throw new common_1.NotFoundException('Trip not found');
        }
        if (trip.createdBy.toString() !== userId) {
            throw new common_1.ForbiddenException('Only trip creator can remove members');
        }
        if (trip.createdBy.toString() === memberId) {
            throw new common_1.BadRequestException('Cannot remove trip creator');
        }
        const memberIndex = trip.members.findIndex((member) => member.user.toString() === memberId);
        if (memberIndex === -1) {
            throw new common_1.NotFoundException('Member not found in this trip');
        }
        trip.members.splice(memberIndex, 1);
        await trip.save();
        const updatedTrip = await this.tripsModel
            .findById(id)
            .populate('createdBy', 'fullName email profilePictureUrl')
            .populate('members.user', 'fullName email profilePictureUrl')
            .exec();
        if (!updatedTrip) {
            throw new common_1.NotFoundException('Trip not found after member removal');
        }
        return updatedTrip;
    }
    async recommendMembers(tripId, userId) {
        var _a, _b;
        await this.recLogModel.create({
            user: userId,
            trip: tripId,
            keyword: 'trip_member_recommendation',
            recommendationType: 'trip_members',
            context: {
                source: 'trip_recommendation'
            }
        });
        const trip = await this.tripsModel.findById(tripId).exec();
        if (!trip) {
            throw new common_1.NotFoundException('Trip not found');
        }
        const excludedIds = [
            ...trip.members.map((m) => m.user.toString()),
            trip.createdBy.toString(),
            userId
        ];
        const candidates = await this.userModel.find({ _id: { $nin: excludedIds } }).exec();
        if (!candidates || candidates.length === 0) {
            return [];
        }
        const profiles = candidates
            .map((u) => `ID: ${u._id}, Name: ${u.fullName || 'Unknown'}, Tags: ${(u.tags || []).join(', ')}, Bio: ${u.bio || 'No bio'}`)
            .join('\n');
        if (!profiles || profiles.trim().length === 0) {
            return candidates.slice(0, 10);
        }
        const prompt = `You are a recommendation system. Based on the user profiles below, return ONLY a JSON array of up to 10 user IDs that would be best matches for a trip. Consider factors like similar tags, interests, and compatibility. Respond with ONLY the JSON array, no explanation.

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
            let recommendedIds = [];
            if (completion && completion.choices && completion.choices.length > 0) {
                const responseContent = (_b = (_a = completion.choices[0]) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b.content;
                console.log('OpenAI response content:', responseContent);
                if (responseContent) {
                    try {
                        const cleanedContent = responseContent.trim();
                        const jsonRegex = /\[.*\]/;
                        const jsonMatch = jsonRegex.exec(cleanedContent);
                        if (jsonMatch) {
                            recommendedIds = JSON.parse(jsonMatch[0]);
                            if (!Array.isArray(recommendedIds)) {
                                throw new Error('Response is not an array');
                            }
                            recommendedIds = recommendedIds
                                .filter(id => typeof id === 'string' && id.length > 0)
                                .slice(0, 10);
                        }
                        else {
                            throw new Error('No JSON array found in response');
                        }
                    }
                    catch (parseError) {
                        console.warn('Failed to parse OpenAI response as JSON:', parseError);
                        console.warn('Raw response:', responseContent);
                        recommendedIds = candidates.map((u) => u._id.toString());
                    }
                }
            }
            else {
                console.warn('Invalid OpenAI response structure');
                recommendedIds = candidates.map((u) => u._id.toString());
            }
            let recommended = candidates.filter((u) => recommendedIds.includes(u._id.toString()));
            if (recommended.length === 0) {
                recommended = candidates.slice(0, 10);
            }
            return recommended.slice(0, 10);
        }
        catch (error) {
            console.error('Azure OpenAI API error:', error);
            const recommended = candidates.slice(0, 10);
            return recommended;
        }
    }
};
TripsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)('Trips')),
    __param(1, (0, mongoose_1.InjectModel)('RecommendationLog')),
    __param(2, (0, mongoose_1.InjectModel)('Users')),
    __param(3, (0, mongoose_1.InjectModel)('Group')),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model])
], TripsService);
exports.TripsService = TripsService;
//# sourceMappingURL=trips.service.js.map