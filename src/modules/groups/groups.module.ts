import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GroupsService } from './groups.service';
import { GroupsController } from './groups.controller';
import { Group, GroupSchema } from './schema/group.schema';
import { Trips, TripsSchema } from '../trips/schema/trips.schema';
import { Users, UsersSchema } from '../users/schema/users.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Group.name, schema: GroupSchema },
      { name: Trips.name, schema: TripsSchema },
      { name: Users.name, schema: UsersSchema },
    ])
  ],
  providers: [GroupsService],
  controllers: [GroupsController],
  exports: [GroupsService]
})
export class GroupsModule {}
