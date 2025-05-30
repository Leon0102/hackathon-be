import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { MongooseModuleOptions } from '@nestjs/mongoose';
import { isNil } from 'lodash';

@Injectable()
export class ApiConfigService {
    constructor(private configService: ConfigService) {}

    get isDevelopment(): boolean {
        return this.nodeEnv === 'development';
    }

    get isProduction(): boolean {
        return this.nodeEnv === 'production';
    }

    get isTest(): boolean {
        return this.nodeEnv === 'test';
    }

    private getNumber(key: string): number {
        const value = this.get(key);

        try {
            return Number(value);
        } catch {
            throw new Error(key + ' environment variable is not a number');
        }
    }

    private getBoolean(key: string): boolean {
        const value = this.get(key);

        try {
            return Boolean(JSON.parse(value));
        } catch {
            throw new Error(key + ' env var is not a boolean');
        }
    }

    private getString(key: string): string {
        const value = this.get(key);

        return value.replace(/\\n/g, '\n');
    }

    get nodeEnv(): string {
        return this.getString('NODE_ENV');
    }

    getMongooseOptions(): MongooseModuleOptions {
        const options: MongooseModuleOptions = {
            uri: this.getString('MONGODB_DEV'),
            dbName: 'nest-api-mongo-database',
            user: this.get('MONGOOSE_USERNAME'),
            pass: this.get('MONGOOSE_PASSWORD'),
            useNewUrlParser: true,
            useUnifiedTopology: true
        };

        return options;
    }

    get mongodbConfig(): string {
        return this.getString('MONGODB_DEV');
    }

    get serverConfig() {
        return {
            port: this.configService.get<string>('PORT') || 4000
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

    get documentationEnabled(): boolean {
        return this.getBoolean('ENABLE_DOCUMENTATION');
    }

    get authConfig() {
        return {
            privateKey: this.getString('JWT_PRIVATE_KEY'),
            publicKey: this.getString('JWT_PUBLIC_KEY'),
            jwtExpirationTime: this.getNumber('JWT_EXPIRATION_TIME') ?? 3600
        };
    }

    private get(key: string): string {
        const value = this.configService.get<string>(key);

        if (isNil(value)) {
            // probably we should call process.exit() too to avoid locking the service

            throw new Error(key + ' environment variable does not set');
        }

        return value;
    }

    // get googleAuth() {
    //     return {
    //         clientID: this.getString('GOOGLE_AUTH_CLIENT_ID'),
    //         clientSecret: this.getString('GOOGLE_AUTH_CLIENT_SECRET')
    //     };
    // }

    // get appleAuth() {
    //     return {
    //         clientId: this.getString('APPLE_AUTH_CLIENT_ID'),
    //         clientSecret: this.getString('APPLE_AUTH_CLIENT_SECRET')
    //     };
    // }
}
