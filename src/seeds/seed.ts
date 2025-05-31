import 'dotenv/config';
import mongoose from 'mongoose';
import { faker } from '@faker-js/faker';
import { UsersSchema } from '../modules/users/schema/users.schema';
import { TripsSchema } from '../modules/trips/schema/trips.schema';
import { GroupSchema } from '../modules/groups/schema/group.schema';
import {
  AuthProvider,
  Gender,
  TravelStyle,
  UserRole,
  TripStatus,
  MemberStatus,
} from '../constants';

async function main() {
  const uri = 'mongodb+srv://haphuchoan:9AAoyHqH0FvTDpkR@cluster0.7n65af.mongodb.net/'
  const dbName = 'nest-api-mongo-database'
  await mongoose.connect(uri, { dbName });
  console.log(`Connected to MongoDB: ${uri}, database: ${dbName}`);

  const UserModel = mongoose.model('Users', UsersSchema);
  const TripModel = mongoose.model('Trips', TripsSchema);
  const GroupModel = mongoose.model('Group', GroupSchema);

  // Get existing data counts
  const existingUserCount = await UserModel.countDocuments();
  const existingTripCount = await TripModel.countDocuments();
  const existingGroupCount = await GroupModel.countDocuments();
  console.log(`Existing data - Users: ${existingUserCount}, Trips: ${existingTripCount}, Groups: ${existingGroupCount}`);

  // Create 50 new fake users
  const newUsers: any[] = [];
  for (let i = 0; i < 50; i++) {
    const user = await UserModel.create({
      fullName: faker.person.fullName(),
      email: faker.internet.email().toLowerCase(),
      passwordHash: "123456",
      authProvider: AuthProvider.LOCAL,
      profilePictureUrl: faker.image.avatar(),
      age: faker.number.int({ min: 18, max: 80 }),
      gender: faker.helpers.arrayElement(Object.values(Gender)),
      bio: faker.lorem.sentence(),
      languages: Array.from({ length: faker.number.int({ min: 1, max: 3 }) }, () => faker.lorem.word()),
      travelStyle: faker.helpers.arrayElement(Object.values(TravelStyle)),
      budget: faker.number.int({ min: 100, max: 10000 }),
      preferredDestinations: Array.from({ length: faker.number.int({ min: 1, max: 5 }) }, () => faker.location.city()),
      trustScore: faker.number.int({ min: 0, max: 100 }),
      isVerified: faker.datatype.boolean(),
      role: UserRole.USER,
      tags: Array.from({ length: faker.number.int({ min: 1, max: 5 }) }, () => faker.lorem.word()),
    });
    newUsers.push(user);
  }
  console.log(`Seeded ${newUsers.length} new users`);
  const totalUsers = await UserModel.countDocuments();
  console.log(`Total users in DB: ${totalUsers}`);

  // Get all existing users to create trips and groups for
  const allUsers = await UserModel.find();

  // Create 20 new fake trips
  const newTrips: any[] = [];
  for (let i = 0; i < 20; i++) {
    const creator = faker.helpers.arrayElement(allUsers);
    const startDate = faker.date.soon({ days: 30 });
    const endDate = faker.date.between({ from: startDate, to: new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000) });
    // Seed the trip, including the creator as an initial member
    const trip = await TripModel.create({
      createdBy: creator._id,
      destination: faker.location.city(),
      startDate,
      endDate,
      status: faker.helpers.arrayElement(Object.values(TripStatus)),
      maxParticipants: faker.number.int({ min: 1, max: 10 }),
      members: [
        { user: creator._id, status: MemberStatus.JOINED, joinedAt: startDate }
      ],
      itinerary: [],
    });
    newTrips.push(trip);
  }
  console.log(`Seeded ${newTrips.length} new trips`);
  const totalTrips = await TripModel.countDocuments();
  console.log(`Total trips in DB: ${totalTrips}`);

  // Get all existing trips to create groups for
  const allTrips = await TripModel.find();

  // Create 15 new fake groups
  const newGroups: any[] = [];
  for (let i = 0; i < 15; i++) {
    const trip = faker.helpers.arrayElement(allTrips);
    const owner = faker.helpers.arrayElement(allUsers);

    // Generate random group members (including the owner)
    const shuffledUsers = [...allUsers].sort(() => 0.5 - Math.random());
    const maxMembers = faker.number.int({ min: 2, max: 8 });
    const groupMembers = shuffledUsers.slice(0, Math.min(maxMembers - 1, allUsers.length - 1));

    // Ensure owner is in the members list
    const memberIds = [owner._id, ...groupMembers.map(u => u._id)];

    const group = await GroupModel.create({
      trip: trip._id,
      name: `${faker.word.adjective()} ${faker.word.noun()} Group`,
      owner: owner._id,
      members: memberIds,
      maxParticipants: maxMembers + 1, // +1 to account for the owner
    });
    newGroups.push(group);
  }
  console.log(`Seeded ${newGroups.length} new groups`);
  const totalGroups = await GroupModel.countDocuments();
  console.log(`Total groups in DB: ${totalGroups}`);

  await mongoose.disconnect();
  console.log('Disconnected from MongoDB');
}

main().catch((err) => {
  console.error('Seed script failed:', err);
  process.exit(1);
});
