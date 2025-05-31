import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { GroupsModule } from '../groups/groups.module';
import { UsersModule } from '../users/users.module';
import { Users, UsersSchema } from '../users/schema/users.schema';
import { RecommendationLog, RecommendationLogSchema } from './schema/recommendation-log.schema';
import { Trips, TripsSchema } from './schema/trips.schema';
import { TripsController } from './trips.controller';
import { TripsService } from './trips.service';
import { RecommendationController } from './controllers/recommendation.controller';
import { RecommendationService } from './services/recommendation.service';
import { MemoryCacheService } from './services/memory-cache.service';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Trips.name, schema: TripsSchema },
            { name: RecommendationLog.name, schema: RecommendationLogSchema },
            { name: Users.name, schema: UsersSchema }
        ]),
        GroupsModule, // Import GroupsModule to provide Group model
        UsersModule // Import UsersModule for user services
    ],
    controllers: [TripsController, RecommendationController],
    providers: [TripsService, RecommendationService, MemoryCacheService],
    exports: [TripsService, RecommendationService, MemoryCacheService]
})
export class TripsModule {}
