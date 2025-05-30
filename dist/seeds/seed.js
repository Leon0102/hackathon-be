"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const mongoose_1 = __importDefault(require("mongoose"));
const faker_1 = require("@faker-js/faker");
const users_schema_1 = require("../modules/users/schema/users.schema");
const trips_schema_1 = require("../modules/trips/schema/trips.schema");
const constants_1 = require("../constants");
async function main() {
    const uri = 'mongodb+srv://haphuchoan:9AAoyHqH0FvTDpkR@cluster0.7n65af.mongodb.net/';
    const dbName = 'nest-api-mongo-database';
    await mongoose_1.default.connect(uri, { dbName });
    console.log(`Connected to MongoDB: ${uri}, database: ${dbName}`);
    const UserModel = mongoose_1.default.model('Users', users_schema_1.UsersSchema);
    const TripModel = mongoose_1.default.model('Trips', trips_schema_1.TripsSchema);
    await UserModel.deleteMany({});
    await TripModel.deleteMany({});
    const users = [];
    for (let i = 0; i < 20; i++) {
        const user = await UserModel.create({
            fullName: faker_1.faker.name.fullName(),
            email: faker_1.faker.internet.email().toLowerCase(),
            passwordHash: "123456",
            authProvider: constants_1.AuthProvider.LOCAL,
            profilePictureUrl: faker_1.faker.image.avatar(),
            age: faker_1.faker.datatype.number({ min: 18, max: 80 }),
            gender: faker_1.faker.helpers.arrayElement(Object.values(constants_1.Gender)),
            bio: faker_1.faker.lorem.sentence(),
            languages: Array.from({ length: faker_1.faker.datatype.number({ min: 1, max: 3 }) }, () => faker_1.faker.lorem.word()),
            travelStyle: faker_1.faker.helpers.arrayElement(Object.values(constants_1.TravelStyle)),
            budget: faker_1.faker.datatype.number({ min: 100, max: 10000 }),
            preferredDestinations: Array.from({ length: faker_1.faker.datatype.number({ min: 1, max: 5 }) }, () => faker_1.faker.address.city()),
            trustScore: faker_1.faker.datatype.number({ min: 0, max: 100 }),
            isVerified: faker_1.faker.datatype.boolean(),
            role: constants_1.UserRole.USER,
            tags: Array.from({ length: faker_1.faker.datatype.number({ min: 1, max: 5 }) }, () => faker_1.faker.lorem.word()),
        });
        users.push(user);
    }
    console.log(`Seeded ${users.length} users`);
    const totalUsers = await UserModel.countDocuments();
    console.log(`Total users in DB: ${totalUsers}`);
    const trips = [];
    for (let i = 0; i < 10; i++) {
        const creator = faker_1.faker.helpers.arrayElement(users);
        const startDate = faker_1.faker.date.soon(30);
        const endDate = faker_1.faker.date.between(startDate, new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000));
        const trip = await TripModel.create({
            createdBy: creator._id,
            destination: faker_1.faker.address.city(),
            startDate,
            endDate,
            status: faker_1.faker.helpers.arrayElement(Object.values(constants_1.TripStatus)),
            maxParticipants: faker_1.faker.datatype.number({ min: 1, max: 10 }),
            members: [
                { user: creator._id, status: constants_1.MemberStatus.JOINED, joinedAt: startDate }
            ],
            itinerary: [],
        });
        trips.push(trip);
    }
    console.log(`Seeded ${trips.length} trips`);
    const totalTrips = await TripModel.countDocuments();
    console.log(`Total trips in DB: ${totalTrips}`);
    await mongoose_1.default.disconnect();
    console.log('Disconnected from MongoDB');
}
main().catch((err) => {
    console.error('Seed script failed:', err);
    process.exit(1);
});
//# sourceMappingURL=seed.js.map