import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { MatchStatus } from '../../../../constants';

export class UpdateMatchStatusDto {
    @ApiProperty({ description: 'New match status', enum: MatchStatus })
    @IsEnum(MatchStatus)
    status: MatchStatus;
}
