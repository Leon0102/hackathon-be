import type { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import type { Observable } from 'rxjs';
import { map } from 'rxjs';

import { PageDto } from '../common/dto';
import { ResponseDto } from '../common/dto/response.dto';

@Injectable()
export class WrapResponseInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
        const http = context.switchToHttp();
        const req = http.getRequest();
        const ctx = http.getResponse();
        const statusCode: number = ctx.statusCode;
        // Bypass wrapping for Swagger and static assets
        const url: string = req.originalUrl || req.url;
        if (url.startsWith('/docs') || url.match(/\.(css|js|png|svg|ico)$/)) {
            return next.handle();
        }

        return next.handle().pipe(
            map((response) => {
                if (response instanceof ResponseDto) {
                    return {
                        statusCode,
                        messageCode: response.messageCode
                    };
                }

                if (response instanceof PageDto) {
                    return {
                        statusCode,
                        data: response.data,
                        meta: response.meta
                    };
                }

                // if (response instanceof BrandManifestDto) {
                //     return response;
                // }

                return {
                    statusCode,
                    data: response
                };
            })
        );
    }
}
