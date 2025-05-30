import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Itinerary, ItineraryDocument } from './schema/itinerary.schema';

@Injectable()
export class ItineraryService {
    constructor(
        @InjectModel(Itinerary.name) private readonly itineraryModel: Model<ItineraryDocument>
    ) {}

    // TODO: Implement service methods
}
