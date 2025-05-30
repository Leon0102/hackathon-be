"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UUIDParam = exports.RefreshToken = exports.Auth = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const guards_1 = require("../guards");
const auth_user_interceptor_1 = require("../interceptors/auth-user.interceptor");
const public_route_decorator_1 = require("./public-route.decorator");
function Auth(roles = [], options) {
    const isPublicRoute = options === null || options === void 0 ? void 0 : options.public;
    return (0, common_1.applyDecorators)((0, common_1.SetMetadata)('roles', roles), (0, common_1.UseGuards)((0, guards_1.AuthGuard)({ public: isPublicRoute }), guards_1.RolesGuard), (0, swagger_1.ApiBearerAuth)(), (0, common_1.UseInterceptors)(auth_user_interceptor_1.AuthUserInterceptor), (0, swagger_1.ApiUnauthorizedResponse)({ description: 'Unauthorized' }), (0, public_route_decorator_1.PublicRoute)(isPublicRoute));
}
exports.Auth = Auth;
function RefreshToken() {
    return (0, common_1.applyDecorators)((0, common_1.UseGuards)(guards_1.JwtRefreshGuard), (0, swagger_1.ApiUnauthorizedResponse)({ description: 'Unauthorized' }));
}
exports.RefreshToken = RefreshToken;
function UUIDParam(property, ...pipes) {
    return (0, common_1.Param)(property, new common_1.ParseUUIDPipe({ version: '4' }), ...pipes);
}
exports.UUIDParam = UUIDParam;
//# sourceMappingURL=http.decorator.js.map