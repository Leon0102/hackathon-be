"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const otplib_1 = require("otplib");
const utils_1 = require("../../common/utils");
const constants_1 = require("../../constants");
const api_config_service_1 = require("../../shared/services/api-config.service");
const mail_service_1 = require("../../shared/services/mail.service");
const users_service_1 = require("../users/users.service");
const token_payload_dto_1 = require("./dto/token-payload.dto");
let AuthService = class AuthService {
    constructor(jwtService, configService, usersService, mailService) {
        this.jwtService = jwtService;
        this.configService = configService;
        this.usersService = usersService;
        this.mailService = mailService;
    }
    async createAccessToken(data) {
        return new token_payload_dto_1.TokenPayloadDto({
            expiresIn: this.configService.authConfig.jwtExpirationTime,
            accessToken: await this.jwtService.signAsync({
                userId: data.userId,
                type: constants_1.Token.ACCESS_TOKEN,
                role: data.role
            }),
            refreshToken: await this.jwtService.signAsync({
                userId: data.userId,
                type: constants_1.Token.REFRESH_TOKEN,
                role: data.role
            }, {
                expiresIn: constants_1.TimeExpression.ONE_WEEK
            })
        });
    }
    async validateUser(userLoginDto) {
        const user = await this.usersService.getUserByEmail(userLoginDto.email);
        if (!user) {
            throw new common_1.NotFoundException(constants_1.ErrorCode.AUTH_EMAIL_NOT_FOUND);
        }
        const isPasswordValid = await (0, utils_1.validateHash)(userLoginDto.password, user === null || user === void 0 ? void 0 : user.passwordHash);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException(constants_1.ErrorCode.AUTH_INCORRECT_PASSWORD);
        }
        return user;
    }
    async forgotPassword(email) {
        const user = await this.usersService.findByIdOrEmail({
            email
        });
        if (!user) {
            throw new common_1.NotFoundException(constants_1.ErrorCode.USER_NOT_FOUND);
        }
        otplib_1.totp.options = {
            digits: 6,
            step: 600
        };
        const otpCode = otplib_1.totp.generate(email);
        const username = user.email;
        await this.mailService.sendEmailOTP(user.email, 'Change Password', { username, otpCode });
    }
    async verifyOTP(dto) {
        const user = await this.usersService.findByIdOrEmail({
            email: dto.email
        });
        if (!otplib_1.totp.check(dto.otpCode, dto.email)) {
            throw new common_1.BadRequestException(constants_1.ErrorCode.AUTH_INVALID_OTP);
        }
        return user;
    }
    async resetPassword(resetPasswordDto) {
        return this.usersService.resetPassword(resetPasswordDto);
    }
};
AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        api_config_service_1.ApiConfigService,
        users_service_1.UsersService,
        mail_service_1.MailService])
], AuthService);
exports.AuthService = AuthService;
//# sourceMappingURL=auth.service.js.map