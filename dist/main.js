"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bootstrap = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const platform_express_1 = require("@nestjs/platform-express");
const compression_1 = __importDefault(require("compression"));
const express_ctx_1 = require("express-ctx");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const app_module_1 = require("./app.module");
const filters_1 = require("./filters");
const interceptors_1 = require("./interceptors");
const setup_swagger_1 = require("./setup-swagger");
const api_config_service_1 = require("./shared/services/api-config.service");
const shared_module_1 = require("./shared/shared.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, new platform_express_1.ExpressAdapter(), {
        cors: true
    });
    app.setGlobalPrefix('/api', { exclude: [{ path: '/manifest/:startUrl', method: common_1.RequestMethod.GET }] });
    app.enable('trust proxy');
    app.use((0, helmet_1.default)());
    app.use((0, express_rate_limit_1.default)({
        windowMs: 15 * 60 * 1000,
        max: 10000
    }));
    app.use((0, compression_1.default)());
    app.use((0, morgan_1.default)('combined'));
    app.enableVersioning();
    app.useGlobalFilters(new filters_1.HttpExceptionFilter());
    app.useGlobalInterceptors(new interceptors_1.WrapResponseInterceptor(), new interceptors_1.TimeoutInterceptor());
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
        transformOptions: {
            enableImplicitConversion: true
        }
    }));
    const configService = app.select(shared_module_1.SharedModule).get(api_config_service_1.ApiConfigService);
    if (configService.documentationEnabled) {
        (0, setup_swagger_1.setupSwagger)(app);
    }
    app.use(express_ctx_1.middleware);
    if (!configService.isDevelopment) {
        app.enableShutdownHooks();
    }
    const port = configService.serverConfig.port;
    await app.listen(port);
    console.info(`🚀 Server running on: http://localhost:${port}/docs`);
    return app;
}
exports.bootstrap = bootstrap;
void bootstrap();
//# sourceMappingURL=main.js.map