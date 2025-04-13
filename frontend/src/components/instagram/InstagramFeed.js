import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useConfig } from '../../context/ConfigContext';
import { FaInstagram, FaSpinner, FaExclamationCircle } from 'react-icons/fa';
import './InstagramFeed.css';

const InstagramFeed = ({ limit = 4 }) => {
  const { config } = useConfig();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Extraer el username de la URL de Instagram
  const getInstagramUsername = () => {
    if (!config?.socialLinks?.instagram) return 'madamepastelmdp';
    
    const url = config.socialLinks.instagram;
    const regex = /instagram\.com\/([^/?]+)/;
    const match = url.match(regex);
    
    return match ? match[1] : 'madamepastelmdp';
  };
  
  useEffect(() => {
    const fetchInstagramFeed = async () => {
      try {
        setLoading(true);
        
        // En un entorno real, haríamos una petición a nuestra API que se comunica con la API de Instagram
        // Por ahora, usaremos datos ficticios que simulan una respuesta de la API
        
        // Simulamos un pequeño retraso para mostrar el estado de carga
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Datos de ejemplo que coinciden con el formato de la API de Instagram
        const mockData = {
          data: [
            {
              id: '123456789_1',
              caption: '¡Nuevas tortas de chocolate para esta semana! #pasteleria #chocolate #madamepastel',
              media_url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&q=80',
              permalink: 'https://www.instagram.com/p/123456/',
              timestamp: '2025-04-05T14:30:00+0000'
            },
            {
              id: '123456789_2',
              caption: 'Cupcakes de vainilla con frosting de frutos rojos, perfectos para cualquier ocasión 🧁',
              media_url: 'https://images.unsplash.com/photo-1486427944299-d1955d23e34d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&q=80',
              permalink: 'https://www.instagram.com/p/123457/',
              timestamp: '2025-04-04T10:15:00+0000'
            },
            {
              id: '123456789_3',
              caption: 'Macarons de pistacho, la especialidad de la casa 🇫🇷✨ #macarons #pistacho',
              media_url: 'https://images.unsplash.com/photo-1612201143788-b15844da6cc8?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&q=80',
              permalink: 'https://www.instagram.com/p/123458/',
              timestamp: '2025-04-03T16:45:00+0000'
            },
            {
              id: '123456789_4',
              caption: 'Torta personalizada para el cumpleaños de Sofía. ¡Felicidades! 🎂🎉',
              media_url: 'https://images.unsplash.com/photo-1535141192574-5d4897c12636?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&q=80',
              permalink: 'https://www.instagram.com/p/123459/',
              timestamp: '2025-04-02T09:20:00+0000'
            },
            {
              id: '123456789_5',
              caption: 'Mesa dulce para evento corporativo. Consulta por presupuestos personalizados 💼',
              media_url: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&q=80',
              permalink: 'https://www.instagram.com/p/123460/',
              timestamp: '2025-04-01T14:10:00+0000'
            },
            {
              id: '123456789_6',
              caption: 'Brownies con nueces, el complemento perfecto para tu café ☕',
              media_url: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&q=80',
              permalink: 'https://www.instagram.com/p/123461/',
              timestamp: '2025-03-31T11:30:00+0000'
            }
          ]
        };
        
        setPosts(mockData.data.slice(0, limit));
        setLoading(false);
      } catch (error) {
        console.error('Error al obtener feed de Instagram:', error);
        setError('No se pudieron cargar las publicaciones de Instagram');
        setLoading(false);
      }
    };
    
    fetchInstagramFeed();
  }, [limit]);
  
  // Formatear la fecha de la publicación
  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('es-AR', {
      day: 'numeric',
      month: 'short'
    });
  };
  
  // Truncar el texto de la descripción
  const truncateCaption = (caption, maxLength = 60) => {
    if (!caption) return '';
    if (caption.length <= maxLength) return caption;
    
    return caption.substring(0, maxLength) + '...';
  };
  
  if (loading) {
    return (
      <div className="instagram-feed instagram-loading">
        <FaSpinner className="spinner" />
        <p>Cargando publicaciones de Instagram...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="instagram-feed instagram-error">
        <FaExclamationCircle />
        <p>{error}</p>
      </div>
    );
  }
  
  return (
    <div className="instagram-feed">
      <div className="instagram-feed-header">
        <FaInstagram className="instagram-icon" />
        <span className="instagram-username">@{getInstagramUsername()}</span>
      </div>
      
      <div className="instagram-grid">
        {posts.map(post => (
          <div className="instagram-item" key={post.id}>
            <a href={post.permalink} target="_blank" rel="noopener noreferrer" className="instagram-link">
              <div className="instagram-image-container">
                <img src={post.media_url} alt={truncateCaption(post.caption, 20)} className="instagram-image" />
                <div className="instagram-overlay">
                  <div className="instagram-caption">{truncateCaption(post.caption)}</div>
                  <div className="instagram-date">{formatDate(post.timestamp)}</div>
                </div>
              </div>
            </a>
          </div>
        ))}
      </div>
      
      <a 
        href={config?.socialLinks?.instagram || "https://www.instagram.com/madamepastelmdp"} 
        target="_blank" 
        rel="noopener noreferrer" 
        className="view-more-link"
      >
        Ver más en Instagram
      </a>
    </div>
  );
};

export default InstagramFeed;
