import { RequestMethod, ValidationPipe } from '@nestjs/common';
import * as fs from 'fs';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { ExpressAdapter } from '@nestjs/platform-express';
import compression from 'compression';
import { middleware as expressCtx } from 'express-ctx';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import morgan from 'morgan';

import { AppModule } from './app.module';
import { HttpExceptionFilter } from './filters';
import { TimeoutInterceptor, WrapResponseInterceptor } from './interceptors';
import { setupSwagger } from './setup-swagger';
import { ApiConfigService } from './shared/services/api-config.service';
import { SharedModule } from './shared/shared.module';

export async function bootstrap(): Promise<NestExpressApplication> {
    // Optional HTTPS configuration
    const httpsOptions =
        process.env.SSL_KEY_PATH && process.env.SSL_CERT_PATH
            ? {
                  key: fs.readFileSync(process.env.SSL_KEY_PATH),
                  cert: fs.readFileSync(process.env.SSL_CERT_PATH)
              }
            : undefined;
    const app = await NestFactory.create<NestExpressApplication>(
        AppModule,
        new ExpressAdapter(),
        { cors: true, ...(httpsOptions ? { httpsOptions } : {}) }
    );

    app.setGlobalPrefix('/api', { exclude: [{ path: '/manifest/:startUrl', method: RequestMethod.GET }] });
    app.use(helmet());
    app.use(
        rateLimit({
            windowMs: 15 * 60 * 1000, // 15 minutes
            max: 10_000 // limit each IP to 100 requests per windowMs
        })
    );
    app.use(compression());
    app.use(morgan('combined'));
    app.enableVersioning();

    app.useGlobalFilters(new HttpExceptionFilter());

    app.useGlobalInterceptors(new WrapResponseInterceptor(), new TimeoutInterceptor());

    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            transform: true,
            forbidNonWhitelisted: true,
            transformOptions: {
                enableImplicitConversion: true
            }
        })
    );

    const configService = app.select(SharedModule).get(ApiConfigService);

    setupSwagger(app);

    app.use(expressCtx);

    app.enableShutdownHooks();

    const port = configService.serverConfig.port;

    await app.listen(port);

    console.info(`🚀 Server running on: http://localhost:${port}/docs`);

    return app;
}

void bootstrap();
