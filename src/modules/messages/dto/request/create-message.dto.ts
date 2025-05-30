import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsMongoId, IsString, MaxLength } from 'class-validator';
import { Types } from 'mongoose';
import { MessageType } from '../../../../constants';

export class CreateMessageDto {
    @ApiProperty({ description: 'Trip ID this message belongs to' })
    @IsMongoId()
    tripId: Types.ObjectId;

    @ApiProperty({ description: 'Content of the message', maxLength: 1000 })
    @IsString()
    @MaxLength(1000)
    content: string;

    @ApiProperty({ description: 'Type of message', enum: MessageType })
    @IsEnum(MessageType)
    messageType: MessageType = MessageType.TEXT;
}
