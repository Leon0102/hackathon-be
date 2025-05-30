import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ReportsService } from './reports.service';

@Controller('reports')
@ApiTags('Reports')
export class ReportsController {
    constructor(private readonly reportsService: ReportsService) {}

    // TODO: Implement controller endpoints
}
