"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisConfigModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const ioredis_1 = require("@nestjs-modules/ioredis");
let RedisConfigModule = class RedisConfigModule {
};
RedisConfigModule = __decorate([
    (0, common_1.Module)({
        imports: [
            ioredis_1.RedisModule.forRootAsync({
                imports: [config_1.ConfigModule],
                useFactory: async (configService) => ({
                    type: 'single',
                    url: configService.get('REDIS_URL') || 'redis://localhost:6379',
                    options: {
                        connectTimeout: 10000,
                        commandTimeout: 5000,
                        retryDelayOnFailover: 100,
                        maxRetriesPerRequest: 3,
                        lazyConnect: true,
                        keepAlive: 30000,
                        enableOfflineQueue: false,
                        onConnect: () => {
                            console.log('✅ Redis connected successfully');
                        },
                        onError: (error) => {
                            console.error('❌ Redis connection error:', error.message);
                        },
                        onReconnecting: () => {
                            console.log('🔄 Redis reconnecting...');
                        },
                    },
                }),
                inject: [config_1.ConfigService],
            }),
        ],
        exports: [ioredis_1.RedisModule],
    })
], RedisConfigModule);
exports.RedisConfigModule = RedisConfigModule;
//# sourceMappingURL=redis.module.js.map