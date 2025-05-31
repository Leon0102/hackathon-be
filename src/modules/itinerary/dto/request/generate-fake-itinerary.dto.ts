import { IsMongoId, IsString, IsDateString, IsNumber, IsOptional, IsEnum, IsArray, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export enum TravelStyle {
    ADVENTURE = 'adventure',
    LUXURY = 'luxury',
    BUDGET = 'budget',
    CULTURAL = 'cultural',
    RELAXED = 'relaxed'
}

export class GenerateFakeItineraryDto {
    @ApiProperty({
        description: 'Trip ID to generate itinerary for',
        example: '64f7b1234567890123456789'
    })
    @IsMongoId({ message: 'Trip ID must be a valid MongoDB ObjectId' })
    tripId: string;

    @ApiProperty({
        description: 'Destination name',
        example: 'Tokyo'
    })
    @IsString()
    destination: string;

    @ApiProperty({
        description: 'Start date of the trip',
        example: '2024-06-01'
    })
    @IsDateString()
    startDate: string;

    @ApiProperty({
        description: 'End date of the trip',
        example: '2024-06-07'
    })
    @IsDateString()
    endDate: string;

    @ApiProperty({
        description: 'Number of days for the itinerary',
        example: 7,
        minimum: 1,
        maximum: 30
    })
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    @Max(30)
    numberOfDays: number;

    @ApiPropertyOptional({
        description: 'Travel style preference',
        enum: TravelStyle,
        example: TravelStyle.CULTURAL
    })
    @IsOptional()
    @IsEnum(TravelStyle)
    travelStyle?: TravelStyle;

    @ApiPropertyOptional({
        description: 'Travel interests',
        example: ['food', 'culture', 'shopping'],
        isArray: true,
        type: [String]
    })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    interests?: string[];
}
