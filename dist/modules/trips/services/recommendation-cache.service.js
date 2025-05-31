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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var RecommendationCacheService_1;
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecommendationCacheService = void 0;
const common_1 = require("@nestjs/common");
const ioredis_1 = require("@nestjs-modules/ioredis");
const ioredis_2 = __importDefault(require("ioredis"));
let RecommendationCacheService = RecommendationCacheService_1 = class RecommendationCacheService {
    constructor(redis) {
        this.redis = redis;
        this.logger = new common_1.Logger(RecommendationCacheService_1.name);
        this.CACHE_TTL = 3600;
        this.BATCH_CACHE_TTL = 1800;
        this.USER_INTERACTION_TTL = 86400;
    }
    generateCacheKey(cacheKey) {
        const { userId, type, context, filters = {} } = cacheKey;
        const filterHash = this.hashObject(filters);
        return `rec:${userId}:${type}:${context}:${filterHash}`;
    }
    generateUserPatternKey(userId) {
        return `user_patterns:${userId}`;
    }
    generateTrendingKey(type) {
        return `trending:${type}`;
    }
    hashObject(obj) {
        return Buffer.from(JSON.stringify(obj)).toString('base64').slice(0, 16);
    }
    async cacheRecommendations(cacheKey, recommendations, ttl = this.CACHE_TTL) {
        try {
            const key = this.generateCacheKey(cacheKey);
            const data = {
                recommendations,
                cachedAt: new Date().toISOString(),
                ttl
            };
            await this.redis.setex(key, ttl, JSON.stringify(data));
            this.logger.debug(`Cached ${recommendations.length} recommendations for key: ${key}`);
        }
        catch (error) {
            this.logger.error(`Failed to cache recommendations: ${error.message}`);
        }
    }
    async getCachedRecommendations(cacheKey) {
        try {
            const key = this.generateCacheKey(cacheKey);
            const cached = await this.redis.get(key);
            if (!cached) {
                this.logger.debug(`Cache miss for key: ${key}`);
                return null;
            }
            const data = JSON.parse(cached);
            this.logger.debug(`Cache hit for key: ${key}`);
            return data.recommendations;
        }
        catch (error) {
            this.logger.error(`Failed to retrieve cached recommendations: ${error.message}`);
            return null;
        }
    }
    async cacheUserPatterns(userId, patterns) {
        try {
            const key = this.generateUserPatternKey(userId);
            const data = Object.assign(Object.assign({}, patterns), { updatedAt: new Date().toISOString() });
            await this.redis.setex(key, this.USER_INTERACTION_TTL, JSON.stringify(data));
            this.logger.debug(`Cached user patterns for userId: ${userId}`);
        }
        catch (error) {
            this.logger.error(`Failed to cache user patterns: ${error.message}`);
        }
    }
    async getUserPatterns(userId) {
        try {
            const key = this.generateUserPatternKey(userId);
            const cached = await this.redis.get(key);
            if (!cached) {
                return null;
            }
            return JSON.parse(cached);
        }
        catch (error) {
            this.logger.error(`Failed to retrieve user patterns: ${error.message}`);
            return null;
        }
    }
    async cacheTrendingRecommendations(type, trending) {
        try {
            const key = this.generateTrendingKey(type);
            const data = Object.assign(Object.assign({}, trending), { generatedAt: new Date().toISOString() });
            await this.redis.setex(key, this.BATCH_CACHE_TTL, JSON.stringify(data));
            this.logger.debug(`Cached trending data for type: ${type}`);
        }
        catch (error) {
            this.logger.error(`Failed to cache trending recommendations: ${error.message}`);
        }
    }
    async getTrendingRecommendations(type) {
        try {
            const key = this.generateTrendingKey(type);
            const cached = await this.redis.get(key);
            if (!cached) {
                return null;
            }
            return JSON.parse(cached);
        }
        catch (error) {
            this.logger.error(`Failed to retrieve trending recommendations: ${error.message}`);
            return null;
        }
    }
    async invalidateUserCache(userId) {
        try {
            const pattern = `rec:${userId}:*`;
            const keys = await this.redis.keys(pattern);
            if (keys.length > 0) {
                await this.redis.del(...keys);
                this.logger.debug(`Invalidated ${keys.length} cache entries for user: ${userId}`);
            }
            const userPatternKey = this.generateUserPatternKey(userId);
            await this.redis.del(userPatternKey);
        }
        catch (error) {
            this.logger.error(`Failed to invalidate user cache: ${error.message}`);
        }
    }
    async invalidateTypeCache(type) {
        try {
            const pattern = `rec:*:${type}:*`;
            const keys = await this.redis.keys(pattern);
            if (keys.length > 0) {
                await this.redis.del(...keys);
                this.logger.debug(`Invalidated ${keys.length} cache entries for type: ${type}`);
            }
            const trendingKey = this.generateTrendingKey(type);
            await this.redis.del(trendingKey);
        }
        catch (error) {
            this.logger.error(`Failed to invalidate type cache: ${error.message}`);
        }
    }
    async batchCacheRecommendations(recommendations) {
        try {
            const pipeline = this.redis.pipeline();
            for (const item of recommendations) {
                const key = this.generateCacheKey(item.cacheKey);
                const data = {
                    recommendations: item.recommendations,
                    cachedAt: new Date().toISOString(),
                    ttl: item.ttl || this.CACHE_TTL
                };
                pipeline.setex(key, item.ttl || this.CACHE_TTL, JSON.stringify(data));
            }
            await pipeline.exec();
            this.logger.debug(`Batch cached ${recommendations.length} recommendation sets`);
        }
        catch (error) {
            this.logger.error(`Failed to batch cache recommendations: ${error.message}`);
        }
    }
    async getCacheStats() {
        try {
            const info = await this.redis.info('memory');
            const keyCount = await this.redis.dbsize();
            const memoryMatch = info.match(/used_memory_human:(.+)/);
            const memoryUsage = memoryMatch ? memoryMatch[1].trim() : 'Unknown';
            return {
                totalKeys: keyCount,
                memoryUsage,
                hitRate: 0.85
            };
        }
        catch (error) {
            this.logger.error(`Failed to get cache stats: ${error.message}`);
            return {
                totalKeys: 0,
                memoryUsage: 'Unknown',
                hitRate: 0
            };
        }
    }
    async clearAllCache() {
        try {
            const patterns = ['rec:*', 'user_patterns:*', 'trending:*'];
            for (const pattern of patterns) {
                const keys = await this.redis.keys(pattern);
                if (keys.length > 0) {
                    await this.redis.del(...keys);
                }
            }
            this.logger.warn('Cleared all recommendation cache');
        }
        catch (error) {
            this.logger.error(`Failed to clear cache: ${error.message}`);
        }
    }
};
RecommendationCacheService = RecommendationCacheService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, ioredis_1.InjectRedis)()),
    __metadata("design:paramtypes", [typeof (_a = typeof ioredis_2.default !== "undefined" && ioredis_2.default) === "function" ? _a : Object])
], RecommendationCacheService);
exports.RecommendationCacheService = RecommendationCacheService;
//# sourceMappingURL=recommendation-cache.service.js.map