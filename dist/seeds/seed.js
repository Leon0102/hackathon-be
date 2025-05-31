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
const group_schema_1 = require("../modules/groups/schema/group.schema");
const constants_1 = require("../constants");
async function main() {
    const uri = 'mongodb+srv://haphuchoan:9AAoyHqH0FvTDpkR@cluster0.7n65af.mongodb.net/';
    const dbName = 'nest-api-mongo-database';
    await mongoose_1.default.connect(uri, { dbName });
    console.log(`Connected to MongoDB: ${uri}, database: ${dbName}`);
    const UserModel = mongoose_1.default.model('Users', users_schema_1.UsersSchema);
    const TripModel = mongoose_1.default.model('Trips', trips_schema_1.TripsSchema);
    const GroupModel = mongoose_1.default.model('Group', group_schema_1.GroupSchema);
    const existingUserCount = await UserModel.countDocuments();
    const existingTripCount = await TripModel.countDocuments();
    const existingGroupCount = await GroupModel.countDocuments();
    console.log(`Existing data - Users: ${existingUserCount}, Trips: ${existingTripCount}, Groups: ${existingGroupCount}`);
    const newUsers = [];
    for (let i = 0; i < 50; i++) {
        const user = await UserModel.create({
            fullName: faker_1.faker.person.fullName(),
            email: faker_1.faker.internet.email().toLowerCase(),
            passwordHash: "123456",
            authProvider: constants_1.AuthProvider.LOCAL,
            profilePictureUrl: faker_1.faker.image.avatar(),
            age: faker_1.faker.number.int({ min: 18, max: 80 }),
            gender: faker_1.faker.helpers.arrayElement(Object.values(constants_1.Gender)),
            bio: faker_1.faker.lorem.sentence(),
            languages: Array.from({ length: faker_1.faker.number.int({ min: 1, max: 3 }) }, () => faker_1.faker.lorem.word()),
            travelStyle: faker_1.faker.helpers.arrayElement(Object.values(constants_1.TravelStyle)),
            budget: faker_1.faker.number.int({ min: 100, max: 10000 }),
            preferredDestinations: Array.from({ length: faker_1.faker.number.int({ min: 1, max: 5 }) }, () => faker_1.faker.location.city()),
            trustScore: faker_1.faker.number.int({ min: 0, max: 100 }),
            isVerified: faker_1.faker.datatype.boolean(),
            role: constants_1.UserRole.USER,
            tags: Array.from({ length: faker_1.faker.number.int({ min: 1, max: 5 }) }, () => faker_1.faker.lorem.word()),
        });
        newUsers.push(user);
    }
    console.log(`Seeded ${newUsers.length} new users`);
    const totalUsers = await UserModel.countDocuments();
    console.log(`Total users in DB: ${totalUsers}`);
    const allUsers = await UserModel.find();
    const newTrips = [];
    for (let i = 0; i < 20; i++) {
        const creator = faker_1.faker.helpers.arrayElement(allUsers);
        const startDate = faker_1.faker.date.soon({ days: 30 });
        const endDate = faker_1.faker.date.between({ from: startDate, to: new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000) });
        const trip = await TripModel.create({
            createdBy: creator._id,
            destination: faker_1.faker.location.city(),
            startDate,
            endDate,
            status: faker_1.faker.helpers.arrayElement(Object.values(constants_1.TripStatus)),
            maxParticipants: faker_1.faker.number.int({ min: 1, max: 10 }),
            members: [
                { user: creator._id, status: constants_1.MemberStatus.JOINED, joinedAt: startDate }
            ],
            itinerary: [],
        });
        newTrips.push(trip);
    }
    console.log(`Seeded ${newTrips.length} new trips`);
    const totalTrips = await TripModel.countDocuments();
    console.log(`Total trips in DB: ${totalTrips}`);
    const allTrips = await TripModel.find();
    const newGroups = [];
    for (let i = 0; i < 15; i++) {
        const trip = faker_1.faker.helpers.arrayElement(allTrips);
        const owner = faker_1.faker.helpers.arrayElement(allUsers);
        const shuffledUsers = [...allUsers].sort(() => 0.5 - Math.random());
        const maxMembers = faker_1.faker.number.int({ min: 2, max: 8 });
        const groupMembers = shuffledUsers.slice(0, Math.min(maxMembers - 1, allUsers.length - 1));
        const memberIds = [owner._id, ...groupMembers.map(u => u._id)];
        const group = await GroupModel.create({
            trip: trip._id,
            name: `${faker_1.faker.word.adjective()} ${faker_1.faker.word.noun()} Group`,
            owner: owner._id,
            members: memberIds,
            maxParticipants: maxMembers + 1,
        });
        newGroups.push(group);
    }
    console.log(`Seeded ${newGroups.length} new groups`);
    const totalGroups = await GroupModel.countDocuments();
    console.log(`Total groups in DB: ${totalGroups}`);
    await mongoose_1.default.disconnect();
    console.log('Disconnected from MongoDB');
}
main().catch((err) => {
    console.error('Seed script failed:', err);
    process.exit(1);
});
//# sourceMappingURL=seed.js.map