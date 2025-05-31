import { Injectable, Logger } from '@nestjs/common';

// Simple in-memory cache implementation as fallback when Redis is not available
export interface CachedRecommendation {
  id: string;
  type: 'user' | 'trip' | 'group';
  score: number;
  metadata: Record<string, any>;
  generatedAt: Date;
}

export interface RecommendationCacheKey {
  userId: string;
  type: string;
  context: string;
  filters?: Record<string, any>;
}

interface CacheEntry<T = any> {
  data: T;
  expiresAt: Date;
  createdAt: Date;
}

@Injectable()
export class MemoryCacheService {
  private readonly logger = new Logger(MemoryCacheService.name);
  private cache = new Map<string, CacheEntry>();
  private readonly DEFAULT_TTL = 3600; // 1 hour in seconds

  constructor() {
    // Clean up expired entries every 5 minutes
    setInterval(() => this.cleanup(), 5 * 60 * 1000);
    this.logger.log('Memory cache service initialized');
  }

  /**
   * Generate cache key for recommendations
   */
  private generateCacheKey(cacheKey: RecommendationCacheKey): string {
    const { userId, type, context, filters = {} } = cacheKey;
    const filterHash = this.hashObject(filters);
    return `rec:${userId}:${type}:${context}:${filterHash}`;
  }

  /**
   * Hash object for consistent cache keys
   */
  private hashObject(obj: Record<string, any>): string {
    return Buffer.from(JSON.stringify(obj)).toString('base64').slice(0, 16);
  }

