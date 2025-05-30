import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Trips, TripsSchema } from './schema/trips.schema';
import { TripsController } from './trips.controller';
import { TripsService } from './trips.service';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Trips.name, schema: TripsSchema }
        ])
    ],
    controllers: [TripsController],
    providers: [TripsService],
    exports: [TripsService]
})
export class TripsModule {}
