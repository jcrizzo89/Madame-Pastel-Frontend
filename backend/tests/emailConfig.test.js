const { createTransporter } = require('../config/emailConfig');

describe('Email transport configuration', () => {
  const originalValues = Object.fromEntries(
    ['EMAIL_HOST', 'EMAIL_USER', 'EMAIL_PASSWORD'].map(key => [key, process.env[key]])
  );

  afterEach(() => {
    for (const [key, value] of Object.entries(originalValues)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  });

  it('does not attempt delivery when SMTP credentials are missing', async () => {
    delete process.env.EMAIL_HOST;
    delete process.env.EMAIL_USER;
    delete process.env.EMAIL_PASSWORD;

    await expect(createTransporter()).rejects.toThrow('Email delivery is not configured');
  });
});
