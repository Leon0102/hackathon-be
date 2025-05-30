import { IsString } from 'class-validator';
import { StringField } from '../../../../decorators';

export class JoinTripDto {
    @StringField({ required: false })
    @IsString()
    message?: string;
}
