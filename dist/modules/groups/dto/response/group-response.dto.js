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
exports.GroupResponseDto = void 0;
const class_transformer_1 = require("class-transformer");
const user_response_dto_1 = require("../../../users/dto/response/user-response.dto");
class GroupResponseDto {
}
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, class_transformer_1.Transform)(({ obj, key }) => {
        var _a;
        if (obj._id)
            return obj._id.toString();
        if (obj.id)
            return obj.id.toString();
        return (_a = obj[key]) === null || _a === void 0 ? void 0 : _a.toString();
    }),
    __metadata("design:type", String)
], GroupResponseDto.prototype, "id", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], GroupResponseDto.prototype, "name", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, class_transformer_1.Type)(() => user_response_dto_1.UserResponseDto),
    __metadata("design:type", user_response_dto_1.UserResponseDto)
], GroupResponseDto.prototype, "owner", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, class_transformer_1.Type)(() => user_response_dto_1.UserResponseDto),
    __metadata("design:type", Array)
], GroupResponseDto.prototype, "members", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, class_transformer_1.Transform)(({ value }) => value === null || value === void 0 ? void 0 : value.toString()),
    __metadata("design:type", String)
], GroupResponseDto.prototype, "trip", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Date)
], GroupResponseDto.prototype, "createdAt", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Date)
], GroupResponseDto.prototype, "updatedAt", void 0);
exports.GroupResponseDto = GroupResponseDto;
//# sourceMappingURL=group-response.dto.js.map