import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ReviewsService } from './reviews.service';

@Controller('reviews')
@ApiTags('Reviews')
export class ReviewsController {
    constructor(private readonly reviewsService: ReviewsService) {}

    // TODO: Implement controller endpoints
}
