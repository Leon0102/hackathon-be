import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform } from 'class-transformer';
import { MessageType } from '../../../../constants';

export class MessageResponseDto {
    @ApiProperty({ description: 'Message ID' })
    @Expose()
    @Transform(({ obj }) => obj._id?.toString())
    id: string;

    @ApiProperty({ description: 'Trip ID this message belongs to' })
    @Expose()
    @Transform(({ obj }) => obj.tripId?.toString())
    tripId: string;

    @ApiProperty({ description: 'Sender ID' })
    @Expose()
    @Transform(({ obj }) => obj.senderId?.toString())
    senderId: string;

    @ApiProperty({ description: 'Content of the message' })
    @Expose()
    content: string;

    @ApiProperty({ description: 'Timestamp of the message' })
    @Expose()
    timestamp: Date;

    @ApiProperty({ description: 'Type of message', enum: MessageType })
    @Expose()
    messageType: MessageType;

    @ApiProperty({ description: 'Whether the message is flagged' })
    @Expose()
    isFlagged: boolean;

    @ApiProperty({ description: 'Formatted timestamp' })
    @Expose()
    formattedTimestamp: string;
}
