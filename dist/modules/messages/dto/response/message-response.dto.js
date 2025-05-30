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
exports.MessageResponseDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const constants_1 = require("../../../../constants");
class MessageResponseDto {
}
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Message ID' }),
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
], MessageResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Trip ID this message belongs to' }),
    (0, class_transformer_1.Expose)(),
    (0, class_transformer_1.Transform)(({ obj, key }) => {
        var _a;
        if (obj.tripId) {
            return obj.tripId.toString();
        }
        return (_a = obj[key]) === null || _a === void 0 ? void 0 : _a.toString();
    }),
    __metadata("design:type", String)
], MessageResponseDto.prototype, "tripId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Sender ID' }),
    (0, class_transformer_1.Expose)(),
    (0, class_transformer_1.Transform)(({ obj, key }) => {
        var _a;
        if (obj.senderId) {
            return obj.senderId.toString();
        }
        return (_a = obj[key]) === null || _a === void 0 ? void 0 : _a.toString();
    }),
    __metadata("design:type", String)
], MessageResponseDto.prototype, "senderId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Content of the message' }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], MessageResponseDto.prototype, "content", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Timestamp of the message' }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Date)
], MessageResponseDto.prototype, "timestamp", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Type of message', enum: constants_1.MessageType }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], MessageResponseDto.prototype, "messageType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Whether the message is flagged' }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Boolean)
], MessageResponseDto.prototype, "isFlagged", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Formatted timestamp' }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], MessageResponseDto.prototype, "formattedTimestamp", void 0);
exports.MessageResponseDto = MessageResponseDto;
//# sourceMappingURL=message-response.dto.js.map