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
exports.ReviewSchema = exports.Review = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let Review = class Review extends mongoose_2.Document {
};
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Users', required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Review.prototype, "reviewerId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Users', required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Review.prototype, "revieweeId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Trips', required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Review.prototype, "tripId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, required: true, min: 1, max: 5 }),
    __metadata("design:type", Number)
], Review.prototype, "rating", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: true, maxlength: 500 }),
    __metadata("design:type", String)
], Review.prototype, "comment", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Boolean, default: false }),
    __metadata("design:type", Boolean)
], Review.prototype, "aiToxicityFlag", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date, default: Date.now, required: true }),
    __metadata("design:type", Date)
], Review.prototype, "createdAt", void 0);
Review = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Review);
exports.Review = Review;
exports.ReviewSchema = mongoose_1.SchemaFactory.createForClass(Review);
exports.ReviewSchema.index({ reviewerId: 1, revieweeId: 1, tripId: 1 }, { unique: true });
exports.ReviewSchema.index({ reviewerId: 1 });
exports.ReviewSchema.index({ revieweeId: 1 });
exports.ReviewSchema.index({ tripId: 1 });
exports.ReviewSchema.index({ rating: 1 });
exports.ReviewSchema.index({ aiToxicityFlag: 1 });
exports.ReviewSchema.index({ createdAt: -1 });
exports.ReviewSchema.virtual('isPositiveReview').get(function () {
    return this.rating >= 4;
});
exports.ReviewSchema.virtual('formattedRating').get(function () {
    return `${this.rating}/5`;
});
exports.ReviewSchema.pre('save', function (next) {
    if (this.reviewerId.toString() === this.revieweeId.toString()) {
        return next(new Error('Users cannot review themselves'));
    }
    if (this.rating < 1 || this.rating > 5) {
        return next(new Error('Rating must be between 1 and 5'));
    }
    if (this.comment.trim().length === 0) {
        return next(new Error('Comment cannot be empty'));
    }
    if (this.comment.length > 500) {
        return next(new Error('Comment cannot exceed 500 characters'));
    }
    next();
});
//# sourceMappingURL=review.schema.js.map