import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { MatchStatus } from '../../../constants';

export type MatchDocument = Match & Document;

@Schema({ timestamps: true })
export class Match extends Document {
    @Prop({ type: Types.ObjectId, ref: 'Users', required: true })
    userA: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Users', required: true })
    userB: Types.ObjectId;

    @Prop({ type: Number, required: true, min: 0, max: 100 })
    matchScore: number;

    @Prop({ type: String, enum: Object.values(MatchStatus), default: MatchStatus.PENDING, required: true })
    status: MatchStatus;

    @Prop({ type: Types.ObjectId, ref: 'Users', required: true })
    initiatedBy: Types.ObjectId;

    @Prop({ type: Date, default: Date.now, required: true })
    createdAt: Date;
}

export const MatchSchema = SchemaFactory.createForClass(Match);

// Indexes for performance
MatchSchema.index({ userA: 1, userB: 1 }, { unique: true });
MatchSchema.index({ userA: 1 });
MatchSchema.index({ userB: 1 });
MatchSchema.index({ status: 1 });
MatchSchema.index({ initiatedBy: 1 });
MatchSchema.index({ createdAt: -1 });

// Virtual for participants
MatchSchema.virtual('participants').get(function() {
    return [this.userA, this.userB];
});

// Virtual for is mutual match
MatchSchema.virtual('isMutualMatch').get(function() {
    return this.status === MatchStatus.ACCEPTED;
});

// Pre-save validation
MatchSchema.pre('save', function(next) {
    // Ensure users are different
    if (this.userA.toString() === this.userB.toString()) {
        return next(new Error('Users cannot match with themselves'));
    }

    // Ensure initiatedBy is one of the users
    const initiatedByStr = this.initiatedBy.toString();
    const userAStr = this.userA.toString();
    const userBStr = this.userB.toString();

    if (initiatedByStr !== userAStr && initiatedByStr !== userBStr) {
        return next(new Error('Match must be initiated by one of the participating users'));
    }

    // Validate match score
    if (this.matchScore < 0 || this.matchScore > 100) {
        return next(new Error('Match score must be between 0 and 100'));
    }

    next();
});
