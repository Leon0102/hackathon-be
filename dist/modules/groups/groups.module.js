"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GroupsModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const trips_schema_1 = require("../trips/schema/trips.schema");
const users_schema_1 = require("../users/schema/users.schema");
const groups_controller_1 = require("./groups.controller");
const groups_service_1 = require("./groups.service");
const group_schema_1 = require("./schema/group.schema");
let GroupsModule = class GroupsModule {
};
GroupsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: group_schema_1.Group.name, schema: group_schema_1.GroupSchema },
                { name: trips_schema_1.Trips.name, schema: trips_schema_1.TripsSchema },
                { name: users_schema_1.Users.name, schema: users_schema_1.UsersSchema }
            ])
        ],
        providers: [groups_service_1.GroupsService],
        controllers: [groups_controller_1.GroupsController],
        exports: [groups_service_1.GroupsService]
    })
], GroupsModule);
exports.GroupsModule = GroupsModule;
//# sourceMappingURL=groups.module.js.map