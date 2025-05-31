import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class UserLoginDto {
    @ApiProperty({
        description: 'User email address',
        example: 'user@example.com'
    })
    @IsEmail()
    @IsNotEmpty()
    @Transform(({ value }) => value?.toLowerCase(), { toClassOnly: true })
    readonly email: string;

    @ApiProperty({
        description: 'User password',
        example: 'securePassword123'
    })
    @IsNotEmpty()
    @IsString()
    readonly password: string;
}
