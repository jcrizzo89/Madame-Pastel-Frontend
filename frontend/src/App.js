import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { ConfigProvider } from './context/ConfigContext';
import './styles/global.css';
import './styles/layout.css';

// Componentes de Layout
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';

// Páginas
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import PromotionsPage from './pages/PromotionsPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import CheckoutSuccessPage from './pages/CheckoutSuccessPage';
import CheckoutFailurePage from './pages/CheckoutFailurePage';
import CheckoutPendingPage from './pages/CheckoutPendingPage';
import ContactPage from './pages/ContactPage';
import NotFoundPage from './pages/NotFoundPage';

// Importación de rutas de administrador
import AdminRoutes from './routes/AdminRoutes';

function App() {
  return (
    <ConfigProvider>
      <CartProvider>
        <Router>
          <div className="App">
            {/* Contenido principal del sitio (solo se muestra si no estamos en rutas de admin) */}
            <Routes>
              {/* Rutas del administrador */}
              <Route path="/admin/*" element={<AdminRoutes />} />
              
              {/* Rutas públicas del sitio */}
              <Route path="/*" element={
                <>
                  <Header />
                  <main className="main-content">
                    <Routes>
                      <Route path="/" element={<HomePage />} />
                      <Route path="/productos" element={<ProductsPage />} />
                      <Route path="/productos/:id" element={<ProductDetailPage />} />
                      <Route path="/promociones" element={<PromotionsPage />} />
                      <Route path="/carrito" element={<CartPage />} />
                      <Route path="/checkout" element={<CheckoutPage />} />
                      <Route path="/checkout/success" element={<CheckoutSuccessPage />} />
                      <Route path="/checkout/failure" element={<CheckoutFailurePage />} />
                      <Route path="/checkout/pending" element={<CheckoutPendingPage />} />
                      <Route path="/contacto" element={<ContactPage />} />
                      <Route path="*" element={<NotFoundPage />} />
                    </Routes>
                  </main>
                  <Footer />
                </>
              } />
            </Routes>
          </div>
        </Router>
      </CartProvider>
    </ConfigProvider>
  );
}

export default App;
