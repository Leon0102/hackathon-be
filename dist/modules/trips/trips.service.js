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
const trips_schema_1 = require("./schema/trips.schema");
const constants_1 = require("../../constants");
const recommendation_log_schema_1 = require("./schema/recommendation-log.schema");
const users_schema_1 = require("../users/schema/users.schema");
const openai_1 = require("openai");
require("@azure/openai/types");
let TripsService = class TripsService {
    constructor(tripsModel, recLogModel, userModel) {
        this.tripsModel = tripsModel;
        this.recLogModel = recLogModel;
        this.userModel = userModel;
        const apiKey = process.env.AZURE_OPENAI_KEY;
        const endpoint = `https://${process.env.AZURE_OPENAI_RESOURCE_NAME}.openai.azure.com`;
        const deployment = process.env.AZURE_OPENAI_DEPLOYMENT_NAME;
        const apiVersion = "2024-10-21";
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
        const trip = new this.tripsModel(Object.assign(Object.assign({}, createTripDto), { createdBy: creatorId, members: [{
                    user: new mongoose_2.Types.ObjectId(creatorId),
                    status: constants_1.MemberStatus.JOINED,
                    joinedAt: new Date()
                }] }));
        const savedTrip = await trip.save();
        const populatedTrip = await this.tripsModel
            .findById(savedTrip._id)
            .populate('createdBy', 'fullName email profilePictureUrl')
            .populate('members.user', 'fullName email profilePictureUrl')
            .exec();
        if (!populatedTrip) {
            throw new common_1.NotFoundException('Failed to create trip');
        }
        return populatedTrip;
    }
    async getAllTrips(page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        const trips = await this.tripsModel
            .find({ status: constants_1.TripStatus.OPEN })
            .populate('createdBy', 'fullName email profilePictureUrl')
            .populate('members.user', 'fullName email profilePictureUrl')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean()
            .exec();
        return trips;
    }
    async getTripById(id) {
        const trip = await this.tripsModel
            .findById(id)
            .populate('createdBy', 'fullName email profilePictureUrl')
            .populate('members.user', 'fullName email profilePictureUrl')
            .exec();
        if (!trip) {
            throw new common_1.NotFoundException('Trip not found');
        }
        return trip;
    }
    async getMyTrips(userId) {
        const trips = await this.tripsModel
            .find({
            $or: [
                { createdBy: userId },
                { 'members.user': userId, 'members.status': { $in: [constants_1.MemberStatus.JOINED, constants_1.MemberStatus.INVITED] } }
            ]
        })
            .populate('createdBy', 'fullName email profilePictureUrl')
            .populate('members.user', 'fullName email profilePictureUrl')
            .sort({ createdAt: -1 })
            .exec();
        return trips;
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
        const trips = await this.tripsModel
            .find(query)
            .populate('createdBy', 'fullName email profilePictureUrl')
            .populate('members.user', 'fullName email profilePictureUrl')
            .sort({ createdAt: -1 })
            .exec();
        return trips;
    }
    async joinTrip(id, userId, joinTripDto) {
        const trip = await this.tripsModel.findById(id);
        if (!trip) {
            throw new common_1.NotFoundException('Trip not found');
        }
        if (trip.status !== constants_1.TripStatus.OPEN) {
            throw new common_1.BadRequestException('Trip is not open for joining');
        }
        const existingMember = trip.members.find(member => member.user.toString() === userId);
        if (existingMember) {
            throw new common_1.BadRequestException('You are already a member of this trip');
        }
        const joinedMembers = trip.members.filter(member => member.status === constants_1.MemberStatus.JOINED);
        if (joinedMembers.length >= trip.maxParticipants) {
            throw new common_1.BadRequestException('Trip is full');
        }
        const memberStatus = trip.createdBy.toString() === userId ? constants_1.MemberStatus.JOINED : constants_1.MemberStatus.REQUESTED;
        trip.members.push({
            user: new mongoose_2.Types.ObjectId(userId),
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
            throw new common_1.NotFoundException('Trip not found after join');
        }
        return updatedTrip;
    }
    async leaveTrip(id, userId) {
        const trip = await this.tripsModel.findById(id);
        if (!trip) {
            throw new common_1.NotFoundException('Trip not found');
        }
        if (trip.createdBy.toString() === userId) {
            throw new common_1.BadRequestException('Trip creator cannot leave the trip. Please delete the trip instead.');
        }
        const memberIndex = trip.members.findIndex(member => member.user.toString() === userId);
        if (memberIndex === -1) {
            throw new common_1.BadRequestException('You are not a member of this trip');
        }
        trip.members.splice(memberIndex, 1);
        await trip.save();
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
        const member = trip.members.find(member => member.user.toString() === memberId);
        if (!member) {
            throw new common_1.NotFoundException('Member not found in this trip');
        }
        if (updateMemberStatusDto.status === constants_1.MemberStatus.JOINED) {
            const joinedMembers = trip.members.filter(m => m.status === constants_1.MemberStatus.JOINED);
            if (joinedMembers.length >= trip.maxParticipants && member.status !== constants_1.MemberStatus.JOINED) {
                throw new common_1.BadRequestException('Trip is full');
            }
        }
        member.status = updateMemberStatusDto.status;
        if (updateMemberStatusDto.status === constants_1.MemberStatus.JOINED) {
            member.joinedAt = new Date();
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
        const memberIndex = trip.members.findIndex(member => member.user.toString() === memberId);
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
    async recommendMembers(tripId, userId, dto) {
        var _a, _b;
        await this.recLogModel.create({ user: userId, trip: tripId, keyword: dto.keyword });
        const trip = await this.tripsModel.findById(tripId).exec();
        if (!trip) {
            throw new common_1.NotFoundException('Trip not found');
        }
        const excludedIds = trip.members.map(m => m.user.toString()).concat(trip.createdBy.toString(), userId);
        const candidates = await this.userModel.find({ _id: { $nin: excludedIds } }).exec();
        const profiles = candidates.map(u => `ID: ${u._id}, Name: ${u.fullName}, Tags: ${(u.tags || []).join(', ')}, Bio: ${u.bio}`).join('\n');
        const prompt = `Recommend up to 5 user IDs best matching keyword "${dto.keyword}" from the users list:\n${profiles}`;
        try {
            const completion = await this.openai.chat.completions.create({
                messages: [{ role: 'user', content: prompt }],
                model: "",
                max_tokens: 128
            });
            let recommendedIds = [];
            try {
                const responseContent = (_b = (_a = completion.choices[0]) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b.content;
                if (responseContent) {
                    recommendedIds = JSON.parse(responseContent);
                }
            }
            catch (_c) {
                const keywordLower = dto.keyword.toLowerCase();
                recommendedIds = candidates.filter(u => Array.isArray(u.tags) && u.tags.some(tag => tag.toLowerCase().includes(keywordLower))).map(u => u._id.toString());
            }
            let recommended = candidates.filter(u => recommendedIds.includes(u._id.toString()));
            if (recommended.length === 0) {
                recommended = candidates.slice(0, 5);
            }
            return recommended;
        }
        catch (error) {
            console.error('Azure OpenAI API error:', error);
            const keywordLower = dto.keyword.toLowerCase();
            const recommended = candidates.filter(u => Array.isArray(u.tags) && u.tags.some(tag => tag.toLowerCase().includes(keywordLower))).slice(0, 5);
            if (recommended.length === 0) {
                return candidates.slice(0, 5);
            }
            return recommended;
        }
    }
};
TripsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(trips_schema_1.Trips.name)),
    __param(1, (0, mongoose_1.InjectModel)(recommendation_log_schema_1.RecommendationLog.name)),
    __param(2, (0, mongoose_1.InjectModel)(users_schema_1.Users.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model])
], TripsService);
exports.TripsService = TripsService;
//# sourceMappingURL=trips.service.js.map