import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import ProductCard from '../components/products/ProductCard';
import '../styles/ProductsPage.css';
import { PLACEHOLDER_IMAGES, PRODUCT_CATEGORIES } from '../utils/constants';

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('todos');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Llamada real a la API
        const response = await axios.get('http://localhost:5000/api/products');
        const productsData = response.data;
        
        setProducts(productsData.map(product => ({
          id: product._id,
          name: product.name,
          price: product.price,
          category: product.category,
          description: product.description,
          image: product.image || PLACEHOLDER_IMAGES.PRODUCT_SMALL,
          inStock: product.stock > 0
        })));
        
        // Extraer categorías únicas
        const uniqueCategories = [...new Set(productsData.map(product => product.category))];
        setCategories(uniqueCategories);
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching products:', error);
        
        // Fallback a productos simulados en caso de error
        const mockProducts = [
          {
            id: 1,
            name: 'Torta de Chocolate',
            price: 5500,
            category: 'Tortas',
            description: 'Deliciosa torta de chocolate con ganache',
            image: PLACEHOLDER_IMAGES.PRODUCT_SMALL,
            inStock: true
          },
          {
            id: 2,
            name: 'Cupcakes x6',
            price: 3200,
            category: 'Cupcakes',
            description: 'Media docena de cupcakes variados',
            image: PLACEHOLDER_IMAGES.PRODUCT_SMALL,
            inStock: true
          },
          {
            id: 3,
            name: 'Cookies Artesanales',
            price: 2500,
            category: 'Cookies',
            description: 'Cookies artesanales de chocolate y avena',
            image: PLACEHOLDER_IMAGES.PRODUCT_SMALL,
            inStock: true
          },
          {
            id: 4,
            name: 'Cheesecake',
            price: 4800,
            category: 'Postres',
            description: 'Cheesecake con frutos rojos',
            image: PLACEHOLDER_IMAGES.PRODUCT_SMALL,
            inStock: true
          },
          {
            id: 5,
            name: 'Box Merienda',
            price: 6200,
            category: 'Box Dulces',
            description: 'Box con variedad de dulces para la merienda',
            image: PLACEHOLDER_IMAGES.PRODUCT_SMALL,
            inStock: true
          },
          {
            id: 6,
            name: 'Torta Cumpleaños',
            price: 7500,
            category: 'Eventos Especiales',
            description: 'Torta personalizada para cumpleaños',
            image: PLACEHOLDER_IMAGES.PRODUCT_SMALL,
            inStock: true
          },
          {
            id: 7,
            name: 'Macarons x10',
            price: 3800,
            category: 'Cookies',
            description: 'Pack de 10 macarons surtidos',
            image: PLACEHOLDER_IMAGES.PRODUCT_SMALL,
            inStock: true
          },
          {
            id: 8,
            name: 'Brownie con Nueces',
            price: 2800,
            category: 'Postres',
            description: 'Brownie casero con nueces',
            image: PLACEHOLDER_IMAGES.PRODUCT_SMALL,
            inStock: true
          }
        ];
        
        setProducts(mockProducts);
        
        // Extraer categorías únicas
        const uniqueCategories = [...new Set(mockProducts.map(product => product.category))];
        setCategories(uniqueCategories);
        
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, []);
  
  // Filtrar productos por categoría y término de búsqueda
  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'todos' || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          product.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="products-page">
      <div className="products-banner">
        <div className="container">
          <h1>Nuestros Productos</h1>
        </div>
      </div>
      
      <div className="container">
        <div className="products-filter">
          <div className="search-box">
            <input 
              type="text" 
              placeholder="Buscar productos..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-control"
            />
          </div>
          
          <div className="category-filter">
            <button 
              className={`category-btn ${selectedCategory === 'todos' ? 'active' : ''}`}
              onClick={() => setSelectedCategory('todos')}
            >
              Todos
            </button>
            {categories.map(category => (
              <button 
                key={category}
                className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
                onClick={() => setSelectedCategory(category)}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>
        </div>
        
        {loading ? (
          <p className="loading-message">Cargando productos...</p>
        ) : (
          <>
            <div className="results-info">
              <p>Mostrando {filteredProducts.length} productos</p>
            </div>
            
            <div className="products-grid">
              {filteredProducts.length > 0 ? (
                filteredProducts.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))
              ) : (
                <p className="no-results">No se encontraron productos que coincidan con tu búsqueda.</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ProductsPage;
