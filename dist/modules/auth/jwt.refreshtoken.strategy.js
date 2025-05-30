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
exports.JwtRefreshTokenStrategy = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const passport_jwt_1 = require("passport-jwt");
const constants_1 = require("../../constants");
const api_config_service_1 = require("../../shared/services/api-config.service");
const users_service_1 = require("../users/users.service");
let JwtRefreshTokenStrategy = class JwtRefreshTokenStrategy extends (0, passport_1.PassportStrategy)(passport_jwt_1.Strategy, 'jwt-refresh-token') {
    constructor(userService, configService) {
        super({
            jwtFromRequest: passport_jwt_1.ExtractJwt.fromHeader('refreshtoken'),
            ignoreExpiration: false,
            secretOrKey: configService.authConfig.publicKey,
            passReqToCallback: true
        });
        this.userService = userService;
        this.configService = configService;
    }
    async validate(req, payload) {
        if (payload.type !== constants_1.Token.REFRESH_TOKEN) {
            throw new common_1.UnauthorizedException(constants_1.ErrorCode.UNAUTHORIZED);
        }
        const user = await this.userService.findByIdOrEmail({ email: payload.userEmail });
        if (!user) {
            throw new common_1.UnauthorizedException(constants_1.ErrorCode.UNAUTHORIZED);
        }
        return { id: user.id, email: user.email, role: user.role };
    }
};
JwtRefreshTokenStrategy = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        api_config_service_1.ApiConfigService])
], JwtRefreshTokenStrategy);
exports.JwtRefreshTokenStrategy = JwtRefreshTokenStrategy;
//# sourceMappingURL=jwt.refreshtoken.strategy.js.map