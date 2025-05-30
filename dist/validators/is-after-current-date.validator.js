"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IsAfterCurrentDate = void 0;
const class_validator_1 = require("class-validator");
let IsAfterCurrentDateConstraint = class IsAfterCurrentDateConstraint {
    validate(propertyValue, _args) {
        return new Date(propertyValue) > new Date();
    }
    defaultMessage(args) {
        return `"${args.property}" must be after "currentDate"`;
    }
};
IsAfterCurrentDateConstraint = __decorate([
    (0, class_validator_1.ValidatorConstraint)({ async: true })
], IsAfterCurrentDateConstraint);
function IsAfterCurrentDate(validationOptions) {
    return function (object, propertyName) {
        (0, class_validator_1.registerDecorator)({
            name: 'isAfterCurrentDate',
            target: object.constructor,
            propertyName,
            options: validationOptions,
            constraints: [],
            validator: IsAfterCurrentDateConstraint
        });
    };
}
exports.IsAfterCurrentDate = IsAfterCurrentDate;
//# sourceMappingURL=is-after-current-date.validator.js.map