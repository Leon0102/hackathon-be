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
var MemoryCacheService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemoryCacheService = void 0;
const common_1 = require("@nestjs/common");
let MemoryCacheService = MemoryCacheService_1 = class MemoryCacheService {
    constructor() {
        this.logger = new common_1.Logger(MemoryCacheService_1.name);
        this.cache = new Map();
        this.DEFAULT_TTL = 3600;
        setInterval(() => this.cleanup(), 5 * 60 * 1000);
        this.logger.log('Memory cache service initialized');
    }
    generateCacheKey(cacheKey) {
        const { userId, type, context, filters = {} } = cacheKey;
        const filterHash = this.hashObject(filters);
        return `rec:${userId}:${type}:${context}:${filterHash}`;
    }
    hashObject(obj) {
        return Buffer.from(JSON.stringify(obj)).toString('base64').slice(0, 16);
    }
    async cacheRecommendations(cacheKey, recommendations, ttl = this.DEFAULT_TTL) {
        try {
            const key = this.generateCacheKey(cacheKey);
            const entry = {
                data: {
                    recommendations,
                    cachedAt: new Date().toISOString(),
                    ttl
                },
                expiresAt: new Date(Date.now() + ttl * 1000),
                createdAt: new Date()
            };
            this.cache.set(key, entry);
            this.logger.debug(`Cached ${recommendations.length} recommendations for key: ${key}`);
        }
        catch (error) {
            this.logger.error(`Failed to cache recommendations: ${error.message}`);
        }
    }
    async getCachedRecommendations(cacheKey) {
        try {
            const key = this.generateCacheKey(cacheKey);
            const entry = this.cache.get(key);
            if (!entry) {
                this.logger.debug(`Cache miss for key: ${key}`);
                return null;
            }
            if (new Date() > entry.expiresAt) {
                this.cache.delete(key);
                this.logger.debug(`Cache expired for key: ${key}`);
                return null;
            }
            this.logger.debug(`Cache hit for key: ${key}`);
            return entry.data.recommendations;
        }
        catch (error) {
            this.logger.error(`Failed to retrieve cached recommendations: ${error.message}`);
            return null;
        }
    }
    async cacheUserPatterns(userId, patterns, ttl = 86400) {
        try {
            const key = `user_patterns:${userId}`;
            const entry = {
                data: Object.assign(Object.assign({}, patterns), { updatedAt: new Date().toISOString() }),
                expiresAt: new Date(Date.now() + ttl * 1000),
                createdAt: new Date()
            };
            this.cache.set(key, entry);
            this.logger.debug(`Cached user patterns for userId: ${userId}`);
        }
        catch (error) {
            this.logger.error(`Failed to cache user patterns: ${error.message}`);
        }
    }
    async getUserPatterns(userId) {
        try {
            const key = `user_patterns:${userId}`;
            const entry = this.cache.get(key);
            if (!entry) {
                return null;
            }
            if (new Date() > entry.expiresAt) {
                this.cache.delete(key);
                return null;
            }
            return entry.data;
        }
        catch (error) {
            this.logger.error(`Failed to retrieve user patterns: ${error.message}`);
            return null;
        }
    }
    async cacheTrendingRecommendations(type, trending, ttl = 1800) {
        try {
            const key = `trending:${type}`;
            const entry = {
                data: Object.assign(Object.assign({}, trending), { generatedAt: new Date().toISOString() }),
                expiresAt: new Date(Date.now() + ttl * 1000),
                createdAt: new Date()
            };
            this.cache.set(key, entry);
            this.logger.debug(`Cached trending data for type: ${type}`);
        }
        catch (error) {
            this.logger.error(`Failed to cache trending recommendations: ${error.message}`);
        }
    }
    async getTrendingRecommendations(type) {
        try {
            const key = `trending:${type}`;
            const entry = this.cache.get(key);
            if (!entry) {
                return null;
            }
            if (new Date() > entry.expiresAt) {
                this.cache.delete(key);
                return null;
            }
            return entry.data;
        }
        catch (error) {
            this.logger.error(`Failed to retrieve trending recommendations: ${error.message}`);
            return null;
        }
    }
    async invalidateUserCache(userId) {
        try {
            const keysToDelete = [];
            for (const [key] of this.cache.entries()) {
                if (key.includes(`rec:${userId}:`) || key === `user_patterns:${userId}`) {
                    keysToDelete.push(key);
                }
            }
            for (const key of keysToDelete) {
                this.cache.delete(key);
            }
            this.logger.debug(`Invalidated ${keysToDelete.length} cache entries for user: ${userId}`);
        }
        catch (error) {
            this.logger.error(`Failed to invalidate user cache: ${error.message}`);
        }
    }
    async invalidateTypeCache(type) {
        try {
            const keysToDelete = [];
            for (const [key] of this.cache.entries()) {
                if (key.includes(`:${type}:`) || key === `trending:${type}`) {
                    keysToDelete.push(key);
                }
            }
            for (const key of keysToDelete) {
                this.cache.delete(key);
            }
            this.logger.debug(`Invalidated ${keysToDelete.length} cache entries for type: ${type}`);
        }
        catch (error) {
            this.logger.error(`Failed to invalidate type cache: ${error.message}`);
        }
    }
    async getCacheStats() {
        try {
            const entries = Array.from(this.cache.values());
            const totalKeys = this.cache.size;
            const sizeInBytes = JSON.stringify(Array.from(this.cache.entries())).length;
            const memoryUsage = this.formatBytes(sizeInBytes);
            let oldestEntry = null;
            let newestEntry = null;
            if (entries.length > 0) {
                const dates = entries.map(e => e.createdAt);
                oldestEntry = new Date(Math.min(...dates.map(d => d.getTime())));
                newestEntry = new Date(Math.max(...dates.map(d => d.getTime())));
            }
            return {
                totalKeys,
                memoryUsage,
                hitRate: 0.85,
                oldestEntry,
                newestEntry
            };
        }
        catch (error) {
            this.logger.error(`Failed to get cache stats: ${error.message}`);
            return {
                totalKeys: 0,
                memoryUsage: 'Unknown',
                hitRate: 0,
                oldestEntry: null,
                newestEntry: null
            };
        }
    }
    async clearAllCache() {
        try {
            const size = this.cache.size;
            this.cache.clear();
            this.logger.warn(`Cleared all cache (${size} entries)`);
        }
        catch (error) {
            this.logger.error(`Failed to clear cache: ${error.message}`);
        }
    }
    cleanup() {
        const now = new Date();
        const keysToDelete = [];
        for (const [key, entry] of this.cache.entries()) {
            if (now > entry.expiresAt) {
                keysToDelete.push(key);
            }
        }
        for (const key of keysToDelete) {
            this.cache.delete(key);
        }
        if (keysToDelete.length > 0) {
            this.logger.debug(`Cleaned up ${keysToDelete.length} expired cache entries`);
        }
    }
    formatBytes(bytes) {
        if (bytes === 0)
            return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
};
MemoryCacheService = MemoryCacheService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], MemoryCacheService);
exports.MemoryCacheService = MemoryCacheService;
//# sourceMappingURL=memory-cache.service.js.map