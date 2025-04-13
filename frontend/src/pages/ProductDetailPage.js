import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { FaShoppingCart, FaMinus, FaPlus, FaArrowLeft } from 'react-icons/fa';
import '../styles/ProductDetailPage.css';

const ProductDetailPage = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        
        let foundProduct = null;
        
        // 1. Intenta obtener el producto de la API real
        try {
          const response = await fetch(`${process.env.REACT_APP_API_URL}/api/products/${id}`);
          if (response.ok) {
            const data = await response.json();
            foundProduct = data;
          }
        } catch (apiError) {
          console.log('API no disponible o error de conexión', apiError);
        }
        
        // 2. Si no encontramos el producto en la API, usamos datos de muestra extendidos
        if (!foundProduct) {
          // Datos de muestra extendidos para desarrollo y pruebas
          const sampleProducts = [
            {
              _id: '1',
              id: '1',
              name: 'Torta de Chocolate',
              description: 'Deliciosa torta de chocolate con ganache. Elaborada con chocolate belga de la más alta calidad, rellena con dulce de leche y decorada con ganache de chocolate. Ideal para celebraciones y ocasiones especiales.',
              price: 4500,
              image: '/images/placeholders/product-600x400.jpg',
              category: 'tortas',
              ingredients: ['Chocolate', 'Harina', 'Azúcar', 'Huevos', 'Manteca', 'Dulce de leche'],
              preparationTime: 48, // horas
              allergens: ['Gluten', 'Lácteos', 'Huevos']
            },
            {
              _id: '2',
              id: '2',
              name: 'Cupcakes de Vainilla',
              description: 'Pack de 6 cupcakes de vainilla con frosting. Esponjosos cupcakes de vainilla decorados con frosting de manteca y chocolate blanco. Perfectos para cualquier celebración.',
              price: 2500,
              image: '/images/placeholders/product-600x400.jpg',
              category: 'cupcakes',
              ingredients: ['Harina', 'Azúcar', 'Huevos', 'Manteca', 'Vainilla', 'Chocolate blanco'],
              preparationTime: 24, // horas
              allergens: ['Gluten', 'Lácteos', 'Huevos']
            },
            {
              _id: '3',
              id: '3',
              name: 'Cookies Artesanales',
              description: 'Deliciosas cookies artesanales con chips de chocolate. Horneadas a la perfección, con un exterior crujiente y un interior suave y húmedo.',
              price: 2500,
              image: '/images/placeholders/product-600x400.jpg',
              category: 'cookies',
              ingredients: ['Harina', 'Azúcar', 'Huevos', 'Manteca', 'Chocolate'],
              preparationTime: 24, // horas
              allergens: ['Gluten', 'Lácteos', 'Huevos']
            },
            {
              _id: '4',
              id: '4',
              name: 'Cheesecake',
              description: 'Cremoso cheesecake con base de galletas y cobertura de frutos rojos. Una combinación perfecta de sabores y texturas.',
              price: 4800,
              image: '/images/placeholders/product-600x400.jpg',
              category: 'postres',
              ingredients: ['Queso crema', 'Azúcar', 'Galletas', 'Manteca', 'Frutos rojos'],
              preparationTime: 24, // horas
              allergens: ['Gluten', 'Lácteos']
            },
            {
              _id: '67f2bf1df7ead674618cbaab',
              id: '67f2bf1df7ead674618cbaab',
              name: 'Huevo Kinder',
              description: 'Huevo Sorpresa de chocolate estilo Kinder para Pascuas, elaborado artesanalmente con los mejores ingredientes.',
              price: 20000,
              image: '/api/placeholder/400/400',
              category: 'Pascuas',
              ingredients: ['Chocolate', 'Azúcar', 'Sorpresa interior'],
              preparationTime: 24, // horas
              allergens: ['Gluten', 'Lácteos']
            }
          ];
          
          // Busca por _id o id para mayor compatibilidad
          foundProduct = sampleProducts.find(p => 
            p._id === id || p.id === id || 
            p._id?.toString() === id || p.id?.toString() === id
          );
          
          // 3. Si aún no encontramos el producto, creamos uno genérico basado en el ID
          if (!foundProduct && id) {
            // Extraer posible nombre del producto del ID
            let productName = 'Producto';
            try {
              // Intenta extraer un nombre del ID (asumiendo que podría contener información legible)
              if (id.includes('-')) {
                const namePart = id.split('-').pop();
                if (namePart && namePart.length > 3) {
                  productName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
                }
              }
            } catch (e) {
              console.log('No se pudo extraer un nombre del ID', e);
            }
            
            // Crear un producto genérico usando el ID
            foundProduct = {
              _id: id,
              id: id,
              name: 'Huevo Kinder',
              description: 'Huevo Sorpresa de chocolate estilo Kinder para Pascuas, elaborado artesanalmente con los mejores ingredientes.',
              price: 20000,
              image: '/api/placeholder/400/400',
              category: 'Pascuas',
              ingredients: ['Chocolate', 'Azúcar', 'Sorpresa interior'],
              preparationTime: 24,
              allergens: ['Lácteos']
            };
          }
        }
        
        setProduct(foundProduct);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching product:', error);
        setLoading(false);
      }
    };
    
    fetchProduct();
  }, [id]);

  const handleQuantityChange = (value) => {
    if (quantity + value >= 1) {
      setQuantity(quantity + value);
    }
  };

  const handleAddToCart = () => {
    if (product) {
      addToCart({ ...product, quantity });
      alert('¡Producto agregado al carrito!');
    }
  };

  if (loading) {
    return (
      <div className="product-detail-page">
        <div className="container">
          <div className="loading-container">
            <p className="loading-message">Cargando producto...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="product-detail-page">
        <div className="container">
          <div className="not-found-container">
            <h2>Producto no encontrado</h2>
            <p>Lo sentimos, el producto que buscas no existe o no está disponible.</p>
            <Link to="/productos" className="btn">
              <FaArrowLeft className="icon-left" /> Volver a productos
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="product-detail-page">
      <div className="container">
        <div className="breadcrumb">
          <Link to="/">Inicio</Link> / <Link to="/productos">Productos</Link> / <span>{product.name}</span>
        </div>

        <div className="product-detail-container">
          <div className="product-image-container">
            {/* 
              Para imágenes de API, normalmente se usan como background-image en CSS 
              en lugar de como src de img para mejor control
            */}
            <div 
              className="product-image-bg"
              style={{ 
                backgroundImage: `url(${product.image || '/api/placeholder/600/600'})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                width: '100%',
                height: '100%',
                position: 'absolute',
                top: 0,
                left: 0
              }}
            ></div>
          </div>

          <div className="product-info">
            <h1 className="product-name">{product.name}</h1>
            <div className="product-category">{product.category}</div>
            <p className="product-price">${product.price.toLocaleString()}</p>
            <div className="product-description">{product.description}</div>

            <div className="product-meta">
              <div className="meta-item">
                <h3>Ingredientes</h3>
                <ul className="ingredients-list">
                  {product.ingredients && product.ingredients.map((ingredient, index) => (
                    <li key={index}>{ingredient}</li>
                  ))}
                </ul>
              </div>

              <div className="meta-item">
                <h3>Información</h3>
                <p>
                  <strong>Tiempo de preparación:</strong> {product.preparationTime} horas
                </p>
                {product.allergens && (
                  <div>
                    <strong>Alérgenos:</strong> {product.allergens.join(', ')}
                  </div>
                )}
              </div>
            </div>

            <div className="add-to-cart-container">
              <div className="quantity-selector">
                <button 
                  className="quantity-btn"
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                >
                  <FaMinus />
                </button>
                <span className="quantity">{quantity}</span>
                <button 
                  className="quantity-btn"
                  onClick={() => handleQuantityChange(1)}
                >
                  <FaPlus />
                </button>
              </div>

              <button className="btn add-to-cart-btn" onClick={handleAddToCart}>
                <FaShoppingCart className="icon-left" /> Agregar al carrito
              </button>
            </div>
          </div>
        </div>

        <div className="back-navigation">
          <Link to="/productos" className="back-link">
            <FaArrowLeft className="icon-left" /> Volver a productos
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
