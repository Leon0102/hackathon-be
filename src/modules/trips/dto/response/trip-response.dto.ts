import { Expose, Type } from 'class-transformer';
import { MemberStatus } from '../../../../constants';


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
    _id: string;

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
    itinerary: string[];

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
}
