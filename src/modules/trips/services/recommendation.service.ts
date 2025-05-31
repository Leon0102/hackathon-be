import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  RecommendationLog,
  RecommendationType,
  RecommendationOutcome,
  RecommendationContext,
  UserInteraction
} from '../schema/recommendation-log.schema';
import { MemoryCacheService, CachedRecommendation, RecommendationCacheKey } from './memory-cache.service';
import { UsersService } from '../../users/users.service';
import { GroupsService } from '../../groups/groups.service';

export interface RecommendationRequest {
  userId: string;
  keyword: string;
  type: RecommendationType;
  context: Partial<RecommendationContext>;
  limit?: number;
  offset?: number;
  useCache?: boolean;
}

export interface RecommendationResponse {
  recommendations: CachedRecommendation[];
  total: number;
  cached: boolean;
  generatedAt: Date;
  analyticsId?: string;
}

export interface UserInteractionRequest {
  logId: string;
  outcome: RecommendationOutcome;
  timeSpentViewing?: number;
  metadata?: Record<string, any>;
}

@Injectable()
export class RecommendationService {
  private readonly logger = new Logger(RecommendationService.name);

  constructor(
    @InjectModel(RecommendationLog.name)
    private readonly recommendationLogModel: Model<RecommendationLog>,
    private readonly cacheService: MemoryCacheService,
    private readonly usersService: UsersService,
    private readonly groupsService: GroupsService
  ) {}

  /**
   * Generate recommendations with caching
   */
  async generateRecommendations(request: RecommendationRequest): Promise<RecommendationResponse> {
    const { userId, keyword, type, context, limit = 10, offset = 0, useCache = true } = request;

    // Create cache key
    const cacheKey: RecommendationCacheKey = {
      userId,
      type,
      context: context.source ?? 'default',
      filters: context.filters ?? {}
    };

    // Try to get from cache first
    if (useCache) {
      const cached = await this.cacheService.getCachedRecommendations(cacheKey);
      if (cached) {
        return {
          recommendations: cached.slice(offset, offset + limit),
          total: cached.length,
          cached: true,
          generatedAt: new Date()
        };
      }
    }

    // Generate fresh recommendations
    const recommendations = await this.generateFreshRecommendations(request);

    // Cache the results
    if (useCache && recommendations.length > 0) {
      await this.cacheService.cacheRecommendations(
        cacheKey,
        recommendations,
        this.getTTLForType(type)
      );
    }

    // Log the recommendation generation
    const log = await this.logRecommendation({
      user: new Types.ObjectId(userId),
      keyword,
      recommendationType: type,
      context: {
        source: context.source ?? 'api',
        filters: context.filters ?? {},
        pageNumber: Math.floor(offset / limit),
        positionInResults: offset,
        userAgent: context.userAgent,
        sessionId: context.sessionId
      },
      relevanceScore: this.calculateAverageRelevance(recommendations),
      tags: this.extractTags(keyword, type)
    });

    return {
      recommendations: recommendations.slice(offset, offset + limit),
      total: recommendations.length,
      cached: false,
      generatedAt: new Date(),
      analyticsId: log._id.toString()
    };
  }

  /**
   * Generate fresh recommendations based on type
   */
  private async generateFreshRecommendations(request: RecommendationRequest): Promise<CachedRecommendation[]> {
    const { userId, keyword, type, limit = 10 } = request;

    switch (type) {
      case RecommendationType.TRIP_MEMBERS:
        return this.generateTripMemberRecommendations(userId, keyword, limit);

      case RecommendationType.GROUPS:
        return this.generateGroupRecommendations(userId, keyword, limit);

      case RecommendationType.DESTINATIONS:
        return this.generateDestinationRecommendations(userId, keyword, limit);

      case RecommendationType.SIMILAR_USERS:
        return this.generateSimilarUserRecommendations(userId, keyword, limit);

      default:
        throw new Error(`Unsupported recommendation type: ${type}`);
    }
  }

