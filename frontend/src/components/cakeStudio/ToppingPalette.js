import React, { useState } from 'react';
import {
  TOPPING_CATEGORIES,
  AVAILABLE_TOPPINGS
} from '../../data/cakeStudioData';
import { playToppingPop } from '../../utils/cakeSoundEffects';

const ToppingPalette = ({
  tier,
  onAddTopping,
  customText,
  setCustomText
}) => {
  const [activeCategory, setActiveCategory] = useState('all');

  const filteredToppings =
    activeCategory === 'all'
      ? AVAILABLE_TOPPINGS
      : AVAILABLE_TOPPINGS.filter((t) => t.category === activeCategory);

  const handleToppingClick = (topping) => {
    // Calcular posición inicial sugerida según los pisos de la torta
    const topTierY = tier.layers === 1 ? 260 : tier.layers === 2 ? 210 : 170;
    // Variación aleatoria sutil para que no caigan todos encimados en el centro
    const randomOffsetX = (Math.random() - 0.5) * 110;
    const randomOffsetY = (Math.random() - 0.5) * 35;

    const newToppingInstance = {
      ...topping,
      uid: `${topping.id}-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      x: 250 + randomOffsetX,
      y: topTierY + randomOffsetY,
      rotation: Math.floor(Math.random() * 20) - 10,
      scale: 1
    };

    playToppingPop();
    onAddTopping(newToppingInstance);
  };

  return (
    <div className="topping-palette">
      <div className="palette-header">
        <h3>Elige tus Toppings</h3>
        <span className="palette-subtitle">Hacé clic para agregar a tu creación</span>
      </div>

      {/* Selector de categorías */}
      <div className="category-tabs" role="tablist">
        {TOPPING_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            role="tab"
            aria-selected={activeCategory === cat.id}
            className={`category-tab-btn ${activeCategory === cat.id ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat.id)}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Grid de toppings */}
      <div className="toppings-grid">
        {filteredToppings.map((topping) => (
          <button
            key={topping.id}
            type="button"
            className="topping-card-btn"
            onClick={() => handleToppingClick(topping)}
            title={`Agregar ${topping.name}`}
          >
            <div className="topping-card-icon">{topping.emoji}</div>
            <span className="topping-card-name">{topping.name}</span>
            <span className="topping-card-plus">+</span>
          </button>
        ))}
      </div>

      {/* Configuración de texto libre para el Topper */}
      <div className="custom-topper-input-box">
        <label htmlFor="cake-custom-text">
          <span>🏷️</span> Texto para el Topper o Pastel:
        </label>
        <div className="input-group">
          <input
            id="cake-custom-text"
            type="text"
            maxLength={26}
            placeholder="Ej: ¡Feliz Cumple Sofi!"
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
          />
          {customText && (
            <button
              type="button"
              className="btn-clear-text"
              onClick={() => setCustomText('')}
              title="Borrar texto"
            >
              ✕
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ToppingPalette;
