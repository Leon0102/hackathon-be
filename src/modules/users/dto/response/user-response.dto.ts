import { Exclude, Expose, Transform } from 'class-transformer';

import { AuthProvider, Gender, TravelStyle, UserRole } from '../../../../constants';

export class UserResponseDto {
    @Expose()
    @Transform(({ obj, key }) => {
        // Handle MongoDB _id field
        if (obj._id) {
            return obj._id.toString();
        }

        // Handle regular id field
        if (obj.id) {
            return obj.id.toString();
        }

        // Fallback for other id formats
        return obj[key]?.toString();
    })
    id: string;

    @Expose()
    fullName: string;

    @Expose()
    email: string;

    @Exclude()
    passwordHash: string;

    @Expose()
    authProvider: AuthProvider;

    @Expose()
    age?: number;

    @Expose()
    gender?: Gender;

    @Expose()
    bio?: string;

    @Expose()
    languages: string[];

    @Expose()
    travelStyle?: TravelStyle;

    @Expose()
    budget?: number;

    @Expose()
    preferredDestinations: string[];

    @Expose()
    location?: string;

    @Expose()
    trustScore: number;

    @Expose()
    isVerified: boolean;

    @Expose()
    role: UserRole;

    @Expose()
    createdAt: Date;

    @Expose()
    updatedAt: Date;

    @Expose()
    profileCompletion?: number;

    @Expose()
    profilePictureUrl?: string;
}
