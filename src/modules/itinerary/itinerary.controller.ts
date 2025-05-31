import {
    Controller,
    Post,
    UseGuards,
    Req
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth} from '@nestjs/swagger';
import { Request } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { ItineraryService } from './itinerary.service';
import {
} from './dto/response';

@Controller('itinerary')
@ApiTags('Itinerary')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class ItineraryController {
    constructor(private readonly itineraryService: ItineraryService) {}

    @Post('bulk-generate')
    @ApiOperation({
        summary: 'Generate fake itineraries for all trips',
        description: 'Bulk generates fake itineraries for all existing trips in the database'
    })
    @ApiResponse({
        status: 201,
        description: 'Fake itineraries generated successfully',
    })
    async generateFakeItinerariesForAllTrips(
        @Req() req: Request
    ) {
        return await this.itineraryService.generateFakeItinerariesForAllTrips();
    }
}
