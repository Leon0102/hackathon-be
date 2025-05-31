import { IsMongoId, IsString, IsOptional, Allow } from 'class-validator';
import { StringField } from '../../../../decorators';

export class AddUserToTripDto {
    @IsMongoId({ message: 'User ID must be a valid MongoDB ObjectId' })
    userId: string;

    @StringField({ required: false })
    @IsOptional()
    @IsString()
    message?: string;

    @Allow()
    id?: any; // Allow any 'id' property without validation errors
}
