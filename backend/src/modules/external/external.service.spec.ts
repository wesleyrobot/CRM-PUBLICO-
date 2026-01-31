import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { ExternalService } from './external.service';
import { LoggerService } from '../../common/logger/logger.service';
import { of, throwError } from 'rxjs';
import { AxiosResponse } from 'axios';

describe('ExternalService', () => {
  let service: ExternalService;
  let httpService: HttpService;

  const mockHttpService = {
    get: jest.fn(),
  };

  const mockLoggerService = {
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    logExternalAPI: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExternalService,
        {
          provide: HttpService,
          useValue: mockHttpService,
        },
        {
          provide: LoggerService,
          useValue: mockLoggerService,
        },
      ],
    }).compile();

    service = module.get<ExternalService>(ExternalService);
    httpService = module.get<HttpService>(HttpService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('fetchExternalData', () => {
    it('should fetch data successfully', async () => {
      const mockResponse: AxiosResponse = {
        data: { userId: 1, id: 1, title: 'Test', completed: false },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      };

      mockHttpService.get.mockReturnValue(of(mockResponse));

      const result = await service.fetchExternalData('https://api.example.com/data');

      expect(result).toEqual(mockResponse.data);
      expect(mockHttpService.get).toHaveBeenCalledWith('https://api.example.com/data');
      expect(mockLoggerService.logExternalAPI).toHaveBeenCalled();
    });

    it('should handle errors', async () => {
      const error = new Error('Network error');
      mockHttpService.get.mockReturnValue(throwError(() => error));

      await expect(
        service.fetchExternalData('https://api.example.com/data'),
      ).rejects.toThrow('Network error');
    });
  });
});
