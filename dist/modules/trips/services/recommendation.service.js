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
var RecommendationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecommendationService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const recommendation_log_schema_1 = require("../schema/recommendation-log.schema");
const memory_cache_service_1 = require("./memory-cache.service");
const users_service_1 = require("../../users/users.service");
const groups_service_1 = require("../../groups/groups.service");
let RecommendationService = RecommendationService_1 = class RecommendationService {
    constructor(recommendationLogModel, cacheService, usersService, groupsService) {
        this.recommendationLogModel = recommendationLogModel;
        this.cacheService = cacheService;
        this.usersService = usersService;
        this.groupsService = groupsService;
        this.logger = new common_1.Logger(RecommendationService_1.name);
    }
    async generateRecommendations(request) {
        var _a, _b, _c, _d;
        const { userId, keyword, type, context, limit = 10, offset = 0, useCache = true } = request;
        const cacheKey = {
            userId,
            type,
            context: (_a = context.source) !== null && _a !== void 0 ? _a : 'default',
            filters: (_b = context.filters) !== null && _b !== void 0 ? _b : {}
        };
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
        const recommendations = await this.generateFreshRecommendations(request);
        if (useCache && recommendations.length > 0) {
            await this.cacheService.cacheRecommendations(cacheKey, recommendations, this.getTTLForType(type));
        }
        const log = await this.logRecommendation({
            user: new mongoose_2.Types.ObjectId(userId),
            keyword,
            recommendationType: type,
            context: {
                source: (_c = context.source) !== null && _c !== void 0 ? _c : 'api',
                filters: (_d = context.filters) !== null && _d !== void 0 ? _d : {},
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
    async generateFreshRecommendations(request) {
        const { userId, keyword, type, limit = 10 } = request;
        switch (type) {
            case recommendation_log_schema_1.RecommendationType.TRIP_MEMBERS:
                return this.generateTripMemberRecommendations(userId, keyword, limit);
            case recommendation_log_schema_1.RecommendationType.GROUPS:
                return this.generateGroupRecommendations(userId, keyword, limit);
            case recommendation_log_schema_1.RecommendationType.DESTINATIONS:
                return this.generateDestinationRecommendations(userId, keyword, limit);
            case recommendation_log_schema_1.RecommendationType.SIMILAR_USERS:
                return this.generateSimilarUserRecommendations(userId, keyword, limit);
            default:
                throw new Error(`Unsupported recommendation type: ${type}`);
        }
    }
    async generateTripMemberRecommendations(userId, keyword, limit) {
        const userPatterns = await this.cacheService.getUserPatterns(userId);
        const users = await this.usersService.searchUsersForRecommendations(keyword, userId, userPatterns, limit * 2);
        return users.map((user, index) => {
            var _a, _b;
            return ({
                id: user._id.toString(),
                type: 'user',
                score: this.calculateUserRelevanceScore(user, keyword, userPatterns),
                metadata: {
                    name: user.fullName,
                    profilePicture: user.profilePicture,
                    commonInterests: (_a = user.commonInterests) !== null && _a !== void 0 ? _a : [],
                    mutualConnections: (_b = user.mutualConnections) !== null && _b !== void 0 ? _b : 0,
                    lastActive: user.lastActiveAt
                },
                generatedAt: new Date()
            });
        })
            .sort((a, b) => b.score - a.score)
            .slice(0, limit);
    }
    async generateGroupRecommendations(userId, keyword, limit) {
        const userPatterns = await this.cacheService.getUserPatterns(userId);
        const groups = await this.groupsService.searchGroupsForRecommendations(keyword, userId, userPatterns, limit * 2);
        return groups.map((group, index) => {
            var _a, _b;
            return ({
                id: group._id.toString(),
                type: 'group',
                score: this.calculateGroupRelevanceScore(group, keyword, userPatterns),
                metadata: {
                    name: group.name,
                    description: group.description,
                    memberCount: (_a = group.memberCount) !== null && _a !== void 0 ? _a : 0,
                    isPublic: group.isPublic,
                    tags: (_b = group.tags) !== null && _b !== void 0 ? _b : [],
                    recentActivity: group.lastActivityAt
                },
                generatedAt: new Date()
            });
        })
            .sort((a, b) => b.score - a.score)
            .slice(0, limit);
    }
    async generateDestinationRecommendations(userId, keyword, limit) {
        const destinations = await this.searchDestinations(keyword, userId, limit);
        return destinations.map((destination, index) => ({
            id: destination.id,
            type: 'trip',
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
    async generateSimilarUserRecommendations(userId, keyword, limit) {
        const userPatterns = await this.cacheService.getUserPatterns(userId);
        const similarUsers = await this.findUsersWithSimilarPatterns(userId, userPatterns, limit);
        return similarUsers.map((user, index) => {
            var _a;
            return ({
                id: user._id.toString(),
                type: 'user',
                score: user.similarityScore,
                metadata: {
                    name: user.fullName,
                    profilePicture: user.profilePicture,
                    similarityReasons: user.similarityReasons,
                    commonInterests: (_a = user.commonInterests) !== null && _a !== void 0 ? _a : [],
                    interactionCompatibility: user.interactionCompatibility
                },
                generatedAt: new Date()
            });
        });
    }
    async logUserInteraction(request) {
        const { logId, outcome, timeSpentViewing = 0, metadata = {} } = request;
        try {
            const interaction = {
                outcome,
                timestamp: new Date(),
                timeSpentViewing,
                metadata
            };
            await this.recommendationLogModel.findByIdAndUpdate(logId, {
                $push: { interactions: interaction },
                $set: { updatedAt: new Date() }
            });
            this.logger.debug(`Logged interaction for recommendation: ${logId}`);
            await this.updateUserPatternsFromInteraction(logId, interaction);
        }
        catch (error) {
            this.logger.error(`Failed to log user interaction: ${error.message}`);
        }
    }
    async getRecommendationAnalytics(userId, days = 30) {
        const matchStage = {
            createdAt: {
                $gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000)
            }
        };
        if (userId) {
            matchStage.user = new mongoose_2.Types.ObjectId(userId);
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
    async getTrendingPatterns(type, days = 7) {
        const matchStage = {
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
                                        $in: ['$$this.outcome', [recommendation_log_schema_1.RecommendationOutcome.CLICKED, recommendation_log_schema_1.RecommendationOutcome.JOINED]]
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
        if (trending.length > 0) {
            const trendingData = {
                keywords: trending.slice(0, 20).map(t => t._id.keyword),
                destinations: trending.filter(t => t._id.type === recommendation_log_schema_1.RecommendationType.DESTINATIONS)
                    .slice(0, 10).map(t => t._id.keyword),
                popularTimes: {}
            };
            if (type) {
                await this.cacheService.cacheTrendingRecommendations(type, trendingData);
            }
        }
        return trending;
    }
    async logRecommendation(data) {
        const log = new this.recommendationLogModel(data);
        return log.save();
    }
    getTTLForType(type) {
        switch (type) {
            case recommendation_log_schema_1.RecommendationType.TRIP_MEMBERS:
                return 1800;
            case recommendation_log_schema_1.RecommendationType.GROUPS:
                return 3600;
            case recommendation_log_schema_1.RecommendationType.DESTINATIONS:
                return 7200;
            case recommendation_log_schema_1.RecommendationType.SIMILAR_USERS:
                return 1800;
            default:
                return 3600;
        }
    }
    calculateAverageRelevance(recommendations) {
        if (recommendations.length === 0)
            return 0;
        return recommendations.reduce((sum, rec) => sum + rec.score, 0) / recommendations.length;
    }
    extractTags(keyword, type) {
        const tags = [type];
        if (keyword.includes('beach'))
            tags.push('beach', 'coastal');
        if (keyword.includes('mountain'))
            tags.push('mountain', 'adventure');
        if (keyword.includes('city'))
            tags.push('urban', 'culture');
        if (keyword.includes('food'))
            tags.push('culinary', 'dining');
        return tags;
    }
    calculateUserRelevanceScore(user, keyword, userPatterns) {
        var _a, _b, _c, _d;
        let score = 0.5;
        if ((_a = user.fullName) === null || _a === void 0 ? void 0 : _a.toLowerCase().includes(keyword.toLowerCase()))
            score += 0.3;
        if ((_b = user.bio) === null || _b === void 0 ? void 0 : _b.toLowerCase().includes(keyword.toLowerCase()))
            score += 0.2;
        if ((_c = userPatterns === null || userPatterns === void 0 ? void 0 : userPatterns.topKeywords) === null || _c === void 0 ? void 0 : _c.includes(keyword))
            score += 0.3;
        if (((_d = user.commonInterests) === null || _d === void 0 ? void 0 : _d.length) > 0)
            score += Math.min(user.commonInterests.length * 0.1, 0.4);
        if (user.mutualConnections > 0)
            score += Math.min(user.mutualConnections * 0.05, 0.2);
        return Math.min(score, 1.0);
    }
    calculateGroupRelevanceScore(group, keyword, userPatterns) {
        var _a, _b, _c;
        let score = 0.5;
        if ((_a = group.name) === null || _a === void 0 ? void 0 : _a.toLowerCase().includes(keyword.toLowerCase()))
            score += 0.4;
        if ((_b = group.description) === null || _b === void 0 ? void 0 : _b.toLowerCase().includes(keyword.toLowerCase()))
            score += 0.2;
        if ((_c = group.tags) === null || _c === void 0 ? void 0 : _c.some(tag => tag.toLowerCase().includes(keyword.toLowerCase())))
            score += 0.3;
        if (group.lastActivityAt && Date.now() - new Date(group.lastActivityAt).getTime() < 7 * 24 * 60 * 60 * 1000) {
            score += 0.1;
        }
        return Math.min(score, 1.0);
    }
    async searchDestinations(keyword, userId, limit) {
        return [];
    }
    async findUsersWithSimilarPatterns(userId, userPatterns, limit) {
        return [];
    }
    async updateUserPatternsFromInteraction(logId, interaction) {
        this.logger.debug(`Updating user patterns from interaction: ${logId}`);
    }
};
RecommendationService = RecommendationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(recommendation_log_schema_1.RecommendationLog.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        memory_cache_service_1.MemoryCacheService,
        users_service_1.UsersService,
        groups_service_1.GroupsService])
], RecommendationService);
exports.RecommendationService = RecommendationService;
//# sourceMappingURL=recommendation.service.js.map