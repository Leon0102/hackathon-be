import { IsString, Min } from 'class-validator';
import { NumberField } from '../../../../decorators';

export class CreateGroupDto {
    @IsString()
    name: string;

    @IsString()
    tripId: string;

    @NumberField()
    @Min(1, { message: 'Maximum participants must be at least 1' })
    maxParticipants: number;
}
