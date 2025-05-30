import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { MessagesService } from './messages.service';

@Controller('messages')
@ApiTags('Messages')
export class MessagesController {
    constructor(private readonly messagesService: MessagesService) {}

    // TODO: Implement controller endpoints
}
