import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { MessageType } from '../../../constants';

export type MessageDocument = Message & Document;

@Schema({ timestamps: true })
export class Message extends Document {
    @Prop({ type: Types.ObjectId, ref: 'Trips', required: true })
    tripId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Users', required: true })
    senderId: Types.ObjectId;

    @Prop({ type: String, required: true })
    content: string;

    @Prop({ type: Date, default: Date.now, required: true })
    timestamp: Date;

    @Prop({ type: String, enum: Object.values(MessageType), default: MessageType.TEXT, required: true })
    messageType: MessageType;

    @Prop({ type: Boolean, default: false })
    isFlagged: boolean;
}

export const MessageSchema = SchemaFactory.createForClass(Message);

// Indexes for performance
MessageSchema.index({ tripId: 1 });
MessageSchema.index({ senderId: 1 });
MessageSchema.index({ tripId: 1, timestamp: -1 });
MessageSchema.index({ isFlagged: 1 });

// Virtual for formatted timestamp
MessageSchema.virtual('formattedTimestamp').get(function() {
    return this.timestamp.toISOString();
});

// Pre-save validation
MessageSchema.pre('save', function(next) {
    // Validate content length
    if (this.content.length > 1000) {
        return next(new Error('Message content cannot exceed 1000 characters'));
    }

    // Set timestamp if not provided
    if (!this.timestamp) {
        this.timestamp = new Date();
    }

    next();
});
