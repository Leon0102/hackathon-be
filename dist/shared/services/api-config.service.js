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
exports.ApiConfigService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const lodash_1 = require("lodash");
let ApiConfigService = class ApiConfigService {
    constructor(configService) {
        this.configService = configService;
    }
    get isDevelopment() {
        return this.nodeEnv === 'development';
    }
    get isProduction() {
        return this.nodeEnv === 'production';
    }
    get isTest() {
        return this.nodeEnv === 'test';
    }
    getNumber(key) {
        const value = this.get(key);
        try {
            return Number(value);
        }
        catch (_a) {
            throw new Error(key + ' environment variable is not a number');
        }
    }
    getBoolean(key) {
        const value = this.get(key);
        try {
            return Boolean(JSON.parse(value));
        }
        catch (_a) {
            throw new Error(key + ' env var is not a boolean');
        }
    }
    getString(key) {
        const value = this.get(key);
        return value.replace(/\\n/g, '\n');
    }
    get nodeEnv() {
        return this.getString('NODE_ENV');
    }
    getMongooseOptions() {
        const options = {
            uri: this.getString('MONGODB_DEV'),
            dbName: 'nest-api-mongo-database',
            user: this.get('MONGOOSE_USERNAME'),
            pass: this.get('MONGOOSE_PASSWORD'),
            useNewUrlParser: true,
            useUnifiedTopology: true
        };
        return options;
    }
    get mongodbConfig() {
        return this.getString('MONGODB_DEV');
    }
    get serverConfig() {
        return {
            port: this.configService.get('PORT') || 4000
        };
    }
    get awsSesConfig() {
        return {
            sesAccessKeyId: this.getString('AWS_SES_ACCESS_KEY_ID') || '',
            sesSecretAccessKey: this.getString('AWS_SES_SECRET_ACCESS_KEY') || '',
            sesRegion: this.getString('AWS_SES_REGION') || '',
            sesSource: this.getString('AWS_SES_SOURCE') || ''
        };
    }
    get awsS3Config() {
        return {
            s3AccessKeyId: this.getString('AWS_S3_ACCESS_KEY_ID'),
            s3SecretAccessKey: this.getString('AWS_S3_SECRET_ACCESS_KEY'),
            bucketRegion: this.getString('AWS_S3_BUCKET_REGION'),
            bucketName: this.getString('AWS_S3_BUCKET_NAME'),
            bucketEndpoint: this.getString('AWS_S3_BUCKET_ENDPOINT')
        };
    }
    get documentationEnabled() {
        return this.getBoolean('ENABLE_DOCUMENTATION');
    }
    get authConfig() {
        var _a;
        return {
            privateKey: this.getString('JWT_PRIVATE_KEY'),
            publicKey: this.getString('JWT_PUBLIC_KEY'),
            jwtExpirationTime: (_a = this.getNumber('JWT_EXPIRATION_TIME')) !== null && _a !== void 0 ? _a : 3600
        };
    }
    get(key) {
        const value = this.configService.get(key);
        if ((0, lodash_1.isNil)(value)) {
            throw new Error(key + ' environment variable does not set');
        }
        return value;
    }
};
ApiConfigService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], ApiConfigService);
exports.ApiConfigService = ApiConfigService;
//# sourceMappingURL=api-config.service.js.map