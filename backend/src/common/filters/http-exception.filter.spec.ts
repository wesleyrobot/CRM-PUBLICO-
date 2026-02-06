import {
  ArgumentsHost,
  HttpException,
  HttpStatus,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { HttpExceptionFilter } from './http-exception.filter';

describe('HttpExceptionFilter', () => {
  let filter: HttpExceptionFilter;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;
  let mockGetResponse: jest.Mock;
  let mockGetRequest: jest.Mock;
  let mockHttpArgumentsHost: jest.Mock;
  let mockArgumentsHost: ArgumentsHost;

  beforeEach(() => {
    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    mockGetResponse = jest.fn().mockReturnValue({
      status: mockStatus,
    });
    mockGetRequest = jest.fn().mockReturnValue({
      url: '/api/v1/test',
      method: 'GET',
      requestId: 'test-request-id-123',
    });
    mockHttpArgumentsHost = jest.fn().mockReturnValue({
      getResponse: mockGetResponse,
      getRequest: mockGetRequest,
    });
    mockArgumentsHost = {
      switchToHttp: mockHttpArgumentsHost,
      getArgByIndex: jest.fn(),
      getArgs: jest.fn(),
      getType: jest.fn(),
      switchToRpc: jest.fn(),
      switchToWs: jest.fn(),
    };

    filter = new HttpExceptionFilter();
  });

  it('should be defined', () => {
    expect(filter).toBeDefined();
  });

  it('should catch HttpException and return proper response', () => {
    const exception = new HttpException('Test error', HttpStatus.BAD_REQUEST);

    filter.catch(exception, mockArgumentsHost);

    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(mockJson).toHaveBeenCalled();
  });

  it('should include success: false in response', () => {
    const exception = new BadRequestException('Bad request');

    filter.catch(exception, mockArgumentsHost);

    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
      }),
    );
  });

  it('should include errorCode in response', () => {
    const exception = new NotFoundException('Not found');

    filter.catch(exception, mockArgumentsHost);

    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        errorCode: 'NOT_FOUND',
      }),
    );
  });

  it('should map 401 to UNAUTHORIZED error code', () => {
    const exception = new UnauthorizedException();

    filter.catch(exception, mockArgumentsHost);

    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        errorCode: 'UNAUTHORIZED',
      }),
    );
  });

  it('should map 403 to FORBIDDEN error code', () => {
    const exception = new ForbiddenException();

    filter.catch(exception, mockArgumentsHost);

    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        errorCode: 'FORBIDDEN',
      }),
    );
  });

  it('should map 409 to CONFLICT error code', () => {
    const exception = new ConflictException();

    filter.catch(exception, mockArgumentsHost);

    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        errorCode: 'CONFLICT',
      }),
    );
  });

  it('should include path in response', () => {
    const exception = new NotFoundException();

    filter.catch(exception, mockArgumentsHost);

    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        path: '/api/v1/test',
      }),
    );
  });

  it('should include requestId in response', () => {
    const exception = new NotFoundException();

    filter.catch(exception, mockArgumentsHost);

    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        requestId: 'test-request-id-123',
      }),
    );
  });

  it('should handle INTERNAL_SERVER_ERROR', () => {
    const exception = new HttpException(
      'Internal error',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );

    filter.catch(exception, mockArgumentsHost);

    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        errorCode: 'INTERNAL_SERVER_ERROR',
      }),
    );
  });

  it('should handle validation errors with array of messages', () => {
    const exception = new BadRequestException({
      message: ['name must not be empty', 'email must be valid'],
      statusCode: 400,
    });

    filter.catch(exception, mockArgumentsHost);

    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Erro de validação',
        errors: ['name must not be empty', 'email must be valid'],
        errorCode: 'BAD_REQUEST',
      }),
    );
  });

  it('should handle HttpException with object response containing message', () => {
    const exception = new HttpException(
      { message: 'Custom error' },
      HttpStatus.FORBIDDEN,
    );

    filter.catch(exception, mockArgumentsHost);

    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.FORBIDDEN);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Custom error',
      }),
    );
  });

  it('should handle HttpException with string response', () => {
    const exception = new HttpException('Forbidden', HttpStatus.FORBIDDEN);

    filter.catch(exception, mockArgumentsHost);

    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Forbidden',
      }),
    );
  });

  it('should handle non-HttpException errors as 500', () => {
    const exception = new Error('Something broke');

    filter.catch(exception, mockArgumentsHost);

    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Erro interno do servidor',
        errorCode: 'INTERNAL_SERVER_ERROR',
        success: false,
      }),
    );
  });

  it('should handle null exception', () => {
    filter.catch(null, mockArgumentsHost);

    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
  });

  it('should always include timestamp', () => {
    const exception = new NotFoundException();

    filter.catch(exception, mockArgumentsHost);

    const jsonCall = mockJson.mock.calls[0][0];
    expect(jsonCall).toHaveProperty('timestamp');
    const date = new Date(jsonCall.timestamp);
    expect(date.getTime()).not.toBeNaN();
  });

  it('should include statusCode in response body', () => {
    const exception = new NotFoundException('Not found');

    filter.catch(exception, mockArgumentsHost);

    const jsonCall = mockJson.mock.calls[0][0];
    expect(jsonCall.statusCode).toBe(HttpStatus.NOT_FOUND);
  });

  it('should use INTERNAL_SERVER_ERROR code for unmapped status codes', () => {
    const exception = new HttpException('Custom', 418);

    filter.catch(exception, mockArgumentsHost);

    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        errorCode: 'INTERNAL_SERVER_ERROR',
      }),
    );
  });
});
