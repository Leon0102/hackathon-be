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

export class FakeActivityResponseDto extends ActivityResponseDto {
    @ApiProperty({
        description: 'Travel image URL for the activity',
        example: 'https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e'
    })
    @Expose()
    imageUrl?: string;
}

export class FakeDayItineraryResponseDto {
    @ApiProperty({
        description: 'Day number',
        example: 1
    })
    @Expose()
    day: number;

    @ApiProperty({
        description: 'Date in ISO format',
        example: '2024-06-01'
    })
    @Expose()
    date: string;

    @ApiProperty({
        description: 'Activities for the day with images',
        type: [FakeActivityResponseDto]
    })
    @Expose()
    @Type(() => FakeActivityResponseDto)
    activities: FakeActivityResponseDto[];
}

export class FakeItineraryResponseDto {
    @ApiProperty({
        description: 'Trip ID',
        example: '64f7b1234567890123456789'
    })
    @Expose()
    tripId: string;

    @ApiProperty({
        description: 'Destination name',
        example: 'Tokyo'
    })
    @Expose()
    destination: string;

    @ApiProperty({
        description: 'Total number of days',
        example: 7
    })
    @Expose()
    totalDays: number;

    @ApiProperty({
        description: 'Daily itineraries with activities and images',
        type: [FakeDayItineraryResponseDto]
    })
    @Expose()
    @Type(() => FakeDayItineraryResponseDto)
    itineraries: FakeDayItineraryResponseDto[];
}

export class GenerateAllItinerariesResponseDto {
    @ApiProperty({
        description: 'Number of trips processed',
        example: 25
    })
    @Expose()
    processedTrips: number;

    @ApiProperty({
        description: 'Number of itineraries generated',
        example: 175
    })
    @Expose()
    generatedItineraries: number;

    @ApiProperty({
        description: 'Any errors encountered during generation',
        example: ['Trip 64f7b1234567890123456789: Invalid date range (0 days)'],
        type: [String]
    })
    @Expose()
    errors: string[];
}
