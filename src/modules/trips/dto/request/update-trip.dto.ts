import { IsDate, IsEnum, IsNumber, IsString, IsOptional, IsArray, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { StringField, NumberField } from '../../../../decorators';
import { TripStatus, AgeRange, TravelPurpose, TravelInterest } from '../../../../constants';

export class UpdateTripDto {
    @StringField({ required: false })
    @IsOptional()
    destination?: string;

    @Type(() => Date)
    @IsDate()
    @IsOptional()
    startDate?: Date;

    @Type(() => Date)
    @IsDate()
    @IsOptional()
    endDate?: Date;

    @NumberField({ required: false })
    @IsOptional()
    @Min(1, { message: 'Maximum participants must be at least 1' })
    maxParticipants?: number;

    @IsEnum(TripStatus)
    @IsOptional()
    status?: TripStatus;

    @IsEnum(AgeRange)
    @IsOptional()
    preferredAgeRange?: AgeRange;

    @IsArray()
    @IsEnum(TravelPurpose, { each: true })
    @IsOptional()
    travelPurposes?: TravelPurpose[];

    @IsArray()
    @IsEnum(TravelInterest, { each: true })
    @IsOptional()
    interests?: TravelInterest[];
}
