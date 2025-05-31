import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { RecommendationService, RecommendationRequest } from '../services/recommendation.service';
import { MemoryCacheService } from '../services/memory-cache.service';
import { RecommendationType, RecommendationOutcome } from '../schema/recommendation-log.schema';
import { AuthGuard } from '../../../guards/auth.guard';
import { AuthUser } from '../../../decorators/auth-user.decorator';
import { Users } from '../../users/schema/users.schema';

class RecommendationRequestDto {
  keyword: string;
  type: RecommendationType;
  source?: string;
  filters?: Record<string, any>;
  limit?: number;
  offset?: number;
  useCache?: boolean;
  userAgent?: string;
  sessionId?: string;
}

class UserInteractionDto {
  logId: string;
  outcome: RecommendationOutcome;
  timeSpentViewing?: number;
  metadata?: Record<string, any>;
}

@ApiTags('Recommendations')
@Controller('recommendations')
@UseGuards(AuthGuard())
@ApiBearerAuth()
export class RecommendationController {
  private readonly logger = new Logger(RecommendationController.name);

  constructor(
    private readonly recommendationService: RecommendationService,
    private readonly cacheService: MemoryCacheService
  ) {}

  @Post('generate')
  @ApiOperation({
    summary: 'Generate personalized recommendations',
    description: 'Generate recommendations based on user preferences, keywords, and context with caching support'
  })
  @ApiResponse({
    status: 200,
    description: 'Recommendations generated successfully',
    schema: {
      type: 'object',
      properties: {
        recommendations: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              type: { type: 'string', enum: ['user', 'trip', 'group'] },
              score: { type: 'number' },
              metadata: { type: 'object' },
              generatedAt: { type: 'string', format: 'date-time' }
            }
          }
        },
        total: { type: 'number' },
        cached: { type: 'boolean' },
        generatedAt: { type: 'string', format: 'date-time' },
        analyticsId: { type: 'string' }
      }
    }
  })
  async generateRecommendations(
    @AuthUser() user: Users,
    @Body() requestDto: RecommendationRequestDto
  ) {
    try {
      const request: RecommendationRequest = {
        userId: user._id.toString(),
        keyword: requestDto.keyword,
        type: requestDto.type,
        context: {
          source: requestDto.source ?? 'api',
          filters: requestDto.filters ?? {},
          userAgent: requestDto.userAgent,
          sessionId: requestDto.sessionId
        },
        limit: requestDto.limit ?? 10,
        offset: requestDto.offset ?? 0,
        useCache: requestDto.useCache !== false
      };

      const result = await this.recommendationService.generateRecommendations(request);

      this.logger.log(`Generated ${result.recommendations.length} recommendations for user ${user._id} (cached: ${result.cached})`);

      return {
        success: true,
        data: result
      };
    } catch (error) {
      this.logger.error(`Failed to generate recommendations: ${error.message}`);
      throw error;
    }
  }

  @Post('interactions')
  @ApiOperation({
    summary: 'Log user interaction with recommendation',
    description: 'Track user interactions (views, clicks, joins) for analytics and personalization'
  })
  @ApiResponse({ status: 200, description: 'Interaction logged successfully' })
  async logUserInteraction(
    @AuthUser() user: Users,
    @Body() interactionDto: UserInteractionDto
  ) {
    try {
      await this.recommendationService.logUserInteraction(interactionDto);

      this.logger.log(`Logged interaction for user ${user._id}: ${interactionDto.outcome}`);

      return {
        success: true,
        message: 'Interaction logged successfully'
      };
    } catch (error) {
      this.logger.error(`Failed to log interaction: ${error.message}`);
      throw error;
    }
  }

  @Get('analytics')
  @ApiOperation({
    summary: 'Get recommendation analytics',
    description: 'Retrieve analytics data for recommendations including CTR, conversion rates, and trends'
  })
  @ApiQuery({ name: 'days', required: false, description: 'Number of days to analyze (default: 30)' })
  @ApiResponse({
    status: 200,
    description: 'Analytics data retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              _id: { type: 'string' },
              dailyStats: { type: 'array' },
              totalRecommendations: { type: 'number' },
              overallAvgRelevance: { type: 'number' },
              overallAvgCTR: { type: 'number' },
              overallAvgConversion: { type: 'number' }
            }
          }
        }
      }
    }
  })
  async getAnalytics(
    @AuthUser() user: Users,
    @Query('days') days?: string
  ) {
    try {
      const daysNum = days ? parseInt(days, 10) : 30;
      const analytics = await this.recommendationService.getRecommendationAnalytics(
        user._id.toString(),
        daysNum
      );

      return {
        success: true,
        data: analytics
      };
    } catch (error) {
      this.logger.error(`Failed to get analytics: ${error.message}`);
      throw error;
    }
  }

  @Get('analytics/admin')
  @ApiOperation({
    summary: 'Get global recommendation analytics (Admin only)',
    description: 'Retrieve global analytics data across all users'
  })
  @ApiQuery({ name: 'days', required: false, description: 'Number of days to analyze (default: 30)' })
  async getGlobalAnalytics(
    @Query('days') days?: string
  ) {
    try {
      const daysNum = days ? parseInt(days, 10) : 30;
      const analytics = await this.recommendationService.getRecommendationAnalytics(
        undefined, // No specific user
        daysNum
      );

      return {
        success: true,
        data: analytics
      };
    } catch (error) {
      this.logger.error(`Failed to get global analytics: ${error.message}`);
      throw error;
    }
  }

  @Get('trending')
  @ApiOperation({
    summary: 'Get trending patterns and keywords',
    description: 'Retrieve trending search patterns, keywords, and popular recommendations'
  })
  @ApiQuery({ name: 'type', required: false, enum: RecommendationType, description: 'Filter by recommendation type' })
  @ApiQuery({ name: 'days', required: false, description: 'Number of days to analyze (default: 7)' })
  @ApiResponse({
    status: 200,
    description: 'Trending patterns retrieved successfully'
  })
  async getTrendingPatterns(
    @Query('type') type?: RecommendationType,
    @Query('days') days?: string
  ) {
    try {
      const daysNum = days ? parseInt(days, 10) : 7;
      const trending = await this.recommendationService.getTrendingPatterns(type, daysNum);

      return {
        success: true,
        data: trending
      };
    } catch (error) {
      this.logger.error(`Failed to get trending patterns: ${error.message}`);
      throw error;
    }
  }

  @Get('types')
  @ApiOperation({
    summary: 'Get available recommendation types',
    description: 'Retrieve all available recommendation types with descriptions'
  })
  @ApiResponse({
    status: 200,
    description: 'Recommendation types retrieved successfully'
  })
  async getRecommendationTypes() {
    const types = Object.values(RecommendationType).map(type => ({
      value: type,
      label: this.getTypeLabel(type),
      description: this.getTypeDescription(type)
    }));

    return {
      success: true,
      data: types
    };
  }

  @Get('outcomes')
  @ApiOperation({
    summary: 'Get available interaction outcomes',
    description: 'Retrieve all available user interaction outcomes for logging'
  })
  @ApiResponse({
    status: 200,
    description: 'Interaction outcomes retrieved successfully'
  })
  async getInteractionOutcomes() {
    const outcomes = Object.values(RecommendationOutcome).map(outcome => ({
      value: outcome,
      label: this.getOutcomeLabel(outcome),
      description: this.getOutcomeDescription(outcome)
    }));

    return {
      success: true,
      data: outcomes
    };
  }

  @Delete('cache/user')
  @ApiOperation({
    summary: 'Clear user recommendation cache',
    description: 'Clear all cached recommendations for the current user'
  })
  @ApiResponse({ status: 200, description: 'Cache cleared successfully' })
  async clearUserCache(@AuthUser() user: Users) {
    try {
      await this.cacheService.invalidateUserCache(user._id.toString());

      this.logger.log(`Cleared cache for user ${user._id}`);

      return {
        success: true,
        message: 'User cache cleared successfully'
      };
    } catch (error) {
      this.logger.error(`Failed to clear user cache: ${error.message}`);
      throw error;
    }
  }

  @Delete('cache/type/:type')
  @ApiOperation({
    summary: 'Clear cache for recommendation type (Admin only)',
    description: 'Clear all cached recommendations for a specific type'
  })
  @ApiResponse({ status: 200, description: 'Type cache cleared successfully' })
  async clearTypeCache(@Param('type') type: RecommendationType) {
    try {
      await this.cacheService.invalidateTypeCache(type);

      this.logger.log(`Cleared cache for type ${type}`);

      return {
        success: true,
        message: `Cache cleared for type: ${type}`
      };
    } catch (error) {
      this.logger.error(`Failed to clear type cache: ${error.message}`);
      throw error;
    }
  }

  @Get('cache/stats')
  @ApiOperation({
    summary: 'Get cache statistics (Admin only)',
    description: 'Retrieve cache performance and usage statistics'
  })
  @ApiResponse({
    status: 200,
    description: 'Cache statistics retrieved successfully'
  })
  async getCacheStats() {
    try {
      const stats = await this.cacheService.getCacheStats();

      return {
        success: true,
        data: stats
      };
    } catch (error) {
      this.logger.error(`Failed to get cache stats: ${error.message}`);
      throw error;
    }
  }

  // Helper methods for labels and descriptions
  private getTypeLabel(type: RecommendationType): string {
    switch (type) {
      case RecommendationType.TRIP_MEMBERS:
        return 'Trip Members';
      case RecommendationType.GROUPS:
        return 'Groups';
      case RecommendationType.DESTINATIONS:
        return 'Destinations';
      case RecommendationType.SIMILAR_USERS:
        return 'Similar Users';
      default:
        return type;
    }
  }

  private getTypeDescription(type: RecommendationType): string {
    switch (type) {
      case RecommendationType.TRIP_MEMBERS:
        return 'Recommend potential trip members based on interests and compatibility';
      case RecommendationType.GROUPS:
        return 'Suggest relevant groups to join based on user preferences';
      case RecommendationType.DESTINATIONS:
        return 'Recommend travel destinations based on search criteria and user history';
      case RecommendationType.SIMILAR_USERS:
        return 'Find users with similar travel preferences and interaction patterns';
      default:
        return '';
    }
  }

  private getOutcomeLabel(outcome: RecommendationOutcome): string {
    switch (outcome) {
      case RecommendationOutcome.VIEWED:
        return 'Viewed';
      case RecommendationOutcome.CLICKED:
        return 'Clicked';
      case RecommendationOutcome.JOINED:
        return 'Joined';
      case RecommendationOutcome.IGNORED:
        return 'Ignored';
      case RecommendationOutcome.REJECTED:
        return 'Rejected';
      default:
        return outcome;
    }
  }

  private getOutcomeDescription(outcome: RecommendationOutcome): string {
    switch (outcome) {
      case RecommendationOutcome.VIEWED:
        return 'User viewed the recommendation without taking action';
      case RecommendationOutcome.CLICKED:
        return 'User clicked on the recommendation for more details';
      case RecommendationOutcome.JOINED:
        return 'User successfully joined/booked the recommended item';
      case RecommendationOutcome.IGNORED:
        return 'User scrolled past the recommendation without viewing';
      case RecommendationOutcome.REJECTED:
        return 'User explicitly dismissed or rejected the recommendation';
      default:
        return '';
    }
  }
}
