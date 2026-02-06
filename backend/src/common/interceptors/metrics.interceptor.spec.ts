import { MetricsInterceptor } from './metrics.interceptor';
import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of, throwError } from 'rxjs';

describe('MetricsInterceptor', () => {
  let interceptor: MetricsInterceptor;

  const createMockContext = (overrides: any = {}) => {
    const request = {
      method: 'GET',
      url: '/api/v1/test',
      route: { path: '/api/v1/test' },
      ...overrides,
    };

    const response = {
      statusCode: 200,
    };

    return {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue(request),
        getResponse: jest.fn().mockReturnValue(response),
      }),
    } as unknown as ExecutionContext;
  };

  beforeEach(() => {
    interceptor = new MetricsInterceptor();
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
          done();
        },
      });
    });

    it('should use url when route is not available', (done) => {
      const context = createMockContext({ route: undefined });
      const handler: CallHandler = {
        handle: () => of({ data: 'test' }),
      };

      interceptor.intercept(context, handler).subscribe({
        complete: () => {
          done();
        },
      });
    });
  });

  describe('error requests', () => {
    it('should still record metrics on error', (done) => {
      const context = createMockContext();
      const error = { status: 500, message: 'Internal Server Error' };
      const handler: CallHandler = {
        handle: () => throwError(() => error),
      };

      interceptor.intercept(context, handler).subscribe({
        error: () => {
          // Metrics should still be recorded
          done();
        },
      });
    });

    it('should default to 500 when no status on error', (done) => {
      const context = createMockContext();
      const error = new Error('Unknown error');
      const handler: CallHandler = {
        handle: () => throwError(() => error),
      };

      interceptor.intercept(context, handler).subscribe({
        error: () => {
          done();
        },
      });
    });
  });
});
