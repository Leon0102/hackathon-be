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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TripsSchema = exports.Trips = exports.TripMemberSchema = exports.TripMember = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const constants_1 = require("../../../constants");
let TripMember = class TripMember {
};
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Users', required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], TripMember.prototype, "user", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, enum: Object.values(constants_1.MemberStatus), required: true }),
    __metadata("design:type", String)
], TripMember.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date }),
    __metadata("design:type", Date)
], TripMember.prototype, "joinedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], TripMember.prototype, "message", void 0);
TripMember = __decorate([
    (0, mongoose_1.Schema)({ _id: false })
], TripMember);
exports.TripMember = TripMember;
exports.TripMemberSchema = mongoose_1.SchemaFactory.createForClass(TripMember);
let Trips = class Trips extends mongoose_2.Document {
};
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Users', required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Trips.prototype, "createdBy", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: true, trim: true }),
    __metadata("design:type", String)
], Trips.prototype, "destination", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date, required: true }),
    __metadata("design:type", Date)
], Trips.prototype, "startDate", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date, required: true }),
    __metadata("design:type", Date)
], Trips.prototype, "endDate", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, enum: Object.values(constants_1.TripStatus), default: constants_1.TripStatus.OPEN, required: true }),
    __metadata("design:type", String)
], Trips.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, required: true, min: 1 }),
    __metadata("design:type", Number)
], Trips.prototype, "maxParticipants", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [exports.TripMemberSchema], default: [] }),
    __metadata("design:type", Array)
], Trips.prototype, "members", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [{ type: mongoose_2.Types.ObjectId, ref: 'Itinerary' }], default: [] }),
    __metadata("design:type", Array)
], Trips.prototype, "itinerary", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, enum: Object.values(constants_1.AgeRange), default: constants_1.AgeRange.NO_PREFERENCE }),
    __metadata("design:type", String)
], Trips.prototype, "preferredAgeRange", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], enum: Object.values(constants_1.TravelPurpose), default: [] }),
    __metadata("design:type", Array)
], Trips.prototype, "travelPurposes", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], enum: Object.values(constants_1.TravelInterest), default: [] }),
    __metadata("design:type", Array)
], Trips.prototype, "interests", void 0);
Trips = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Trips);
exports.Trips = Trips;
exports.TripsSchema = mongoose_1.SchemaFactory.createForClass(Trips);
exports.TripsSchema.index({ createdBy: 1 });
exports.TripsSchema.index({ destination: 'text' });
exports.TripsSchema.index({ startDate: 1, endDate: 1 });
exports.TripsSchema.index({ status: 1 });
exports.TripsSchema.index({ 'members.user': 1 });
exports.TripsSchema.index({ preferredAgeRange: 1 });
exports.TripsSchema.index({ travelPurposes: 1 });
exports.TripsSchema.index({ interests: 1 });
exports.TripsSchema.virtual('currentMemberCount').get(function () {
    return this.members.filter((member) => member.status === constants_1.MemberStatus.JOINED).length;
});
exports.TripsSchema.virtual('availableSpots').get(function () {
    const joinedMembers = this.members.filter((member) => member.status === constants_1.MemberStatus.JOINED).length;
    return this.maxParticipants - joinedMembers;
});
exports.TripsSchema.virtual('isFull').get(function () {
    const joinedMembers = this.members.filter((member) => member.status === constants_1.MemberStatus.JOINED).length;
    return joinedMembers >= this.maxParticipants;
});
exports.TripsSchema.pre('save', function (next) {
    if (this.endDate <= this.startDate) {
        return next(new Error('End date must be after start date'));
    }
    if (this.startDate < new Date()) {
        return next(new Error('Start date cannot be in the past'));
    }
    next();
});
//# sourceMappingURL=trips.schema.js.map