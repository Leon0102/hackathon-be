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
exports.UsersSchema = exports.Users = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const utils_1 = require("../../../common/utils");
const constants_1 = require("../../../constants");
let Users = class Users {
};
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: true, trim: true }),
    __metadata("design:type", String)
], Users.prototype, "fullName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: true, unique: true, lowercase: true, trim: true }),
    __metadata("design:type", String)
], Users.prototype, "email", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: String,
        required() {
            return this.authProvider === constants_1.AuthProvider.LOCAL;
        }
    }),
    __metadata("design:type", String)
], Users.prototype, "passwordHash", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, enum: constants_1.AuthProvider, default: constants_1.AuthProvider.LOCAL, required: true }),
    __metadata("design:type", String)
], Users.prototype, "authProvider", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, default: null }),
    __metadata("design:type", String)
], Users.prototype, "profilePictureUrl", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, min: 18, max: 120 }),
    __metadata("design:type", Number)
], Users.prototype, "age", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, enum: constants_1.Gender }),
    __metadata("design:type", String)
], Users.prototype, "gender", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, maxlength: 500 }),
    __metadata("design:type", String)
], Users.prototype, "bio", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], Users.prototype, "languages", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, enum: constants_1.TravelStyle }),
    __metadata("design:type", String)
], Users.prototype, "travelStyle", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, min: 0 }),
    __metadata("design:type", Number)
], Users.prototype, "budget", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], Users.prototype, "preferredDestinations", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, default: 0, min: 0, max: 100 }),
    __metadata("design:type", Number)
], Users.prototype, "trustScore", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Boolean, default: false }),
    __metadata("design:type", Boolean)
], Users.prototype, "isVerified", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, enum: constants_1.UserRole, default: constants_1.UserRole.USER }),
    __metadata("design:type", String)
], Users.prototype, "role", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], Users.prototype, "tags", void 0);
Users = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Users);
exports.Users = Users;
exports.UsersSchema = mongoose_1.SchemaFactory.createForClass(Users);
exports.UsersSchema.index({ email: 1 });
exports.UsersSchema.index({ authProvider: 1 });
exports.UsersSchema.index({ trustScore: -1 });
exports.UsersSchema.index({ isVerified: 1 });
exports.UsersSchema.virtual('profileCompletion').get(function () {
    const fields = [
        'fullName',
        'email',
        'age',
        'gender',
        'bio',
        'languages',
        'travelStyle',
        'preferredDestinations'
    ];
    const completedFields = fields.filter((field) => {
        const value = this[field];
        return (value !== null &&
            value !== undefined &&
            value !== '' &&
            (Array.isArray(value) ? value.length > 0 : true));
    });
    return Math.round((completedFields.length / fields.length) * 100);
});
exports.UsersSchema.pre('save', function (next) {
    if (this.authProvider === constants_1.AuthProvider.LOCAL && this.passwordHash && this.isModified('passwordHash')) {
        this.passwordHash = (0, utils_1.generateHash)(this.passwordHash);
    }
    next();
});
//# sourceMappingURL=users.schema.js.map