"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueryFailedFilter = void 0;
const common_1 = require("@nestjs/common");
const http_1 = require("http");
const typeorm_1 = require("typeorm");
const constants_1 = require("../constants");
let QueryFailedFilter = class QueryFailedFilter {
    catch(exception, host) {
        var _a, _b;
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const status = ((_a = exception.driverError) === null || _a === void 0 ? void 0 : _a.routine) === 'string_to_uuid'
            ? common_1.HttpStatus.BAD_REQUEST
            : common_1.HttpStatus.INTERNAL_SERVER_ERROR;
        response.status(status).json({
            statusCode: status,
            messageCode: ((_b = exception.driverError) === null || _b === void 0 ? void 0 : _b.routine) === 'string_to_uuid'
                ? constants_1.ErrorCode.UUID_INVALID
                : constants_1.ErrorCode.INTERNAL_SERVER_ERROR,
            error: http_1.STATUS_CODES[status],
            timestamp: new Date().toISOString()
        });
    }
};
QueryFailedFilter = __decorate([
    (0, common_1.Catch)(typeorm_1.QueryFailedError)
], QueryFailedFilter);
exports.QueryFailedFilter = QueryFailedFilter;
//# sourceMappingURL=query-failed.filter.js.map