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
exports.AbstractDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class AbstractDto {
    constructor(schema, options) {
        if (!(options === null || options === void 0 ? void 0 : options.excludeFields)) {
            this.id = schema._id;
            this.createdAt = schema.createdAt;
            this.updatedAt = schema.updatedAt;
        }
    }
}
__decorate([
    (0, swagger_1.ApiProperty)({ example: '000000x0-00x0-0000-000x-xx0xx00x000x' }),
    __metadata("design:type", String)
], AbstractDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], AbstractDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], AbstractDto.prototype, "updatedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], AbstractDto.prototype, "deletedAt", void 0);
exports.AbstractDto = AbstractDto;
//# sourceMappingURL=abstract.dto.js.map