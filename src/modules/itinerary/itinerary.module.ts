import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ItineraryController } from './itinerary.controller';
import { ItineraryService } from './itinerary.service';
import { Itinerary, ItinerarySchema } from './schema/itinerary.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Itinerary.name, schema: ItinerarySchema }
        ])
    ],
    controllers: [ItineraryController],
    providers: [ItineraryService],
    exports: [ItineraryService]
})
export class ItineraryModule {}
