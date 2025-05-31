import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, Matches } from 'class-validator';
import { Transform } from 'class-transformer';

export class ResetPasswordDto {
    @ApiProperty({
        description: 'User email address',
        example: 'user@vstation.com'
    })
    @IsEmail()
    @Matches(/^[\w+.-]+@[\dA-Za-z-]+\.[\d.A-Za-z-]+$/, {
        message: 'please enter a valid email address'
    })
    @Transform(({ value }) => value?.toLowerCase(), { toClassOnly: true })
    email: string;

    @ApiProperty({
        description: 'New password',
        example: 'newSecurePassword123'
    })
    @IsNotEmpty()
    @IsString()
    newPassword: string;
}
