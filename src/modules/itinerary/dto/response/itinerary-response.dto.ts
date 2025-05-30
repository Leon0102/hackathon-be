import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform, Type } from 'class-transformer';

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

    @ApiProperty({ description: 'Trip ID this itinerary belongs to' })
    @Expose()
    @Transform(({ obj, key }) => {
        // Handle MongoDB ObjectId field
        if (obj.tripId) {
            return obj.tripId.toString();
        }

        // Fallback for other formats
        return obj[key]?.toString();
    })
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
