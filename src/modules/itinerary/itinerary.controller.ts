import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ItineraryService } from './itinerary.service';

@Controller('itinerary')
@ApiTags('Itinerary')
export class ItineraryController {
    constructor(private readonly itineraryService: ItineraryService) {}

    // TODO: Implement controller endpoints
}
