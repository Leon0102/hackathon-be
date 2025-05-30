import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform } from 'class-transformer';
import { MatchStatus } from '../../../../constants';

export class MatchResponseDto {
    @ApiProperty({ description: 'Match ID' })
    @Expose()
    @Transform(({ obj }) => obj._id?.toString())
    id: string;

    @ApiProperty({ description: 'User A ID' })
    @Expose()
    @Transform(({ obj }) => obj.userA?.toString())
    userA: string;

    @ApiProperty({ description: 'User B ID' })
    @Expose()
    @Transform(({ obj }) => obj.userB?.toString())
    userB: string;

    @ApiProperty({ description: 'Match score' })
    @Expose()
    matchScore: number;

    @ApiProperty({ description: 'Match status', enum: MatchStatus })
    @Expose()
    status: MatchStatus;

    @ApiProperty({ description: 'User who initiated the match' })
    @Expose()
    @Transform(({ obj }) => obj.initiatedBy?.toString())
    initiatedBy: string;

    @ApiProperty({ description: 'When the match was created' })
    @Expose()
    createdAt: Date;

    @ApiProperty({ description: 'Whether this is a mutual match' })
    @Expose()
    isMutualMatch: boolean;
}
