"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
require("./boilerplate.polyfill");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const mongoose_1 = require("@nestjs/mongoose");
const schedule_1 = require("@nestjs/schedule");
const mailer_1 = require("@nestjs-modules/mailer");
const auth_module_1 = require("./modules/auth/auth.module");
const trips_module_1 = require("./modules/trips/trips.module");
const users_module_1 = require("./modules/users/users.module");
const api_config_service_1 = require("./shared/services/api-config.service");
const shared_module_1 = require("./shared/shared.module");
let AppModule = class AppModule {
};
AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: '.env'
            }),
            mongoose_1.MongooseModule.forRootAsync({
                imports: [shared_module_1.SharedModule],
                useFactory: (configService) => configService.getMongooseOptions(),
                inject: [api_config_service_1.ApiConfigService]
            }),
            mailer_1.MailerModule.forRootAsync({
                imports: [config_1.ConfigModule],
                useFactory: async (configService) => ({
                    transport: {
                        host: configService.get('MAIL_HOST'),
                        port: configService.get('MAIL_PORT'),
                        secure: configService.get('MAIL_SECURE'),
                        auth: {
                            user: configService.get('MAIL_USER'),
                            pass: configService.get('MAIL_PASS')
                        }
                    }
                }),
                inject: [config_1.ConfigService]
            }),
            users_module_1.UsersModule,
            auth_module_1.AuthModule,
            trips_module_1.TripsModule,
            schedule_1.ScheduleModule.forRoot()
        ],
        providers: []
    })
], AppModule);
exports.AppModule = AppModule;
//# sourceMappingURL=app.module.js.map