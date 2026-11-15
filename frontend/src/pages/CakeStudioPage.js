import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useConfig } from '../context/ConfigContext';
import {
  CAKE_TIERS,
  FROSTING_COLORS,
  DRIP_STYLES,
  evaluateCakeCreation
} from '../data/cakeStudioData';
import CakeCanvas from '../components/cakeStudio/CakeCanvas';
import ToppingPalette from '../components/cakeStudio/ToppingPalette';
import CakeVerdictModal from '../components/cakeStudio/CakeVerdictModal';
import {
  getSoundMuted,
  toggleSoundMuted,
  playColorSplash,
  playTrashSound
} from '../utils/cakeSoundEffects';
import '../styles/CakeStudioPage.css';

const CakeStudioPage = () => {
  const { config } = useConfig();
  const svgRef = useRef(null);

  // Estados de configuración de la torta
  const [tier, setTier] = useState(CAKE_TIERS[0]);
  const [frosting, setFrosting] = useState(FROSTING_COLORS[0]);
  const [drip, setDrip] = useState(DRIP_STYLES[1]);
  const [toppings, setToppings] = useState([]);
  const [customText, setCustomText] = useState('Madame Pastel');
  const [selectedToppingIndex, setSelectedToppingIndex] = useState(null);

  // Historial para deshacer
  const [history, setHistory] = useState([]);

  // Estado sonoro
  const [isMuted, setIsMuted] = useState(getSoundMuted());

  // Modal del veredicto
  const [showVerdict, setShowVerdict] = useState(false);
  const [verdictData, setVerdictData] = useState(null);

  const handleToggleSound = () => {
    const muted = toggleSoundMuted();
    setIsMuted(muted);
  };

  const handleTierChange = (newTier) => {
    setTier(newTier);
    playColorSplash();
  };

  const handleFrostingChange = (newFrosting) => {
    setFrosting(newFrosting);
    playColorSplash();
  };

  const handleDripChange = (newDrip) => {
    setDrip(newDrip);
    playColorSplash();
  };

  const handleAddTopping = (newTopping) => {
    setHistory((prev) => [...prev, toppings]);
    setToppings((prev) => [...prev, newTopping]);
    setSelectedToppingIndex(toppings.length);
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const lastState = history[history.length - 1];
    setHistory((prev) => prev.slice(0, -1));
    setToppings(lastState);
    setSelectedToppingIndex(null);
    playTrashSound();
  };

  const handleClearAll = () => {
    if (toppings.length === 0) return;
    if (window.confirm('¿Deseas quitar todos los toppings para empezar de nuevo?')) {
      setHistory((prev) => [...prev, toppings]);
      setToppings([]);
      setSelectedToppingIndex(null);
      playTrashSound();
    }
  };

  const handleFinishCreation = () => {
    const result = evaluateCakeCreation({
      tier,
      frosting,
      drip,
      toppings,
      customText
    });
    setVerdictData(result);
    setShowVerdict(true);
  };

  return (
    <div className="cake-studio-page">
      <div className="cake-studio-container">
        {/* Encabezado del taller */}
        <header className="studio-header">
          <div className="header-badge">🎮 Taller Creativo & Minijuego</div>
          <h1 className="studio-title">Crea tu Pastel Soñado</h1>
          <p className="studio-description">
            Elegí pisos y coberturas, arrastrá toppings artesanales a tu gusto y recibí el{' '}
            <strong>Veredicto de Madame Pastel</strong> con un cupón de regalo para tu pedido.
          </p>

          <div className="studio-top-controls">
            <button
              type="button"
              className={`sound-toggle-btn ${isMuted ? 'muted' : ''}`}
              onClick={handleToggleSound}
              title={isMuted ? 'Activar efectos de sonido' : 'Silenciar sonido'}
            >
              {isMuted ? '🔇 Sonido desactivado' : '🔊 Efectos activos'}
            </button>

            <Link to="/que-dulce-sos" className="classic-link-btn" style={{ background: '#fdf2f4', color: '#6A2C3E', border: '1px solid #fad2da' }}>
              🍓 ¿Qué dulce sos? →
            </Link>

            <Link to="/trivia" className="classic-link-btn" style={{ background: '#fdf2f4', color: '#6A2C3E', border: '1px solid #fad2da' }}>
              🎯 Trivia (15s) →
            </Link>

            <Link to="/armar-torta" className="classic-link-btn">
              Formulario clásico →
            </Link>
          </div>
        </header>

        {/* Barra superior de configuración rápida: Pisos, Cobertura y Drip */}
        <section className="studio-selectors-bar">
          {/* 1. Selector de pisos */}
          <div className="selector-group">
            <label className="selector-label">
              <span className="step-num">1</span> Pisos & Altura
            </label>
            <div className="tiers-pill-list">
              {CAKE_TIERS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  className={`tier-pill-btn ${tier.id === t.id ? 'active' : ''}`}
                  onClick={() => handleTierChange(t)}
                >
                  <span className="tier-icon">{t.icon}</span>
                  <div className="tier-text">
                    <strong>{t.name}</strong>
                    <small>{t.layers === 1 ? '10 porc.' : t.layers === 2 ? '22 porc.' : '35 porc.'}</small>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Cobertura / Color */}
          <div className="selector-group">
            <label className="selector-label">
              <span className="step-num">2</span> Cobertura
            </label>
            <div className="swatch-list">
              {FROSTING_COLORS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  className={`swatch-btn ${frosting.id === f.id ? 'active' : ''}`}
                  style={{ backgroundColor: f.color }}
                  onClick={() => handleFrostingChange(f)}
                  title={f.name}
                >
                  {frosting.id === f.id && <span className="swatch-check">✓</span>}
                </button>
              ))}
            </div>
            <span className="swatch-current-name">{frosting.name}</span>
          </div>

          {/* 3. Estilo de Drip */}
          <div className="selector-group">
            <label className="selector-label">
              <span className="step-num">3</span> Drip
            </label>
            <div className="drip-buttons-list">
              {DRIP_STYLES.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  className={`drip-btn ${drip.id === d.id ? 'active' : ''}`}
                  onClick={() => handleDripChange(d)}
                >
                  <span
                    className="drip-indicator-dot"
                    style={{
                      backgroundColor: d.color === 'transparent' ? '#eee' : d.color,
                      border: d.color === 'transparent' ? '1px dashed #999' : 'none'
                    }}
                  />
                  {d.name}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Área interactiva principal: Canvas a la izquierda y Paleta a la derecha */}
        <div className="studio-workspace">
          {/* Columna del Canvas / Pastel */}
          <section className="canvas-column">
            <div className="canvas-header-bar">
              <span className="canvas-counter">
                🍓 <strong>{toppings.length}</strong> adornos en el pastel
              </span>
              <div className="canvas-actions">
                <button
                  type="button"
                  className="btn-canvas-action"
                  onClick={handleUndo}
                  disabled={history.length === 0}
                  title="Deshacer último topping"
                >
                  ↩ Deshacer
                </button>
                <button
                  type="button"
                  className="btn-canvas-action"
                  onClick={handleClearAll}
                  disabled={toppings.length === 0}
                  title="Limpiar todos los toppings"
                >
                  🗑 Limpiar
                </button>
              </div>
            </div>

            <CakeCanvas
              tier={tier}
              frosting={frosting}
              drip={drip}
              toppings={toppings}
              setToppings={setToppings}
              customText={customText}
              selectedToppingIndex={selectedToppingIndex}
              setSelectedToppingIndex={setSelectedToppingIndex}
              svgRef={svgRef}
            />

            {/* Botón principal de finalización */}
            <div className="finish-creation-section">
              <button
                type="button"
                className="btn-finish-cake"
                onClick={handleFinishCreation}
              >
                <span className="btn-icon">🏆</span>
                ¡Terminé mi creación! Obtener Veredicto
              </button>
              <p className="finish-hint">
                Madame Pastel evaluará tu diseño y te otorgará un cupón de descuento especial.
              </p>
            </div>
          </section>

          {/* Columna de la Paleta de Toppings */}
          <aside className="palette-column">
            <ToppingPalette
              tier={tier}
              onAddTopping={handleAddTopping}
              customText={customText}
              setCustomText={setCustomText}
            />
          </aside>
        </div>
      </div>

      {/* Modal de Veredicto & Recompensa */}
      {showVerdict && verdictData && (
        <CakeVerdictModal
          verdict={verdictData}
          tier={tier}
          frosting={frosting}
          drip={drip}
          toppings={toppings}
          customText={customText}
          config={config}
          svgRef={svgRef}
          onClose={() => setShowVerdict(false)}
        />
      )}
    </div>
  );
};

export default CakeStudioPage;
