"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeoIP = exports.isIpField = exports.isStringField = void 0;
const common_1 = require("@nestjs/common");
const class_validator_1 = require("class-validator");
const net_1 = require("net");
function isStringField(data) {
    const isValid = (0, class_validator_1.isNotEmpty)(data) && (0, class_validator_1.isString)(data);
    if (!isValid) {
        throw new common_1.BadRequestException();
    }
    return data.trim();
}
exports.isStringField = isStringField;
function isIpField(data) {
    const isValid = (0, class_validator_1.isNotEmpty)(data) && (0, class_validator_1.isString)(data) && (0, net_1.isIP)(data);
    if (!isValid) {
        throw new common_1.BadRequestException();
    }
    return data.trim();
}
exports.isIpField = isIpField;
function GeoIP() {
    return (0, common_1.createParamDecorator)((_data, context) => {
        const request = context.switchToHttp().getRequest();
        const geoIp = {
            ipAddress: isIpField(request.headers['ip-address']),
            platform: isStringField(request.headers['platform']),
            city: isStringField(request.headers['city']),
            country: isStringField(request.headers['country']),
            countryCode: isStringField(request.headers['country-code'])
        };
        return geoIp;
    })();
}
exports.GeoIP = GeoIP;
//# sourceMappingURL=geo-ip.decorator.js.map