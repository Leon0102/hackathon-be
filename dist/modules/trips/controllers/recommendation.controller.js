"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var RecommendationController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecommendationController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const recommendation_service_1 = require("../services/recommendation.service");
const memory_cache_service_1 = require("../services/memory-cache.service");
const recommendation_log_schema_1 = require("../schema/recommendation-log.schema");
const auth_guard_1 = require("../../../guards/auth.guard");
const auth_user_decorator_1 = require("../../../decorators/auth-user.decorator");
const users_schema_1 = require("../../users/schema/users.schema");
class RecommendationRequestDto {
}
class UserInteractionDto {
}
let RecommendationController = RecommendationController_1 = class RecommendationController {
    constructor(recommendationService, cacheService) {
        this.recommendationService = recommendationService;
        this.cacheService = cacheService;
        this.logger = new common_1.Logger(RecommendationController_1.name);
    }
    async generateRecommendations(user, requestDto) {
        var _a, _b, _c, _d;
        try {
            const request = {
                userId: user._id.toString(),
                keyword: requestDto.keyword,
                type: requestDto.type,
                context: {
                    source: (_a = requestDto.source) !== null && _a !== void 0 ? _a : 'api',
                    filters: (_b = requestDto.filters) !== null && _b !== void 0 ? _b : {},
                    userAgent: requestDto.userAgent,
                    sessionId: requestDto.sessionId
                },
                limit: (_c = requestDto.limit) !== null && _c !== void 0 ? _c : 10,
                offset: (_d = requestDto.offset) !== null && _d !== void 0 ? _d : 0,
                useCache: requestDto.useCache !== false
            };
            const result = await this.recommendationService.generateRecommendations(request);
            this.logger.log(`Generated ${result.recommendations.length} recommendations for user ${user._id} (cached: ${result.cached})`);
            return {
                success: true,
                data: result
            };
        }
        catch (error) {
            this.logger.error(`Failed to generate recommendations: ${error.message}`);
            throw error;
        }
    }
    async logUserInteraction(user, interactionDto) {
        try {
            await this.recommendationService.logUserInteraction(interactionDto);
            this.logger.log(`Logged interaction for user ${user._id}: ${interactionDto.outcome}`);
            return {
                success: true,
                message: 'Interaction logged successfully'
            };
        }
        catch (error) {
            this.logger.error(`Failed to log interaction: ${error.message}`);
            throw error;
        }
    }
    async getAnalytics(user, days) {
        try {
            const daysNum = days ? parseInt(days, 10) : 30;
            const analytics = await this.recommendationService.getRecommendationAnalytics(user._id.toString(), daysNum);
            return {
                success: true,
                data: analytics
            };
        }
        catch (error) {
            this.logger.error(`Failed to get analytics: ${error.message}`);
            throw error;
        }
    }
    async getGlobalAnalytics(days) {
        try {
            const daysNum = days ? parseInt(days, 10) : 30;
            const analytics = await this.recommendationService.getRecommendationAnalytics(undefined, daysNum);
            return {
                success: true,
                data: analytics
            };
        }
        catch (error) {
            this.logger.error(`Failed to get global analytics: ${error.message}`);
            throw error;
        }
    }
    async getTrendingPatterns(type, days) {
        try {
            const daysNum = days ? parseInt(days, 10) : 7;
            const trending = await this.recommendationService.getTrendingPatterns(type, daysNum);
            return {
                success: true,
                data: trending
            };
        }
        catch (error) {
            this.logger.error(`Failed to get trending patterns: ${error.message}`);
            throw error;
        }
    }
    async getRecommendationTypes() {
        const types = Object.values(recommendation_log_schema_1.RecommendationType).map(type => ({
            value: type,
            label: this.getTypeLabel(type),
            description: this.getTypeDescription(type)
        }));
        return {
            success: true,
            data: types
        };
    }
    async getInteractionOutcomes() {
        const outcomes = Object.values(recommendation_log_schema_1.RecommendationOutcome).map(outcome => ({
            value: outcome,
            label: this.getOutcomeLabel(outcome),
            description: this.getOutcomeDescription(outcome)
        }));
        return {
            success: true,
            data: outcomes
        };
    }
    async clearUserCache(user) {
        try {
            await this.cacheService.invalidateUserCache(user._id.toString());
            this.logger.log(`Cleared cache for user ${user._id}`);
            return {
                success: true,
                message: 'User cache cleared successfully'
            };
        }
        catch (error) {
            this.logger.error(`Failed to clear user cache: ${error.message}`);
            throw error;
        }
    }
    async clearTypeCache(type) {
        try {
            await this.cacheService.invalidateTypeCache(type);
            this.logger.log(`Cleared cache for type ${type}`);
            return {
                success: true,
                message: `Cache cleared for type: ${type}`
            };
        }
        catch (error) {
            this.logger.error(`Failed to clear type cache: ${error.message}`);
            throw error;
        }
    }
    async getCacheStats() {
        try {
            const stats = await this.cacheService.getCacheStats();
            return {
                success: true,
                data: stats
            };
        }
        catch (error) {
            this.logger.error(`Failed to get cache stats: ${error.message}`);
            throw error;
        }
    }
    getTypeLabel(type) {
        switch (type) {
            case recommendation_log_schema_1.RecommendationType.TRIP_MEMBERS:
                return 'Trip Members';
            case recommendation_log_schema_1.RecommendationType.GROUPS:
                return 'Groups';
            case recommendation_log_schema_1.RecommendationType.DESTINATIONS:
                return 'Destinations';
            case recommendation_log_schema_1.RecommendationType.SIMILAR_USERS:
                return 'Similar Users';
            default:
                return type;
        }
    }
    getTypeDescription(type) {
        switch (type) {
            case recommendation_log_schema_1.RecommendationType.TRIP_MEMBERS:
                return 'Recommend potential trip members based on interests and compatibility';
            case recommendation_log_schema_1.RecommendationType.GROUPS:
                return 'Suggest relevant groups to join based on user preferences';
            case recommendation_log_schema_1.RecommendationType.DESTINATIONS:
                return 'Recommend travel destinations based on search criteria and user history';
            case recommendation_log_schema_1.RecommendationType.SIMILAR_USERS:
                return 'Find users with similar travel preferences and interaction patterns';
            default:
                return '';
        }
    }
    getOutcomeLabel(outcome) {
        switch (outcome) {
            case recommendation_log_schema_1.RecommendationOutcome.VIEWED:
                return 'Viewed';
            case recommendation_log_schema_1.RecommendationOutcome.CLICKED:
                return 'Clicked';
            case recommendation_log_schema_1.RecommendationOutcome.JOINED:
                return 'Joined';
            case recommendation_log_schema_1.RecommendationOutcome.IGNORED:
                return 'Ignored';
            case recommendation_log_schema_1.RecommendationOutcome.REJECTED:
                return 'Rejected';
            default:
                return outcome;
        }
    }
    getOutcomeDescription(outcome) {
        switch (outcome) {
            case recommendation_log_schema_1.RecommendationOutcome.VIEWED:
                return 'User viewed the recommendation without taking action';
            case recommendation_log_schema_1.RecommendationOutcome.CLICKED:
                return 'User clicked on the recommendation for more details';
            case recommendation_log_schema_1.RecommendationOutcome.JOINED:
                return 'User successfully joined/booked the recommended item';
            case recommendation_log_schema_1.RecommendationOutcome.IGNORED:
                return 'User scrolled past the recommendation without viewing';
            case recommendation_log_schema_1.RecommendationOutcome.REJECTED:
                return 'User explicitly dismissed or rejected the recommendation';
            default:
                return '';
        }
    }
};
__decorate([
    (0, common_1.Post)('generate'),
    (0, swagger_1.ApiOperation)({
        summary: 'Generate personalized recommendations',
        description: 'Generate recommendations based on user preferences, keywords, and context with caching support'
    }),
    (0, swagger_1.ApiResponse)({
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
    }),
    __param(0, (0, auth_user_decorator_1.AuthUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [users_schema_1.Users,
        RecommendationRequestDto]),
    __metadata("design:returntype", Promise)
], RecommendationController.prototype, "generateRecommendations", null);
__decorate([
    (0, common_1.Post)('interactions'),
    (0, swagger_1.ApiOperation)({
        summary: 'Log user interaction with recommendation',
        description: 'Track user interactions (views, clicks, joins) for analytics and personalization'
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Interaction logged successfully' }),
    __param(0, (0, auth_user_decorator_1.AuthUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [users_schema_1.Users,
        UserInteractionDto]),
    __metadata("design:returntype", Promise)
], RecommendationController.prototype, "logUserInteraction", null);
__decorate([
    (0, common_1.Get)('analytics'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get recommendation analytics',
        description: 'Retrieve analytics data for recommendations including CTR, conversion rates, and trends'
    }),
    (0, swagger_1.ApiQuery)({ name: 'days', required: false, description: 'Number of days to analyze (default: 30)' }),
    (0, swagger_1.ApiResponse)({
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
    }),
    __param(0, (0, auth_user_decorator_1.AuthUser)()),
    __param(1, (0, common_1.Query)('days')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [users_schema_1.Users, String]),
    __metadata("design:returntype", Promise)
], RecommendationController.prototype, "getAnalytics", null);
__decorate([
    (0, common_1.Get)('analytics/admin'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get global recommendation analytics (Admin only)',
        description: 'Retrieve global analytics data across all users'
    }),
    (0, swagger_1.ApiQuery)({ name: 'days', required: false, description: 'Number of days to analyze (default: 30)' }),
    __param(0, (0, common_1.Query)('days')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RecommendationController.prototype, "getGlobalAnalytics", null);
__decorate([
    (0, common_1.Get)('trending'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get trending patterns and keywords',
        description: 'Retrieve trending search patterns, keywords, and popular recommendations'
    }),
    (0, swagger_1.ApiQuery)({ name: 'type', required: false, enum: recommendation_log_schema_1.RecommendationType, description: 'Filter by recommendation type' }),
    (0, swagger_1.ApiQuery)({ name: 'days', required: false, description: 'Number of days to analyze (default: 7)' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Trending patterns retrieved successfully'
    }),
    __param(0, (0, common_1.Query)('type')),
    __param(1, (0, common_1.Query)('days')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], RecommendationController.prototype, "getTrendingPatterns", null);
__decorate([
    (0, common_1.Get)('types'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get available recommendation types',
        description: 'Retrieve all available recommendation types with descriptions'
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Recommendation types retrieved successfully'
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], RecommendationController.prototype, "getRecommendationTypes", null);
__decorate([
    (0, common_1.Get)('outcomes'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get available interaction outcomes',
        description: 'Retrieve all available user interaction outcomes for logging'
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Interaction outcomes retrieved successfully'
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], RecommendationController.prototype, "getInteractionOutcomes", null);
__decorate([
    (0, common_1.Delete)('cache/user'),
    (0, swagger_1.ApiOperation)({
        summary: 'Clear user recommendation cache',
        description: 'Clear all cached recommendations for the current user'
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Cache cleared successfully' }),
    __param(0, (0, auth_user_decorator_1.AuthUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [users_schema_1.Users]),
    __metadata("design:returntype", Promise)
], RecommendationController.prototype, "clearUserCache", null);
__decorate([
    (0, common_1.Delete)('cache/type/:type'),
    (0, swagger_1.ApiOperation)({
        summary: 'Clear cache for recommendation type (Admin only)',
        description: 'Clear all cached recommendations for a specific type'
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Type cache cleared successfully' }),
    __param(0, (0, common_1.Param)('type')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RecommendationController.prototype, "clearTypeCache", null);
__decorate([
    (0, common_1.Get)('cache/stats'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get cache statistics (Admin only)',
        description: 'Retrieve cache performance and usage statistics'
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Cache statistics retrieved successfully'
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], RecommendationController.prototype, "getCacheStats", null);
RecommendationController = RecommendationController_1 = __decorate([
    (0, swagger_1.ApiTags)('Recommendations'),
    (0, common_1.Controller)('recommendations'),
    (0, common_1.UseGuards)((0, auth_guard_1.AuthGuard)()),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [recommendation_service_1.RecommendationService,
        memory_cache_service_1.MemoryCacheService])
], RecommendationController);
exports.RecommendationController = RecommendationController;
//# sourceMappingURL=recommendation.controller.js.map