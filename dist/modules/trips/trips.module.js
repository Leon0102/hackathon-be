"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TripsModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const groups_module_1 = require("../groups/groups.module");
const users_module_1 = require("../users/users.module");
const users_schema_1 = require("../users/schema/users.schema");
const recommendation_log_schema_1 = require("./schema/recommendation-log.schema");
const trips_schema_1 = require("./schema/trips.schema");
const trips_controller_1 = require("./trips.controller");
const trips_service_1 = require("./trips.service");
const recommendation_controller_1 = require("./controllers/recommendation.controller");
const recommendation_service_1 = require("./services/recommendation.service");
const memory_cache_service_1 = require("./services/memory-cache.service");
let TripsModule = class TripsModule {
};
TripsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: trips_schema_1.Trips.name, schema: trips_schema_1.TripsSchema },
                { name: recommendation_log_schema_1.RecommendationLog.name, schema: recommendation_log_schema_1.RecommendationLogSchema },
                { name: users_schema_1.Users.name, schema: users_schema_1.UsersSchema }
            ]),
            groups_module_1.GroupsModule,
            users_module_1.UsersModule
        ],
        controllers: [trips_controller_1.TripsController, recommendation_controller_1.RecommendationController],
        providers: [trips_service_1.TripsService, recommendation_service_1.RecommendationService, memory_cache_service_1.MemoryCacheService],
        exports: [trips_service_1.TripsService, recommendation_service_1.RecommendationService, memory_cache_service_1.MemoryCacheService]
    })
], TripsModule);
exports.TripsModule = TripsModule;
//# sourceMappingURL=trips.module.js.map