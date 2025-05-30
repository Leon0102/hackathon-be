/* eslint-disable no-invalid-this */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

import { generateHash } from '../../../common/utils';
import { AuthProvider, Gender, TravelStyle, UserRole } from '../../../constants';

@Schema({ timestamps: true })
export class Users extends Document {
    @Prop({ type: String, required: true, trim: true })
    fullName: string;

    @Prop({ type: String, required: true, unique: true, lowercase: true, trim: true })
    email: string;

    @Prop({
        type: String,
        required: function() {
            return this.authProvider === AuthProvider.LOCAL;
        }
    })
    passwordHash: string;

    @Prop({ type: String, enum: AuthProvider, default: AuthProvider.LOCAL, required: true })
    authProvider: AuthProvider;

    @Prop({ type: String, default: null })
    profilePictureUrl: string;

    @Prop({ type: String, default: null })
    avatarUrl: string;

    @Prop({ type: Number, min: 18, max: 120 })
    age: number;

    @Prop({ type: String, enum: Gender })
    gender: Gender;

    @Prop({ type: String, maxlength: 500 })
    bio: string;

    @Prop({ type: [String], default: [] })
    languages: string[];

    @Prop({ type: String, enum: TravelStyle })
    travelStyle: TravelStyle;

    @Prop({ type: Number, min: 0 })
    budget: number;

    @Prop({ type: [String], default: [] })
    preferredDestinations: string[];

    @Prop({ type: Number, default: 0, min: 0, max: 100 })
    trustScore: number;

    @Prop({ type: Boolean, default: false })
    isVerified: boolean;

    @Prop({ type: String, enum: UserRole, default: UserRole.USER })
    role: UserRole;

    @Prop({ type: [String], default: [] })
    tags: string[];
}

export const UsersSchema = SchemaFactory.createForClass(Users);

// Indexes for performance
UsersSchema.index({ email: 1 });
UsersSchema.index({ authProvider: 1 });
UsersSchema.index({ trustScore: -1 });
UsersSchema.index({ isVerified: 1 });

// Virtual for profile completion percentage
UsersSchema.virtual('profileCompletion').get(function() {
    const fields = ['fullName', 'email', 'age', 'gender', 'bio', 'languages', 'travelStyle', 'preferredDestinations'];
    const completedFields = fields.filter(field => {
        const value = this[field];
        return value !== null && value !== undefined && value !== '' &&
               (Array.isArray(value) ? value.length > 0 : true);
    });
    return Math.round((completedFields.length / fields.length) * 100);
});

// Pre-save hook for password hashing (only for local auth)
UsersSchema.pre('save', function (next) {
    if (this.authProvider === AuthProvider.LOCAL && this.passwordHash && this.isModified('passwordHash')) {
        this.passwordHash = generateHash(this.passwordHash);
    }
    next();
});
