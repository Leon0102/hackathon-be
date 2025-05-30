"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ItineraryModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const itinerary_controller_1 = require("./itinerary.controller");
const itinerary_service_1 = require("./itinerary.service");
const itinerary_schema_1 = require("./schema/itinerary.schema");
let ItineraryModule = class ItineraryModule {
};
ItineraryModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: itinerary_schema_1.Itinerary.name, schema: itinerary_schema_1.ItinerarySchema }
            ])
        ],
        controllers: [itinerary_controller_1.ItineraryController],
        providers: [itinerary_service_1.ItineraryService],
        exports: [itinerary_service_1.ItineraryService]
    })
], ItineraryModule);
exports.ItineraryModule = ItineraryModule;
//# sourceMappingURL=itinerary.module.js.map