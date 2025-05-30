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
exports.RecommendationLogSchema = exports.RecommendationLog = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let RecommendationLog = class RecommendationLog extends mongoose_2.Document {
};
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Users', required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], RecommendationLog.prototype, "user", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Trips', required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], RecommendationLog.prototype, "trip", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: true }),
    __metadata("design:type", String)
], RecommendationLog.prototype, "keyword", void 0);
RecommendationLog = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], RecommendationLog);
exports.RecommendationLog = RecommendationLog;
exports.RecommendationLogSchema = mongoose_1.SchemaFactory.createForClass(RecommendationLog);
//# sourceMappingURL=recommendation-log.schema.js.map