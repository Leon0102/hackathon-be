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
exports.JwtStrategy = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const passport_jwt_1 = require("passport-jwt");
const constants_1 = require("../../constants");
const api_config_service_1 = require("../../shared/services/api-config.service");
const users_service_1 = require("../users/users.service");
let JwtStrategy = class JwtStrategy extends (0, passport_1.PassportStrategy)(passport_jwt_1.Strategy) {
    constructor(configService, usersService) {
        super({
            jwtFromRequest: passport_jwt_1.ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: configService.authConfig.publicKey
        });
        this.configService = configService;
        this.usersService = usersService;
    }
    async validate(args) {
        if (args.type !== constants_1.Token.ACCESS_TOKEN) {
            throw new common_1.UnauthorizedException(constants_1.ErrorCode.UNAUTHORIZED);
        }
        const user = await this.usersService.findByIdOrEmail({
            email: args.userEmail
        });
        if (!user) {
            throw new common_1.UnauthorizedException(constants_1.ErrorCode.UNAUTHORIZED);
        }
        return user;
    }
};
JwtStrategy = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [api_config_service_1.ApiConfigService,
        users_service_1.UsersService])
], JwtStrategy);
exports.JwtStrategy = JwtStrategy;
//# sourceMappingURL=jwt.strategy.js.map