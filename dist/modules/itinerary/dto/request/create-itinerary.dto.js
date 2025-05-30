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
exports.CreateItineraryDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const mongoose_1 = require("mongoose");
class CreateActivityDto {
}
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Time of the activity' }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateActivityDto.prototype, "time", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Description of the activity' }),
    __metadata("design:type", String)
], CreateActivityDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Location of the activity' }),
    __metadata("design:type", String)
], CreateActivityDto.prototype, "location", void 0);
class CreateItineraryDto {
}
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Trip ID this itinerary belongs to' }),
    (0, class_validator_1.IsMongoId)(),
    __metadata("design:type", mongoose_1.Types.ObjectId)
], CreateItineraryDto.prototype, "tripId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Day number of the itinerary', minimum: 1 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CreateItineraryDto.prototype, "day", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Date of the itinerary' }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", Date)
], CreateItineraryDto.prototype, "date", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Activities for this day', type: [CreateActivityDto] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => CreateActivityDto),
    __metadata("design:type", Array)
], CreateItineraryDto.prototype, "activities", void 0);
exports.CreateItineraryDto = CreateItineraryDto;
//# sourceMappingURL=create-itinerary.dto.js.map