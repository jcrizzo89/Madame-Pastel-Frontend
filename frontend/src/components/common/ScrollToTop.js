import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop
 * Garantiza que cada vez que el usuario navega a una nueva ruta o pestaña,
 * la pantalla se posicione automáticamente arriba de todo (inicio de la página).
 */
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Si la URL contiene un ancla / hash (ej: #seccion), no interferir si se desea saltar al elemento
    if (!window.location.hash) {
      try {
        window.scrollTo({
          top: 0,
          left: 0,
          behavior: 'instant'
        });
      } catch {
        window.scrollTo(0, 0);
      }
    }
  }, [pathname]);

  return null;
};

export default ScrollToTop;
