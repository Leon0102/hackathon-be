import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, Matches, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class UserRegisterDto {
    @ApiProperty({
        description: 'Full name of the user',
        example: 'John Doe'
    })
    @IsNotEmpty()
    @IsString()
    readonly fullName: string;

    @ApiProperty({
        description: 'User email address',
        example: 'user@vstation.com'
    })
    @IsEmail()
    @Matches(/^[\w+.-]+@[\dA-Za-z-]+\.[\d.A-Za-z-]+$/, {
        message: 'please enter a valid email address'
    })
    @Transform(({ value }) => value?.toLowerCase(), { toClassOnly: true })
    readonly email: string;

    @ApiProperty({
        description: 'User password',
        example: 'vStation@123',
        required: false,
        minLength: 8
    })
    @IsOptional()
    @IsString()
    @MinLength(8)
    readonly passwordHash?: string;
}
