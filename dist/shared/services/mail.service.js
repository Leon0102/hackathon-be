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
exports.MailService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const mailer_1 = require("@nestjs-modules/mailer");
const templates_1 = require("./email-services/templates");
let MailService = class MailService {
    constructor(mailerService, config) {
        this.mailerService = mailerService;
        this.config = config;
    }
    async mailConfig() {
        return {
            transport: {
                host: this.config.get('MAIL_HOST'),
                port: this.config.get('MAIL_PORT'),
                secure: this.config.get('MAIL_SECURE'),
                auth: {
                    user: this.config.get('MAIL_USER'),
                    pass: this.config.get('MAIL_PASS')
                }
            }
        };
    }
    async sendEmailOTP(to, subject, context) {
        const { username, otpCode } = context;
        return this.mailerService.sendMail({
            to,
            from: this.config.get('MAIL_FROM'),
            subject,
            html: templates_1.OTP_EMAIL.template(username, otpCode)
        });
    }
};
MailService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [mailer_1.MailerService, config_1.ConfigService])
], MailService);
exports.MailService = MailService;
//# sourceMappingURL=mail.service.js.map