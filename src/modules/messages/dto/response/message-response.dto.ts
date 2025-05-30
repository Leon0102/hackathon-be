import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform } from 'class-transformer';

import { MessageType } from '../../../../constants';

export class MessageResponseDto {
    @ApiProperty({ description: 'Message ID' })
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

    @ApiProperty({ description: 'Trip ID this message belongs to' })
    @Expose()
    @Transform(({ obj, key }) => {
        // Handle MongoDB ObjectId field
        if (obj.tripId) {
            return obj.tripId.toString();
        }

        // Fallback for other formats
        return obj[key]?.toString();
    })
    tripId: string;

    @ApiProperty({ description: 'Sender ID' })
    @Expose()
    @Transform(({ obj, key }) => {
        // Handle MongoDB ObjectId field
        if (obj.senderId) {
            return obj.senderId.toString();
        }

        // Fallback for other formats
        return obj[key]?.toString();
    })
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
