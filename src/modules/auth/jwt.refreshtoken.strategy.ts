import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { ErrorCode, Token } from '../../constants';
import { ApiConfigService } from '../../shared/services/api-config.service';
import { UsersService } from '../users/users.service';
import type ITokenPayload from './token-payload.interface';

interface IRequestHeaders extends Request {
    refreshtoken: string;
}
interface IRequest {
    headers: IRequestHeaders;
}

@Injectable()
export class JwtRefreshTokenStrategy extends PassportStrategy(Strategy, 'jwt-refresh-token') {
    constructor(
        private readonly userService: UsersService,
        private readonly configService: ApiConfigService
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromHeader('refreshtoken'),
            ignoreExpiration: false,
            secretOrKey: configService.authConfig.publicKey,
            passReqToCallback: true
        });
    }

    async validate(req: IRequest, payload: ITokenPayload) {
        if (payload.type !== Token.REFRESH_TOKEN) {
            throw new UnauthorizedException(ErrorCode.UNAUTHORIZED);
        }

        const user = await this.userService.findByIdOrEmail({ email: payload.userEmail });

        if (!user) {
            throw new UnauthorizedException(ErrorCode.UNAUTHORIZED);
        }

        return { id: user.id, email: user.email, role: user.role };
    }
}