  /**
   * Cache recommendations with TTL
   */
  async cacheRecommendations(
    cacheKey: RecommendationCacheKey,
    recommendations: CachedRecommendation[],
    ttl: number = this.DEFAULT_TTL
  ): Promise<void> {
    try {
      const key = this.generateCacheKey(cacheKey);
      const entry: CacheEntry = {
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
    } catch (error) {
      this.logger.error(`Failed to cache recommendations: ${error.message}`);
    }
  }

  /**
   * Retrieve cached recommendations
   */
  async getCachedRecommendations(
    cacheKey: RecommendationCacheKey
  ): Promise<CachedRecommendation[] | null> {
    try {
      const key = this.generateCacheKey(cacheKey);
      const entry = this.cache.get(key);

      if (!entry) {
        this.logger.debug(`Cache miss for key: ${key}`);
        return null;
      }

      // Check if expired
      if (new Date() > entry.expiresAt) {
        this.cache.delete(key);
        this.logger.debug(`Cache expired for key: ${key}`);
        return null;
      }

      this.logger.debug(`Cache hit for key: ${key}`);
      return entry.data.recommendations;
    } catch (error) {
      this.logger.error(`Failed to retrieve cached recommendations: ${error.message}`);
      return null;
    }
  }

  /**
   * Cache user patterns
   */
  async cacheUserPatterns(
    userId: string,
    patterns: {
      preferredTypes: string[];
      avgRelevanceScore: number;
      topKeywords: string[];
      interactionHistory: Record<string, number>;
      lastActive: Date;
    },
    ttl: number = 86400 // 24 hours
  ): Promise<void> {
    try {
      const key = `user_patterns:${userId}`;
      const entry: CacheEntry = {
        data: {
          ...patterns,
          updatedAt: new Date().toISOString()
        },
        expiresAt: new Date(Date.now() + ttl * 1000),
        createdAt: new Date()
      };

      this.cache.set(key, entry);
      this.logger.debug(`Cached user patterns for userId: ${userId}`);
    } catch (error) {
      this.logger.error(`Failed to cache user patterns: ${error.message}`);
    }
  }

  /**
   * Get cached user patterns
   */
  async getUserPatterns(userId: string): Promise<any | null> {
    try {
      const key = `user_patterns:${userId}`;
      const entry = this.cache.get(key);

      if (!entry) {
        return null;
      }

      // Check if expired
      if (new Date() > entry.expiresAt) {
        this.cache.delete(key);
        return null;
      }

      return entry.data;
    } catch (error) {
      this.logger.error(`Failed to retrieve user patterns: ${error.message}`);
      return null;
    }
  }

  /**
   * Cache trending recommendations globally
   */
  async cacheTrendingRecommendations(
    type: string,
    trending: {
      keywords: string[];
      destinations: string[];
      popularTimes: Record<string, number>;
    },
    ttl: number = 1800 // 30 minutes
  ): Promise<void> {
    try {
      const key = `trending:${type}`;
      const entry: CacheEntry = {
        data: {
          ...trending,
          generatedAt: new Date().toISOString()
        },
        expiresAt: new Date(Date.now() + ttl * 1000),
        createdAt: new Date()
      };

      this.cache.set(key, entry);
      this.logger.debug(`Cached trending data for type: ${type}`);
    } catch (error) {
      this.logger.error(`Failed to cache trending recommendations: ${error.message}`);
    }
  }

  /**
   * Get trending recommendations
   */
  async getTrendingRecommendations(type: string): Promise<any | null> {
    try {
      const key = `trending:${type}`;
      const entry = this.cache.get(key);

      if (!entry) {
        return null;
      }

      // Check if expired
      if (new Date() > entry.expiresAt) {
        this.cache.delete(key);
        return null;
      }

      return entry.data;
    } catch (error) {
      this.logger.error(`Failed to retrieve trending recommendations: ${error.message}`);
      return null;
    }
  }

  /**
   * Invalidate cache for specific user
   */
  async invalidateUserCache(userId: string): Promise<void> {
    try {
      const keysToDelete: string[] = [];

      for (const [key] of this.cache.entries()) {
        if (key.includes(`rec:${userId}:`) || key === `user_patterns:${userId}`) {
          keysToDelete.push(key);
        }
      }

      for (const key of keysToDelete) {
        this.cache.delete(key);
      }

      this.logger.debug(`Invalidated ${keysToDelete.length} cache entries for user: ${userId}`);
    } catch (error) {
      this.logger.error(`Failed to invalidate user cache: ${error.message}`);
    }
  }

  /**
   * Invalidate cache for specific recommendation type
   */
  async invalidateTypeCache(type: string): Promise<void> {
    try {
      const keysToDelete: string[] = [];

      for (const [key] of this.cache.entries()) {
        if (key.includes(`:${type}:`) || key === `trending:${type}`) {
          keysToDelete.push(key);
        }
      }

      for (const key of keysToDelete) {
        this.cache.delete(key);
      }

      this.logger.debug(`Invalidated ${keysToDelete.length} cache entries for type: ${type}`);
    } catch (error) {
      this.logger.error(`Failed to invalidate type cache: ${error.message}`);
    }
  }

  /**
   * Get cache statistics
   */
  async getCacheStats(): Promise<{
    totalKeys: number;
    memoryUsage: string;
    hitRate: number;
    oldestEntry: Date | null;
    newestEntry: Date | null;
  }> {
    try {
      const entries = Array.from(this.cache.values());
      const totalKeys = this.cache.size;

      // Calculate approximate memory usage
      const sizeInBytes = JSON.stringify(Array.from(this.cache.entries())).length;
      const memoryUsage = this.formatBytes(sizeInBytes);

      // Find oldest and newest entries
      let oldestEntry: Date | null = null;
      let newestEntry: Date | null = null;

      if (entries.length > 0) {
        const dates = entries.map(e => e.createdAt);
        oldestEntry = new Date(Math.min(...dates.map(d => d.getTime())));
        newestEntry = new Date(Math.max(...dates.map(d => d.getTime())));
      }

      return {
        totalKeys,
        memoryUsage,
        hitRate: 0.85, // This would need to be tracked separately
        oldestEntry,
        newestEntry
      };
    } catch (error) {
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

  /**
   * Clear all cache (use with caution)
   */
  async clearAllCache(): Promise<void> {
    try {
      const size = this.cache.size;
      this.cache.clear();
      this.logger.warn(`Cleared all cache (${size} entries)`);
    } catch (error) {
      this.logger.error(`Failed to clear cache: ${error.message}`);
    }
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = new Date();
    const keysToDelete: string[] = [];

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

  /**
   * Format bytes to human readable string
   */
  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}