  /**
   * Generate trip member recommendations
   */
  private async generateTripMemberRecommendations(
    userId: string,
    keyword: string,
    limit: number
  ): Promise<CachedRecommendation[]> {
    // Get user patterns for personalization
    const userPatterns = await this.cacheService.getUserPatterns(userId);

    // Find users based on keyword and user patterns
    const users = await this.usersService.searchUsersForRecommendations(
      keyword,
      userId,
      userPatterns,
      limit * 2 // Get more to filter and rank
    );

    return users.map((user, index) => ({
      id: user._id.toString(),
      type: 'user' as const,
      score: this.calculateUserRelevanceScore(user, keyword, userPatterns),
      metadata: {
        name: user.fullName,
        profilePicture: user.profilePicture,
        commonInterests: user.commonInterests ?? [],
        mutualConnections: user.mutualConnections ?? 0,
        lastActive: user.lastActiveAt
      },
      generatedAt: new Date()
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
  }

  /**
   * Generate group recommendations
   */
  private async generateGroupRecommendations(
    userId: string,
    keyword: string,
    limit: number
  ): Promise<CachedRecommendation[]> {
    const userPatterns = await this.cacheService.getUserPatterns(userId);

    const groups = await this.groupsService.searchGroupsForRecommendations(
      keyword,
      userId,
      userPatterns,
      limit * 2
    );

    return groups.map((group, index) => ({
      id: group._id.toString(),
      type: 'group' as const,
      score: this.calculateGroupRelevanceScore(group, keyword, userPatterns),
      metadata: {
        name: group.name,
        description: group.description,
        memberCount: group.memberCount ?? 0,
        isPublic: group.isPublic,
        tags: group.tags ?? [],
        recentActivity: group.lastActivityAt
      },
      generatedAt: new Date()
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
  }

  /**
   * Generate destination recommendations
   */
  private async generateDestinationRecommendations(
    userId: string,
    keyword: string,
    limit: number
  ): Promise<CachedRecommendation[]> {
    // This would integrate with a destinations service or external API
    // For now, returning mock data structure
    const destinations = await this.searchDestinations(keyword, userId, limit);

    return destinations.map((destination, index) => ({
      id: destination.id,
      type: 'trip' as const,
      score: destination.score,
      metadata: {
        name: destination.name,
        location: destination.location,
        description: destination.description,
        imageUrl: destination.imageUrl,
        avgRating: destination.avgRating,
        priceRange: destination.priceRange,
        popularSeasons: destination.popularSeasons
      },
      generatedAt: new Date()
    }));
  }

  /**
   * Generate similar user recommendations
   */
  private async generateSimilarUserRecommendations(
    userId: string,
    keyword: string,
    limit: number
  ): Promise<CachedRecommendation[]> {
    // Find users with similar interaction patterns
    const userPatterns = await this.cacheService.getUserPatterns(userId);
    const similarUsers = await this.findUsersWithSimilarPatterns(userId, userPatterns, limit);

    return similarUsers.map((user, index) => ({
      id: user._id.toString(),
      type: 'user' as const,
      score: user.similarityScore,
      metadata: {
        name: user.fullName,
        profilePicture: user.profilePicture,
        similarityReasons: user.similarityReasons,
        commonInterests: user.commonInterests ?? [],
        interactionCompatibility: user.interactionCompatibility
      },
      generatedAt: new Date()
    }));
  }

  /**
   * Log user interaction with recommendation
   */
  async logUserInteraction(request: UserInteractionRequest): Promise<void> {
    const { logId, outcome, timeSpentViewing = 0, metadata = {} } = request;

    try {
      const interaction: UserInteraction = {
        outcome,
        timestamp: new Date(),
        timeSpentViewing,
        metadata
      };

      await this.recommendationLogModel.findByIdAndUpdate(
        logId,
        {
          $push: { interactions: interaction },
          $set: { updatedAt: new Date() }
        }
      );

      this.logger.debug(`Logged interaction for recommendation: ${logId}`);

      // Update user patterns based on interaction
      await this.updateUserPatternsFromInteraction(logId, interaction);

    } catch (error) {
      this.logger.error(`Failed to log user interaction: ${error.message}`);
    }
  }

  /**
   * Get recommendation analytics
   */
  async getRecommendationAnalytics(userId?: string, days: number = 30): Promise<any> {
    const matchStage: any = {
      createdAt: {
        $gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000)
      }
    };

    if (userId) {
      matchStage.user = new Types.ObjectId(userId);
    }

    const analytics = await this.recommendationLogModel.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: {
            type: '$recommendationType',
            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }
          },
          count: { $sum: 1 },
          avgRelevanceScore: { $avg: '$relevanceScore' },
          avgClickThroughRate: { $avg: '$clickThroughRate' },
          avgConversionRate: { $avg: '$conversionRate' },
          totalInteractions: { $sum: { $size: '$interactions' } }
        }
      },
      {
        $group: {
          _id: '$_id.type',
          dailyStats: {
            $push: {
              date: '$_id.date',
              count: '$count',
              avgRelevanceScore: '$avgRelevanceScore',
              avgClickThroughRate: '$avgClickThroughRate',
              avgConversionRate: '$avgConversionRate',
              totalInteractions: '$totalInteractions'
            }
          },
          totalRecommendations: { $sum: '$count' },
          overallAvgRelevance: { $avg: '$avgRelevanceScore' },
          overallAvgCTR: { $avg: '$avgClickThroughRate' },
          overallAvgConversion: { $avg: '$avgConversionRate' }
        }
      }
    ]);

    return analytics;
  }

  /**
   * Get trending keywords and patterns
   */
  async getTrendingPatterns(type?: RecommendationType, days: number = 7): Promise<any> {
    const matchStage: any = {
      createdAt: {
        $gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000)
      }
    };

