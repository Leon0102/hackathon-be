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
    constructor(private configService: ApiConfigService, private usersService: UsersService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: configService.authConfig.publicKey
        });
    }

    async validate(args: { userId: string; role: UserRole; type: TokenType }): Promise<Users> {
        if (args.type !== Token.ACCESS_TOKEN) {
            throw new UnauthorizedException(ErrorCode.UNAUTHORIZED);
        }

        const user = await this.usersService.findByIdOrEmail({
            id: args.userId
        });
        // Ensure the user exists and is not null

        if (!user) {
            throw new UnauthorizedException(ErrorCode.UNAUTHORIZED);
        }

        return user;
    }
}
