import { ResponseWrapperInterceptor } from './response-wrapper.interceptor';
import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of } from 'rxjs';

describe('ResponseWrapperInterceptor', () => {
  let interceptor: ResponseWrapperInterceptor<any>;

  beforeEach(() => {
    interceptor = new ResponseWrapperInterceptor();
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  it('should wrap response with success, data, timestamp, path', (done) => {
    const mockContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          url: '/api/v1/leads',
          requestId: 'req-123',
        }),
        getResponse: jest.fn().mockReturnValue({ statusCode: 200 }),
      }),
    } as unknown as ExecutionContext;

    const handler: CallHandler = {
      handle: () => of({ id: '1', nome: 'Test Lead' }),
    };

    interceptor.intercept(mockContext, handler).subscribe({
      next: (value) => {
        expect(value.success).toBe(true);
        expect(value.data).toEqual({ id: '1', nome: 'Test Lead' });
        expect(value.path).toBe('/api/v1/leads');
        expect(value.requestId).toBe('req-123');
        expect(value.timestamp).toBeDefined();
      },
      complete: () => done(),
    });
  });

  it('should not double-wrap already wrapped responses', (done) => {
    const alreadyWrapped = {
      success: true,
      data: { id: '1' },
      timestamp: '2024-01-01',
      path: '/api/v1/test',
    };

    const mockContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({ url: '/api/v1/test' }),
        getResponse: jest.fn().mockReturnValue({ statusCode: 200 }),
      }),
    } as unknown as ExecutionContext;

    const handler: CallHandler = {
      handle: () => of(alreadyWrapped),
    };

    interceptor.intercept(mockContext, handler).subscribe({
      next: (value) => {
        expect(value).toEqual(alreadyWrapped);
      },
      complete: () => done(),
    });
  });

  it('should handle array data', (done) => {
    const mockContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          url: '/api/v1/leads',
          requestId: 'req-456',
        }),
        getResponse: jest.fn().mockReturnValue({ statusCode: 200 }),
      }),
    } as unknown as ExecutionContext;

    const handler: CallHandler = {
      handle: () => of([{ id: '1' }, { id: '2' }]),
    };

    interceptor.intercept(mockContext, handler).subscribe({
      next: (value) => {
        expect(value.success).toBe(true);
        expect(value.data).toEqual([{ id: '1' }, { id: '2' }]);
      },
      complete: () => done(),
    });
  });

  it('should handle null data', (done) => {
    const mockContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({ url: '/api/v1/test' }),
        getResponse: jest.fn().mockReturnValue({ statusCode: 200 }),
      }),
    } as unknown as ExecutionContext;

    const handler: CallHandler = {
      handle: () => of(null),
    };

    interceptor.intercept(mockContext, handler).subscribe({
      next: (value) => {
        expect(value.success).toBe(true);
        expect(value.data).toBeNull();
      },
      complete: () => done(),
    });
  });
});
