import type { ArgumentsHost, ExceptionFilter } from '@nestjs/common';
import { Catch, HttpStatus } from '@nestjs/common';
import type { Response } from 'express';
import { STATUS_CODES } from 'http';
import { QueryFailedError } from 'typeorm';

import { ErrorCode } from '../constants';

@Catch(QueryFailedError)
export class QueryFailedFilter implements ExceptionFilter<QueryFailedError> {
    catch(exception: QueryFailedError, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();

        const status =
            exception.driverError?.routine === 'string_to_uuid'
                ? HttpStatus.BAD_REQUEST
                : HttpStatus.INTERNAL_SERVER_ERROR;

        response.status(status).json({
            statusCode: status,
            messageCode:
                exception.driverError?.routine === 'string_to_uuid'
                    ? ErrorCode.UUID_INVALID
                    : ErrorCode.INTERNAL_SERVER_ERROR,
            error: STATUS_CODES[status],
            timestamp: new Date().toISOString()
        });
    }
}
