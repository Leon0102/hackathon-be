import 'dotenv/config';
import mongoose from 'mongoose';
import { faker } from '@faker-js/faker';
import { UsersSchema } from '../modules/users/schema/users.schema';
import { TripsSchema } from '../modules/trips/schema/trips.schema';
import {
  AuthProvider,
  Gender,
  TravelStyle,
  UserRole,
  TripStatus,
  MemberStatus,
} from '../constants';

async function main() {
  const uri = 'mongodb+srv://linh:cjMxz7sNneA2nqsK@cluster0.lcp74ko.mongodb.net/?retryWrites=true&w=majority'
  const dbName = 'nest-api-mongo-database'
  await mongoose.connect(uri, { dbName });
  console.log(`Connected to MongoDB: ${uri}, database: ${dbName}`);

  const UserModel = mongoose.model('Users', UsersSchema);
  const TripModel = mongoose.model('Trips', TripsSchema);

  // Clear existing data
  await UserModel.deleteMany({});
  await TripModel.deleteMany({});

  // Create fake users
  const users: any[] = [];
  for (let i = 0; i < 20; i++) {
    const user = await UserModel.create({
      fullName: faker.name.fullName(),
      email: faker.internet.email().toLowerCase(),
      passwordHash: "123456",
      authProvider: AuthProvider.LOCAL,
      profilePictureUrl: faker.image.avatar(),
      age: faker.datatype.number({ min: 18, max: 80 }),
      gender: faker.helpers.arrayElement(Object.values(Gender)),
      bio: faker.lorem.sentence(),
      languages: Array.from({ length: faker.datatype.number({ min: 1, max: 3 }) }, () => faker.lorem.word()),
      travelStyle: faker.helpers.arrayElement(Object.values(TravelStyle)),
      budget: faker.datatype.number({ min: 100, max: 10000 }),
      preferredDestinations: Array.from({ length: faker.datatype.number({ min: 1, max: 5 }) }, () => faker.address.city()),
      trustScore: faker.datatype.number({ min: 0, max: 100 }),
      isVerified: faker.datatype.boolean(),
      role: faker.helpers.arrayElement(Object.values(UserRole)),
      tags: Array.from({ length: faker.datatype.number({ min: 1, max: 5 }) }, () => faker.lorem.word()),
    });
    users.push(user);
  }
  console.log(`Seeded ${users.length} users`);
  const totalUsers = await UserModel.countDocuments();
  console.log(`Total users in DB: ${totalUsers}`);

  // Create fake trips
  const trips: any[] = [];
  for (let i = 0; i < 10; i++) {
    const creator = faker.helpers.arrayElement(users);
    const startDate = faker.date.soon(30);
    const endDate = faker.date.between(startDate, new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000));
    const trip = await TripModel.create({
      createdBy: creator._id,
      destination: faker.address.city(),
      startDate,
      endDate,
      status: faker.helpers.arrayElement(Object.values(TripStatus)),
      maxParticipants: faker.datatype.number({ min: 1, max: 10 }),
      members: [],
      itinerary: [],
    });
    trips.push(trip);
  }
  console.log(`Seeded ${trips.length} trips`);
  const totalTrips = await TripModel.countDocuments();
  console.log(`Total trips in DB: ${totalTrips}`);

  await mongoose.disconnect();
  console.log('Disconnected from MongoDB');
}

main().catch((err) => {
  console.error('Seed script failed:', err);
  process.exit(1);
});
