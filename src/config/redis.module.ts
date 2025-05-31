import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RedisModule } from '@nestjs-modules/ioredis';

@Module({
  imports: [
    RedisModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        type: 'single',
        url: configService.get('REDIS_URL') || 'redis://localhost:6379',
        options: {
          // Connection options
          connectTimeout: 10000,
          commandTimeout: 5000,
          retryDelayOnFailover: 100,
          maxRetriesPerRequest: 3,

          // Connection pool
          lazyConnect: true,
          keepAlive: 30000,

          // Performance options
          enableOfflineQueue: false,

          // Event handlers
          onConnect: () => {
            console.log('✅ Redis connected successfully');
          },
          onError: (error) => {
            console.error('❌ Redis connection error:', error.message);
          },
          onReconnecting: () => {
            console.log('🔄 Redis reconnecting...');
          },
        },
      }),
      inject: [ConfigService],
    }),
  ],
  exports: [RedisModule],
})
export class RedisConfigModule {}
