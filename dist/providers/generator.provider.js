"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeneratorProvider = void 0;
const uuid_1 = require("uuid");
class GeneratorProvider {
    static uuid() {
        return (0, uuid_1.v1)();
    }
    static fileName(ext) {
        return GeneratorProvider.uuid() + '.' + ext;
    }
    static getS3PublicUrl(key) {
        if (!key) {
            throw new TypeError('key is required');
        }
        return `https://s3.${process.env.AWS_S3_BUCKET_NAME_REGION}.amazonaws.com/${process.env.AWS_S3_BUCKET_NAME}/${key}`;
    }
    static getS3Key(publicUrl) {
        if (!publicUrl) {
            throw new TypeError('key is required');
        }
        const exec = new RegExp(`(?<=https://${process.env.AWS_S3_BUCKET_NAME}.s3.ap-southeast-1.amazonaws.com/).*`).exec(publicUrl);
        if (!exec) {
            return false;
        }
        return exec[0];
    }
    static generateVerificationCode() {
        return Math.floor(1000 + Math.random() * 9000).toString();
    }
    static generatePassword() {
        const lowercase = 'abcdefghijklmnopqrstuvwxyz';
        const uppercase = lowercase.toUpperCase();
        const numbers = '0123456789';
        let text = '';
        for (let i = 0; i < 4; i++) {
            text += uppercase.charAt(Math.floor(Math.random() * uppercase.length));
            text += lowercase.charAt(Math.floor(Math.random() * lowercase.length));
            text += numbers.charAt(Math.floor(Math.random() * numbers.length));
        }
        return text;
    }
    static generateRandomString(length) {
        return Math.random()
            .toString(36)
            .replace(/[^\dA-Za-z]+/g, '')
            .slice(0, Math.max(0, length));
    }
}
exports.GeneratorProvider = GeneratorProvider;
//# sourceMappingURL=generator.provider.js.map