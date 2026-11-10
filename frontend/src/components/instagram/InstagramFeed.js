import React from 'react';
import { useConfig } from '../../context/ConfigContext';
import { FaInstagram } from 'react-icons/fa';
import './InstagramFeed.css';

const DEFAULT_POSTS = [
  {
    id: 'post-1',
    caption: 'Drip cake artesanal en tonos pastel con macarons y detalles dorados.',
    date: 'Esta semana',
    image: '/images/torta-personalizada-ilustrativa.png'
  },
  {
    id: 'post-2',
    caption: 'Torta personalizada con buttercream y flores artesanales.',
    date: 'Destacados',
    image: '/images/placeholders/product-600x400.jpg'
  },
  {
    id: 'post-3',
    caption: 'Mini tartas y porciones individuales para tu mesa dulce.',
    date: 'Novedades',
    image: '/images/placeholders/instagram-300x300.jpg'
  },
  {
    id: 'post-4',
    caption: 'Letter cake con doble relleno de dulce de leche y frutos del bosque.',
    date: 'A pedido',
    image: '/images/placeholders/product-300x300.jpg'
  }
];

const InstagramFeed = () => {
  const { config } = useConfig();
  const instagramUrl = config?.socialLinks?.instagram || 'https://www.instagram.com/madamepastelmdp/';

  // Posts configurados o muestra visual destacada
  const posts = (config?.instagramPosts && config.instagramPosts.length > 0)
    ? config.instagramPosts
    : DEFAULT_POSTS;

  return (
    <div className="instagram-feed">
      <div className="instagram-feed-header">
        <FaInstagram className="instagram-icon" aria-hidden="true" />
        <span className="instagram-username">@madamepastelmdp</span>
      </div>

      <div className="instagram-grid">
        {posts.map((post) => (
          <a
            key={post.id}
            href={instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="instagram-item"
            aria-label={`Ver publicación en Instagram: ${post.caption}`}
          >
            <div className="instagram-image-container">
              <img
                src={post.image || '/logo-madame-pastel.jpeg'}
                alt={post.caption}
                className="instagram-image"
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = '/logo-madame-pastel.jpeg';
                }}
              />
              <div className="instagram-overlay">
                <p className="instagram-caption">{post.caption}</p>
                <span className="instagram-date">{post.date}</span>
              </div>
            </div>
          </a>
        ))}
      </div>

      <a
        href={instagramUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="view-more-link"
        aria-label="Ver perfil completo de Madame Pastel en Instagram"
      >
        <FaInstagram aria-hidden="true" /> Seguir en Instagram
      </a>
    </div>
  );
};

export default InstagramFeed;
