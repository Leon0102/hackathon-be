import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Admin, AdminDocument } from './schema/admin.schema';

@Injectable()
export class AdminsService {
    constructor(
        @InjectModel(Admin.name) private adminModel: Model<AdminDocument>
    ) {}

    // TODO: Implement service methods
}
