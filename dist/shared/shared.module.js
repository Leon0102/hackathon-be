"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SharedModule = void 0;
const axios_1 = require("@nestjs/axios");
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const api_config_service_1 = require("./services/api-config.service");
const aws_s3_service_1 = require("./services/aws-s3.service");
const aws_ses_service_1 = require("./services/email-services/aws-ses.service");
const email_builder_1 = require("./services/email-services/builder/email.builder");
const generator_service_1 = require("./services/generator.service");
const mail_service_1 = require("./services/mail.service");
const validator_service_1 = require("./services/validator.service");
const providers = [
    api_config_service_1.ApiConfigService,
    validator_service_1.ValidatorService,
    aws_s3_service_1.AwsS3Service,
    generator_service_1.GeneratorService,
    aws_ses_service_1.AwsSESService,
    email_builder_1.EmailBuilder,
    mail_service_1.MailService
];
let SharedModule = class SharedModule {
};
SharedModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        providers,
        imports: [axios_1.HttpModule, cqrs_1.CqrsModule],
        exports: [...providers, axios_1.HttpModule, cqrs_1.CqrsModule]
    })
], SharedModule);
exports.SharedModule = SharedModule;
//# sourceMappingURL=shared.module.js.map