import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { GroupsModule } from '../groups/groups.module';
import { Users, UsersSchema } from '../users/schema/users.schema';
import { RecommendationLog, RecommendationLogSchema } from './schema/recommendation-log.schema';
import { Trips, TripsSchema } from './schema/trips.schema';
import { TripsController } from './trips.controller';
import { TripsService } from './trips.service';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Trips.name, schema: TripsSchema },
            { name: RecommendationLog.name, schema: RecommendationLogSchema },
            { name: Users.name, schema: UsersSchema }
        ]),
        GroupsModule // Import GroupsModule to provide Group model
    ],
    controllers: [TripsController],
    providers: [TripsService],
    exports: [TripsService]
})
export class TripsModule {}
