import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Trips, TripsSchema } from './schema/trips.schema';
import { RecommendationLog, RecommendationLogSchema } from './schema/recommendation-log.schema';
import { Users, UsersSchema } from '../users/schema/users.schema';
import { TripsController } from './trips.controller';
import { TripsService } from './trips.service';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Trips.name, schema: TripsSchema },
            { name: RecommendationLog.name, schema: RecommendationLogSchema },
            { name: Users.name, schema: UsersSchema }
        ])
    ],
    controllers: [TripsController],
    providers: [TripsService],
    exports: [TripsService]
})
export class TripsModule {}
