import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Match, MatchDocument } from './schema/match.schema';

@Injectable()
export class MatchesService {
    constructor(
        @InjectModel(Match.name) private readonly matchModel: Model<MatchDocument>
    ) {}

    // TODO: Implement service methods
}
