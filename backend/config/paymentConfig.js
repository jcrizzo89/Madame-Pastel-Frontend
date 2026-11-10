const getMercadoPagoAccessToken = () => {
  const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;
  if (!accessToken) throw new Error('MERCADO_PAGO_ACCESS_TOKEN must be configured');
  return accessToken;
};

const getWebhookUrl = () => {
  const backendUrl = process.env.BACKEND_URL;
  if (!backendUrl) throw new Error('BACKEND_URL must be configured');
  return `${backendUrl.replace(/\/+$/, '')}/api/payments/webhook`;
};

module.exports = { getMercadoPagoAccessToken, getWebhookUrl };
