import React, { useEffect, useRef, useState } from 'react';
import { loadGoogleMapsApi } from '../../utils/googleMapsLoader';
import '../../styles/GoogleAddressInput.css';

/**
 * Componente de entrada de dirección con normalización automática usando Google Maps Places Autocomplete.
 * - Restringido a Argentina con foco en Mar del Plata.
 * - Extrae calle, número, localidad y código postal.
 * - Si no hay API Key o falla la conexión, funciona de forma transparente como input regular sin romper la UI.
 */
const GoogleAddressInput = ({
  value = '',
  onChange,
  onAddressSelect,
  placeholder = 'Ej: San Martín 2450 o Av. Colón 1234',
  required = false,
  id = 'delivery-address',
  name = 'address',
  disabled = false,
  className = ''
}) => {
  const inputRef = useRef(null);
  const autocompleteRef = useRef(null);
  const [mapsLoaded, setMapsLoaded] = useState(false);
  const [isNormalized, setIsNormalized] = useState(false);
  const [formattedAddress, setFormattedAddress] = useState('');

  useEffect(() => {
    let isMounted = true;

    loadGoogleMapsApi()
      .then((googleMaps) => {
        if (!isMounted || !inputRef.current || !googleMaps?.places) return;

        setMapsLoaded(true);

        try {
          const autocomplete = new googleMaps.places.Autocomplete(inputRef.current, {
            componentRestrictions: { country: 'ar' },
            fields: ['address_components', 'formatted_address', 'geometry', 'name'],
            types: ['address']
          });

          // Delimitar preferentemente a la zona de Mar del Plata / Costa Atlántica
          const mdpBounds = new googleMaps.LatLngBounds(
            new googleMaps.LatLng(-38.15, -57.70),
            new googleMaps.LatLng(-37.85, -57.45)
          );
          autocomplete.setBounds(mdpBounds);

          autocomplete.addListener('place_changed', () => {
            const place = autocomplete.getPlace();
            if (!place || !place.address_components) return;

            let streetNumber = '';
            let route = '';
            let city = '';
            let zipCode = '';
            let province = '';

            for (const component of place.address_components) {
              const types = component.types || [];
              if (types.includes('street_number')) {
                streetNumber = component.long_name;
              }
              if (types.includes('route')) {
                route = component.long_name;
              }
              if (types.includes('locality') || types.includes('sublocality') || types.includes('administrative_area_level_2')) {
                if (!city) city = component.long_name;
              }
              if (types.includes('postal_code')) {
                zipCode = component.long_name;
              }
              if (types.includes('administrative_area_level_1')) {
                province = component.long_name;
              }
            }

            const cleanStreet = route ? (streetNumber ? `${route} ${streetNumber}` : route) : (place.name || '');
            const finalFormatted = place.formatted_address || cleanStreet;

            setIsNormalized(true);
            setFormattedAddress(finalFormatted);

            if (onAddressSelect) {
              onAddressSelect({
                address: cleanStreet || finalFormatted,
                formattedAddress: finalFormatted,
                city: city || 'Mar del Plata',
                zipCode: zipCode || '',
                province: province || 'Buenos Aires',
                lat: place.geometry?.location?.lat ? place.geometry.location.lat() : null,
                lng: place.geometry?.location?.lng ? place.geometry.location.lng() : null
              });
            } else if (onChange) {
              onChange({ target: { name, value: cleanStreet || finalFormatted } });
            }
          });

          autocompleteRef.current = autocomplete;
        } catch (initErr) {
          console.warn('Google Places Autocomplete no se pudo inicializar:', initErr);
        }
      })
      .catch((err) => {
        // Sin API Key o error de red: se comporta como un input regular
        if (isMounted) {
          setMapsLoaded(false);
        }
      });

    return () => {
      isMounted = false;
      if (autocompleteRef.current && window.google?.maps?.event) {
        window.google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, [name, onAddressSelect, onChange]);

  const handleInputChange = (e) => {
    setIsNormalized(false);
    if (onChange) {
      onChange(e);
    }
  };

  const handleClear = () => {
    setIsNormalized(false);
    setFormattedAddress('');
    if (onChange) {
      onChange({ target: { name, value: '' } });
    }
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const mapsQueryUrl = value
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${value}, Mar del Plata`)}`
    : null;

  return (
    <div className="google-address-wrapper">
      <div className="google-address-input-container">
        <span className="google-address-icon" aria-hidden="true">📍</span>
        <input
          ref={inputRef}
          id={id}
          name={name}
          type="text"
          value={value}
          onChange={handleInputChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className={`google-address-input ${className}`}
          autoComplete="off"
        />
        {value && !disabled && (
          <button
            type="button"
            className="google-address-clear"
            onClick={handleClear}
            title="Limpiar dirección"
            aria-label="Limpiar dirección"
          >
            ×
          </button>
        )}
      </div>

      <div className="google-address-status">
        {isNormalized ? (
          <span className="google-address-badge">
            ✓ Dirección normalizada con Google Maps
          </span>
        ) : mapsLoaded ? (
          <p className="google-address-hint">
            Escribí y seleccioná tu dirección de la lista de Google Maps para mayor precisión.
          </p>
        ) : (
          <p className="google-address-hint">
            Indicá calle, altura y detalles de entrega en Mar del Plata.
          </p>
        )}

        {value && mapsQueryUrl && (
          <a
            href={mapsQueryUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="google-address-map-link"
            title="Ver ubicación en Google Maps"
          >
            🗺️ Ver en Google Maps
          </a>
        )}
      </div>
    </div>
  );
};

export default GoogleAddressInput;
