"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiEnumPropertyOptional = exports.ApiEnumProperty = exports.ApiUUIDPropertyOptional = exports.ApiUUIDProperty = exports.ApiBooleanPropertyOptional = exports.ApiBooleanProperty = void 0;
const swagger_1 = require("@nestjs/swagger");
const utils_1 = require("../common/utils");
function ApiBooleanProperty(options = {}) {
    return (0, swagger_1.ApiProperty)(Object.assign({ type: Boolean }, options));
}
exports.ApiBooleanProperty = ApiBooleanProperty;
function ApiBooleanPropertyOptional(options = {}) {
    return ApiBooleanProperty(Object.assign({ required: false }, options));
}
exports.ApiBooleanPropertyOptional = ApiBooleanPropertyOptional;
function ApiUUIDProperty(options = {}) {
    return (0, swagger_1.ApiProperty)(Object.assign({ type: options.each ? [String] : String, format: 'uuid', isArray: options.each }, options));
}
exports.ApiUUIDProperty = ApiUUIDProperty;
function ApiUUIDPropertyOptional(options = {}) {
    return ApiUUIDProperty(Object.assign({ required: false }, options));
}
exports.ApiUUIDPropertyOptional = ApiUUIDPropertyOptional;
function ApiEnumProperty(getEnum, options = {}) {
    const enumValue = getEnum();
    return (0, swagger_1.ApiProperty)(Object.assign({ type: 'enum', enum: enumValue, enumName: (0, utils_1.getVariableName)(getEnum) }, options));
}
exports.ApiEnumProperty = ApiEnumProperty;
function ApiEnumPropertyOptional(getEnum, options = {}) {
    return ApiEnumProperty(getEnum, Object.assign({ required: false }, options));
}
exports.ApiEnumPropertyOptional = ApiEnumPropertyOptional;
//# sourceMappingURL=property.decorators.js.map