import 'dotenv/config';
import mongoose from 'mongoose';
import { faker } from '@faker-js/faker';
import { UsersSchema } from '../modules/users/schema/users.schema';
import { TripsSchema } from '../modules/trips/schema/trips.schema';
import { GroupSchema } from '../modules/groups/schema/group.schema';
import { ItinerarySchema } from '../modules/itinerary/schema/itinerary.schema';
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
  const ItineraryModel = mongoose.model('Itinerary', ItinerarySchema);

  // Clear all existing data
  console.log('🗑️  Clearing all existing data...');
  await Promise.all([
    UserModel.deleteMany({}),
    TripModel.deleteMany({}),
    GroupModel.deleteMany({}),
    ItineraryModel.deleteMany({})
  ]);
  console.log('✅ All existing data cleared');

  // Generate travel-themed tags for users
  const travelTags = [
    'adventure', 'backpacking', 'luxury', 'budget', 'solo', 'group',
    'photography', 'foodie', 'culture', 'history', 'nature', 'beach',
    'mountains', 'cities', 'countryside', 'art', 'music', 'sports',
    'hiking', 'diving', 'skiing', 'surfing', 'yoga', 'wellness'
  ];

  // Generate diverse travel destinations
  const destinations = [
    'Tokyo, Japan', 'Paris, France', 'New York, USA', 'Bali, Indonesia',
    'Barcelona, Spain', 'Thailand', 'Iceland', 'Norway', 'Peru', 'Morocco',
    'Vietnam', 'Greece', 'Turkey', 'Egypt', 'Kenya', 'Australia',
    'New Zealand', 'Argentina', 'Chile', 'India', 'Nepal', 'Bhutan',
    'Sri Lanka', 'Cambodia', 'Laos', 'Myanmar', 'Philippines', 'Malaysia'
  ];

  // Create 100 realistic fake users
  console.log('👥 Creating users...');
  const users: any[] = [];
  for (let i = 0; i < 100; i++) {
    const gender = faker.helpers.arrayElement(Object.values(Gender));
    const user = await UserModel.create({
      fullName: faker.person.fullName(),
      email: faker.internet.email().toLowerCase(),
      passwordHash: "123456",
      authProvider: AuthProvider.LOCAL,
      profilePictureUrl: faker.image.avatar(),
      age: faker.number.int({ min: 18, max: 65 }),
      gender: gender,
      bio: faker.lorem.sentences(faker.number.int({ min: 1, max: 3 })),
      languages: faker.helpers.arrayElements(['English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese', 'Japanese', 'Mandarin', 'Korean', 'Hindi'], { min: 1, max: 4 }),
      travelStyle: faker.helpers.arrayElement(Object.values(TravelStyle)),
      budget: faker.number.int({ min: 500, max: 15000 }),
      preferredDestinations: faker.helpers.arrayElements(destinations, { min: 2, max: 6 }),
      trustScore: faker.number.int({ min: 60, max: 100 }),
      isVerified: faker.datatype.boolean({ probability: 0.7 }),
      role: UserRole.USER,
      tags: faker.helpers.arrayElements(travelTags, { min: 3, max: 8 }),
    });
    users.push(user);
  }
  console.log(`✅ Created ${users.length} users`);

  // Create 30 diverse trips with proper group linkage
  console.log('🌍 Creating trips and linked groups...');
  const trips: any[] = [];
  const groups: any[] = [];

  for (let i = 0; i < 30; i++) {
    const creator = faker.helpers.arrayElement(users);
    const destination = faker.helpers.arrayElement(destinations);
    const startDate = faker.date.between({
      from: new Date(Date.now() + 24 * 60 * 60 * 1000), // Start from tomorrow
      to: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000)   // Up to 120 days from now
    });
    const tripDuration = faker.number.int({ min: 3, max: 21 }); // 3-21 days
    const endDate = new Date(startDate.getTime() + tripDuration * 24 * 60 * 60 * 1000);
    const maxParticipants = faker.number.int({ min: 4, max: 12 });

    // Create the trip first
    const trip = await TripModel.create({
      createdBy: creator._id,
      destination: destination,
      startDate,
      endDate,
      status: faker.helpers.arrayElement([TripStatus.OPEN, TripStatus.OPEN, TripStatus.OPEN, TripStatus.CLOSED]), // 75% open
      maxParticipants: maxParticipants,
      members: [
        { user: creator._id, status: MemberStatus.JOINED, joinedAt: new Date(Date.now() - faker.number.int({ min: 1, max: 30 }) * 24 * 60 * 60 * 1000) }
      ],
      itinerary: [], // Will be populated later
      description: faker.lorem.paragraphs(faker.number.int({ min: 1, max: 3 })),
      requirements: faker.helpers.arrayElements([
        'Valid passport required',
        'Vaccinations may be required',
        'Travel insurance recommended',
        'Moderate fitness level needed',
        'Swimming ability required',
        'Previous hiking experience preferred'
      ], { min: 1, max: 3 })
    });

    // Add 2-8 additional members to the trip
    const additionalMemberCount = Math.min(
      faker.number.int({ min: 2, max: 8 }),
      maxParticipants - 1, // -1 for creator
      users.length - 1    // -1 for creator
    );

    const potentialMembers = users.filter(u => u._id.toString() !== creator._id.toString());
    const selectedMembers = faker.helpers.arrayElements(potentialMembers, additionalMemberCount);

    const additionalMembers = selectedMembers.map(member => ({
      user: member._id,
      status: faker.helpers.arrayElement([
        MemberStatus.JOINED, MemberStatus.JOINED, MemberStatus.JOINED, // 75% joined
        MemberStatus.REQUESTED, MemberStatus.INVITED
      ]),
      joinedAt: new Date(Date.now() - faker.number.int({ min: 1, max: 20 }) * 24 * 60 * 60 * 1000)
    }));

    trip.members.push(...additionalMembers);
    await trip.save();

    // Create automatically linked group for this trip
    const groupMembers = [creator._id, ...selectedMembers.map(m => m._id)];
    const group = await GroupModel.create({
      trip: trip._id,
      name: `${destination.split(',')[0]} Travelers`,
      owner: creator._id,
      members: groupMembers,
      maxParticipants: maxParticipants,
      description: `Join us for an amazing trip to ${destination}!`
    });

    // Update trip with group reference
    trip.group = group._id;
    await trip.save();

    trips.push(trip);
    groups.push(group);
  }
  console.log(`✅ Created ${trips.length} trips with linked groups`);

  // Create comprehensive itineraries for each trip
  console.log('📅 Creating detailed itineraries...');
  let totalItineraries = 0;

  for (const trip of trips) {
    const tripDuration = Math.ceil((trip.endDate - trip.startDate) / (1000 * 60 * 60 * 24));

    for (let day = 1; day <= tripDuration; day++) {
      const itineraryDate = new Date(trip.startDate.getTime() + (day - 1) * 24 * 60 * 60 * 1000);

      // Generate 3-6 activities per day
      const activities: Array<{time: string, description: string, location: string}> = [];
      const activityCount = faker.number.int({ min: 3, max: 6 });

      const activityTemplates = [
        { time: '08:00', type: 'breakfast', locations: ['Hotel Restaurant', 'Local Café', 'Street Market'] },
        { time: '09:30', type: 'morning', locations: ['Museum', 'Historical Site', 'Park', 'Temple', 'Market'] },
        { time: '12:00', type: 'lunch', locations: ['Local Restaurant', 'Food Market', 'Rooftop Dining'] },
        { time: '14:00', type: 'afternoon', locations: ['Gallery', 'Shopping District', 'Beach', 'Hiking Trail'] },
        { time: '16:30', type: 'activity', locations: ['Adventure Tour', 'Cultural Experience', 'Spa', 'Workshop'] },
        { time: '19:00', type: 'dinner', locations: ['Traditional Restaurant', 'Fine Dining', 'Night Market'] },
        { time: '21:00', type: 'evening', locations: ['Local Bar', 'Cultural Show', 'Night Walk', 'Hotel Lounge'] }
      ];

      const selectedTemplates = faker.helpers.arrayElements(activityTemplates, activityCount);

      for (const template of selectedTemplates) {
        activities.push({
          time: template.time,
          description: `${template.type === 'breakfast' ? 'Breakfast at' :
                        template.type === 'lunch' ? 'Lunch at' :
                        template.type === 'dinner' ? 'Dinner at' :
                        'Visit'} ${faker.helpers.arrayElement(template.locations)}`,
          location: faker.helpers.arrayElement(template.locations)
        });
      }

      // Sort activities by time
      activities.sort((a, b) => a.time.localeCompare(b.time));

      const itinerary = await ItineraryModel.create({
        tripId: trip._id,
        day: day,
        date: itineraryDate,
        activities: activities
      });

      // Add itinerary reference to trip
      trip.itinerary.push(itinerary._id);
      totalItineraries++;
    }

    // Save trip with itinerary references
    await trip.save();
  }

  console.log(`✅ Created ${totalItineraries} detailed itinerary entries`);

  // Print summary
  const finalCounts = {
    users: await UserModel.countDocuments(),
    trips: await TripModel.countDocuments(),
    groups: await GroupModel.countDocuments(),
    itineraries: await ItineraryModel.countDocuments()
  };

  console.log('\n🎉 Seeding completed successfully!');
  console.log('📊 Final counts:');
  console.log(`   Users: ${finalCounts.users}`);
  console.log(`   Trips: ${finalCounts.trips}`);
  console.log(`   Groups: ${finalCounts.groups}`);
  console.log(`   Itineraries: ${finalCounts.itineraries}`);
  console.log('\n✨ Database is now populated with comprehensive fake data!');

  await mongoose.disconnect();
  console.log('🔌 Disconnected from MongoDB');
}

main().catch((err) => {
  console.error('❌ Seed script failed:', err);
  process.exit(1);
});
