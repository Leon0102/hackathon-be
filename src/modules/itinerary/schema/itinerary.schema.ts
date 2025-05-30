import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

// Activity subdocument schema
@Schema({ _id: false })
export class Activity {
    @Prop({ type: String, required: true })
    time: string;

    @Prop({ type: String, required: true })
    description: string;

    @Prop({ type: String, required: true })
    location: string;
}

export const ActivitySchema = SchemaFactory.createForClass(Activity);

export type ItineraryDocument = Itinerary & Document;

@Schema({ timestamps: true })
export class Itinerary extends Document {
    @Prop({ type: Types.ObjectId, ref: 'Trips', required: true })
    tripId: Types.ObjectId;

    @Prop({ type: Number, required: true, min: 1 })
    day: number;

    @Prop({ type: Date, required: true })
    date: Date;

    @Prop({ type: [ActivitySchema], default: [] })
    activities: Activity[];
}

export const ItinerarySchema = SchemaFactory.createForClass(Itinerary);

// Indexes for performance
ItinerarySchema.index({ tripId: 1 });
ItinerarySchema.index({ tripId: 1, day: 1 });
ItinerarySchema.index({ date: 1 });

// Virtual for formatted date
ItinerarySchema.virtual('formattedDate').get(function() {
    return this.date.toISOString().split('T')[0];
});

// Pre-save validation
ItinerarySchema.pre('save', function(next) {
    // Ensure day is positive
    if (this.day <= 0) {
        return next(new Error('Day must be a positive number'));
    }

    // Validate date is not in the past
    if (this.date < new Date()) {
        return next(new Error('Date cannot be in the past'));
    }

    next();
});
