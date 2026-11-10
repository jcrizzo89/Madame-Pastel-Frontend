import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ProductCard from '../components/products/ProductCard';
import { API_URL, PLACEHOLDER_IMAGES } from '../utils/constants';
import '../styles/ProductsPage.css';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [category, setCategory] = useState('todos');
  const [search, setSearch] = useState('');

  useEffect(() => {
    let active = true;
    axios
      .get(`${API_URL}/products`)
      .then(({ data }) => {
        if (!active) return;
        setProducts(
          data.map((item) => ({
            id: item._id,
            _id: item._id,
            name: item.name,
            price: item.price,
            category: item.category,
            description: item.description || '',
            image: item.image || PLACEHOLDER_IMAGES.PRODUCT_SMALL,
            inStock: item.stock > 0 || item.madeToOrder,
            madeToOrder: item.madeToOrder,
            customCakeSizeId: item.customCakeSizeId,
            isPromotion: item.isPromotion,
            discountPercentage: item.discountPercentage
          }))
        );
      })
      .catch(() => {
        if (active) setError(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const categories = [...new Set(products.map((item) => item.category).filter(Boolean))];

  const searchLower = search.trim().toLowerCase();
  const filtered = products.filter((item) => {
    const matchesCategory = category === 'todos' || item.category === category;
    const matchesSearch =
      !searchLower ||
      `${item.name} ${item.description}`.toLowerCase().includes(searchLower);
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="products-page">
      <div className="products-banner">
        <div className="container">
          <h1>Nuestros productos</h1>
          <p>Consultá disponibilidad y coordiná el envío por WhatsApp.</p>
        </div>
      </div>

      <div className="container">
        <div className="products-filter">
          <div className="search-box">
            <input
              type="search"
              aria-label="Buscar productos"
              placeholder="Buscar por nombre o ingrediente..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-control"
            />
          </div>
          <div className="category-filter" role="tablist" aria-label="Filtrar por categoría">
            <button
              type="button"
              className={`category-btn ${category === 'todos' ? 'active' : ''}`}
              onClick={() => setCategory('todos')}
            >
              Todos
            </button>
            {categories.map((item) => (
              <button
                type="button"
                key={item}
                className={`category-btn ${category === item ? 'active' : ''}`}
                onClick={() => setCategory(item)}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <p className="loading-message">Cargando productos...</p>
        ) : error ? (
          <p className="no-results">
            No pudimos cargar el catálogo. Volvé a intentar más tarde o escribinos por WhatsApp.
          </p>
        ) : (
          <>
            <div className="results-info">
              <p>
                Mostrando {filtered.length} {filtered.length === 1 ? 'producto' : 'productos'}
              </p>
            </div>
            {filtered.length > 0 ? (
              <div className="products-grid">
                {filtered.map((item) => (
                  <ProductCard key={item.id} product={item} />
                ))}
              </div>
            ) : (
              <div className="no-results text-center" style={{ padding: '40px 20px' }}>
                <p>Todavía no hay productos publicados para esta selección.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
