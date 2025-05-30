"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PhoneNumberSerializer = exports.S3UrlParser = exports.ToUpperCase = exports.ToLowerCase = exports.ToArray = exports.ToInt = exports.ToBoolean = exports.Trim = void 0;
const class_transformer_1 = require("class-transformer");
const libphonenumber_js_1 = require("libphonenumber-js");
const lodash_1 = require("lodash");
const providers_1 = require("../providers");
function Trim() {
    return (0, class_transformer_1.Transform)((params) => {
        const value = params.value;
        if ((0, lodash_1.isArray)(value)) {
            return (0, lodash_1.map)(value, (v) => (0, lodash_1.trim)(v).replace(/\s\s+/g, ' '));
        }
        return (0, lodash_1.trim)(value).replace(/\s\s+/g, ' ');
    });
}
exports.Trim = Trim;
function ToBoolean() {
    return (0, class_transformer_1.Transform)((params) => {
        switch (params.obj[params.key]) {
            case 'true': {
                return true;
            }
            case 'false': {
                return false;
            }
            default: {
                return params.value;
            }
        }
    }, { toClassOnly: true });
}
exports.ToBoolean = ToBoolean;
function ToInt() {
    return (0, class_transformer_1.Transform)((params) => {
        const value = params.value;
        return Number.parseInt(value, 10);
    }, { toClassOnly: true });
}
exports.ToInt = ToInt;
function ToArray() {
    return (0, class_transformer_1.Transform)((params) => {
        const value = params.value;
        if ((0, lodash_1.isNil)(value)) {
            return [];
        }
        return (0, lodash_1.castArray)(value);
    }, { toClassOnly: true });
}
exports.ToArray = ToArray;
function ToLowerCase() {
    return (0, class_transformer_1.Transform)((params) => {
        const value = params.value;
        if (!value) {
            return;
        }
        if (!Array.isArray(value)) {
            return value.toLowerCase();
        }
        return value.map((v) => v.toLowerCase());
    }, {
        toClassOnly: true
    });
}
exports.ToLowerCase = ToLowerCase;
function ToUpperCase() {
    return (0, class_transformer_1.Transform)((params) => {
        const value = params.value;
        if (!value) {
            return;
        }
        if (!Array.isArray(value)) {
            return value.toUpperCase();
        }
        return value.map((v) => v.toUpperCase());
    }, {
        toClassOnly: true
    });
}
exports.ToUpperCase = ToUpperCase;
function S3UrlParser() {
    return (0, class_transformer_1.Transform)((params) => {
        const key = params.value;
        switch (params.type) {
            case class_transformer_1.TransformationType.CLASS_TO_PLAIN: {
                return providers_1.GeneratorProvider.getS3PublicUrl(key);
            }
            case class_transformer_1.TransformationType.PLAIN_TO_CLASS: {
                return providers_1.GeneratorProvider.getS3Key(key);
            }
            default: {
                return key;
            }
        }
    });
}
exports.S3UrlParser = S3UrlParser;
function PhoneNumberSerializer() {
    return (0, class_transformer_1.Transform)((params) => (0, libphonenumber_js_1.parsePhoneNumber)(params.value).number);
}
exports.PhoneNumberSerializer = PhoneNumberSerializer;
//# sourceMappingURL=transform.decorators.js.map