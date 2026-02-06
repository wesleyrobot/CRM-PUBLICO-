import { LoggerService } from './logger.service';

describe('LoggerService', () => {
  let service: LoggerService;
  let mockWinstonLogger: any;

  beforeEach(() => {
    mockWinstonLogger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
      verbose: jest.fn(),
    };

    service = new LoggerService(mockWinstonLogger);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('log', () => {
    it('should call winston info', () => {
      service.log('test message', 'TestContext');
      expect(mockWinstonLogger.info).toHaveBeenCalledWith('test message', {
        context: 'TestContext',
      });
    });

    it('should handle missing context', () => {
      service.log('test message');
      expect(mockWinstonLogger.info).toHaveBeenCalledWith('test message', {
        context: undefined,
      });
    });
  });

  describe('error', () => {
    it('should call winston error', () => {
      service.error('error message', 'stack trace', 'TestContext');
      expect(mockWinstonLogger.error).toHaveBeenCalledWith('error message', {
        context: 'TestContext',
        trace: 'stack trace',
      });
    });
  });

  describe('warn', () => {
    it('should call winston warn', () => {
      service.warn('warning message', 'TestContext');
      expect(mockWinstonLogger.warn).toHaveBeenCalledWith('warning message', {
        context: 'TestContext',
      });
    });
  });

  describe('debug', () => {
    it('should call winston debug', () => {
      service.debug('debug message', 'TestContext');
      expect(mockWinstonLogger.debug).toHaveBeenCalledWith('debug message', {
        context: 'TestContext',
      });
    });
  });

  describe('verbose', () => {
    it('should call winston verbose', () => {
      service.verbose('verbose message', 'TestContext');
      expect(mockWinstonLogger.verbose).toHaveBeenCalledWith(
        'verbose message',
        { context: 'TestContext' },
      );
    });
  });

  describe('logRequest', () => {
    it('should log HTTP request details', () => {
      service.logRequest('GET', '/api/v1/test', 200, 50);
      expect(mockWinstonLogger.info).toHaveBeenCalledWith('HTTP Request', {
        context: 'HTTP',
        method: 'GET',
        url: '/api/v1/test',
        statusCode: 200,
        duration: '50ms',
      });
    });
  });

  describe('logDatabaseQuery', () => {
    it('should log database query details', () => {
      service.logDatabaseQuery('SELECT * FROM leads', 15);
      expect(mockWinstonLogger.debug).toHaveBeenCalledWith('Database Query', {
        context: 'Database',
        query: 'SELECT * FROM leads',
        duration: '15ms',
      });
    });
  });

  describe('logExternalAPI', () => {
    it('should log external API call details', () => {
      service.logExternalAPI('ViaCEP', 'GET', 'https://viacep.com.br/ws/01001000/json', 200, 120);
      expect(mockWinstonLogger.info).toHaveBeenCalledWith('External API Call', {
        context: 'ExternalAPI',
        service: 'ViaCEP',
        method: 'GET',
        url: 'https://viacep.com.br/ws/01001000/json',
        statusCode: 200,
        duration: '120ms',
      });
    });
  });
});
