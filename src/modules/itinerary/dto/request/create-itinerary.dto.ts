import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsMongoId, IsNumber, IsArray, ValidateNested, Min } from 'class-validator';
import { Types } from 'mongoose';

class CreateActivityDto {
    @ApiProperty({ description: 'Time of the activity' })
    @IsDateString()
    time: string;

    @ApiProperty({ description: 'Description of the activity' })
    description: string;

    @ApiProperty({ description: 'Location of the activity' })
    location: string;
}

export class CreateItineraryDto {
    @ApiProperty({ description: 'Trip ID this itinerary belongs to' })
    @IsMongoId()
    tripId: Types.ObjectId;

    @ApiProperty({ description: 'Day number of the itinerary', minimum: 1 })
    @IsNumber()
    @Min(1)
    day: number;

    @ApiProperty({ description: 'Date of the itinerary' })
    @IsDateString()
    date: Date;

    @ApiProperty({ description: 'Activities for this day', type: [CreateActivityDto] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateActivityDto)
    activities: CreateActivityDto[];
}
