import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ReportDocument = Report & Document;

@Schema({ timestamps: true })
export class Report extends Document {
    @Prop({ type: Types.ObjectId, ref: 'Users', required: true })
    reporterId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Users', required: true })
    reportedUserId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Message', required: false })
    messageId?: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Trips', required: false })
    tripId?: Types.ObjectId;

    @Prop({ type: String, required: true, maxlength: 500 })
    reason: string;

    @Prop({ type: Boolean, default: false })
    isReviewed: boolean;

    @Prop({ type: Date, default: Date.now, required: true })
    createdAt: Date;
}

export const ReportSchema = SchemaFactory.createForClass(Report);

// Indexes for performance
ReportSchema.index({ reporterId: 1 });
ReportSchema.index({ reportedUserId: 1 });
ReportSchema.index({ messageId: 1 });
ReportSchema.index({ tripId: 1 });
ReportSchema.index({ isReviewed: 1 });
ReportSchema.index({ createdAt: -1 });
ReportSchema.index({ reporterId: 1, reportedUserId: 1, messageId: 1 }, {
    unique: true,
    partialFilterExpression: { messageId: { $exists: true } }
});

// Virtual for report type
ReportSchema.virtual('reportType').get(function() {
    if (this.messageId) return 'message';
    if (this.tripId) return 'trip';
    return 'user';
});

// Virtual for is pending review
ReportSchema.virtual('isPendingReview').get(function() {
    return !this.isReviewed;
});

// Pre-save validation
ReportSchema.pre('save', function(next) {
    // Ensure reporter and reported user are different
    if (this.reporterId.toString() === this.reportedUserId.toString()) {
        return next(new Error('Users cannot report themselves'));
    }

    // Validate reason length
    if (this.reason.trim().length === 0) {
        return next(new Error('Reason cannot be empty'));
    }

    if (this.reason.length > 500) {
        return next(new Error('Reason cannot exceed 500 characters'));
    }

    // If messageId is provided, tripId should also be provided (message belongs to a trip)
    if (this.messageId && !this.tripId) {
        return next(new Error('Trip ID is required when reporting a message'));
    }

    next();
});
