jest.mock('@sentry/node', () => ({
  setUser: jest.fn(),
  setContext: jest.fn(),
  captureException: jest.fn(),
  addBreadcrumb: jest.fn(),
}));

import { SentryInterceptor } from './sentry.interceptor';
import { ExecutionContext, CallHandler, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { of, throwError } from 'rxjs';
import * as Sentry from '@sentry/node';

const mockSentry = Sentry as jest.Mocked<typeof Sentry> & {
  setUser: jest.Mock;
  setContext: jest.Mock;
  captureException: jest.Mock;
  addBreadcrumb: jest.Mock;
};

describe('SentryInterceptor', () => {
  let interceptor: SentryInterceptor;

  const createMockContext = (overrides: any = {}) => {
    const request = {
      method: 'GET',
      url: '/api/v1/test',
      user: null,
      headers: {
        'content-type': 'application/json',
        authorization: 'Bearer token123',
        cookie: 'session=abc',
        'x-api-key': 'key123',
      },
      ...overrides,
    };

    return {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue(request),
      }),
    } as unknown as ExecutionContext;
  };

  beforeEach(() => {
    interceptor = new SentryInterceptor();
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  describe('successful requests', () => {
    it('should pass through successful requests', (done) => {
      const context = createMockContext();
      const handler: CallHandler = {
        handle: () => of({ data: 'test' }),
      };

      interceptor.intercept(context, handler).subscribe({
        next: (value) => {
          expect(value).toEqual({ data: 'test' });
        },
        complete: () => {
          expect(mockSentry.addBreadcrumb).toHaveBeenCalled();
          done();
        },
      });
    });

    it('should set user context when user is authenticated', (done) => {
      const context = createMockContext({
        user: { id: '123', nome: 'Test User' },
      });
      const handler: CallHandler = {
        handle: () => of({ data: 'test' }),
      };

      interceptor.intercept(context, handler).subscribe({
        complete: () => {
          expect(mockSentry.setUser).toHaveBeenCalledWith({
            id: '123',
            username: 'Test User',
          });
          done();
        },
      });
    });

    it('should not set user context when no user', (done) => {
      const context = createMockContext({ user: null });
      const handler: CallHandler = {
        handle: () => of({ data: 'test' }),
      };

      interceptor.intercept(context, handler).subscribe({
        complete: () => {
          expect(mockSentry.setUser).not.toHaveBeenCalled();
          done();
        },
      });
    });

    it('should set request context', (done) => {
      const context = createMockContext();
      const handler: CallHandler = {
        handle: () => of({ data: 'test' }),
      };

      interceptor.intercept(context, handler).subscribe({
        complete: () => {
          expect(mockSentry.setContext).toHaveBeenCalledWith(
            'request',
            expect.objectContaining({
              method: 'GET',
              url: '/api/v1/test',
            }),
          );
          done();
        },
      });
    });
  });

  describe('error handling', () => {
    it('should capture 500 errors to Sentry', (done) => {
      const context = createMockContext();
      const error = new InternalServerErrorException('Server error');
      const handler: CallHandler = {
        handle: () => throwError(() => error),
      };

      interceptor.intercept(context, handler).subscribe({
        error: () => {
          expect(mockSentry.captureException).toHaveBeenCalledWith(
            error,
            expect.objectContaining({
              tags: expect.objectContaining({
                endpoint: '/api/v1/test',
                method: 'GET',
              }),
            }),
          );
          done();
        },
      });
    });

    it('should NOT capture 4xx errors to Sentry', (done) => {
      const context = createMockContext();
      const error = new BadRequestException('Bad request');
      const handler: CallHandler = {
        handle: () => throwError(() => error),
      };

      interceptor.intercept(context, handler).subscribe({
        error: () => {
          expect(mockSentry.captureException).not.toHaveBeenCalled();
          done();
        },
      });
    });

    it('should capture non-HTTP errors', (done) => {
      const context = createMockContext();
      const error = new Error('Unexpected error');
      const handler: CallHandler = {
        handle: () => throwError(() => error),
      };

      interceptor.intercept(context, handler).subscribe({
        error: () => {
          expect(mockSentry.captureException).toHaveBeenCalled();
          done();
        },
      });
    });

    it('should re-throw the error after capturing', (done) => {
      const context = createMockContext();
      const originalError = new InternalServerErrorException('Server error');
      const handler: CallHandler = {
        handle: () => throwError(() => originalError),
      };

      interceptor.intercept(context, handler).subscribe({
        error: (error) => {
          expect(error).toBe(originalError);
          done();
        },
      });
    });
  });

  describe('header sanitization', () => {
    it('should sanitize sensitive headers', (done) => {
      const context = createMockContext();
      const handler: CallHandler = {
        handle: () => of({ data: 'test' }),
      };

      interceptor.intercept(context, handler).subscribe({
        complete: () => {
          const contextCall = (mockSentry.setContext as jest.Mock).mock.calls[0];
          const headers = contextCall[1].headers;
          expect(headers).not.toHaveProperty('authorization');
          expect(headers).not.toHaveProperty('cookie');
          expect(headers).not.toHaveProperty('x-api-key');
          expect(headers).toHaveProperty('content-type');
          done();
        },
      });
    });
  });

  describe('breadcrumbs', () => {
    it('should add breadcrumb for each request', (done) => {
      const context = createMockContext({ method: 'POST', url: '/api/v1/leads' });
      const handler: CallHandler = {
        handle: () => of({ data: 'test' }),
      };

      interceptor.intercept(context, handler).subscribe({
        complete: () => {
          expect(mockSentry.addBreadcrumb).toHaveBeenCalledWith({
            category: 'http',
            message: 'POST /api/v1/leads',
            level: 'info',
          });
          done();
        },
      });
    });
  });
});
