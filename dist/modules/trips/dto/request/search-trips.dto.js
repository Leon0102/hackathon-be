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
exports.SearchTripsDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const constants_1 = require("../../../../constants");
class SearchTripsDto {
    constructor() {
        this.page = 1;
        this.limit = 10;
    }
}
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Destination to search for' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], SearchTripsDto.prototype, "destination", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Start date for trip search' }),
    (0, class_transformer_1.Type)(() => Date),
    (0, class_validator_1.IsDate)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Date)
], SearchTripsDto.prototype, "startDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'End date for trip search' }),
    (0, class_transformer_1.Type)(() => Date),
    (0, class_validator_1.IsDate)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Date)
], SearchTripsDto.prototype, "endDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Preferred age range',
        enum: constants_1.AgeRange
    }),
    (0, class_validator_1.IsEnum)(constants_1.AgeRange),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], SearchTripsDto.prototype, "preferredAgeRange", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Travel purposes',
        enum: constants_1.TravelPurpose,
        isArray: true
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsEnum)(constants_1.TravelPurpose, { each: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], SearchTripsDto.prototype, "travelPurposes", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Travel interests',
        enum: constants_1.TravelInterest,
        isArray: true
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsEnum)(constants_1.TravelInterest, { each: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], SearchTripsDto.prototype, "interests", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Page number for pagination', minimum: 1 }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], SearchTripsDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Number of items per page', minimum: 1, maximum: 50 }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], SearchTripsDto.prototype, "limit", void 0);
exports.SearchTripsDto = SearchTripsDto;
//# sourceMappingURL=search-trips.dto.js.map