"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WrapResponseInterceptor = void 0;
const common_1 = require("@nestjs/common");
const rxjs_1 = require("rxjs");
const dto_1 = require("../common/dto");
const response_dto_1 = require("../common/dto/response.dto");
let WrapResponseInterceptor = class WrapResponseInterceptor {
    intercept(context, next) {
        const http = context.switchToHttp();
        const req = http.getRequest();
        const ctx = http.getResponse();
        const statusCode = ctx.statusCode;
        const url = req.originalUrl || req.url;
        if (url.startsWith('/docs') || url.match(/\.(css|js|png|svg|ico)$/)) {
            return next.handle();
        }
        return next.handle().pipe((0, rxjs_1.map)((response) => {
            if (response instanceof response_dto_1.ResponseDto) {
                return {
                    statusCode,
                    messageCode: response.messageCode
                };
            }
            if (response instanceof dto_1.PageDto) {
                return {
                    statusCode,
                    data: response.data,
                    meta: response.meta
                };
            }
            return {
                statusCode,
                data: response
            };
        }));
    }
};
WrapResponseInterceptor = __decorate([
    (0, common_1.Injectable)()
], WrapResponseInterceptor);
exports.WrapResponseInterceptor = WrapResponseInterceptor;
//# sourceMappingURL=wrap-response.interceptor.js.map