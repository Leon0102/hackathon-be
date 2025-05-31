import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { faker } from '@faker-js/faker';
import { Itinerary, ItineraryDocument, Activity } from './schema/itinerary.schema';

// DTO interfaces for fake itinerary generation
export interface GenerateFakeItineraryDto {
    tripId: string;
    destination: string;
    startDate: Date;
    endDate: Date;
    numberOfDays: number;
    travelStyle?: 'adventure' | 'luxury' | 'budget' | 'cultural' | 'relaxed';
    interests?: string[];
}

export interface FakeActivityDto {
    time: string;
    description: string;
    location: string;
    imageUrl?: string;
}

export interface DayItinerary {
    day: number;
    date: string;
    activities: FakeActivityDto[];
}

export interface FakeItineraryResponse {
    tripId: string;
    destination: string;
    totalDays: number;
    itineraries: DayItinerary[];
}

@Injectable()
export class ItineraryService {
    constructor(
        @InjectModel(Itinerary.name) private readonly itineraryModel: Model<ItineraryDocument>
    ) {}

    // Travel image URLs for different categories
    private readonly travelImages = {
        restaurants: [
            'https://images.unsplash.com/photo-1514933651103-005eec06c04b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
            'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
            'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
        ],
        attractions: [
            'https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
            'https://images.unsplash.com/photo-1488646953014-85cb44e25828?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
            'https://images.unsplash.com/photo-1471919743851-c4df8b6ee133?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
        ],
        museums: [
            'https://images.unsplash.com/photo-1554907984-15263bfd63bd?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
            'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
            'https://images.unsplash.com/photo-1594736797933-d0711ba50a6d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
        ],
        parks: [
            'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
            'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
            'https://images.unsplash.com/photo-1448375240586-882707db888b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
        ],
        shopping: [
            'https://images.unsplash.com/photo-1472851294608-062f824d29cc?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
            'https://images.unsplash.com/photo-1516321497487-e288fb19713f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
            'https://images.unsplash.com/photo-1563013544-824ae1b704d3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
        ],
        nightlife: [
            'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
            'https://images.unsplash.com/photo-1486328228599-85db465b07ad?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
            'https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
        ]
    };

    /**
     * Generate fake itinerary with travel images
     */
    async generateFakeItinerary(dto: GenerateFakeItineraryDto): Promise<FakeItineraryResponse> {
        const { tripId, destination, startDate, numberOfDays, travelStyle = 'cultural', interests = [] } = dto;

        const itineraries: DayItinerary[] = [];
        const currentDate = new Date(startDate);

        for (let day = 1; day <= numberOfDays; day++) {
            const activities = this.generateActivitiesForDay(day, destination, travelStyle, interests);

            itineraries.push({
                day,
                date: currentDate.toISOString().split('T')[0],
                activities
            });

            currentDate.setDate(currentDate.getDate() + 1);
        }

        return {
            tripId,
            destination,
            totalDays: numberOfDays,
            itineraries
        };
    }

    /**
     * Generate activities for a specific day
     */
    private generateActivitiesForDay(day: number, destination: string, travelStyle: string, interests: string[]): FakeActivityDto[] {
        const activities: FakeActivityDto[] = [];
        const times = ['09:00', '11:30', '14:00', '16:30', '19:00', '21:00'];

        // Morning activity
        activities.push({
            time: times[0],
            description: this.generateActivityDescription('morning', destination, travelStyle),
            location: this.generateLocationName(destination),
            imageUrl: this.getRandomImageUrl('attractions')
        });

        // Late morning activity
        activities.push({
            time: times[1],
            description: this.generateActivityDescription('museum', destination, travelStyle),
            location: this.generateLocationName(destination, 'museum'),
            imageUrl: this.getRandomImageUrl('museums')
        });

        // Lunch
        activities.push({
            time: times[2],
            description: this.generateActivityDescription('lunch', destination, travelStyle),
            location: this.generateLocationName(destination, 'restaurant'),
            imageUrl: this.getRandomImageUrl('restaurants')
        });

        // Afternoon activity
        activities.push({
            time: times[3],
            description: this.generateActivityDescription('afternoon', destination, travelStyle),
            location: this.generateLocationName(destination),
            imageUrl: this.getRandomImageUrl(interests.includes('shopping') ? 'shopping' : 'parks')
        });

        // Dinner
        activities.push({
            time: times[4],
            description: this.generateActivityDescription('dinner', destination, travelStyle),
            location: this.generateLocationName(destination, 'restaurant'),
            imageUrl: this.getRandomImageUrl('restaurants')
        });

        // Evening activity (optional)
        if (Math.random() > 0.3) {
            activities.push({
                time: times[5],
                description: this.generateActivityDescription('evening', destination, travelStyle),
                location: this.generateLocationName(destination, 'nightlife'),
                imageUrl: this.getRandomImageUrl('nightlife')
            });
        }

        return activities;
    }

