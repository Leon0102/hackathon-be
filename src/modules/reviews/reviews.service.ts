import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Review, ReviewDocument } from './schema/review.schema';

@Injectable()
export class ReviewsService {
    constructor(
        @InjectModel(Review.name) private readonly reviewModel: Model<ReviewDocument>
    ) {}

    // TODO: Implement service methods
}
