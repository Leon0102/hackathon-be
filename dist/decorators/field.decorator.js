"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DateFieldOptional = exports.DateField = exports.URLFieldOptional = exports.URLField = exports.UUIDFieldOptional = exports.UUIDField = exports.PhoneFieldOptional = exports.PhoneField = exports.EmailFieldOptional = exports.EmailField = exports.EnumFieldOptional = exports.EnumField = exports.TmpKeyFieldOptional = exports.TmpKeyField = exports.TranslationsFieldOptional = exports.TranslationsField = exports.BooleanFieldOptional = exports.BooleanField = exports.PasswordFieldOptional = exports.PasswordField = exports.StringFieldOptional = exports.StringField = exports.NumberFieldOptional = exports.NumberField = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const lodash_1 = __importDefault(require("lodash"));
const constants_1 = require("../constants");
const property_decorators_1 = require("./property.decorators");
const transform_decorators_1 = require("./transform.decorators");
const validator_decorators_1 = require("./validator.decorators");
function NumberField(options = {}) {
    const decorators = [(0, class_transformer_1.Type)(() => Number)];
    const { each, int, minimum, maximum, isPositive, swagger } = options;
    if (swagger !== false) {
        decorators.push((0, swagger_1.ApiProperty)(Object.assign(Object.assign({ type: Number }, options), { example: int ? 1 : 1.2 })));
    }
    if (each) {
        decorators.push((0, transform_decorators_1.ToArray)());
    }
    if (int) {
        decorators.push((0, class_validator_1.IsInt)({ each }));
    }
    else {
        decorators.push((0, class_validator_1.IsNumber)({}, { each }));
    }
    if (lodash_1.default.isNumber(minimum)) {
        decorators.push((0, class_validator_1.Min)(minimum, { each }));
    }
    if (lodash_1.default.isNumber(maximum)) {
        decorators.push((0, class_validator_1.Max)(maximum, { each }));
    }
    if (isPositive) {
        decorators.push((0, class_validator_1.IsPositive)({ each }));
    }
    return (0, common_1.applyDecorators)(...decorators);
}
exports.NumberField = NumberField;
function NumberFieldOptional(options = {}) {
    return (0, common_1.applyDecorators)((0, class_validator_1.IsOptional)(), NumberField(Object.assign({ required: false }, options)));
}
exports.NumberFieldOptional = NumberFieldOptional;
function StringField(options = {}) {
    const decorators = [(0, class_validator_1.IsNotEmpty)(), (0, class_validator_1.IsString)()];
    if (options.swagger !== false) {
        decorators.push((0, swagger_1.ApiProperty)(Object.assign({ type: String }, options)));
    }
    if (options.trim !== false) {
        decorators.push((0, transform_decorators_1.Trim)());
    }
    if (options.minLength) {
        decorators.push((0, class_validator_1.MinLength)(options.minLength));
    }
    if (options.maxLength) {
        decorators.push((0, class_validator_1.MaxLength)(options.maxLength));
    }
    if (options.toLowerCase) {
        decorators.push((0, transform_decorators_1.ToLowerCase)());
    }
    if (options.toUpperCase) {
        decorators.push((0, transform_decorators_1.ToUpperCase)());
    }
    return (0, common_1.applyDecorators)(...decorators);
}
exports.StringField = StringField;
function StringFieldOptional(options = {}) {
    return (0, common_1.applyDecorators)((0, class_validator_1.IsOptional)(), StringField(Object.assign({ required: false }, options)));
}
exports.StringFieldOptional = StringFieldOptional;
function PasswordField(options = {}) {
    return (0, common_1.applyDecorators)(StringField(Object.assign({ format: '^[\\d!#$%&*@A-Z^a-z]*$' }, options)), (0, validator_decorators_1.IsPassword)());
}
exports.PasswordField = PasswordField;
function PasswordFieldOptional(options = {}) {
    return (0, common_1.applyDecorators)((0, class_validator_1.IsOptional)(), PasswordField(Object.assign({ required: false }, options)));
}
exports.PasswordFieldOptional = PasswordFieldOptional;
function BooleanField(options = {}) {
    const decorators = [(0, class_validator_1.IsBoolean)(), (0, transform_decorators_1.ToBoolean)()];
    if (options.swagger !== false) {
        decorators.push((0, swagger_1.ApiProperty)(Object.assign({ type: Boolean }, options)));
    }
    return (0, common_1.applyDecorators)(...decorators);
}
exports.BooleanField = BooleanField;
function BooleanFieldOptional(options = {}) {
    return (0, common_1.applyDecorators)((0, class_validator_1.IsOptional)(), BooleanField(Object.assign({ required: false }, options)));
}
exports.BooleanFieldOptional = BooleanFieldOptional;
function TranslationsField(options) {
    const decorators = [
        (0, class_validator_1.ArrayMinSize)(constants_1.supportedLanguageCount),
        (0, class_validator_1.ArrayMaxSize)(constants_1.supportedLanguageCount),
        (0, class_validator_1.ValidateNested)({
            each: true
        }),
        (0, class_transformer_1.Type)(() => options.type)
    ];
    if (options.swagger !== false) {
        decorators.push((0, swagger_1.ApiProperty)(Object.assign({ isArray: true }, options)));
    }
    return (0, common_1.applyDecorators)(...decorators);
}
exports.TranslationsField = TranslationsField;
function TranslationsFieldOptional(options) {
    return (0, common_1.applyDecorators)((0, class_validator_1.IsOptional)(), TranslationsField(Object.assign({ required: false }, options)));
}
exports.TranslationsFieldOptional = TranslationsFieldOptional;
function TmpKeyField(options = {}) {
    const decorators = [(0, validator_decorators_1.IsTmpKey)()];
    if (options.swagger !== false) {
        decorators.push((0, swagger_1.ApiProperty)(Object.assign({ type: String }, options)));
    }
    return (0, common_1.applyDecorators)(...decorators);
}
exports.TmpKeyField = TmpKeyField;
function TmpKeyFieldOptional(options = {}) {
    return (0, common_1.applyDecorators)((0, class_validator_1.IsOptional)(), TmpKeyField(Object.assign({ required: false }, options)));
}
exports.TmpKeyFieldOptional = TmpKeyFieldOptional;
function EnumField(getEnum, options = {}) {
    const enumValue = getEnum();
    const decorators = [(0, class_validator_1.IsEnum)(enumValue, { each: options.each })];
    if (options.swagger !== false) {
        decorators.push((0, property_decorators_1.ApiEnumProperty)(getEnum, options));
    }
    if (options.each) {
        decorators.push((0, transform_decorators_1.ToArray)());
    }
    return (0, common_1.applyDecorators)(...decorators);
}
exports.EnumField = EnumField;
function EnumFieldOptional(getEnum, options = {}) {
    return (0, common_1.applyDecorators)((0, class_validator_1.IsOptional)(), EnumField(getEnum, Object.assign({ required: false }, options)));
}
exports.EnumFieldOptional = EnumFieldOptional;
function EmailField(options = {}) {
    const decorators = [(0, class_validator_1.IsEmail)(), StringField(Object.assign({ toLowerCase: true }, options))];
    if (options.swagger !== false) {
        decorators.push((0, swagger_1.ApiProperty)(Object.assign({ type: String }, options)));
    }
    return (0, common_1.applyDecorators)(...decorators);
}
exports.EmailField = EmailField;
function EmailFieldOptional(options = {}) {
    return (0, common_1.applyDecorators)((0, class_validator_1.IsOptional)(), EmailField(Object.assign({ required: false }, options)));
}
exports.EmailFieldOptional = EmailFieldOptional;
function PhoneField(options = {}) {
    const decorators = [(0, validator_decorators_1.IsPhoneNumber)(), (0, transform_decorators_1.PhoneNumberSerializer)()];
    if (options.swagger !== false) {
        decorators.push((0, swagger_1.ApiProperty)(Object.assign({ type: String }, options)));
    }
    return (0, common_1.applyDecorators)(...decorators);
}
exports.PhoneField = PhoneField;
function PhoneFieldOptional(options = {}) {
    return (0, common_1.applyDecorators)((0, class_validator_1.IsOptional)(), PhoneField(Object.assign({ required: false }, options)));
}
exports.PhoneFieldOptional = PhoneFieldOptional;
function UUIDField(options = {}) {
    const decorators = [(0, class_validator_1.IsUUID)('4', { each: options.each })];
    if (options.swagger !== false) {
        decorators.push((0, property_decorators_1.ApiUUIDProperty)(options));
    }
    if (options.each) {
        decorators.push((0, class_validator_1.ArrayNotEmpty)(), (0, transform_decorators_1.ToArray)());
    }
    return (0, common_1.applyDecorators)(...decorators);
}
exports.UUIDField = UUIDField;
function UUIDFieldOptional(options = {}) {
    return (0, common_1.applyDecorators)((0, class_validator_1.IsOptional)(), UUIDField(Object.assign({ required: false }, options)));
}
exports.UUIDFieldOptional = UUIDFieldOptional;
function URLField(options = {}) {
    return (0, common_1.applyDecorators)(StringField(options), (0, class_validator_1.IsUrl)());
}
exports.URLField = URLField;
function URLFieldOptional(options = {}) {
    return (0, common_1.applyDecorators)((0, class_validator_1.IsOptional)(), URLField(Object.assign({ required: false }, options)));
}
exports.URLFieldOptional = URLFieldOptional;
function DateField(options = {}) {
    const decorators = [(0, class_transformer_1.Type)(() => Date), (0, class_validator_1.IsDate)()];
    if (options.swagger !== false) {
        decorators.push((0, swagger_1.ApiProperty)(options));
    }
    return (0, common_1.applyDecorators)(...decorators);
}
exports.DateField = DateField;
function DateFieldOptional(options = {}) {
    return (0, common_1.applyDecorators)((0, class_validator_1.IsOptional)(), DateField(Object.assign(Object.assign({}, options), { required: false })));
}
exports.DateFieldOptional = DateFieldOptional;
//# sourceMappingURL=field.decorator.js.map