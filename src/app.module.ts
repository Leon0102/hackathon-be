/* eslint-disable @typescript-eslint/require-await */
import './boilerplate.polyfill';

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { MailerModule } from '@nestjs-modules/mailer';

import { AdminsModule } from './modules/admins/admins.module';
import { AuthModule } from './modules/auth/auth.module';
import { ItineraryModule } from './modules/itinerary/itinerary.module';
import { MatchesModule } from './modules/matches/matches.module';
import { MessagesModule } from './modules/messages/messages.module';
import { ReportsModule } from './modules/reports/reports.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { TripsModule } from './modules/trips/trips.module';
import { UsersModule } from './modules/users/users.module';
import { ApiConfigService } from './shared/services/api-config.service';
import { SharedModule } from './shared/shared.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '.env'
        }),
        MongooseModule.forRootAsync({
            imports: [SharedModule],
            useFactory: (configService: ApiConfigService) => configService.getMongooseOptions(),
            inject: [ApiConfigService]
        }),
        MailerModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                transport: {
                    host: configService.get('MAIL_HOST'),
                    port: configService.get('MAIL_PORT'),
                    secure: configService.get('MAIL_SECURE'),
                    auth: {
                        user: configService.get('MAIL_USER'),
                        pass: configService.get('MAIL_PASS')
                    }
                }
            }),
            inject: [ConfigService]
        }),
        UsersModule,
        AuthModule,
        TripsModule,
        ItineraryModule,
        MessagesModule,
        MatchesModule,
        ReviewsModule,
        ReportsModule,
        AdminsModule,
        ScheduleModule.forRoot()
    ],
    providers: []
})
export class AppModule {}
