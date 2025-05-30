import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Message, MessageDocument } from './schema/message.schema';

@Injectable()
export class MessagesService {
    constructor(
        @InjectModel(Message.name) private readonly messageModel: Model<MessageDocument>
    ) {}

    // TODO: Implement service methods
}
