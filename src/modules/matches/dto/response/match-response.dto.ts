import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform } from 'class-transformer';

import { MatchStatus } from '../../../../constants';

export class MatchResponseDto {
    @ApiProperty({ description: 'Match ID' })
    @Expose()
    @Transform(({ obj, key }) => {
        // Handle MongoDB _id field
        if (obj._id) {
            return obj._id.toString();
        }

        // Handle regular id field
        if (obj.id) {
            return obj.id.toString();
        }

        // Fallback for other id formats
        return obj[key]?.toString();
    })
    id: string;

    @ApiProperty({ description: 'User A ID' })
    @Expose()
    @Transform(({ obj, key }) => {
        // Handle MongoDB ObjectId field
        if (obj.userA) {
            return obj.userA.toString();
        }

        // Fallback for other formats
        return obj[key]?.toString();
    })
    userA: string;

    @ApiProperty({ description: 'User B ID' })
    @Expose()
    @Transform(({ obj, key }) => {
        // Handle MongoDB ObjectId field
        if (obj.userB) {
            return obj.userB.toString();
        }

        // Fallback for other formats
        return obj[key]?.toString();
    })
    userB: string;

    @ApiProperty({ description: 'Match score' })
    @Expose()
    matchScore: number;

    @ApiProperty({ description: 'Match status', enum: MatchStatus })
    @Expose()
    status: MatchStatus;

    @ApiProperty({ description: 'User who initiated the match' })
    @Expose()
    @Transform(({ obj, key }) => {
        // Handle MongoDB ObjectId field
        if (obj.initiatedBy) {
            return obj.initiatedBy.toString();
        }

        // Fallback for other formats
        return obj[key]?.toString();
    })
    initiatedBy: string;

    @ApiProperty({ description: 'When the match was created' })
    @Expose()
    createdAt: Date;

    @ApiProperty({ description: 'Whether this is a mutual match' })
    @Expose()
    isMutualMatch: boolean;
}