    /**
     * Generate activity description based on time and style
     */
    private generateActivityDescription(timeOfDay: string, destination: string, travelStyle: string): string {
        const descriptions: Record<string, string[]> = {
            morning: [
                `Explore the historic ${destination} old quarter and discover ancient architecture`,
                `Visit ${destination}'s iconic landmark and learn about local history`,
                `Take a guided walking tour through ${destination}'s cultural district`,
                `Enjoy sunrise views from ${destination}'s famous viewpoint`
            ],
            museum: [
                `Visit the ${destination} National Museum of Art and Culture`,
                `Explore the ${destination} History Museum and archaeological exhibits`,
                `Discover local traditions at ${destination} Folk Museum`,
                `Tour the ${destination} Contemporary Art Gallery`
            ],
            lunch: [
                `Savor authentic local cuisine at a traditional ${destination} restaurant`,
                `Try street food specialties at ${destination}'s bustling food market`,
                `Enjoy a fine dining experience featuring ${destination} fusion cuisine`,
                `Lunch at a rooftop restaurant with panoramic views of ${destination}`
            ],
            afternoon: [
                `Shop for local handicrafts and souvenirs in ${destination}'s artisan quarter`,
                `Relax in ${destination}'s beautiful central park and gardens`,
                `Take a boat tour around ${destination}'s scenic waterways`,
                `Visit ${destination}'s vibrant local markets and interact with vendors`
            ],
            dinner: [
                `Dine at ${destination}'s award-winning restaurant with local specialties`,
                `Experience a traditional ${destination} dinner with cultural show`,
                `Enjoy seafood delicacies at ${destination}'s waterfront restaurant`,
                `Taste exotic flavors at ${destination}'s night food market`
            ],
            evening: [
                `Experience ${destination}'s vibrant nightlife scene`,
                `Attend a traditional cultural performance in ${destination}`,
                `Take an evening stroll through ${destination}'s illuminated historic center`,
                `Enjoy cocktails at ${destination}'s rooftop bar with city views`
            ]
        };

        const options = descriptions[timeOfDay] ?? descriptions.morning;
        return faker.helpers.arrayElement(options);
    }

    /**
     * Generate location names
     */
    private generateLocationName(destination: string, type: string = 'default'): string {
        const prefixes: Record<string, string[]> = {
            restaurant: ['The', 'La', 'Café', 'Restaurant', 'Bistro'],
            museum: ['National', 'Royal', 'Historic', 'Modern'],
            nightlife: ['The', 'Club', 'Bar', 'Lounge'],
            default: ['Central', 'Old', 'Historic', 'Royal', 'Grand']
        };

        const suffixes: Record<string, string[]> = {
            restaurant: ['Kitchen', 'Table', 'House', 'Garden', 'Terrace'],
            museum: ['Museum', 'Gallery', 'Center', 'Hall', 'Palace'],
            nightlife: ['Club', 'Bar', 'Lounge', 'Pub', 'Terrace'],
            default: ['Plaza', 'Square', 'Street', 'District', 'Quarter']
        };

        const prefix = faker.helpers.arrayElement(prefixes[type] ?? prefixes.default);
        const suffix = faker.helpers.arrayElement(suffixes[type] ?? suffixes.default);

        return `${prefix} ${destination} ${suffix}`;
    }

    /**
     * Get random image URL from category
     */
    private getRandomImageUrl(category: string): string {
        const images = this.travelImages[category as keyof typeof this.travelImages] ?? this.travelImages.attractions;
        return faker.helpers.arrayElement(images);
    }

