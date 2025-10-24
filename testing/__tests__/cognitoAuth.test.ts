const { requireAuth } = require('../../src/middlewares/cognitoAuth');

// Mock the jwtVerifier module used by cognitoAuth
jest.mock('../../src/middlewares/jwtVerifier', () => ({
  verifyToken: jest.fn(),
}));

const { verifyToken } = require('../../src/middlewares/jwtVerifier');

describe('requireAuth middleware', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('calls next when token is valid and required', async () => {
    verifyToken.mockResolvedValue({ sub: 'user-1' });

    const mw = requireAuth({ required: true });
    const req = { headers: { authorization: 'Bearer valid' } };
    const res: any = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();

    await mw(req, res, next);

    expect(verifyToken).toHaveBeenCalledWith('valid');
    expect(next).toHaveBeenCalled();
  });

  it('returns 401 when token missing and required', async () => {
    const mw = requireAuth({ required: true });
    const req: any = { headers: {} };
    const statusMock = jest.fn().mockReturnThis();
    const jsonMock = jest.fn();
    const res: any = { status: statusMock, json: jsonMock };
    const next = jest.fn();

    await mw(req, res, next);

    expect(statusMock).toHaveBeenCalledWith(401);
    expect(jsonMock).toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  it('allows anonymous when required=false and no token', async () => {
    const mw = requireAuth({ required: false });
    const req: any = { headers: {} };
    const res: any = {};
    const next = jest.fn();

    await mw(req, res, next);

    expect(next).toHaveBeenCalled();
  });
});
