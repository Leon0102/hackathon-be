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
exports.PageQueryDto = void 0;
const constants_1 = require("../../constants");
const decorators_1 = require("../../decorators");
class PageQueryDto {
    constructor() {
        this.createdAt = constants_1.Order.ASC;
        this.page = 1;
        this.limit = 10;
    }
    get order() {
        return this.createdAt === constants_1.Order.DESC ? -1 : 1;
    }
    get skip() {
        return (this.page - 1) * this.limit;
    }
}
__decorate([
    (0, decorators_1.EnumFieldOptional)(() => constants_1.Order, {
        default: constants_1.Order.ASC
    }),
    __metadata("design:type", String)
], PageQueryDto.prototype, "createdAt", void 0);
__decorate([
    (0, decorators_1.NumberFieldOptional)({
        minimum: 1,
        default: 1,
        int: true
    }),
    __metadata("design:type", Number)
], PageQueryDto.prototype, "page", void 0);
__decorate([
    (0, decorators_1.NumberFieldOptional)({
        minimum: 1,
        maximum: 50,
        default: 10,
        int: true
    }),
    __metadata("design:type", Number)
], PageQueryDto.prototype, "limit", void 0);
__decorate([
    (0, decorators_1.StringFieldOptional)(),
    __metadata("design:type", String)
], PageQueryDto.prototype, "searchKey", void 0);
exports.PageQueryDto = PageQueryDto;
//# sourceMappingURL=page-query.dto.js.map