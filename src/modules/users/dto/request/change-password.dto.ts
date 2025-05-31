import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ChangePasswordDto {
    @ApiProperty({
        description: 'New password',
        example: 'newSecurePassword123'
    })
    @IsNotEmpty()
    @IsString()
    newPassword: string;

    @ApiProperty({
        description: 'Confirm new password',
        example: 'newSecurePassword123'
    })
    @IsNotEmpty()
    @IsString()
    newPasswordConfirmed: string;
}
