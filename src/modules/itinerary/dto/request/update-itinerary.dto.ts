import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { CreateItineraryDto } from './create-itinerary.dto';

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
