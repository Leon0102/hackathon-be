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
exports.ItineraryResponseDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
class ActivityResponseDto {
}
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Time of the activity' }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], ActivityResponseDto.prototype, "time", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Description of the activity' }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], ActivityResponseDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Location of the activity' }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], ActivityResponseDto.prototype, "location", void 0);
class ItineraryResponseDto {
}
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Itinerary ID' }),
    (0, class_transformer_1.Expose)(),
    (0, class_transformer_1.Transform)(({ obj, key }) => {
        var _a;
        if (obj._id) {
            return obj._id.toString();
        }
        if (obj.id) {
            return obj.id.toString();
        }
        return (_a = obj[key]) === null || _a === void 0 ? void 0 : _a.toString();
    }),
    __metadata("design:type", String)
], ItineraryResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Trip ID this itinerary belongs to' }),
    (0, class_transformer_1.Expose)(),
    (0, class_transformer_1.Transform)(({ obj, key }) => {
        var _a;
        if (obj.tripId) {
            return obj.tripId.toString();
        }
        return (_a = obj[key]) === null || _a === void 0 ? void 0 : _a.toString();
    }),
    __metadata("design:type", String)
], ItineraryResponseDto.prototype, "tripId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Day number of the itinerary' }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Number)
], ItineraryResponseDto.prototype, "day", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Date of the itinerary' }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Date)
], ItineraryResponseDto.prototype, "date", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Activities for this day', type: [ActivityResponseDto] }),
    (0, class_transformer_1.Expose)(),
    (0, class_transformer_1.Type)(() => ActivityResponseDto),
    __metadata("design:type", Array)
], ItineraryResponseDto.prototype, "activities", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Formatted date' }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], ItineraryResponseDto.prototype, "formattedDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Created at timestamp' }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Date)
], ItineraryResponseDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Updated at timestamp' }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Date)
], ItineraryResponseDto.prototype, "updatedAt", void 0);
exports.ItineraryResponseDto = ItineraryResponseDto;
//# sourceMappingURL=itinerary-response.dto.js.map