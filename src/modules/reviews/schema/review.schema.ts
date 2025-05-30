import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ReviewDocument = Review & Document;

@Schema({ timestamps: true })
export class Review extends Document {
    @Prop({ type: Types.ObjectId, ref: 'Users', required: true })
    reviewerId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Users', required: true })
    revieweeId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Trips', required: true })
    tripId: Types.ObjectId;

    @Prop({ type: Number, required: true, min: 1, max: 5 })
    rating: number;

    @Prop({ type: String, required: true, maxlength: 500 })
    comment: string;

    @Prop({ type: Boolean, default: false })
    aiToxicityFlag: boolean;

    @Prop({ type: Date, default: Date.now, required: true })
    createdAt: Date;
}

export const ReviewSchema = SchemaFactory.createForClass(Review);

// Indexes for performance
ReviewSchema.index({ reviewerId: 1, revieweeId: 1, tripId: 1 }, { unique: true });
ReviewSchema.index({ reviewerId: 1 });
ReviewSchema.index({ revieweeId: 1 });
ReviewSchema.index({ tripId: 1 });
ReviewSchema.index({ rating: 1 });
ReviewSchema.index({ aiToxicityFlag: 1 });
ReviewSchema.index({ createdAt: -1 });

// Virtual for is positive review
ReviewSchema.virtual('isPositiveReview').get(function() {
    return this.rating >= 4;
});

// Virtual for formatted rating
ReviewSchema.virtual('formattedRating').get(function() {
    return `${this.rating}/5`;
});

// Pre-save validation
ReviewSchema.pre('save', function(next) {
    // Ensure reviewer and reviewee are different
    if (this.reviewerId.toString() === this.revieweeId.toString()) {
        return next(new Error('Users cannot review themselves'));
    }

    // Validate rating range
    if (this.rating < 1 || this.rating > 5) {
        return next(new Error('Rating must be between 1 and 5'));
    }

    // Validate comment length
    if (this.comment.trim().length === 0) {
        return next(new Error('Comment cannot be empty'));
    }

    if (this.comment.length > 500) {
        return next(new Error('Comment cannot exceed 500 characters'));
    }

    next();
});
