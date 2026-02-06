jest.mock('@sentry/node', () => ({
  init: jest.fn(),
}));

import { SentryConfig } from './sentry.config';
import { ConfigService } from '@nestjs/config';
import * as Sentry from '@sentry/node';

describe('SentryConfig', () => {
  let sentryConfig: SentryConfig;
  let mockConfigService: jest.Mocked<ConfigService>;

  beforeEach(() => {
    mockConfigService = {
      get: jest.fn(),
    } as any;

    sentryConfig = new SentryConfig(mockConfigService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(sentryConfig).toBeDefined();
  });

  describe('init', () => {
    it('should skip initialization when DSN is not configured', () => {
      mockConfigService.get.mockReturnValue(undefined);
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      sentryConfig.init();

      expect(Sentry.init).not.toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Sentry DSN not configured'),
      );

      consoleSpy.mockRestore();
    });

    it('should initialize Sentry when DSN is configured', () => {
      mockConfigService.get.mockImplementation((key: string, defaultVal?: any) => {
        const config: Record<string, any> = {
          SENTRY_DSN: 'https://test@sentry.io/123',
          NODE_ENV: 'production',
          APP_VERSION: '1.0.0',
        };
        return config[key] ?? defaultVal;
      });

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      sentryConfig.init();

      expect(Sentry.init).toHaveBeenCalledWith(
        expect.objectContaining({
          dsn: 'https://test@sentry.io/123',
          environment: 'production',
          tracesSampleRate: 0.1,
        }),
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Sentry initialized successfully'),
      );

      consoleSpy.mockRestore();
    });

    it('should use higher sample rate in non-production', () => {
      mockConfigService.get.mockImplementation((key: string, defaultVal?: any) => {
        const config: Record<string, any> = {
          SENTRY_DSN: 'https://test@sentry.io/123',
          NODE_ENV: 'development',
          APP_VERSION: '1.0.0',
        };
        return config[key] ?? defaultVal;
      });

      jest.spyOn(console, 'log').mockImplementation();
      sentryConfig.init();

      expect(Sentry.init).toHaveBeenCalledWith(
        expect.objectContaining({
          tracesSampleRate: 1.0,
        }),
      );

      jest.restoreAllMocks();
    });
  });
});
