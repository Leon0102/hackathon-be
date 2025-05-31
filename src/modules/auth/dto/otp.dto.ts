import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, Matches } from 'class-validator';
import { Transform } from 'class-transformer';

export class OTPDto {
    @ApiProperty({
        description: 'User email address',
        example: 'user@vstation.com'
    })
    @IsEmail()
    @Matches(/^[\w+.-]+@[\dA-Za-z-]+\.[\d.A-Za-z-]+$/)
    @Transform(({ value }) => value?.toLowerCase(), { toClassOnly: true })
    readonly email: string;

    @ApiProperty({
        description: 'OTP verification code',
        example: '123456'
    })
    @IsNotEmpty()
    @IsString()
    readonly otpCode: string;
}
