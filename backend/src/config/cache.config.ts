import { CacheModuleOptions, CacheOptionsFactory } from '@nestjs/cache-manager';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { redisStore } from 'cache-manager-redis-yet';

@Injectable()
export class CacheConfigService implements CacheOptionsFactory {
  constructor(private configService: ConfigService) {}

  async createCacheOptions(): Promise<CacheModuleOptions> {
    const isTest = this.configService.get('NODE_ENV') === 'test';

    // Use in-memory cache for tests
    if (isTest) {
      return {
        ttl: 900000, // 15 minutes in milliseconds
        max: 100, // max items in cache
      };
    }

    // Use Redis for development/production
    return {
      store: await redisStore({
        socket: {
          host: this.configService.get('REDIS_HOST', 'localhost'),
          port: this.configService.get('REDIS_PORT', 6379),
        },
        password: this.configService.get('REDIS_PASSWORD'),
        ttl: this.configService.get('REDIS_TTL', 900) * 1000, // Convert to milliseconds
      }),
    };
  }
}
