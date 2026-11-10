const { getMongoUri } = require('../config/databaseConfig');

describe('MongoDB configuration', () => {
  const previousUri = process.env.MONGODB_URI;

  afterEach(() => {
    if (previousUri === undefined) delete process.env.MONGODB_URI;
    else process.env.MONGODB_URI = previousUri;
  });

  it('requires the URI from environment configuration', () => {
    delete process.env.MONGODB_URI;
    expect(() => getMongoUri()).toThrow('MONGODB_URI must be configured');
  });

  it('returns the configured URI without exposing a baked-in fallback', () => {
    process.env.MONGODB_URI = 'mongodb+srv://configured.example/db';
    expect(getMongoUri()).toBe('mongodb+srv://configured.example/db');
  });
});
