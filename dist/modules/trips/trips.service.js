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
let TripsService = class TripsService {
    constructor(tripsModel) {
        this.tripsModel = tripsModel;
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
};
TripsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(trips_schema_1.Trips.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], TripsService);
exports.TripsService = TripsService;
//# sourceMappingURL=trips.service.js.map