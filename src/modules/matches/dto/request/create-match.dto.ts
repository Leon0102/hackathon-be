import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsNumber, Max, Min } from 'class-validator';
import { Types } from 'mongoose';

export class CreateMatchDto {
    @ApiProperty({ description: 'User B ID' })
    @IsMongoId()
    userB: Types.ObjectId;

    @ApiProperty({ description: 'Match score between 0-100', minimum: 0, maximum: 100 })
    @IsNumber()
    @Min(0)
    @Max(100)
    matchScore: number;
}
