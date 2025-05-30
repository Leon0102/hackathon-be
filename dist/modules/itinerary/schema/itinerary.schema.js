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
exports.ItinerarySchema = exports.Itinerary = exports.ActivitySchema = exports.Activity = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let Activity = class Activity {
};
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: true }),
    __metadata("design:type", String)
], Activity.prototype, "time", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: true }),
    __metadata("design:type", String)
], Activity.prototype, "description", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: true }),
    __metadata("design:type", String)
], Activity.prototype, "location", void 0);
Activity = __decorate([
    (0, mongoose_1.Schema)({ _id: false })
], Activity);
exports.Activity = Activity;
exports.ActivitySchema = mongoose_1.SchemaFactory.createForClass(Activity);
let Itinerary = class Itinerary extends mongoose_2.Document {
};
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Trips', required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Itinerary.prototype, "tripId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, required: true, min: 1 }),
    __metadata("design:type", Number)
], Itinerary.prototype, "day", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date, required: true }),
    __metadata("design:type", Date)
], Itinerary.prototype, "date", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [exports.ActivitySchema], default: [] }),
    __metadata("design:type", Array)
], Itinerary.prototype, "activities", void 0);
Itinerary = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Itinerary);
exports.Itinerary = Itinerary;
exports.ItinerarySchema = mongoose_1.SchemaFactory.createForClass(Itinerary);
exports.ItinerarySchema.index({ tripId: 1 });
exports.ItinerarySchema.index({ tripId: 1, day: 1 });
exports.ItinerarySchema.index({ date: 1 });
exports.ItinerarySchema.virtual('formattedDate').get(function () {
    return this.date.toISOString().split('T')[0];
});
exports.ItinerarySchema.pre('save', function (next) {
    if (this.day <= 0) {
        return next(new Error('Day must be a positive number'));
    }
    if (this.date < new Date()) {
        return next(new Error('Date cannot be in the past'));
    }
    next();
});
//# sourceMappingURL=itinerary.schema.js.map