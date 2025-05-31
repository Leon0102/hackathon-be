import { IsString, IsArray, ValidateNested, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { CreateItineraryDto } from './create-itinerary.dto';

export class UpdateActivityDto {
    @ApiProperty({
        description: 'Time of the activity',
        example: '09:00'
    })
    @IsString()
    time: string;

    @ApiProperty({
        description: 'Description of the activity',
        example: 'Visit the historic Tokyo Imperial Palace'
    })
    @IsString()
    description: string;

    @ApiProperty({
        description: 'Location of the activity',
        example: 'Imperial Palace, Tokyo'
    })
    @IsString()
    location: string;
}
export class UpdateItineraryDto extends PartialType(CreateItineraryDto) {
    @ApiPropertyOptional({ description: 'Day number of the itinerary' })
    @IsOptional()
    day?: number;

    @ApiPropertyOptional({ description: 'Date of the itinerary' })
    @IsOptional()
    date?: Date;

    @ApiPropertyOptional({ description: 'Activities for this day' })
    @IsOptional()
    activities?: any[];
}
