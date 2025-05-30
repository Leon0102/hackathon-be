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
exports.MatchResponseDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const constants_1 = require("../../../../constants");
class MatchResponseDto {
}
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Match ID' }),
    (0, class_transformer_1.Expose)(),
    (0, class_transformer_1.Transform)(({ obj }) => { var _a; return (_a = obj._id) === null || _a === void 0 ? void 0 : _a.toString(); }),
    __metadata("design:type", String)
], MatchResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'User A ID' }),
    (0, class_transformer_1.Expose)(),
    (0, class_transformer_1.Transform)(({ obj }) => { var _a; return (_a = obj.userA) === null || _a === void 0 ? void 0 : _a.toString(); }),
    __metadata("design:type", String)
], MatchResponseDto.prototype, "userA", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'User B ID' }),
    (0, class_transformer_1.Expose)(),
    (0, class_transformer_1.Transform)(({ obj }) => { var _a; return (_a = obj.userB) === null || _a === void 0 ? void 0 : _a.toString(); }),
    __metadata("design:type", String)
], MatchResponseDto.prototype, "userB", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Match score' }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Number)
], MatchResponseDto.prototype, "matchScore", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Match status', enum: constants_1.MatchStatus }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], MatchResponseDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'User who initiated the match' }),
    (0, class_transformer_1.Expose)(),
    (0, class_transformer_1.Transform)(({ obj }) => { var _a; return (_a = obj.initiatedBy) === null || _a === void 0 ? void 0 : _a.toString(); }),
    __metadata("design:type", String)
], MatchResponseDto.prototype, "initiatedBy", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'When the match was created' }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Date)
], MatchResponseDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Whether this is a mutual match' }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Boolean)
], MatchResponseDto.prototype, "isMutualMatch", void 0);
exports.MatchResponseDto = MatchResponseDto;
//# sourceMappingURL=match-response.dto.js.map