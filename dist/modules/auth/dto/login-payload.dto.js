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
exports.LoginPayloadDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const schema_1 = require("../../users/schema");
const _1 = require(".");
class LoginPayloadDto {
    constructor(user, token) {
        this.user = user;
        this.token = token;
    }
}
__decorate([
    (0, swagger_1.ApiProperty)({ type: () => schema_1.Users }),
    __metadata("design:type", schema_1.Users)
], LoginPayloadDto.prototype, "user", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: () => _1.TokenPayloadDto }),
    __metadata("design:type", _1.TokenPayloadDto)
], LoginPayloadDto.prototype, "token", void 0);
exports.LoginPayloadDto = LoginPayloadDto;
//# sourceMappingURL=login-payload.dto.js.map