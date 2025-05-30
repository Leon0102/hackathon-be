import { Matches, MinLength } from 'class-validator';

import { EmailField, StringField } from '../../../decorators';

export class UserRegisterDto {
    @StringField({ example: 'John Doe' })
    readonly fullName: string;

    @EmailField({ toLowerCase: true, example: 'user@vstation.com' })
    @Matches(/^[\w+.-]+@[\dA-Za-z-]+\.[\d.A-Za-z-]+$/, {
        message: 'please enter a valid email address'
    })
    readonly email: string;

    @StringField({ minLength: 8, example: 'vStation@123', required: false })
    @MinLength(8)
    readonly passwordHash?: string;
}
