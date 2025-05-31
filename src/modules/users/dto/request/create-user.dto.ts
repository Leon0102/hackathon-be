import { IsOptional, IsEnum, IsArray, Min, Max, MaxLength } from 'class-validator';
import { StringField, NumberField, BooleanField } from '../../../../decorators';
import { AuthProvider, Gender, TravelStyle } from '../../../../constants';

export class CreateUserDto {
    @StringField()
    fullName: string;

    @StringField()
    email: string;

    @StringField({ required: false })
    @IsOptional()
    passwordHash?: string;

    @IsEnum(AuthProvider)
    @IsOptional()
    authProvider?: AuthProvider = AuthProvider.LOCAL;

    @StringField({ required: false })
    @IsOptional()
    profilePictureUrl?: string;

    @NumberField({ required: false })
    @IsOptional()
    @Min(18)
    @Max(120)
    age?: number;

    @IsEnum(Gender)
    @IsOptional()
    gender?: Gender;

    @StringField({ required: false })
    @IsOptional()
    @MaxLength(500)
    bio?: string;

    @IsArray()
    @IsOptional()
    languages?: string[];

    @IsEnum(TravelStyle)
    @IsOptional()
    travelStyle?: TravelStyle;

    @NumberField({ required: false })
    @IsOptional()
    @Min(0)
    budget?: number;

    @IsArray()
    @IsOptional()
    preferredDestinations?: string[];

    @StringField({ required: false })
    @IsOptional()
    location?: string;

    @NumberField({ required: false })
    @IsOptional()
    @Min(0)
    @Max(100)
    trustScore?: number;

    @BooleanField({ required: false })
    @IsOptional()
    isVerified?: boolean;
}
