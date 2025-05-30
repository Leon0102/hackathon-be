"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AwsSESService = void 0;
const client_ses_1 = require("@aws-sdk/client-ses");
const common_1 = require("@nestjs/common");
const api_config_service_1 = require("../api-config.service");
const email_builder_1 = require("./builder/email.builder");
const email_request_builder_1 = require("./builder/email-request.builder");
let AwsSESService = class AwsSESService {
    constructor(configService, emailBuilder) {
        var _a, _b;
        this.configService = configService;
        this.emailBuilder = emailBuilder;
        const sesConfig = this.configService.awsSesConfig;
        this.sesClient = new client_ses_1.SESClient({
            region: sesConfig.sesRegion,
            credentials: {
                accessKeyId: (_a = sesConfig.sesAccessKeyId) !== null && _a !== void 0 ? _a : '',
                secretAccessKey: (_b = sesConfig.sesSecretAccessKey) !== null && _b !== void 0 ? _b : ''
            }
        });
        this.source = sesConfig.sesSource;
    }
    async sendEmail(type, params, to, bbc = false) {
        const requestBuilder = new email_request_builder_1.EmailRequestBuilder();
        const template = this.emailBuilder.build(type, params);
        try {
            const request = requestBuilder.build({
                email: to,
                message: { data: template.message },
                subject: { data: template.subject },
                source: this.source
            }, bbc);
            await this.sesClient.send(new client_ses_1.SendEmailCommand(request));
        }
        catch (_a) {
            throw new common_1.InternalServerErrorException("Something Bad Happened! Couldn't send the email!");
        }
    }
    async sendBulkEmail(type, params) {
        const template = this.emailBuilder.loadTemplate(type);
        await this.createTemplate(type, template === null || template === void 0 ? void 0 : template.subject, template === null || template === void 0 ? void 0 : template.message, template === null || template === void 0 ? void 0 : template.message);
        try {
            return await this.sesClient.send(new client_ses_1.SendBulkTemplatedEmailCommand(params));
        }
        catch (error) {
            throw new Error(error);
        }
    }
    async createTemplate(templateName, subjectPart, htmlPart, textPart) {
        const template = {
            Template: {
                TemplateName: templateName,
                SubjectPart: subjectPart,
                HtmlPart: htmlPart,
                TextPart: textPart
            }
        };
        const isTemplateExisted = await this.checkTemplateExisted(template.Template.TemplateName);
        await (isTemplateExisted
            ? this.updateTemplate(template)
            : this.sesClient.send(new client_ses_1.CreateTemplateCommand(template)));
    }
    async getTemplateList() {
        try {
            const templateList = await this.sesClient.send(new client_ses_1.ListTemplatesCommand({}));
            return templateList.TemplatesMetadata;
        }
        catch (error) {
            throw new Error(error);
        }
    }
    async checkTemplateExisted(templateName) {
        const response = await this.getTemplateList();
        if (!response) {
            return false;
        }
        return response.some(({ Name }) => Name === templateName);
    }
    async updateTemplate(template) {
        try {
            return await this.sesClient.send(new client_ses_1.UpdateTemplateCommand(template));
        }
        catch (error) {
            throw new Error(error);
        }
    }
};
AwsSESService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [api_config_service_1.ApiConfigService, email_builder_1.EmailBuilder])
], AwsSESService);
exports.AwsSESService = AwsSESService;
//# sourceMappingURL=aws-ses.service.js.map