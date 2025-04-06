const NodeCache = require('node-cache');

// Inicializar caché con tiempo de vida predeterminado de 5 minutos
const cache = new NodeCache({ stdTTL: 300 });

/**
 * Middleware para implementar caché en rutas de reportes
 * @param {Number} duration - Duración en segundos (opcional, por defecto usa stdTTL)
 */
const cacheMiddleware = (duration) => {
  return (req, res, next) => {
    // No aplicar caché si es una solicitud autenticada específica de usuario
    // ya que los datos pueden variar por usuario
    if (req.user && req.query.skipCache === 'true') {
      return next();
    }

    // Generar una clave única basada en la URL y los parámetros
    const cacheKey = `${req.originalUrl}`;
    
    // Verificar si existe en caché
    const cachedResponse = cache.get(cacheKey);
    
    if (cachedResponse) {
      // Devolver respuesta desde caché
      return res.status(200).json(cachedResponse);
    }

    // Almacenar la respuesta original para intercepción
    const originalSend = res.json;
    
    // Reemplazar el método json para interceptar la respuesta
    res.json = function(body) {
      // Solo guardar en caché si la respuesta es exitosa
      if (res.statusCode === 200) {
        // Guardar en caché con duración personalizada o predeterminada
        cache.set(cacheKey, body, duration);
      }
      
      // Enviar la respuesta original
      originalSend.call(this, body);
    };
    
    next();
  };
};

/**
 * Función para limpiar entradas de caché específicas
 * @param {Array} patterns - Patrones de URL para invalidar
 */
const clearCache = (patterns = []) => {
  if (patterns.length === 0) {
    // Si no hay patrones, limpiar toda la caché
    cache.flushAll();
    return;
  }
  
  // Obtener todas las claves
  const keys = cache.keys();
  
  // Filtrar claves que coincidan con los patrones
  const keysToDelete = keys.filter(key => {
    return patterns.some(pattern => key.includes(pattern));
  });
  
  // Eliminar claves coincidentes
  keysToDelete.forEach(key => cache.del(key));
};

// Exportar directamente el middleware para compatibilidad con las rutas existentes
module.exports = cacheMiddleware;
// También exponer las funciones individuales
module.exports.clearCache = clearCache;
