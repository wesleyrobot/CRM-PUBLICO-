import { LoggingInterceptor } from './logging.interceptor';
import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of } from 'rxjs';
import { LoggerService } from '../logger/logger.service';

describe('LoggingInterceptor', () => {
  let interceptor: LoggingInterceptor;
  let mockLogger: jest.Mocked<LoggerService>;

  beforeEach(() => {
    mockLogger = {
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
      verbose: jest.fn(),
      logRequest: jest.fn(),
      logDatabaseQuery: jest.fn(),
      logExternalAPI: jest.fn(),
    } as any;

    interceptor = new LoggingInterceptor(mockLogger);
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  it('should log request details on successful response', (done) => {
    const mockContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({ method: 'GET', url: '/api/v1/test' }),
        getResponse: jest.fn().mockReturnValue({ statusCode: 200 }),
      }),
    } as unknown as ExecutionContext;

    const handler: CallHandler = {
      handle: () => of({ data: 'test' }),
    };

    interceptor.intercept(mockContext, handler).subscribe({
      complete: () => {
        expect(mockLogger.logRequest).toHaveBeenCalledWith(
          'GET',
          '/api/v1/test',
          200,
          expect.any(Number),
        );
        done();
      },
    });
  });

  it('should pass through the response data', (done) => {
    const mockContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({ method: 'POST', url: '/api/v1/leads' }),
        getResponse: jest.fn().mockReturnValue({ statusCode: 201 }),
      }),
    } as unknown as ExecutionContext;

    const handler: CallHandler = {
      handle: () => of({ id: '123', nome: 'Test' }),
    };

    interceptor.intercept(mockContext, handler).subscribe({
      next: (value) => {
        expect(value).toEqual({ id: '123', nome: 'Test' });
      },
      complete: () => {
        done();
      },
    });
  });
});
