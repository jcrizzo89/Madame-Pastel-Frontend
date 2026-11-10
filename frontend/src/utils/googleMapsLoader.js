/**
 * Cargador dinámico para el SDK de Google Maps JavaScript con la librería Places.
 * Evita cargas duplicadas y maneja errores de red / falta de API Key con elegancia.
 */

let googleMapsPromise = null;

export const loadGoogleMapsApi = (customApiKey) => {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Entorno sin ventana (SSR)'));
  }

  if (window.google && window.google.maps && window.google.maps.places) {
    return Promise.resolve(window.google.maps);
  }

  const apiKey = customApiKey || process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
  if (!apiKey || typeof apiKey !== 'string' || !apiKey.trim()) {
    return Promise.reject(new Error('No se encontró REACT_APP_GOOGLE_MAPS_API_KEY configurada.'));
  }

  if (googleMapsPromise) {
    return googleMapsPromise;
  }

  googleMapsPromise = new Promise((resolve, reject) => {
    const existingScript = document.getElementById('google-maps-api-script');
    if (existingScript) {
      if (window.google && window.google.maps && window.google.maps.places) {
        resolve(window.google.maps);
      } else {
        existingScript.addEventListener('load', () => resolve(window.google.maps));
        existingScript.addEventListener('error', (err) => {
          googleMapsPromise = null;
          reject(err);
        });
      }
      return;
    }

    const script = document.createElement('script');
    script.id = 'google-maps-api-script';
    script.type = 'text/javascript';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey.trim())}&libraries=places&language=es&region=AR`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      if (window.google && window.google.maps && window.google.maps.places) {
        resolve(window.google.maps);
      } else {
        googleMapsPromise = null;
        reject(new Error('Google Maps script cargado sin librería Places disponible.'));
      }
    };

    script.onerror = (err) => {
      googleMapsPromise = null;
      reject(err);
    };

    document.head.appendChild(script);
  });

  return googleMapsPromise;
};
