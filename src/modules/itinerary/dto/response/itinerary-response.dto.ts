import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform, Type } from 'class-transformer';
import { Types } from 'mongoose';

class ActivityResponseDto {
    @ApiProperty({ description: 'Time of the activity' })
    @Expose()
    time: string;

    @ApiProperty({ description: 'Description of the activity' })
    @Expose()
    description: string;

    @ApiProperty({ description: 'Location of the activity' })
    @Expose()
    location: string;
}

export class ItineraryResponseDto {
    @ApiProperty({ description: 'Itinerary ID' })
    @Expose()
    @Transform(({ obj }) => obj._id?.toString())
    id: string;

    @ApiProperty({ description: 'Trip ID this itinerary belongs to' })
    @Expose()
    @Transform(({ obj }) => obj.tripId?.toString())
    tripId: string;

    @ApiProperty({ description: 'Day number of the itinerary' })
    @Expose()
    day: number;

    @ApiProperty({ description: 'Date of the itinerary' })
    @Expose()
    date: Date;

    @ApiProperty({ description: 'Activities for this day', type: [ActivityResponseDto] })
    @Expose()
    @Type(() => ActivityResponseDto)
    activities: ActivityResponseDto[];

    @ApiProperty({ description: 'Formatted date' })
    @Expose()
    formattedDate: string;

    @ApiProperty({ description: 'Created at timestamp' })
    @Expose()
    createdAt: Date;

    @ApiProperty({ description: 'Updated at timestamp' })
    @Expose()
    updatedAt: Date;
}
