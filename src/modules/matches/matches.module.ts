import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MatchesController } from './matches.controller';
import { MatchesService } from './matches.service';
import { Match, MatchSchema } from './schema/match.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Match.name, schema: MatchSchema }
        ])
    ],
    controllers: [MatchesController],
    providers: [MatchesService],
    exports: [MatchesService]
})
export class MatchesModule {}
