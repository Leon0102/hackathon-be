"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DynamicTranslate = exports.StaticTranslate = exports.DYNAMIC_TRANSLATION_DECORATOR_KEY = exports.STATIC_TRANSLATION_DECORATOR_KEY = void 0;
exports.STATIC_TRANSLATION_DECORATOR_KEY = 'custom:static-translate';
exports.DYNAMIC_TRANSLATION_DECORATOR_KEY = 'custom:dynamic-translate';
function StaticTranslate(data = {}) {
    return (target, key) => {
        Reflect.defineMetadata(exports.STATIC_TRANSLATION_DECORATOR_KEY, data, target, key);
    };
}
exports.StaticTranslate = StaticTranslate;
function DynamicTranslate() {
    return (target, key) => {
        Reflect.defineMetadata(exports.DYNAMIC_TRANSLATION_DECORATOR_KEY, {}, target, key);
    };
}
exports.DynamicTranslate = DynamicTranslate;
//# sourceMappingURL=translate.decorator.js.map