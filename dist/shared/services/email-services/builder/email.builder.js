"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailBuilder = void 0;
const common_1 = require("@nestjs/common");
const lodash_1 = __importDefault(require("lodash"));
const constants_1 = require("../../../../constants");
const templates_1 = require("./../templates");
let EmailBuilder = class EmailBuilder {
    build(type, params) {
        const template = this.loadTemplate(type);
        if (!template) {
            throw new common_1.BadRequestException('This template is not supported');
        }
        if (!template.message || !template.subject) {
            throw new common_1.BadRequestException('This template is valid');
        }
        const built = template;
        built.subject = this.setValues(template.subject, params.subject);
        built.message = this.setValues(template.message, params.message);
        return built;
    }
    loadTemplate(type) {
        let template;
        switch (type) {
            case constants_1.EmailTemplate.FORGOT_PASSWORD_OTP_EMAIL: {
                template = lodash_1.default.clone(templates_1.FORGOT_PASSWORD_OTP_EMAIL);
                break;
            }
            case constants_1.EmailTemplate.DEFAULT: {
                template = lodash_1.default.clone(templates_1.FORGOT_PASSWORD_OTP_EMAIL);
                break;
            }
            default: {
                return null;
            }
        }
        if (!template) {
            throw new common_1.BadRequestException('Cannot find template');
        }
        return template;
    }
    setValues(source, params) {
        let built = source;
        for (const [key, value] of Object.entries(params)) {
            built = built.replace(new RegExp(`{{ ${key} }}`, 'gi'), value);
        }
        return built;
    }
};
EmailBuilder = __decorate([
    (0, common_1.Injectable)()
], EmailBuilder);
exports.EmailBuilder = EmailBuilder;
//# sourceMappingURL=email.builder.js.map