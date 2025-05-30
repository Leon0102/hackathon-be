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
exports.UpdateUserDto = void 0;
const class_validator_1 = require("class-validator");
const decorators_1 = require("../../../../decorators");
const constants_1 = require("../../../../constants");
class UpdateUserDto {
}
__decorate([
    (0, decorators_1.StringField)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateUserDto.prototype, "fullName", void 0);
__decorate([
    (0, decorators_1.StringField)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateUserDto.prototype, "email", void 0);
__decorate([
    (0, decorators_1.StringField)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateUserDto.prototype, "passwordHash", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(constants_1.AuthProvider),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateUserDto.prototype, "authProvider", void 0);
__decorate([
    (0, decorators_1.StringField)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateUserDto.prototype, "profilePictureUrl", void 0);
__decorate([
    (0, decorators_1.NumberField)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Min)(18),
    (0, class_validator_1.Max)(120),
    __metadata("design:type", Number)
], UpdateUserDto.prototype, "age", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(constants_1.Gender),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateUserDto.prototype, "gender", void 0);
__decorate([
    (0, decorators_1.StringField)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MaxLength)(500),
    __metadata("design:type", String)
], UpdateUserDto.prototype, "bio", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], UpdateUserDto.prototype, "languages", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(constants_1.TravelStyle),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateUserDto.prototype, "travelStyle", void 0);
__decorate([
    (0, decorators_1.NumberField)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], UpdateUserDto.prototype, "budget", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], UpdateUserDto.prototype, "preferredDestinations", void 0);
__decorate([
    (0, decorators_1.NumberField)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], UpdateUserDto.prototype, "trustScore", void 0);
__decorate([
    (0, decorators_1.BooleanField)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], UpdateUserDto.prototype, "isVerified", void 0);
exports.UpdateUserDto = UpdateUserDto;
//# sourceMappingURL=update-user.dto.js.map