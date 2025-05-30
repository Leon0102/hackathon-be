import { Exclude, Expose } from 'class-transformer';
import { AuthProvider, Gender, TravelStyle, UserRole } from '../../../../constants';

export class UserResponseDto {
    @Expose()
    _id: string;

    @Expose()
    fullName: string;

    @Expose()
    email: string;

    @Exclude()
    passwordHash: string;

    @Expose()
    authProvider: AuthProvider;

    @Expose()
    profilePictureUrl?: string;

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
    avatarUrl?: string;
}
