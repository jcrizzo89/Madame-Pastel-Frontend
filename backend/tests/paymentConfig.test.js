const { getMercadoPagoAccessToken, getWebhookUrl } = require('../config/paymentConfig');

describe('Payment provider configuration', () => {
  const keys = ['MERCADO_PAGO_ACCESS_TOKEN', 'BACKEND_URL'];
  const originalValues = Object.fromEntries(keys.map(key => [key, process.env[key]]));

  afterEach(() => {
    for (const [key, value] of Object.entries(originalValues)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  });

  it('requires a Mercado Pago access token', () => {
    delete process.env.MERCADO_PAGO_ACCESS_TOKEN;

    expect(() => getMercadoPagoAccessToken()).toThrow('MERCADO_PAGO_ACCESS_TOKEN must be configured');
  });

  it('uses the configured access token', () => {
    process.env.MERCADO_PAGO_ACCESS_TOKEN = 'test-token';

    expect(getMercadoPagoAccessToken()).toBe('test-token');
  });

  it('requires a backend URL for payment notifications', () => {
    delete process.env.BACKEND_URL;

    expect(() => getWebhookUrl()).toThrow('BACKEND_URL must be configured');
  });

  it('builds the webhook URL from the configured backend origin', () => {
    process.env.BACKEND_URL = 'https://api.example.com/';

    expect(getWebhookUrl()).toBe('https://api.example.com/api/payments/webhook');
  });
});
