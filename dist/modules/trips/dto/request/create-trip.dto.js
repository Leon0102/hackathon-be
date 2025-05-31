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
exports.CreateTripDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const decorators_1 = require("../../../../decorators");
const constants_1 = require("../../../../constants");
class CreateTripDto {
    constructor() {
        this.status = constants_1.TripStatus.OPEN;
        this.preferredAgeRange = constants_1.AgeRange.NO_PREFERENCE;
        this.travelPurposes = [];
        this.interests = [];
    }
}
__decorate([
    (0, decorators_1.StringField)(),
    __metadata("design:type", String)
], CreateTripDto.prototype, "destination", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => Date),
    (0, class_validator_1.IsDate)(),
    (0, class_validator_1.MinDate)(new Date(), { message: 'Start date must be in the future' }),
    __metadata("design:type", Date)
], CreateTripDto.prototype, "startDate", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => Date),
    (0, class_validator_1.IsDate)(),
    __metadata("design:type", Date)
], CreateTripDto.prototype, "endDate", void 0);
__decorate([
    (0, decorators_1.NumberField)(),
    (0, class_validator_1.Min)(1, { message: 'Maximum participants must be at least 1' }),
    __metadata("design:type", Number)
], CreateTripDto.prototype, "maxParticipants", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(constants_1.TripStatus),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateTripDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(constants_1.AgeRange),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateTripDto.prototype, "preferredAgeRange", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsEnum)(constants_1.TravelPurpose, { each: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CreateTripDto.prototype, "travelPurposes", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsEnum)(constants_1.TravelInterest, { each: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CreateTripDto.prototype, "interests", void 0);
exports.CreateTripDto = CreateTripDto;
//# sourceMappingURL=create-trip.dto.js.map