import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Trips, TripsSchema } from '../trips/schema/trips.schema';
import { Users, UsersSchema } from '../users/schema/users.schema';
import { GroupsController } from './groups.controller';
import { GroupsService } from './groups.service';
import { Group, GroupSchema } from './schema/group.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Group.name, schema: GroupSchema },
            { name: Trips.name, schema: TripsSchema },
            { name: Users.name, schema: UsersSchema }
        ])
    ],
    providers: [GroupsService],
    controllers: [GroupsController],
    exports: [
        GroupsService,
        MongooseModule // Export MongooseModule to provide Group model
    ]
})
export class GroupsModule {}
