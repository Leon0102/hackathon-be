import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsDate, IsEnum, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { AgeRange, TravelInterest, TravelPurpose } from '../../../../constants';

export class SearchTripsDto {
    @ApiPropertyOptional({ description: 'Destination to search for' })
    @IsString()
    @IsOptional()
    destination?: string;

    @ApiPropertyOptional({ description: 'Start date for trip search' })
    @Type(() => Date)
    @IsDate()
    @IsOptional()
    startDate?: Date;

    @ApiPropertyOptional({ description: 'End date for trip search' })
    @Type(() => Date)
    @IsDate()
    @IsOptional()
    endDate?: Date;

    @ApiPropertyOptional({
        description: 'Preferred age range',
        enum: AgeRange
    })
    @IsEnum(AgeRange)
    @IsOptional()
    preferredAgeRange?: AgeRange;

    @ApiPropertyOptional({
        description: 'Travel purposes',
        enum: TravelPurpose,
        isArray: true
    })
    @IsArray()
    @IsEnum(TravelPurpose, { each: true })
    @IsOptional()
    travelPurposes?: TravelPurpose[];

    @ApiPropertyOptional({
        description: 'Travel interests',
        enum: TravelInterest,
        isArray: true
    })
    @IsArray()
    @IsEnum(TravelInterest, { each: true })
    @IsOptional()
    interests?: TravelInterest[];

    @ApiPropertyOptional({ description: 'Page number for pagination', minimum: 1 })
    @IsOptional()
    page?: number = 1;

    @ApiPropertyOptional({ description: 'Number of items per page', minimum: 1, maximum: 50 })
    @IsOptional()
    limit?: number = 10;
}
