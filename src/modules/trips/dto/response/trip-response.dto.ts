import { Expose, Transform, Type } from 'class-transformer';

import { MemberStatus, AgeRange, TravelInterest, TravelPurpose } from '../../../../constants';
import { ItineraryResponseDto } from '../../../itinerary/dto/response/itinerary-response.dto';

export class TripMemberUserDto {
    @Expose()
    fullName: string;

    @Expose()
    email: string;

    @Expose()
    profilePictureUrl: string;
}
export class TripMemberResponseDto {
    @Expose()
    @Type(() => TripMemberUserDto) // ✅ expects populated object
    user: TripMemberUserDto;

    @Expose()
    status: MemberStatus;

    @Expose()
    joinedAt?: Date;

    @Expose()
    message?: string;
}

export class TripResponseDto {
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
    @Type(() => TripMemberUserDto) // ✅ expects populated object
    createdBy: TripMemberUserDto;

    @Expose()
    destination: string;

    @Expose()
    startDate: Date;

    @Expose()
    endDate: Date;

    @Expose()
    status: string;

    @Expose()
    maxParticipants: number;

    @Expose()
    @Type(() => TripMemberResponseDto)
    members: TripMemberResponseDto[];

    @Expose()
    @Type(() => ItineraryResponseDto)
    itinerary: ItineraryResponseDto[];

    @Expose()
    createdAt: Date;

    @Expose()
    updatedAt: Date;

    @Expose()
    currentMemberCount?: number;

    @Expose()
    availableSpots?: number;

    @Expose()
    isFull?: boolean;

    @Expose()
    preferredAgeRange?: AgeRange;

    @Expose()
    travelPurposes?: TravelPurpose[];

    @Expose()
    interests?: TravelInterest[];
}
