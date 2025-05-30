import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { AdminRole } from '../../../constants';

export type AdminDocument = Admin & Document;

@Schema({ timestamps: true })
export class Admin extends Document {
    @Prop({ type: String, required: true, unique: true, lowercase: true })
    email: string;

    @Prop({ type: String, required: true })
    passwordHash: string;

    @Prop({ type: String, enum: Object.values(AdminRole), default: AdminRole.MODERATOR, required: true })
    role: AdminRole;

    @Prop({ type: Date, default: Date.now, required: true })
    createdAt: Date;
}

export const AdminSchema = SchemaFactory.createForClass(Admin);

// Indexes for performance
AdminSchema.index({ email: 1 }, { unique: true });
AdminSchema.index({ role: 1 });
AdminSchema.index({ createdAt: -1 });

// Virtual for is admin
AdminSchema.virtual('isAdmin').get(function() {
    return this.role === AdminRole.ADMIN;
});

// Virtual for is moderator
AdminSchema.virtual('isModerator').get(function() {
    return this.role === AdminRole.MODERATOR;
});

// Pre-save validation
AdminSchema.pre('save', function(next) {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email)) {
        return next(new Error('Invalid email format'));
    }

    // Validate password hash exists
    if (!this.passwordHash || this.passwordHash.length === 0) {
        return next(new Error('Password hash is required'));
    }

    next();
});
