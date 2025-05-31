import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

// Enum for recommendation types
export enum RecommendationType {
  TRIP_MEMBERS = 'trip_members',
  GROUPS = 'groups',
  DESTINATIONS = 'destinations',
  SIMILAR_USERS = 'similar_users',
  TRIPS = 'trips' // Added 'trips' as a valid enum value
}

// Enum for recommendation outcomes
export enum RecommendationOutcome {
  VIEWED = 'viewed',
  CLICKED = 'clicked',
  JOINED = 'joined',
  IGNORED = 'ignored',
  REJECTED = 'rejected'
}

// Subdocument for recommendation context
@Schema({ _id: false })
export class RecommendationContext {
  @Prop({ type: String, required: true })
  source: string; // 'search', 'browse', 'profile', 'ai_suggested'

  @Prop({ type: Object, default: {} })
  filters: Record<string, any>; // Applied filters during recommendation

  @Prop({ type: Number, default: 0 })
  pageNumber: number;

  @Prop({ type: Number, default: 0 })
  positionInResults: number; // Position in recommendation list

  @Prop({ type: String })
  userAgent?: string;

  @Prop({ type: String })
  sessionId?: string;
}

export const RecommendationContextSchema = SchemaFactory.createForClass(RecommendationContext);

// Subdocument for user interaction tracking
@Schema({ _id: false })
export class UserInteraction {
  @Prop({ type: String, enum: Object.values(RecommendationOutcome), required: true })
  outcome: RecommendationOutcome;

  @Prop({ type: Date, default: Date.now })
  timestamp: Date;

  @Prop({ type: Number, default: 0 })
  timeSpentViewing: number; // in seconds

  @Prop({ type: Object, default: {} })
  metadata: Record<string, any>; // Additional interaction data
}

export const UserInteractionSchema = SchemaFactory.createForClass(UserInteraction);

@Schema({ timestamps: true })
export class RecommendationLog extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Users', required: true })
  user: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Trips' })
  trip?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Users' })
  recommendedUser?: Types.ObjectId; // For member recommendations

  @Prop({ type: Types.ObjectId, ref: 'Group' })
  recommendedGroup?: Types.ObjectId; // For group recommendations

  @Prop({ type: String, required: true })
  keyword: string;

  @Prop({ type: String, enum: Object.values(RecommendationType), required: true })
  recommendationType: RecommendationType;

  @Prop({ type: RecommendationContextSchema, required: true })
  context: RecommendationContext;

  @Prop({ type: [UserInteractionSchema], default: [] })
  interactions: UserInteraction[];

  @Prop({ type: Number, default: 0, min: 0, max: 1 })
  relevanceScore: number; // AI-generated relevance score

  @Prop({ type: Number, default: 0, min: 0, max: 1 })
  clickThroughRate: number; // CTR for this type of recommendation

  @Prop({ type: Number, default: 0, min: 0, max: 1 })
  conversionRate: number; // Success rate (joined/clicked)

  @Prop({ type: [String], default: [] })
  tags: string[]; // For categorization and analysis

  @Prop({ type: Object, default: {} })
  aiMetadata: Record<string, any>; // AI model metadata, confidence scores, etc.

  @Prop({ type: Boolean, default: true })
  isActive: boolean; // For soft deletion

  @Prop({ type: Date })
  expiresAt?: Date; // TTL for old logs
}

export const RecommendationLogSchema = SchemaFactory.createForClass(RecommendationLog);

// Indexes for performance
RecommendationLogSchema.index({ user: 1, recommendationType: 1 });
RecommendationLogSchema.index({ user: 1, keyword: 1 });
RecommendationLogSchema.index({ trip: 1 });
RecommendationLogSchema.index({ recommendedUser: 1 });
RecommendationLogSchema.index({ recommendedGroup: 1 });
RecommendationLogSchema.index({ createdAt: -1 });
RecommendationLogSchema.index({ relevanceScore: -1 });
RecommendationLogSchema.index({ clickThroughRate: -1 });
RecommendationLogSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index
RecommendationLogSchema.index({ 'context.source': 1 });
RecommendationLogSchema.index({ tags: 1 });

// Compound indexes for analytics
RecommendationLogSchema.index({ user: 1, recommendationType: 1, createdAt: -1 });
RecommendationLogSchema.index({ keyword: 1, recommendationType: 1, relevanceScore: -1 });

// Text index for keyword search
RecommendationLogSchema.index({ keyword: 'text', tags: 'text' });

// Virtual for success rate
RecommendationLogSchema.virtual('successRate').get(function() {
  const successfulInteractions = this.interactions.filter(i =>
    [RecommendationOutcome.JOINED, RecommendationOutcome.CLICKED].includes(i.outcome)
  ).length;
  return this.interactions.length > 0 ? successfulInteractions / this.interactions.length : 0;
});

// Virtual for latest interaction
RecommendationLogSchema.virtual('latestInteraction').get(function() {
  return this.interactions.length > 0
    ? this.interactions[this.interactions.length - 1]
    : null;
});

// Pre-save middleware for analytics calculation
RecommendationLogSchema.pre('save', function(next) {
  // Calculate CTR and conversion rate
  const totalInteractions = this.interactions.length;
  if (totalInteractions > 0) {
    const clicks = this.interactions.filter(i =>
      [RecommendationOutcome.CLICKED, RecommendationOutcome.JOINED].includes(i.outcome)
    ).length;
    const conversions = this.interactions.filter(i =>
      i.outcome === RecommendationOutcome.JOINED
    ).length;

    this.clickThroughRate = clicks / totalInteractions;
    this.conversionRate = conversions / totalInteractions;
  }

  // Set expiration (30 days from creation for analytics)
  if (this.isNew && !this.expiresAt) {
    this.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  }

  next();
});
