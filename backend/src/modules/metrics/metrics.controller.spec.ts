import { Test, TestingModule } from '@nestjs/testing';
import { MetricsController } from './metrics.controller';

describe('MetricsController', () => {
  let controller: MetricsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MetricsController],
    }).compile();

    controller = module.get<MetricsController>(MetricsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getHealth', () => {
    it('should return health status with all required fields', () => {
      const result = controller.getHealth();

      expect(result).toHaveProperty('status', 'healthy');
      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('uptime');
      expect(result).toHaveProperty('memory');
      expect(result).toHaveProperty('metrics');
    });

    it('should return memory details', () => {
      const result = controller.getHealth();

      expect(result.memory).toHaveProperty('used');
      expect(result.memory).toHaveProperty('total');
      expect(result.memory).toHaveProperty('percentage');
      expect(typeof result.memory.percentage).toBe('number');
      expect(result.memory.percentage).toBeGreaterThan(0);
      expect(result.memory.percentage).toBeLessThan(100);
    });

    it('should return valid timestamp', () => {
      const result = controller.getHealth();
      const date = new Date(result.timestamp);
      expect(date.getTime()).not.toBeNaN();
    });

    it('should return metrics endpoint info', () => {
      const result = controller.getHealth();
      expect(result.metrics.endpoint).toBe('/api/v1/metrics');
    });
  });

  describe('getStats', () => {
    it('should return process stats', () => {
      const result = controller.getStats();

      expect(result).toHaveProperty('process');
      expect(result.process).toHaveProperty('pid');
      expect(result.process).toHaveProperty('uptime');
      expect(result.process).toHaveProperty('nodeVersion');
    });

    it('should return memory stats', () => {
      const result = controller.getStats();

      expect(result).toHaveProperty('memory');
      expect(result.memory).toHaveProperty('rss');
      expect(result.memory).toHaveProperty('heapTotal');
      expect(result.memory).toHaveProperty('heapUsed');
      expect(result.memory).toHaveProperty('external');
    });

    it('should return cpu stats', () => {
      const result = controller.getStats();

      expect(result).toHaveProperty('cpu');
      expect(result.cpu).toHaveProperty('user');
      expect(result.cpu).toHaveProperty('system');
      expect(typeof result.cpu.user).toBe('number');
      expect(typeof result.cpu.system).toBe('number');
    });

    it('should have valid pid', () => {
      const result = controller.getStats();
      expect(result.process.pid).toBe(process.pid);
    });
  });

  describe('getMetrics', () => {
    it('should return prometheus info message', () => {
      const result = controller.getMetrics();
      expect(result).toHaveProperty('message');
      expect(result.message).toContain('/metrics');
    });
  });
});
