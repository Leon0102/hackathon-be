"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SameAs = void 0;
const class_validator_1 = require("class-validator");
function SameAs(property, validationOptions) {
    return function (object, propertyName) {
        (0, class_validator_1.registerDecorator)({
            name: 'sameAs',
            target: object.constructor,
            propertyName,
            options: validationOptions,
            constraints: [property],
            validator: {
                validate(value, args) {
                    const [relatedPropertyName] = args.constraints;
                    return (args === null || args === void 0 ? void 0 : args.object[relatedPropertyName]) === value;
                },
                defaultMessage() {
                    return '$property must match $constraint1';
                }
            }
        });
    };
}
exports.SameAs = SameAs;
//# sourceMappingURL=same-as.validator.js.map