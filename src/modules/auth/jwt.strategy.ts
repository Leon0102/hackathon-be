import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import type { TokenType, UserRole } from '../../constants';
import { ErrorCode, Token } from '../../constants';
import { ApiConfigService } from '../../shared/services/api-config.service';
import type { Users } from '../users/schema';
import { UsersService } from '../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private readonly configService: ApiConfigService,
        private readonly usersService: UsersService
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: configService.authConfig.publicKey
        });
    }

    async validate(args: { userEmail: string; role: UserRole; type: TokenType }): Promise<Users> {
        if (args.type !== Token.ACCESS_TOKEN) {
            throw new UnauthorizedException(ErrorCode.UNAUTHORIZED);
        }

        const user = await this.usersService.findByIdOrEmail({
            email: args.userEmail
        });
        // Ensure the user exists and is not null

        if (!user) {
            throw new UnauthorizedException(ErrorCode.UNAUTHORIZED);
        }

        return user;
    }
}
