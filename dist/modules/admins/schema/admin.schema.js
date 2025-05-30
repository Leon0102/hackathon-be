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
exports.AdminSchema = exports.Admin = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const constants_1 = require("../../../constants");
let Admin = class Admin extends mongoose_2.Document {
};
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: true, unique: true, lowercase: true }),
    __metadata("design:type", String)
], Admin.prototype, "email", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: true }),
    __metadata("design:type", String)
], Admin.prototype, "passwordHash", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, enum: Object.values(constants_1.AdminRole), default: constants_1.AdminRole.MODERATOR, required: true }),
    __metadata("design:type", String)
], Admin.prototype, "role", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date, default: Date.now, required: true }),
    __metadata("design:type", Date)
], Admin.prototype, "createdAt", void 0);
Admin = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Admin);
exports.Admin = Admin;
exports.AdminSchema = mongoose_1.SchemaFactory.createForClass(Admin);
exports.AdminSchema.index({ email: 1 }, { unique: true });
exports.AdminSchema.index({ role: 1 });
exports.AdminSchema.index({ createdAt: -1 });
exports.AdminSchema.virtual('isAdmin').get(function () {
    return this.role === constants_1.AdminRole.ADMIN;
});
exports.AdminSchema.virtual('isModerator').get(function () {
    return this.role === constants_1.AdminRole.MODERATOR;
});
exports.AdminSchema.pre('save', function (next) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email)) {
        return next(new Error('Invalid email format'));
    }
    if (!this.passwordHash || this.passwordHash.length === 0) {
        return next(new Error('Password hash is required'));
    }
    next();
});
//# sourceMappingURL=admin.schema.js.map