    if (type) {
      matchStage.recommendationType = type;
    }

    const trending = await this.recommendationLogModel.aggregate([
      { $match: matchStage },
      { $unwind: '$tags' },
      {
        $group: {
          _id: {
            keyword: '$keyword',
            tag: '$tags',
            type: '$recommendationType'
          },
          count: { $sum: 1 },
          avgRelevance: { $avg: '$relevanceScore' },
          avgCTR: { $avg: '$clickThroughRate' },
          successfulInteractions: {
            $sum: {
              $size: {
                $filter: {
                  input: '$interactions',
                  cond: {
                    $in: ['$$this.outcome', [RecommendationOutcome.CLICKED, RecommendationOutcome.JOINED]]
                  }
                }
              }
            }
          }
        }
      },
      { $sort: { count: -1, avgRelevance: -1 } },
      { $limit: 50 }
    ]);

    // Cache trending patterns
    if (trending.length > 0) {
      const trendingData = {
        keywords: trending.slice(0, 20).map(t => t._id.keyword),
        destinations: trending.filter(t => t._id.type === RecommendationType.DESTINATIONS)
          .slice(0, 10).map(t => t._id.keyword),
        popularTimes: {} // Would need additional time-based analysis
      };

      if (type) {
        await this.cacheService.cacheTrendingRecommendations(type, trendingData);
      }
    }

    return trending;
  }

  // Helper methods (private)
  private async logRecommendation(data: Partial<RecommendationLog>): Promise<RecommendationLog> {
    const log = new this.recommendationLogModel(data);
    return log.save();
  }

  private getTTLForType(type: RecommendationType): number {
    switch (type) {
      case RecommendationType.TRIP_MEMBERS:
        return 1800; // 30 minutes
      case RecommendationType.GROUPS:
        return 3600; // 1 hour
      case RecommendationType.DESTINATIONS:
        return 7200; // 2 hours
      case RecommendationType.SIMILAR_USERS:
        return 1800; // 30 minutes
      default:
        return 3600; // 1 hour default
    }
  }

  private calculateAverageRelevance(recommendations: CachedRecommendation[]): number {
    if (recommendations.length === 0) return 0;
    return recommendations.reduce((sum, rec) => sum + rec.score, 0) / recommendations.length;
  }

  private extractTags(keyword: string, type: RecommendationType): string[] {
    const tags: string[] = [type];

    // Add keyword-based tags
    if (keyword.includes('beach')) tags.push('beach', 'coastal');
    if (keyword.includes('mountain')) tags.push('mountain', 'adventure');
    if (keyword.includes('city')) tags.push('urban', 'culture');
    if (keyword.includes('food')) tags.push('culinary', 'dining');

    return tags;
  }

  private calculateUserRelevanceScore(user: any, keyword: string, userPatterns: any): number {
    let score = 0.5; // Base score

    // Keyword matching
    if (user.fullName?.toLowerCase().includes(keyword.toLowerCase())) score += 0.3;
    if (user.bio?.toLowerCase().includes(keyword.toLowerCase())) score += 0.2;

    // Pattern matching
    if (userPatterns?.topKeywords?.includes(keyword)) score += 0.3;

    // Common interests
    if (user.commonInterests?.length > 0) score += Math.min(user.commonInterests.length * 0.1, 0.4);

    // Mutual connections
    if (user.mutualConnections > 0) score += Math.min(user.mutualConnections * 0.05, 0.2);

    return Math.min(score, 1.0);
  }

  private calculateGroupRelevanceScore(group: any, keyword: string, userPatterns: any): number {
    let score = 0.5;

    if (group.name?.toLowerCase().includes(keyword.toLowerCase())) score += 0.4;
    if (group.description?.toLowerCase().includes(keyword.toLowerCase())) score += 0.2;

    if (group.tags?.some(tag => tag.toLowerCase().includes(keyword.toLowerCase()))) score += 0.3;

    // Active groups get bonus
    if (group.lastActivityAt && Date.now() - new Date(group.lastActivityAt).getTime() < 7 * 24 * 60 * 60 * 1000) {
      score += 0.1;
    }

    return Math.min(score, 1.0);
  }

  // Mock methods - would be replaced with actual implementations
  private async searchDestinations(keyword: string, userId: string, limit: number): Promise<any[]> {
    // Mock implementation
    return [];
  }

  private async findUsersWithSimilarPatterns(userId: string, userPatterns: any, limit: number): Promise<any[]> {
    // Mock implementation
    return [];
  }

  private async updateUserPatternsFromInteraction(logId: string, interaction: UserInteraction): Promise<void> {
    // Implementation would analyze the interaction and update user patterns cache
    this.logger.debug(`Updating user patterns from interaction: ${logId}`);
  }
}
