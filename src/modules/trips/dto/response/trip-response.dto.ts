import { Expose, Type } from 'class-transformer';
import { MemberStatus } from '../../../../constants';

export class TripMemberResponseDto {
    @Expose()
    user: string;

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
    createdBy: string;

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
