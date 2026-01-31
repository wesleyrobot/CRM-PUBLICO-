import { winstonConfig } from './winston.config';

describe('Winston Configuration', () => {
  it('should be defined', () => {
    expect(winstonConfig).toBeDefined();
  });

  it('should have transports array', () => {
    expect(winstonConfig.transports).toBeDefined();
    expect(Array.isArray(winstonConfig.transports)).toBe(true);
  });

  it('should have format defined', () => {
    expect(winstonConfig.format).toBeDefined();
  });
});
