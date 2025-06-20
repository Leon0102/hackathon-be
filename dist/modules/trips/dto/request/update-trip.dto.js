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
exports.UpdateTripDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const decorators_1 = require("../../../../decorators");
const constants_1 = require("../../../../constants");
class UpdateTripDto {
}
__decorate([
    (0, decorators_1.StringField)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateTripDto.prototype, "destination", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => Date),
    (0, class_validator_1.IsDate)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Date)
], UpdateTripDto.prototype, "startDate", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => Date),
    (0, class_validator_1.IsDate)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Date)
], UpdateTripDto.prototype, "endDate", void 0);
__decorate([
    (0, decorators_1.NumberField)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Min)(1, { message: 'Maximum participants must be at least 1' }),
    __metadata("design:type", Number)
], UpdateTripDto.prototype, "maxParticipants", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(constants_1.TripStatus),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateTripDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(constants_1.AgeRange),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateTripDto.prototype, "preferredAgeRange", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsEnum)(constants_1.TravelPurpose, { each: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], UpdateTripDto.prototype, "travelPurposes", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsEnum)(constants_1.TravelInterest, { each: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], UpdateTripDto.prototype, "interests", void 0);
exports.UpdateTripDto = UpdateTripDto;
//# sourceMappingURL=update-trip.dto.js.map