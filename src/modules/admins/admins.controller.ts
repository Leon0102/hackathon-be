import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AdminsService } from './admins.service';

@Controller('admins')
@ApiTags('Admins')
export class AdminsController {
    constructor(private readonly adminsService: AdminsService) {}

    // TODO: Implement controller endpoints
}
