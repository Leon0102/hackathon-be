"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IsBefore = void 0;
const class_validator_1 = require("class-validator");
let IsBeforeConstraint = class IsBeforeConstraint {
    validate(propertyValue, args) {
        return propertyValue < args.object[args.constraints[0]];
    }
    defaultMessage(args) {
        return `"${args.property}" must be before "${args.constraints[0]}"`;
    }
};
IsBeforeConstraint = __decorate([
    (0, class_validator_1.ValidatorConstraint)({ async: true })
], IsBeforeConstraint);
function IsBefore(property, validationOptions) {
    return function (object, propertyName) {
        (0, class_validator_1.registerDecorator)({
            name: 'isBefore',
            target: object.constructor,
            propertyName,
            options: validationOptions,
            constraints: [property],
            validator: IsBeforeConstraint
        });
    };
}
exports.IsBefore = IsBefore;
//# sourceMappingURL=is-before.validator.js.map