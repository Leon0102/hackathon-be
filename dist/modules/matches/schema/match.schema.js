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
exports.MatchSchema = exports.Match = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const constants_1 = require("../../../constants");
let Match = class Match extends mongoose_2.Document {
};
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Users', required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Match.prototype, "userA", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Users', required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Match.prototype, "userB", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, required: true, min: 0, max: 100 }),
    __metadata("design:type", Number)
], Match.prototype, "matchScore", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, enum: Object.values(constants_1.MatchStatus), default: constants_1.MatchStatus.PENDING, required: true }),
    __metadata("design:type", String)
], Match.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Users', required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Match.prototype, "initiatedBy", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date, default: Date.now, required: true }),
    __metadata("design:type", Date)
], Match.prototype, "createdAt", void 0);
Match = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Match);
exports.Match = Match;
exports.MatchSchema = mongoose_1.SchemaFactory.createForClass(Match);
exports.MatchSchema.index({ userA: 1, userB: 1 }, { unique: true });
exports.MatchSchema.index({ userA: 1 });
exports.MatchSchema.index({ userB: 1 });
exports.MatchSchema.index({ status: 1 });
exports.MatchSchema.index({ initiatedBy: 1 });
exports.MatchSchema.index({ createdAt: -1 });
exports.MatchSchema.virtual('participants').get(function () {
    return [this.userA, this.userB];
});
exports.MatchSchema.virtual('isMutualMatch').get(function () {
    return this.status === constants_1.MatchStatus.ACCEPTED;
});
exports.MatchSchema.pre('save', function (next) {
    if (this.userA.toString() === this.userB.toString()) {
        return next(new Error('Users cannot match with themselves'));
    }
    const initiatedByStr = this.initiatedBy.toString();
    const userAStr = this.userA.toString();
    const userBStr = this.userB.toString();
    if (initiatedByStr !== userAStr && initiatedByStr !== userBStr) {
        return next(new Error('Match must be initiated by one of the participating users'));
    }
    if (this.matchScore < 0 || this.matchScore > 100) {
        return next(new Error('Match score must be between 0 and 100'));
    }
    next();
});
//# sourceMappingURL=match.schema.js.map