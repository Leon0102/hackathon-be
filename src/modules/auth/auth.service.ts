/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Auth } from 'googleapis';
import { totp } from 'otplib';

import { validateHash } from '../../common/utils';
import type { UserRole } from '../../constants';
import { ErrorCode, TimeExpression, Token } from '../../constants';
import { ApiConfigService } from '../../shared/services/api-config.service';
import { MailService } from '../../shared/services/mail.service';
import type { ResetPasswordDto } from '../users/dto/request';
import type { Users } from '../users/schema';
// import { MailGunService } from '../../shared/services/mail-gun.service';
// import type { ResetPasswordDto } from '../users/dto';
// import type { User } from '../users/entities';
import { UsersService } from '../users/users.service';
import type { OTPDto, UserLoginDto } from './dto';
import { TokenPayloadDto } from './dto/token-payload.dto';
@Injectable()
export class AuthService {
    private readonly oauthClient: Auth.OAuth2Client;

    constructor(
        private readonly jwtService: JwtService,
        private readonly configService: ApiConfigService,
        private readonly usersService: UsersService,
        private readonly mailService: MailService
    ) {}

    async createAccessToken(data: { role: UserRole; userEmail: string }): Promise<TokenPayloadDto> {
        return new TokenPayloadDto({
            expiresIn: this.configService.authConfig.jwtExpirationTime,
            accessToken: await this.jwtService.signAsync(
                {
                    userEmail: data.userEmail,
                    type: Token.ACCESS_TOKEN,
                    role: data.role
                },
                {
                    // set expired date access token
                    expiresIn: this.configService.authConfig.jwtExpirationTime
                }
            ),
            refreshToken: await this.jwtService.signAsync(
                {
                    userEmail: data.userEmail,
                    type: Token.REFRESH_TOKEN,
                    role: data.role
                },
                {
                    // set expired date refresh token
                    expiresIn: TimeExpression.ONE_WEEK
                }
            )
        });
    }

    async validateUser(userLoginDto: UserLoginDto): Promise<Users> {
        const user = await this.usersService.getUserByEmail(userLoginDto.email);

        if (!user) {
            throw new NotFoundException(ErrorCode.AUTH_EMAIL_NOT_FOUND);
        }

        const isPasswordValid = await validateHash(userLoginDto.password, user?.passwordHash);

        if (!isPasswordValid) {
            throw new UnauthorizedException(ErrorCode.AUTH_INCORRECT_PASSWORD);
        }

        return user;
    }

    async forgotPassword(email: string) {
        const user = await this.usersService.findByIdOrEmail({
            email
        });

        if (!user) {
            throw new NotFoundException(ErrorCode.USER_NOT_FOUND);
        }

        totp.options = {
            digits: 6,
            step: 600
        };

        const otpCode = totp.generate(email);
        const username = user.email;
        await this.mailService.sendEmailOTP(user.email, 'Change Password', { username, otpCode });
        // return otpCode
    }

    // async verifyGoogleUser(token: string) {
    //     try {
    //         return await this.oauthClient.getTokenInfo(token);
    //     } catch {
    //         throw new BadRequestException(ErrorCode.AUTH_INVALID_TOKEN);
    //     }
    // }

    // async verifyAppleUser(token: string) {
    //     try {
    //         return await verifyAppleToken({
    //             idToken: token,
    //             clientId: this.configService.appleAuth.clientId
    //         });
    //     } catch {
    //         throw new BadRequestException(ErrorCode.AUTH_INVALID_TOKEN);
    //     }
    // }

    async verifyOTP(dto: OTPDto): Promise<Users> {
        const user = await this.usersService.findByIdOrEmail({
            email: dto.email
        });

        if (!totp.check(dto.otpCode, dto.email)) {
            throw new BadRequestException(ErrorCode.AUTH_INVALID_OTP);
        }

        return user;
    }

    async resetPassword(resetPasswordDto: ResetPasswordDto) {
        return this.usersService.resetPassword(resetPasswordDto);
    }

    // async googleAppleAuthentication(
    //     email: string,
    //     _ip: string,
    //     registerType: RegisterMethod
    // ): Promise<LoginPayloadDto> {
    //     const user = await this.usersService.getUserByEmail(email);

    //     if (!user) {
    //         const createUserDto: UserRegisterDto = {
    //             email
    //         };

    //         const userDto = await this.usersService.createUser(
    //             createUserDto,
    //             registerType,
    //             _ip === '::1' ? '14.245.167.9' : _ip
    //         );

    //         const token = await this.createAccessToken({
    //             userEmail: userDto.email,
    //             role: userDto.role
    //         });

    //         await this.usersService.updateLastLogin(userDto.id);

    //         return new LoginPayloadDto(userDto, token);
    //     }

    //     const loginToken = await this.createAccessToken({
    //         userEmail: user.email,
    //         role: user.role
    //     });

    //     await this.usersService.updateLastLogin(user.id);

    //     return new LoginPayloadDto(user.toDto(), loginToken);
    // }
}
