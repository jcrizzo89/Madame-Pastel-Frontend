import axios from 'axios';
import { API_URL } from './constants';

const CACHE_KEY = 'madame_pastel_products_cache_v1';
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutos

let inMemoryProducts = null;
let inMemoryTimestamp = 0;
let inFlightPromise = null;

const readStorageCache = () => {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.data) || typeof parsed.timestamp !== 'number') {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
};

const writeStorageCache = (data, timestamp) => {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ data, timestamp }));
  } catch {
    // Ignorar errores de cuota de almacenamiento o modo privado
  }
};

/**
 * Devuelve la lista de productos almacenada en caché (memoria o sessionStorage) si existe,
 * incluso si está vencida (útil para mostrar inmediatamente mientras se revalida).
 */
export const getCachedProductsSnapshot = () => {
  if (Array.isArray(inMemoryProducts)) {
    return inMemoryProducts;
  }
  const stored = readStorageCache();
  if (stored) {
    inMemoryProducts = stored.data;
    inMemoryTimestamp = stored.timestamp;
    return stored.data;
  }
  return null;
};

/**
 * Indica si la caché actual sigue fresca (dentro del TTL).
 */
export const isProductsCacheFresh = () => {
  if (!Array.isArray(inMemoryProducts)) {
    const stored = readStorageCache();
    if (!stored) return false;
    inMemoryProducts = stored.data;
    inMemoryTimestamp = stored.timestamp;
  }
  return Date.now() - inMemoryTimestamp < CACHE_TTL_MS;
};

/**
 * Obtiene todos los productos deduplicando peticiones concurrentes y guardando en caché.
 */
export const fetchProductsWithCache = async ({ forceRefresh = false } = {}) => {
  if (!forceRefresh && isProductsCacheFresh()) {
    return inMemoryProducts;
  }

  if (!forceRefresh && inFlightPromise) {
    return inFlightPromise;
  }

  inFlightPromise = axios
    .get(`${API_URL}/products`)
    .then(({ data }) => {
      const list = Array.isArray(data) ? data : [];
      const now = Date.now();
      inMemoryProducts = list;
      inMemoryTimestamp = now;
      writeStorageCache(list, now);
      return list;
    })
    .finally(() => {
      inFlightPromise = null;
    });

  return inFlightPromise;
};

/**
 * Busca un producto por ID en la caché local (si existe).
 */
export const getCachedProductById = (id) => {
  if (!id) return null;
  const list = getCachedProductsSnapshot();
  if (!Array.isArray(list)) return null;
  return list.find((item) => String(item._id || item.id) === String(id)) || null;
};

/**
 * Limpia la caché de productos en el cliente (por ejemplo, al crear/editar/eliminar desde Admin).
 */
export const invalidateClientProductsCache = () => {
  inMemoryProducts = null;
  inMemoryTimestamp = 0;
  inFlightPromise = null;
  try {
    sessionStorage.removeItem(CACHE_KEY);
  } catch {
    // Ignorar errores de sessionStorage
  }
};
