/* eslint-disable @typescript-eslint/require-await */
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailerService } from '@nestjs-modules/mailer';

import { OTP_EMAIL } from './email-services/templates';
@Injectable()
export class MailService {
    constructor(private readonly mailerService: MailerService, private readonly config: ConfigService) {}

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

    async sendEmailOTP(to: string, subject: string, context: { username: string; otpCode: string }) {
        const { username, otpCode } = context;

        return this.mailerService.sendMail({
            to,
            from: this.config.get('MAIL_FROM'),
            subject,
            html: OTP_EMAIL.template(username, otpCode)
        });
    }
}
