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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AwsS3Service = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const common_1 = require("@nestjs/common");
const mime_types_1 = __importDefault(require("mime-types"));
const providers_1 = require("../../providers");
const api_config_service_1 = require("./api-config.service");
const generator_service_1 = require("./generator.service");
let AwsS3Service = class AwsS3Service {
    constructor(configService, generatorService) {
        this.configService = configService;
        this.generatorService = generatorService;
        const s3Config = this.configService.awsS3Config;
        this.s3Client = new client_s3_1.S3Client({
            region: s3Config.bucketRegion,
            credentials: {
                accessKeyId: s3Config.s3AccessKeyId,
                secretAccessKey: s3Config.s3SecretAccessKey
            }
        });
        this.bucketName = s3Config.bucketName;
        this.expiresIn = 36000;
    }
    async uploadImage(file) {
        const fileName = this.generatorService.fileName(mime_types_1.default.extension(file.mimetype));
        const key = this.configService.awsS3Config.bucketEndpoint + 'images/' + fileName;
        await this.s3Client.send(new client_s3_1.PutObjectCommand({
            Bucket: this.bucketName,
            Body: file.buffer,
            ContentType: file.mimetype,
            Key: 'images/' + fileName,
            ACL: 'public-read'
        }));
        return key;
    }
    getSignedUrl(key) {
        const command = new client_s3_1.GetObjectCommand({
            Bucket: this.bucketName,
            Key: key
        });
        return (0, s3_request_presigner_1.getSignedUrl)(this.s3Client, command, {
            expiresIn: this.expiresIn
        });
    }
    async deleteObject(key) {
        if (this.validateRemovedImage(key)) {
            await this.s3Client.send(new client_s3_1.DeleteObjectCommand({
                Bucket: this.bucketName,
                Key: key
            }));
        }
    }
    async deleteObjects(keys) {
        const promiseDelete = keys.map((item) => {
            const oldKey = providers_1.GeneratorProvider.getS3Key(item);
            if (oldKey && this.validateRemovedImage(oldKey)) {
                return this.s3Client.send(new client_s3_1.DeleteObjectCommand({
                    Bucket: this.bucketName,
                    Key: oldKey
                }));
            }
        });
        await Promise.all(promiseDelete);
    }
    validateRemovedImage(key) {
        return !key.includes('templates/');
    }
};
AwsS3Service = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [api_config_service_1.ApiConfigService, generator_service_1.GeneratorService])
], AwsS3Service);
exports.AwsS3Service = AwsS3Service;
//# sourceMappingURL=aws-s3.service.js.map