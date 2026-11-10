import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useConfig } from '../context/ConfigContext';
import {
  CUSTOM_CAKE_FILLINGS,
  CUSTOM_CAKE_SIZES,
  EXTRA_SPONGE_PRICE,
  formatARS,
  getCustomCakeSizeFromSearch,
  SPONGE_FLAVORS
} from '../data/customCake';
import { buildCustomCakeWhatsAppMessage, buildWhatsAppOrderUrl } from '../utils/whatsappOrder';
import '../styles/CustomCakePage.css';

const DEFAULT_WHATSAPP = '5492235512021';

const CustomCakePage = () => {
  const location = useLocation();
  const { config } = useConfig();
  const [selection, setSelection] = useState(() => ({
    size: getCustomCakeSizeFromSearch(location.search),
    sponge: '',
    fillings: [],
    decoration: '',
    extraSponge: false
  }));

  const [customer, setCustomer] = useState({
    name: '',
    phone: '',
    address: '',
    city: 'Mar del Plata',
    zipCode: '',
    deliveryDate: '',
    deliveryTime: '',
    paymentMethod: 'transfer',
    notes: ''
  });

  const [errors, setErrors] = useState('');

  const chosenSize = CUSTOM_CAKE_SIZES.find((size) => size.id === selection.size);

  const toggleFilling = (filling) => {
    setSelection((current) => ({
      ...current,
      fillings: current.fillings.includes(filling)
        ? current.fillings.filter((item) => item !== filling)
        : current.fillings.length < 2
        ? [...current.fillings, filling]
        : current.fillings
    }));
  };

  const submit = (event) => {
    event.preventDefault();
    if (
      !selection.size ||
      !selection.sponge ||
      selection.fillings.length !== 2 ||
      !selection.decoration ||
      !customer.name ||
      !customer.phone ||
      !customer.address ||
      !customer.deliveryDate
    ) {
      setErrors('Completá tamaño, bizcochuelo, dos rellenos, decoración y los datos de envío para continuar.');
      return;
    }
    setErrors('');
    const phone = config?.socialLinks?.whatsapp || config?.contactInfo?.phone || DEFAULT_WHATSAPP;
    const message = buildCustomCakeWhatsAppMessage({ ...selection, sizeDetails: chosenSize, customer });
    window.open(buildWhatsAppOrderUrl(phone, message), '_blank', 'noopener,noreferrer');
  };

  const minDeliveryDate = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString().split('T')[0];

  const deliveryFields = [
    { name: 'name', label: 'Nombre y apellido', type: 'text', required: true },
    { name: 'phone', label: 'Tu teléfono', type: 'tel', required: true },
    { name: 'address', label: 'Dirección de entrega', type: 'text', required: true },
    { name: 'city', label: 'Localidad', type: 'text', required: false },
    { name: 'zipCode', label: 'Código postal', type: 'text', required: false },
    { name: 'deliveryDate', label: 'Fecha solicitada (mínimo 48 hs de anticipación)', type: 'date', required: true },
    { name: 'deliveryTime', label: 'Horario solicitado', type: 'time', required: false }
  ];

  return (
    <div className="custom-cake-page">
      <div className="custom-cake-wrap">
        <header className="cake-intro">
          <h1>Armá tu torta personalizada</h1>
          <p>Elegí una opción en cada paso y coordinamos tu pedido por WhatsApp.</p>
        </header>

        <form onSubmit={submit}>
          <section className="cake-step">
            <h2>
              <span>1</span> Elegí el tamaño
            </h2>
            <div className="cake-options size-options">
              {CUSTOM_CAKE_SIZES.map((size) => (
                <label className={`cake-choice ${selection.size === size.id ? 'selected' : ''}`} key={size.id}>
                  <input
                    type="radio"
                    name="size"
                    value={size.id}
                    checked={selection.size === size.id}
                    onChange={() => setSelection({ ...selection, size: size.id })}
                  />
                  <strong>{size.name}</strong>
                  <span>
                    {size.diameter} cm · {size.portions} porciones
                  </span>
                  <b>{formatARS(size.price)}</b>
                </label>
              ))}
            </div>
          </section>

          <section className="cake-step">
            <h2>
              <span>2</span> Elegí el sabor del bizcochuelo
            </h2>
            <div className="cake-options">
              {SPONGE_FLAVORS.map((flavor) => (
                <label className={`cake-choice ${selection.sponge === flavor ? 'selected' : ''}`} key={flavor}>
                  <input
                    type="radio"
                    name="sponge"
                    checked={selection.sponge === flavor}
                    onChange={() => setSelection({ ...selection, sponge: flavor })}
                  />
                  <strong>{flavor}</strong>
                </label>
              ))}
            </div>
          </section>

          <section className="cake-step">
            <h2>
              <span>3</span> Elegí 2 rellenos <small>(incluidos)</small>
            </h2>
            <p className="step-hint" role="status" aria-live="polite">{selection.fillings.length}/2 seleccionados</p>
            <div className="cake-options filling-options">
              {CUSTOM_CAKE_FILLINGS.map((filling) => (
                <label
                  className={`cake-choice filling-choice ${selection.fillings.includes(filling) ? 'selected' : ''}`}
                  key={filling}
                >
                  <input
                    type="checkbox"
                    checked={selection.fillings.includes(filling)}
                    onChange={() => toggleFilling(filling)}
                    disabled={!selection.fillings.includes(filling) && selection.fillings.length >= 2}
                  />
                  {filling}
                </label>
              ))}
            </div>
          </section>

          <section className="cake-step">
            <h2>
              <span>4</span> Elegí la decoración
            </h2>
            <div className="cake-options">
              {[
                ['classic', 'Clásica', 'Drip, copos, bordes y cobertura.'],
                ['personalized', 'Personalizada', 'Contanos tu idea. Se cotiza por WhatsApp.']
              ].map(([value, title, description]) => (
                <label className={`cake-choice ${selection.decoration === value ? 'selected' : ''}`} key={value}>
                  <input
                    type="radio"
                    name="decoration"
                    checked={selection.decoration === value}
                    onChange={() => setSelection({ ...selection, decoration: value })}
                  />
                  <strong>{title}</strong>
                  <span>{description}</span>
                </label>
              ))}
            </div>
          </section>

          <label className="extra-sponge">
            <input
              type="checkbox"
              checked={selection.extraSponge}
              onChange={(event) => setSelection({ ...selection, extraSponge: event.target.checked })}
            />
            Sumar un bizcochuelo extra <b>+{formatARS(EXTRA_SPONGE_PRICE)}</b>
          </label>

          {chosenSize && (
            <div className="cake-estimate">
              <span>Precio base{selection.extraSponge ? ' + bizcochuelo extra' : ''}</span>
              <strong>{formatARS(chosenSize.price + (selection.extraSponge ? EXTRA_SPONGE_PRICE : 0))}</strong>
              {selection.decoration === 'personalized' && (
                <small>La decoración se cotiza aparte. Envío e importe final a confirmar.</small>
              )}
            </div>
          )}

          <section className="cake-step delivery-step">
            <h2>Datos para el envío</h2>
            <div className="cake-fields">
              {deliveryFields.map(({ name, label, type, required }) => (
                <label key={name}>
                  {label} {required && <span aria-hidden="true" style={{ color: '#c94860' }}>*</span>}
                  <input
                    name={name}
                    type={type}
                    value={customer[name]}
                    onChange={(event) => setCustomer({ ...customer, [name]: event.target.value })}
                    required={required}
                    min={name === 'deliveryDate' ? minDeliveryDate : undefined}
                  />
                </label>
              ))}
              <label>
                Medio de pago preferido
                <select
                  value={customer.paymentMethod}
                  onChange={(event) => setCustomer({ ...customer, paymentMethod: event.target.value })}
                >
                  <option value="transfer">Transferencia bancaria</option>
                  <option value="mercadopago">Mercado Pago</option>
                  <option value="cashOnDelivery">Efectivo contra entrega</option>
                </select>
              </label>
              <label className="field-wide">
                Notas adicionales
                <textarea
                  value={customer.notes}
                  onChange={(event) => setCustomer({ ...customer, notes: event.target.value })}
                  placeholder="Detalles de la decoración, dedicatoria o consulta"
                />
              </label>
            </div>
          </section>

          {errors && (
            <p className="cake-error" role="alert">
              {errors}
            </p>
          )}
          <button className="cake-submit" type="submit">
            Pedir mi torta por WhatsApp
          </button>
          <p className="cake-disclaimer">
            El pedido queda sujeto a disponibilidad. Confirmaremos por WhatsApp el envío y el importe final.
          </p>
        </form>
      </div>
    </div>
  );
};

export default CustomCakePage;
