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
exports.ReportSchema = exports.Report = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let Report = class Report extends mongoose_2.Document {
};
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Users', required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Report.prototype, "reporterId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Users', required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Report.prototype, "reportedUserId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Message', required: false }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Report.prototype, "messageId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Trips', required: false }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Report.prototype, "tripId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: true, maxlength: 500 }),
    __metadata("design:type", String)
], Report.prototype, "reason", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Boolean, default: false }),
    __metadata("design:type", Boolean)
], Report.prototype, "isReviewed", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date, default: Date.now, required: true }),
    __metadata("design:type", Date)
], Report.prototype, "createdAt", void 0);
Report = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Report);
exports.Report = Report;
exports.ReportSchema = mongoose_1.SchemaFactory.createForClass(Report);
exports.ReportSchema.index({ reporterId: 1 });
exports.ReportSchema.index({ reportedUserId: 1 });
exports.ReportSchema.index({ messageId: 1 });
exports.ReportSchema.index({ tripId: 1 });
exports.ReportSchema.index({ isReviewed: 1 });
exports.ReportSchema.index({ createdAt: -1 });
exports.ReportSchema.index({ reporterId: 1, reportedUserId: 1, messageId: 1 }, {
    unique: true,
    partialFilterExpression: { messageId: { $exists: true } }
});
exports.ReportSchema.virtual('reportType').get(function () {
    if (this.messageId)
        return 'message';
    if (this.tripId)
        return 'trip';
    return 'user';
});
exports.ReportSchema.virtual('isPendingReview').get(function () {
    return !this.isReviewed;
});
exports.ReportSchema.pre('save', function (next) {
    if (this.reporterId.toString() === this.reportedUserId.toString()) {
        return next(new Error('Users cannot report themselves'));
    }
    if (this.reason.trim().length === 0) {
        return next(new Error('Reason cannot be empty'));
    }
    if (this.reason.length > 500) {
        return next(new Error('Reason cannot exceed 500 characters'));
    }
    if (this.messageId && !this.tripId) {
        return next(new Error('Trip ID is required when reporting a message'));
    }
    next();
});
//# sourceMappingURL=report.schema.js.map