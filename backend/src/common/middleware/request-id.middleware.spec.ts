import { RequestIdMiddleware } from './request-id.middleware';

describe('RequestIdMiddleware', () => {
  let middleware: RequestIdMiddleware;
  let mockReq: any;
  let mockRes: any;
  let mockNext: jest.Mock;

  beforeEach(() => {
    middleware = new RequestIdMiddleware();
    mockReq = { headers: {} };
    mockRes = { setHeader: jest.fn() };
    mockNext = jest.fn();
  });

  it('should be defined', () => {
    expect(middleware).toBeDefined();
  });

  it('should generate a UUID request ID if none provided', () => {
    middleware.use(mockReq, mockRes, mockNext);

    expect(mockReq.requestId).toBeDefined();
    expect(typeof mockReq.requestId).toBe('string');
    expect(mockReq.requestId.length).toBeGreaterThan(0);
    expect(mockNext).toHaveBeenCalled();
  });

  it('should set X-Request-Id response header', () => {
    middleware.use(mockReq, mockRes, mockNext);

    expect(mockRes.setHeader).toHaveBeenCalledWith(
      'X-Request-Id',
      mockReq.requestId,
    );
  });

  it('should use existing X-Request-Id from request headers', () => {
    mockReq.headers['x-request-id'] = 'custom-request-id-456';

    middleware.use(mockReq, mockRes, mockNext);

    expect(mockReq.requestId).toBe('custom-request-id-456');
    expect(mockRes.setHeader).toHaveBeenCalledWith(
      'X-Request-Id',
      'custom-request-id-456',
    );
  });

  it('should call next function', () => {
    middleware.use(mockReq, mockRes, mockNext);

    expect(mockNext).toHaveBeenCalledTimes(1);
  });

  it('should generate unique IDs for different requests', () => {
    const req1: any = { headers: {} };
    const req2: any = { headers: {} };
    const res1: any = { setHeader: jest.fn() };
    const res2: any = { setHeader: jest.fn() };

    middleware.use(req1, res1, mockNext);
    middleware.use(req2, res2, mockNext);

    expect(req1.requestId).not.toBe(req2.requestId);
  });
});
