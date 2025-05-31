import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ItineraryController } from './itinerary.controller';
import { ItineraryService } from './itinerary.service';
import { Itinerary, ItinerarySchema } from './schema/itinerary.schema';
import { Trips, TripsSchema } from '../trips/schema/trips.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Itinerary.name, schema: ItinerarySchema },
            { name: Trips.name, schema: TripsSchema }
        ])
    ],
    controllers: [ItineraryController],
    providers: [ItineraryService],
    exports: [ItineraryService]
})
export class ItineraryModule {}
