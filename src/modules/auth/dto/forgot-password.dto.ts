import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, Matches } from 'class-validator';
import { Transform } from 'class-transformer';

export class ForgotPasswordDto {
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
}
