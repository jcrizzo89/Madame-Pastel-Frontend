import { CUSTOM_CAKE_SIZES, EXTRA_SPONGE_PRICE, formatARS } from '../data/customCake';

const paymentLabels = {
  mercadopago: 'Mercado Pago',
  transfer: 'Transferencia',
  cashOnDelivery: 'Efectivo'
};

const formatDeliverySchedule = (time) => {
  if (time && String(time).trim()) {
    return `${time} hs (a coordinar según horario del evento)`;
  }
  return 'A coordinar según horario del evento (a partir de las 09:00 hs)';
};

export const buildWhatsAppOrderMessage = ({ formData, cart }) => {
  const items = cart.items
    .map(item => `• ${item.quantity} × ${item.name} — ${formatARS(item.price * item.quantity)}`)
    .join('\n');

  return [
    'Hola Madame Pastel, quiero solicitar este pedido:',
    '',
    items,
    '',
    `Subtotal de productos: ${formatARS(cart.totalAmount)}`,
    'Envío: a confirmar',
    'Total final: a confirmar',
    '',
    `Nombre: ${formData.name}`,
    `Mi teléfono: ${formData.phone}`,
    `Dirección: ${formData.address}, ${formData.city} (${formData.zipCode})`,
    `Fecha solicitada: ${formData.deliveryDate}`,
    `Horario solicitado: ${formatDeliverySchedule(formData.deliveryTime)}`,
    `Medio de pago preferido: ${paymentLabels[formData.paymentMethod] || formData.paymentMethod}`,
    formData.notes ? `Nota: ${formData.notes}` : null,
    '',
    'Por favor confirmen disponibilidad, costo de envío e importe final.'
  ].filter(line => line !== null).join('\n');
};

export const buildWhatsAppOrderUrl = (phone, message) => {
  const internationalPhone = String(phone || '').replace(/\D/g, '');
  return `https://wa.me/${internationalPhone}?text=${encodeURIComponent(message)}`;
};

export const buildCustomCakeWhatsAppMessage = (selection) => {
  const size = selection.sizeDetails || CUSTOM_CAKE_SIZES.find(option => option.id === selection.size);
  if (!size) return '';
  const basePrice = size.price;
  const subtotal = basePrice + (selection.extraSponge ? EXTRA_SPONGE_PRICE : 0);
  const personalized = selection.decoration === 'personalized';

  return [
    'Hola Madame Pastel, quiero pedir una torta personalizada:',
    '',
    `Tamaño: ${size.name} (${size.diameter} cm, ${size.portions} porciones)`,
    `Bizcochuelo: ${selection.sponge}`,
    `Rellenos: ${selection.fillings.join(', ')}`,
    personalized ? 'Decoración personalizada: cotizar por WhatsApp' : 'Decoración: Clásica (incluida)',
    `Bizcochuelo extra: ${selection.extraSponge ? formatARS(EXTRA_SPONGE_PRICE) : 'No'}`,
    `Precio base: ${formatARS(basePrice)}`,
    `Subtotal estimado: ${formatARS(subtotal)}`,
    personalized ? 'La decoración personalizada se cotiza aparte.' : null,
    'Envío: a confirmar',
    'Total final: a confirmar',
    '',
    `Nombre: ${selection.customer.name}`,
    `Mi teléfono: ${selection.customer.phone}`,
    `Dirección: ${selection.customer.address}, ${selection.customer.city} (${selection.customer.zipCode})`,
    `Fecha solicitada: ${selection.deliveryDate}`,
    `Horario solicitado: ${formatDeliverySchedule(selection.deliveryTime)}`,
    `Medio de pago preferido: ${paymentLabels[selection.paymentMethod] || selection.paymentMethod}`,
    selection.notes ? `Nota: ${selection.notes}` : null,
    '',
    'Por favor confirmen disponibilidad, costo de envío e importe final.'
  ].filter(line => line !== null).join('\n');
};
