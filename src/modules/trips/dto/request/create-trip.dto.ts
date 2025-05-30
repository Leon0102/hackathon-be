import { IsDate, IsEnum, IsNumber, IsString, IsOptional, IsArray, Min, MinDate } from 'class-validator';
import { Type } from 'class-transformer';
import { StringField, NumberField } from '../../../../decorators';
import { TripStatus, AgeRange, TravelPurpose, TravelInterest } from '../../../../constants';

export class CreateTripDto {
    @StringField()
    destination: string;

    @Type(() => Date)
    @IsDate()
    @MinDate(new Date(), { message: 'Start date must be in the future' })
    startDate: Date;

    @Type(() => Date)
    @IsDate()
    endDate: Date;

    @NumberField()
    @Min(1, { message: 'Maximum participants must be at least 1' })
    maxParticipants: number;

    @IsEnum(TripStatus)
    @IsOptional()
    status?: TripStatus = TripStatus.OPEN;

    @IsEnum(AgeRange)
    @IsOptional()
    preferredAgeRange?: AgeRange = AgeRange.NO_PREFERENCE;

    @IsArray()
    @IsEnum(TravelPurpose, { each: true })
    @IsOptional()
    travelPurposes?: TravelPurpose[] = [];

    @IsArray()
    @IsEnum(TravelInterest, { each: true })
    @IsOptional()
    interests?: TravelInterest[] = [];
}
