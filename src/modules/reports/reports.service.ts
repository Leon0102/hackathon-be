import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Report, ReportDocument } from './schema/report.schema';

@Injectable()
export class ReportsService {
    constructor(
        @InjectModel(Report.name) private reportModel: Model<ReportDocument>
    ) {}

    // TODO: Implement service methods
}
