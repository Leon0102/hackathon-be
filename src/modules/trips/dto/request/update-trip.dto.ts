import { IsDate, IsEnum, IsNumber, IsString, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { StringField, NumberField } from '../../../../decorators';
import { TripStatus } from '../../../../constants';

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
}
