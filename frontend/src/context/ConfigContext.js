import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../utils/constants';

// Crear el contexto
const ConfigContext = createContext();

// Hook personalizado para acceder al contexto
export const useConfig = () => useContext(ConfigContext);

export const ConfigProvider = ({ children }) => {
  // Estado para almacenar la configuración
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Función para cargar la configuración
  const fetchConfig = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/config`);
      setConfig(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error al cargar la configuración:', err);
      setError('No se pudo cargar la configuración del sitio');
      setLoading(false);
    }
  };

  // Cargar la configuración al montar el componente
  useEffect(() => {
    fetchConfig();
  }, []);

  // Función para recargar la configuración (útil después de actualizaciones)
  const reloadConfig = () => {
    fetchConfig();
  };

  // Valores que se proporcionarán a través del contexto
  const value = {
    config,
    loading,
    error,
    reloadConfig
  };

  return (
    <ConfigContext.Provider value={value}>
      {children}
    </ConfigContext.Provider>
  );
};
