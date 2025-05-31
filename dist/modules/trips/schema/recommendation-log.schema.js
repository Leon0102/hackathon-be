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
exports.RecommendationLogSchema = exports.RecommendationLog = exports.UserInteractionSchema = exports.UserInteraction = exports.RecommendationContextSchema = exports.RecommendationContext = exports.RecommendationOutcome = exports.RecommendationType = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
var RecommendationType;
(function (RecommendationType) {
    RecommendationType["TRIP_MEMBERS"] = "trip_members";
    RecommendationType["GROUPS"] = "groups";
    RecommendationType["DESTINATIONS"] = "destinations";
    RecommendationType["SIMILAR_USERS"] = "similar_users";
})(RecommendationType = exports.RecommendationType || (exports.RecommendationType = {}));
var RecommendationOutcome;
(function (RecommendationOutcome) {
    RecommendationOutcome["VIEWED"] = "viewed";
    RecommendationOutcome["CLICKED"] = "clicked";
    RecommendationOutcome["JOINED"] = "joined";
    RecommendationOutcome["IGNORED"] = "ignored";
    RecommendationOutcome["REJECTED"] = "rejected";
})(RecommendationOutcome = exports.RecommendationOutcome || (exports.RecommendationOutcome = {}));
let RecommendationContext = class RecommendationContext {
};
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: true }),
    __metadata("design:type", String)
], RecommendationContext.prototype, "source", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object, default: {} }),
    __metadata("design:type", Object)
], RecommendationContext.prototype, "filters", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, default: 0 }),
    __metadata("design:type", Number)
], RecommendationContext.prototype, "pageNumber", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, default: 0 }),
    __metadata("design:type", Number)
], RecommendationContext.prototype, "positionInResults", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], RecommendationContext.prototype, "userAgent", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], RecommendationContext.prototype, "sessionId", void 0);
RecommendationContext = __decorate([
    (0, mongoose_1.Schema)({ _id: false })
], RecommendationContext);
exports.RecommendationContext = RecommendationContext;
exports.RecommendationContextSchema = mongoose_1.SchemaFactory.createForClass(RecommendationContext);
let UserInteraction = class UserInteraction {
};
__decorate([
    (0, mongoose_1.Prop)({ type: String, enum: Object.values(RecommendationOutcome), required: true }),
    __metadata("design:type", String)
], UserInteraction.prototype, "outcome", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date, default: Date.now }),
    __metadata("design:type", Date)
], UserInteraction.prototype, "timestamp", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, default: 0 }),
    __metadata("design:type", Number)
], UserInteraction.prototype, "timeSpentViewing", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object, default: {} }),
    __metadata("design:type", Object)
], UserInteraction.prototype, "metadata", void 0);
UserInteraction = __decorate([
    (0, mongoose_1.Schema)({ _id: false })
], UserInteraction);
exports.UserInteraction = UserInteraction;
exports.UserInteractionSchema = mongoose_1.SchemaFactory.createForClass(UserInteraction);
let RecommendationLog = class RecommendationLog extends mongoose_2.Document {
};
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Users', required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], RecommendationLog.prototype, "user", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Trips' }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], RecommendationLog.prototype, "trip", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Users' }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], RecommendationLog.prototype, "recommendedUser", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Group' }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], RecommendationLog.prototype, "recommendedGroup", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: true }),
    __metadata("design:type", String)
], RecommendationLog.prototype, "keyword", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, enum: Object.values(RecommendationType), required: true }),
    __metadata("design:type", String)
], RecommendationLog.prototype, "recommendationType", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: exports.RecommendationContextSchema, required: true }),
    __metadata("design:type", RecommendationContext)
], RecommendationLog.prototype, "context", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [exports.UserInteractionSchema], default: [] }),
    __metadata("design:type", Array)
], RecommendationLog.prototype, "interactions", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, default: 0, min: 0, max: 1 }),
    __metadata("design:type", Number)
], RecommendationLog.prototype, "relevanceScore", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, default: 0, min: 0, max: 1 }),
    __metadata("design:type", Number)
], RecommendationLog.prototype, "clickThroughRate", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, default: 0, min: 0, max: 1 }),
    __metadata("design:type", Number)
], RecommendationLog.prototype, "conversionRate", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], RecommendationLog.prototype, "tags", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object, default: {} }),
    __metadata("design:type", Object)
], RecommendationLog.prototype, "aiMetadata", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Boolean, default: true }),
    __metadata("design:type", Boolean)
], RecommendationLog.prototype, "isActive", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date }),
    __metadata("design:type", Date)
], RecommendationLog.prototype, "expiresAt", void 0);
RecommendationLog = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], RecommendationLog);
exports.RecommendationLog = RecommendationLog;
exports.RecommendationLogSchema = mongoose_1.SchemaFactory.createForClass(RecommendationLog);
exports.RecommendationLogSchema.index({ user: 1, recommendationType: 1 });
exports.RecommendationLogSchema.index({ user: 1, keyword: 1 });
exports.RecommendationLogSchema.index({ trip: 1 });
exports.RecommendationLogSchema.index({ recommendedUser: 1 });
exports.RecommendationLogSchema.index({ recommendedGroup: 1 });
exports.RecommendationLogSchema.index({ createdAt: -1 });
exports.RecommendationLogSchema.index({ relevanceScore: -1 });
exports.RecommendationLogSchema.index({ clickThroughRate: -1 });
exports.RecommendationLogSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
exports.RecommendationLogSchema.index({ 'context.source': 1 });
exports.RecommendationLogSchema.index({ tags: 1 });
exports.RecommendationLogSchema.index({ user: 1, recommendationType: 1, createdAt: -1 });
exports.RecommendationLogSchema.index({ keyword: 1, recommendationType: 1, relevanceScore: -1 });
exports.RecommendationLogSchema.index({ keyword: 'text', tags: 'text' });
exports.RecommendationLogSchema.virtual('successRate').get(function () {
    const successfulInteractions = this.interactions.filter(i => [RecommendationOutcome.JOINED, RecommendationOutcome.CLICKED].includes(i.outcome)).length;
    return this.interactions.length > 0 ? successfulInteractions / this.interactions.length : 0;
});
exports.RecommendationLogSchema.virtual('latestInteraction').get(function () {
    return this.interactions.length > 0
        ? this.interactions[this.interactions.length - 1]
        : null;
});
exports.RecommendationLogSchema.pre('save', function (next) {
    const totalInteractions = this.interactions.length;
    if (totalInteractions > 0) {
        const clicks = this.interactions.filter(i => [RecommendationOutcome.CLICKED, RecommendationOutcome.JOINED].includes(i.outcome)).length;
        const conversions = this.interactions.filter(i => i.outcome === RecommendationOutcome.JOINED).length;
        this.clickThroughRate = clicks / totalInteractions;
        this.conversionRate = conversions / totalInteractions;
    }
    if (this.isNew && !this.expiresAt) {
        this.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    }
    next();
});
//# sourceMappingURL=recommendation-log.schema.js.map