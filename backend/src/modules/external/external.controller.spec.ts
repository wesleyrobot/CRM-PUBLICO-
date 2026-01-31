import { Test, TestingModule } from '@nestjs/testing';
import { ExternalController } from './external.controller';
import { ExternalService } from './external.service';

describe('ExternalController', () => {
  let controller: ExternalController;
  let service: ExternalService;

  const mockExternalService = {
    fetchExternalData: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExternalController],
      providers: [
        {
          provide: ExternalService,
          useValue: mockExternalService,
        },
      ],
    }).compile();

    controller = module.get<ExternalController>(ExternalController);
    service = module.get<ExternalService>(ExternalService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('fetchData', () => {
    it('should fetch external data', async () => {
      const mockData = { userId: 1, id: 1, title: 'Test Todo', completed: false };
      const url = 'https://jsonplaceholder.typicode.com/todos/1';

      mockExternalService.fetchExternalData.mockResolvedValue(mockData);

      const result = await controller.fetchData(url);

      expect(result).toEqual(mockData);
      expect(mockExternalService.fetchExternalData).toHaveBeenCalledWith(url);
    });

    it('should handle errors from service', async () => {
      const url = 'https://api.example.com/data';
      const error = new Error('Service error');

      mockExternalService.fetchExternalData.mockRejectedValue(error);

      await expect(controller.fetchData(url)).rejects.toThrow('Service error');
    });
  });
});
