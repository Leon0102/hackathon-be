import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { MatchesService } from './matches.service';

@Controller('matches')
@ApiTags('Matches')
export class MatchesController {
    constructor(private readonly matchesService: MatchesService) {}

    // TODO: Implement controller endpoints
}
