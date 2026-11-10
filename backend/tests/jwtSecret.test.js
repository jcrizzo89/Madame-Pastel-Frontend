const { getJwtSecret } = require('../config/authConfig');

describe('JWT signing key configuration', () => {
  const originalSecret = process.env.JWT_SECRET;

  afterEach(() => {
    if (originalSecret === undefined) delete process.env.JWT_SECRET;
    else process.env.JWT_SECRET = originalSecret;
  });

  it('fails closed when no JWT_SECRET is configured', () => {
    delete process.env.JWT_SECRET;

    expect(() => getJwtSecret()).toThrow('JWT_SECRET must be configured');
  });

  it('uses the configured JWT_SECRET', () => {
    process.env.JWT_SECRET = 'test-only-secret';

    expect(getJwtSecret()).toBe('test-only-secret');
  });
});