    /**
     * Save fake itinerary to database
     */
    async saveFakeItineraryToDatabase(fakeItinerary: FakeItineraryResponse): Promise<ItineraryDocument[]> {
        const savedItineraries: ItineraryDocument[] = [];

        // First, delete existing itineraries for this trip
        await this.itineraryModel.deleteMany({ tripId: new Types.ObjectId(fakeItinerary.tripId) });

        for (const dayItinerary of fakeItinerary.itineraries) {
            const activities: Activity[] = dayItinerary.activities.map(activity => ({
                time: activity.time,
                description: activity.description,
                location: activity.location
            }));

            const itinerary = new this.itineraryModel({
                tripId: new Types.ObjectId(fakeItinerary.tripId),
                day: dayItinerary.day,
                date: new Date(dayItinerary.date),
                activities
            });

            const saved = await itinerary.save();
            savedItineraries.push(saved);
        }

        return savedItineraries;
    }

    /**
     * Generate and save fake itineraries for all trips without itineraries
     */
    async generateFakeItinerariesForAllTrips(): Promise<{
        processedTrips: number;
        generatedItineraries: number;
        errors: string[]
    }> {
        // Get the Trips model from the database connection
        const TripsModel = this.itineraryModel.db.model('Trips');

        const trips = await TripsModel.find({}).lean();
        let processedTrips = 0;
        let generatedItineraries = 0;
        const errors: string[] = [];

        for (const trip of trips) {
            try {
                // Check if trip already has itineraries
                const existingItineraries = await this.itineraryModel.countDocuments({
                    tripId: trip._id
                });

                if (existingItineraries > 0) {
                    continue; // Skip trips that already have itineraries
                }

                // Handle date adjustments for trips with past dates
                let startDate = new Date(trip.startDate);
                let endDate = new Date(trip.endDate);
                const today = new Date();
                today.setHours(0, 0, 0, 0); // Set to start of today

                // If trip dates are in the past, adjust them to start from today
                if (startDate < today) {
                    const originalDuration = endDate.getTime() - startDate.getTime();
                    startDate = new Date(today);
                    endDate = new Date(today.getTime() + originalDuration);
                }

                // Calculate number of days
                const numberOfDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

                if (numberOfDays <= 0 || numberOfDays > 30) {
                    errors.push(`Trip ${trip._id}: Invalid date range (${numberOfDays} days)`);
                    continue;
                }

                // Generate fake itinerary with adjusted dates
                const fakeItinerary = await this.generateFakeItinerary({
                    tripId: trip._id.toString(),
                    destination: trip.destination,
                    startDate: startDate,
                    endDate: endDate,
                    numberOfDays: numberOfDays,
                    travelStyle: faker.helpers.arrayElement(['adventure', 'luxury', 'budget', 'cultural', 'relaxed']),
                    interests: trip.interests ?? []
                });

                // Save to database
                await this.saveFakeItineraryToDatabase(fakeItinerary);

                processedTrips++;
                generatedItineraries += fakeItinerary.itineraries.length;

            } catch (error) {
                errors.push(`Trip ${trip._id}: ${error.message}`);
            }
        }

        return {
            processedTrips,
            generatedItineraries,
            errors
        };
    }

    /**
     * Get itineraries for a specific trip
     */
    async getItinerariesByTripId(tripId: string): Promise<ItineraryDocument[]> {
        if (!Types.ObjectId.isValid(tripId)) {
            throw new BadRequestException('Invalid trip ID format');
        }

        return await this.itineraryModel
            .find({ tripId: new Types.ObjectId(tripId) })
            .sort({ day: 1 })
            .exec();
    }

    /**
     * Update a specific itinerary
     */
    async updateItinerary(itineraryId: string, activities: Activity[]): Promise<ItineraryDocument> {
        if (!Types.ObjectId.isValid(itineraryId)) {
            throw new BadRequestException('Invalid itinerary ID format');
        }

        const updated = await this.itineraryModel
            .findByIdAndUpdate(
                itineraryId,
                { activities },
                { new: true }
            )
            .exec();

        if (!updated) {
            throw new NotFoundException('Itinerary not found');
        }

        return updated;
    }

    /**
     * Delete itinerary for a trip
     */
    async deleteItinerariesByTripId(tripId: string): Promise<{ deletedCount: number }> {
        if (!Types.ObjectId.isValid(tripId)) {
            throw new BadRequestException('Invalid trip ID format');
        }

        const result = await this.itineraryModel
            .deleteMany({ tripId: new Types.ObjectId(tripId) })
            .exec();

        return { deletedCount: result.deletedCount };
    }
}
