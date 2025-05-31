import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { MemberStatus, TripStatus, AgeRange, TravelPurpose, TravelInterest } from '../../../constants';

// Member subdocument schema
@Schema({ _id: false })
export class TripMember {
    @Prop({ type: Types.ObjectId, ref: 'Users', required: true })
    user: Types.ObjectId;

    @Prop({ type: String, enum: Object.values(MemberStatus), required: true })
    status: MemberStatus;

    @Prop({ type: Date })
    joinedAt?: Date;

    @Prop({ type: String })
    message?: string;
}

export const TripMemberSchema = SchemaFactory.createForClass(TripMember);

export type TripsDocument = Trips & Document;

@Schema({ timestamps: true })
export class Trips extends Document {
    @Prop({ type: Types.ObjectId, ref: 'Users', required: true })
    createdBy: Types.ObjectId;

    @Prop({ type: String, required: true, trim: true })
    destination: string;

    @Prop({ type: Date, required: true })
    startDate: Date;

    @Prop({ type: Date, required: true })
    endDate: Date;

    @Prop({ type: String, enum: Object.values(TripStatus), default: TripStatus.OPEN, required: true })
    status: TripStatus;

    @Prop({ type: Number, required: true, min: 1 })
    maxParticipants: number;

    @Prop({ type: [TripMemberSchema], default: [] })
    members: TripMember[];

    @Prop({ type: [{ type: Types.ObjectId, ref: 'Itinerary' }], default: [] })
    itinerary: Types.ObjectId[];

    @Prop({ type: Types.ObjectId, ref: 'Group', required: false })
    group?: Types.ObjectId;

    @Prop({ type: String, enum: Object.values(AgeRange), default: AgeRange.NO_PREFERENCE })
    preferredAgeRange: AgeRange;

    @Prop({ type: [String], enum: Object.values(TravelPurpose), default: [] })
    travelPurposes: TravelPurpose[];

    @Prop({ type: [String], enum: Object.values(TravelInterest), default: [] })
    interests: TravelInterest[];
}

export const TripsSchema = SchemaFactory.createForClass(Trips);

// Indexes for performance
TripsSchema.index({ createdBy: 1 });
TripsSchema.index({ destination: 'text' });
TripsSchema.index({ startDate: 1, endDate: 1 });
TripsSchema.index({ status: 1 });
TripsSchema.index({ 'members.user': 1 });
TripsSchema.index({ preferredAgeRange: 1 });
TripsSchema.index({ travelPurposes: 1 });
TripsSchema.index({ interests: 1 });

// Virtual for current member count
TripsSchema.virtual('currentMemberCount').get(function () {
    return this.members.filter((member) => member.status === MemberStatus.JOINED).length;
});

// Virtual for available spots
TripsSchema.virtual('availableSpots').get(function () {
    const joinedMembers = this.members.filter((member) => member.status === MemberStatus.JOINED).length;
    return this.maxParticipants - joinedMembers;
});

// Virtual for is full
TripsSchema.virtual('isFull').get(function () {
    const joinedMembers = this.members.filter((member) => member.status === MemberStatus.JOINED).length;
    return joinedMembers >= this.maxParticipants;
});

// Pre-save validation
TripsSchema.pre('save', function (next) {
    // Validate end date is after start date
    if (this.endDate <= this.startDate) {
        return next(new Error('End date must be after start date'));
    }

    // Validate start date is not in the past
    if (this.startDate < new Date()) {
        return next(new Error('Start date cannot be in the past'));
    }

    next();
});
