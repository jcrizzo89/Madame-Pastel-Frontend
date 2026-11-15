import React, { useRef, useState, useEffect } from 'react';
import { playToppingPop, playTrashSound } from '../../utils/cakeSoundEffects';

// Función para renderizar los gráficos SVG de cada tipo de topping
const renderToppingShape = (topping, customText) => {
  const { type, color, filling, gold } = topping;

  switch (type) {
    case 'macaron':
      return (
        <g className="topping-svg-macaron">
          {/* Sombra base */}
          <ellipse cx="0" cy="10" rx="19" ry="5" fill="rgba(0,0,0,0.18)" />
          {/* Tapa inferior */}
          <ellipse cx="0" cy="5" rx="18" ry="8" fill={color} />
          {/* Pie crocante del macaron (corona rugosa) */}
          <path
            d="M -18,5 Q -9,8 0,8 Q 9,8 18,5 Q 16,9 0,9 Q -16,9 -18,5 Z"
            fill={filling || '#fff'}
            opacity="0.9"
          />
          {/* Ganache / Relleno */}
          <rect x="-16" y="1" width="32" height="4" rx="2" fill={filling || '#fff'} />
          {/* Tapa superior */}
          <ellipse cx="0" cy="-2" rx="18" ry="9" fill={color} />
          {/* Brillo de superficie */}
          <ellipse cx="-5" cy="-5" rx="10" ry="4" fill="#ffffff" opacity="0.35" />
        </g>
      );

    case 'strawberry':
      return (
        <g className="topping-svg-strawberry">
          {/* Sombra */}
          <ellipse cx="0" cy="14" rx="12" ry="4" fill="rgba(0,0,0,0.2)" />
          {/* Cuerpo frutilla */}
          <path
            d="M 0,-14 C 14,-14 16,5 0,16 C -16,5 -14,-14 0,-14 Z"
            fill="#D92038"
          />
          {/* Brillo */}
          <path
            d="M -5,-10 C 2,-10 4,-2 -2,6 C -7,0 -7,-8 -5,-10 Z"
            fill="#FF6B7A"
            opacity="0.55"
          />
          {/* Pepitas amarillas */}
          {[-6, 0, 6].map((x, i) => (
            <ellipse key={i} cx={x} cy={-2 + (i % 2) * 5} rx="1" ry="1.6" fill="#FFE57F" />
          ))}
          {/* Cabito y hojitas verdes */}
          <path
            d="M 0,-14 Q -5,-18 -9,-14 Q -4,-13 0,-13 Q 4,-13 9,-14 Q 5,-18 0,-14 Z"
            fill="#2E7D32"
          />
          <path d="M 0,-14 Q 2,-20 1,-21" stroke="#2E7D32" strokeWidth="2" strokeLinecap="round" fill="none" />
        </g>
      );

    case 'raspberry':
      return (
        <g className="topping-svg-raspberry">
          <ellipse cx="0" cy="12" rx="11" ry="3.5" fill="rgba(0,0,0,0.18)" />
          <circle cx="-6" cy="4" r="5.5" fill="#A8103A" />
          <circle cx="6" cy="4" r="5.5" fill="#A8103A" />
          <circle cx="0" cy="6" r="5.5" fill="#900C31" />
          <circle cx="-5" cy="-2" r="5.5" fill="#C2184B" />
          <circle cx="5" cy="-2" r="5.5" fill="#C2184B" />
          <circle cx="0" cy="-1" r="5.5" fill="#D81B60" />
          <circle cx="0" cy="-7" r="5" fill="#E91E63" />
          <circle cx="-1" cy="-8" r="1.8" fill="#FF80AB" opacity="0.6" />
        </g>
      );

    case 'blueberry':
      return (
        <g className="topping-svg-blueberry">
          <ellipse cx="0" cy="7" rx="8" ry="3" fill="rgba(0,0,0,0.22)" />
          <circle cx="0" cy="0" r="8" fill="#2C387E" />
          <circle cx="0" cy="0" r="7.5" fill="#3949AB" />
          <circle cx="-2" cy="-2" r="3" fill="#5C6BC0" opacity="0.5" />
          {/* Corona del arándano */}
          <circle cx="2" cy="-3" r="2.2" fill="#1A237E" />
          <polygon points="1,-4 3,-4 2,-2" fill="#5C6BC0" />
        </g>
      );

    case 'citrus':
      return (
        <g className="topping-svg-citrus">
          <ellipse cx="0" cy="14" rx="14" ry="4" fill="rgba(0,0,0,0.15)" />
          <circle cx="0" cy="0" r="15" fill="#E65100" />
          <circle cx="0" cy="0" r="13.5" fill="#FFF3E0" />
          <circle cx="0" cy="0" r="12" fill="#FB8C00" />
          {/* Gajos */}
          {[-120, -60, 0, 60, 120, 180].map((deg, i) => (
            <line
              key={i}
              x1="0"
              y1="0"
              x2={Math.cos((deg * Math.PI) / 180) * 11}
              y2={Math.sin((deg * Math.PI) / 180) * 11}
              stroke="#FFF3E0"
              strokeWidth="1.2"
            />
          ))}
          <circle cx="0" cy="0" r="2.5" fill="#FFF3E0" />
        </g>
      );

    case 'meringue':
      return (
        <g className="topping-svg-meringue">
          <ellipse cx="0" cy="10" rx="13" ry="4" fill="rgba(0,0,0,0.16)" />
          <path
            d="M -13,6 C -14,-2 -5,-8 0,-15 C 5,-8 14,-2 13,6 C 9,10 -9,10 -13,6 Z"
            fill={topping.color || '#FFFDF7'}
          />
          {/* Sombras de pliegues en remolino */}
          <path d="M -10,6 C -7,0 -3,-5 0,-15" stroke="#EADFC7" strokeWidth="1.8" fill="none" />
          <path d="M 0,9 C 2,2 5,-4 0,-15" stroke="#EADFC7" strokeWidth="1.8" fill="none" />
          <path d="M 10,6 C 8,0 4,-5 0,-15" stroke="#EADFC7" strokeWidth="1.5" fill="none" />
        </g>
      );

    case 'truffle':
      return (
        <g className="topping-svg-truffle">
          <ellipse cx="0" cy="10" rx="12" ry="4" fill="rgba(0,0,0,0.25)" />
          <circle cx="0" cy="0" r="11" fill={topping.color || '#3B1E12'} />
          <circle cx="-3" cy="-3" r="5" fill="#4E2B1D" opacity="0.6" />
          {gold && (
            <polygon
              points="-2,-4 3,-6 5,-1 1,2 -4,0"
              fill="#FFD700"
              stroke="#FFE57F"
              strokeWidth="0.5"
            />
          )}
        </g>
      );

    case 'candle':
      return (
        <g className="topping-svg-candle">
          {/* Sombra */}
          <ellipse cx="0" cy="16" rx="6" ry="2.5" fill="rgba(0,0,0,0.18)" />
          {/* Cuerpo vela */}
          <rect x="-4" y="-12" width="8" height="28" rx="2" fill={color || '#FF70A6'} />
          {/* Rayitas espiral decorativas */}
          <line x1="-4" y1="-5" x2="4" y2="-1" stroke="#ffffff" strokeWidth="2" opacity="0.65" />
          <line x1="-4" y1="5" x2="4" y2="9" stroke="#ffffff" strokeWidth="2" opacity="0.65" />
          {/* Mecha */}
          <line x1="0" y1="-12" x2="0" y2="-16" stroke="#424242" strokeWidth="1.5" />
          {/* Llama con animación sutil de parpadeo */}
          <ellipse cx="0" cy="-22" rx="4.5" ry="7" fill="#FFC107" className="candle-flame-outer" />
          <ellipse cx="0" cy="-21" rx="2.5" ry="4.5" fill="#FF5722" className="candle-flame-inner" />
          <circle cx="0" cy="-19" r="1.5" fill="#FFF9C4" />
        </g>
      );

    case 'topper':
      const textToDisplay = (customText && customText.trim()) || 'Madame Pastel';
      return (
        <g className="topping-svg-topper">
          {/* Palillo de soporte en la torta */}
          <line x1="0" y1="0" x2="0" y2="28" stroke="#8D6E63" strokeWidth="2.5" strokeLinecap="round" />
          {/* Cartel dorado circular o banner */}
          <ellipse cx="0" cy="-14" rx="44" ry="18" fill="#FAF0D7" stroke="#D4AF37" strokeWidth="2" />
          <ellipse cx="0" cy="-14" rx="40" ry="15" fill="none" stroke="#E6CA65" strokeWidth="1" strokeDasharray="2,2" />
          <text
            x="0"
            y="-10"
            textAnchor="middle"
            fill="#5D4037"
            fontSize="10"
            fontWeight="bold"
            fontFamily="'Playfair Display', serif, sans-serif"
          >
            {textToDisplay.length > 18 ? textToDisplay.substring(0, 16) + '…' : textToDisplay}
          </text>
        </g>
      );

    case 'flower':
      return (
        <g className="topping-svg-flower">
          <ellipse cx="0" cy="11" rx="10" ry="3.5" fill="rgba(0,0,0,0.14)" />
          {/* Pétalos */}
          {[0, 72, 144, 216, 288].map((deg, i) => (
            <ellipse
              key={i}
              cx={Math.cos((deg * Math.PI) / 180) * 7}
              cy={Math.sin((deg * Math.PI) / 180) * 7}
              rx="6"
              ry="4"
              transform={`rotate(${deg} ${Math.cos((deg * Math.PI) / 180) * 7} ${Math.sin((deg * Math.PI) / 180) * 7})`}
              fill={color || '#F28482'}
            />
          ))}
          <circle cx="0" cy="0" r="4" fill="#FFEB3B" />
        </g>
      );

    case 'sprinkles':
    default:
      return (
        <g className="topping-svg-sprinkles">
          <circle cx="-7" cy="-5" r="2.5" fill="#FFD700" />
          <circle cx="6" cy="-3" r="2" fill="#E91E63" />
          <circle cx="0" cy="4" r="2.5" fill="#00E676" />
          <circle cx="8" cy="5" r="2" fill="#2979FF" />
          <circle cx="-5" cy="6" r="2.2" fill="#FF9100" />
        </g>
      );
  }
};

const CakeCanvas = ({
  tier,
  frosting,
  drip,
  toppings,
  setToppings,
  customText,
  selectedToppingIndex,
  setSelectedToppingIndex,
  svgRef
}) => {
  const [draggingIndex, setDraggingIndex] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  // Coordenadas relativas al SVG a partir de eventos mouse o touch
  const getSvgCoordinates = (e) => {
    if (!svgRef.current) return { x: 250, y: 250 };
    const svg = svgRef.current;
    const pt = svg.createSVGPoint();
    if (e.touches && e.touches.length > 0) {
      pt.x = e.touches[0].clientX;
      pt.y = e.touches[0].clientY;
    } else {
      pt.x = e.clientX;
      pt.y = e.clientY;
    }
    const loc = pt.matrixTransform(svg.getScreenCTM().inverse());
    return { x: loc.x, y: loc.y };
  };

  const handlePointerDown = (index, e) => {
    e.stopPropagation();
    setSelectedToppingIndex(index);
    setDraggingIndex(index);

    const coords = getSvgCoordinates(e);
    const targetTopping = toppings[index];
    setDragOffset({
      x: coords.x - targetTopping.x,
      y: coords.y - targetTopping.y
    });
  };

  const handlePointerMove = (e) => {
    if (draggingIndex === null) return;
    e.preventDefault();
    const coords = getSvgCoordinates(e);
    const newX = Math.max(50, Math.min(450, coords.x - dragOffset.x));
    const newY = Math.max(40, Math.min(440, coords.y - dragOffset.y));

    setToppings((prev) =>
      prev.map((item, idx) => (idx === draggingIndex ? { ...item, x: newX, y: newY } : item))
    );
  };

  const handlePointerUp = () => {
    if (draggingIndex !== null) {
      playToppingPop(1.1);
      setDraggingIndex(null);
    }
  };

  // Click en el fondo del lienzo deselecciona
  const handleBackgroundClick = (e) => {
    if (e.target.tagName === 'svg' || e.target.classList.contains('cake-background-click')) {
      setSelectedToppingIndex(null);
    }
  };

  const removeSelectedTopping = () => {
    if (selectedToppingIndex !== null) {
      playTrashSound();
      setToppings((prev) => prev.filter((_, idx) => idx !== selectedToppingIndex));
      setSelectedToppingIndex(null);
    }
  };

  // Configuración de dimensiones y pisos del pastel
  // Centro SVG: x=250. Altura máxima: y=500.
  // Piso 1 (base): y: 320, h: 90, w: 260
  // Piso 2 (medio): y: 235, h: 80, w: 200
  // Piso 3 (superior): y: 165, h: 70, w: 140
  const renderCakeTiers = () => {
    const layers = tier.layers;

    const tierConfigs = [];
    if (layers === 1) {
      tierConfigs.push({ y: 260, h: 120, w: 280, topY: 260 });
    } else if (layers === 2) {
      tierConfigs.push({ y: 310, h: 100, w: 290, topY: 310 });
      tierConfigs.push({ y: 210, h: 95, w: 210, topY: 210 });
    } else {
      tierConfigs.push({ y: 335, h: 85, w: 300, topY: 335 });
      tierConfigs.push({ y: 250, h: 80, w: 220, topY: 250 });
      tierConfigs.push({ y: 170, h: 75, w: 150, topY: 170 });
    }

    return (
      <g className="cake-tiers-group">
        {tierConfigs.map((t, index) => {
          const rx = t.w / 2;
          const ry = rx * 0.22;
          const cx = 250;
          const isTopTier = index === tierConfigs.length - 1;

          return (
            <g key={index} className={`tier-${index}`}>
              {/* Sombra de la base del piso */}
              <ellipse cx={cx} cy={t.y + t.h} rx={rx + 4} ry={ry + 2} fill="rgba(0,0,0,0.15)" />

              {/* Cilindro / Cuerpo del piso con gradiente tridimensional */}
              <path
                d={`M ${cx - rx},${t.y} 
                    L ${cx - rx},${t.y + t.h} 
                    A ${rx},${ry} 0 0 0 ${cx + rx},${t.y + t.h} 
                    L ${cx + rx},${t.y} 
                    Z`}
                fill={`url(#frostingGradient-${frosting.id})`}
              />

              {/* Detalle de textura suave horizontal */}
              <path
                d={`M ${cx - rx + 4},${t.y + t.h * 0.5} A ${rx - 4},${ry - 1} 0 0 0 ${cx + rx - 4},${t.y + t.h * 0.5}`}
                stroke={frosting.darkColor}
                strokeWidth="2.5"
                fill="none"
                opacity="0.4"
              />

              {/* Tapa elíptica superior del piso */}
              <ellipse
                cx={cx}
                cy={t.y}
                rx={rx}
                ry={ry}
                fill={frosting.color}
                stroke={frosting.darkColor}
                strokeWidth="1.5"
              />

              {/* Drip / Goteo si está activo y es el piso superior (o goteo sutil en todos) */}
              {drip && drip.id !== 'none' && isTopTier && (
                <g className="tier-drip" fill={drip.color}>
                  {/* Curva ondulada de drip derramándose */}
                  <path
                    d={`M ${cx - rx},${t.y}
                        C ${cx - rx + 15},${t.y + 18} ${cx - rx + 25},${t.y + 30} ${cx - rx + 35},${t.y + 20}
                        C ${cx - rx + 45},${t.y + 8}  ${cx - rx + 55},${t.y + 36} ${cx - rx + 68},${t.y + 18}
                        C ${cx - rx + 80},${t.y + 5}  ${cx - rx + 95},${t.y + 32} ${cx - rx + 110},${t.y + 15}
                        C ${cx - rx + 125},${t.y + 5} ${cx - rx + 140},${t.y + 28} ${cx - rx + 155},${t.y + 12}
                        C ${cx - rx + 170},${t.y + 34} ${cx - rx + 185},${t.y + 14} ${cx + rx},${t.y}
                        A ${rx},${ry} 0 0 1 ${cx - rx},${t.y} Z`}
                  />
                  {/* Gotas individuales escurriendo */}
                  <ellipse cx={cx - rx + 25} cy={t.y + 32} rx="4" ry="5.5" />
                  <ellipse cx={cx - rx + 56} cy={t.y + 39} rx="4.5" ry="6" />
                  <ellipse cx={cx - rx + 97} cy={t.y + 34} rx="4" ry="5" />
                  <ellipse cx={cx - rx + 142} cy={t.y + 30} rx="3.5" ry="4.5" />
                  <ellipse cx={cx - rx + 173} cy={t.y + 36} rx="4" ry="5.5" />

                  {/* Brillo en el drip superior */}
                  {drip.highlight && (
                    <path
                      d={`M ${cx - rx + 10},${t.y - 2} A ${rx - 10},${ry - 4} 0 0 1 ${cx + rx - 20},${t.y - 2}`}
                      stroke={drip.highlight}
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      fill="none"
                      opacity="0.65"
                    />
                  )}
                </g>
              )}
            </g>
          );
        })}
      </g>
    );
  };

  return (
    <div
      className="cake-canvas-wrapper"
      ref={containerRef}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      <svg
        ref={svgRef}
        viewBox="0 0 500 520"
        className="cake-interactive-svg"
        onClick={handleBackgroundClick}
        style={{ touchAction: 'none' }}
      >
        <defs>
          {/* Sombras y gradientes para las coberturas */}
          {frosting && (
            <linearGradient id={`frostingGradient-${frosting.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={frosting.darkColor} />
              <stop offset="35%" stopColor={frosting.color} />
              <stop offset="70%" stopColor={frosting.color} />
              <stop offset="100%" stopColor={frosting.shadowColor} />
            </linearGradient>
          )}

          {/* Gradiente del Stand / Pedestal Dorado & Mármol */}
          <linearGradient id="pedestalGold" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#C5A059" />
            <stop offset="40%" stopColor="#F9E8B2" />
            <stop offset="70%" stopColor="#E5C175" />
            <stop offset="100%" stopColor="#A8833C" />
          </linearGradient>

          <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Zona clicable para deseleccionar */}
        <rect
          x="0"
          y="0"
          width="500"
          height="520"
          fill="transparent"
          className="cake-background-click"
        />

        {/* --- PEDESTAL / BASE DECORATIVA ELEGANTE --- */}
        <g className="cake-stand">
          {/* Sombra suave proyectada en la mesa */}
          <ellipse cx="250" cy="485" rx="190" ry="22" fill="rgba(0,0,0,0.12)" />

          {/* Pie central del pedestal */}
          <path
            d="M 235,430 L 225,475 Q 250,480 275,475 L 265,430 Z"
            fill="url(#pedestalGold)"
          />
          {/* Base inferior del pedestal */}
          <ellipse cx="250" cy="475" rx="65" ry="12" fill="url(#pedestalGold)" />
          <ellipse cx="250" cy="472" rx="60" ry="10" fill="#FAF4EA" opacity="0.35" />

          {/* Plato superior del pedestal */}
          <ellipse cx="250" cy="430" rx="175" ry="24" fill="url(#pedestalGold)" />
          <ellipse cx="250" cy="427" rx="168" ry="21" fill="#FFFFFF" />
          <ellipse cx="250" cy="427" rx="160" ry="18" fill="#FDFBF7" stroke="#E5C175" strokeWidth="1" />
        </g>

        {/* --- PISOS DEL PASTEL --- */}
        {renderCakeTiers()}

        {/* --- TOPPINGS ARRASTRABLES Y POSICIONADOS --- */}
        <g className="cake-toppings-layer">
          {toppings.map((topping, index) => {
            const isSelected = selectedToppingIndex === index;
            const isDragging = draggingIndex === index;

            return (
              <g
                key={topping.uid || index}
                transform={`translate(${topping.x}, ${topping.y}) rotate(${topping.rotation || 0}) scale(${topping.scale || 1})`}
                className={`placed-topping ${isSelected ? 'selected' : ''} ${isDragging ? 'dragging' : ''}`}
                onPointerDown={(e) => handlePointerDown(index, e)}
                style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
              >
                {/* Indicador de selección activa */}
                {isSelected && (
                  <g className="selection-ring">
                    <circle
                      cx="0"
                      cy="0"
                      r={(topping.size || 35) * 0.75}
                      fill="none"
                      stroke="#E87A90"
                      strokeWidth="2"
                      strokeDasharray="4,4"
                    />
                  </g>
                )}

                {/* Gráfico vectorial del topping */}
                {renderToppingShape(topping, customText)}
              </g>
            );
          })}
        </g>
      </svg>

      {/* Controles flotantes para el topping seleccionado */}
      {selectedToppingIndex !== null && toppings[selectedToppingIndex] && (
        <div className="topping-quick-controls">
          <span className="topping-title-tag">
            {toppings[selectedToppingIndex].name}
          </span>
          <button
            type="button"
            className="btn-topping-action rotate"
            onClick={() => {
              setToppings((prev) =>
                prev.map((t, idx) =>
                  idx === selectedToppingIndex
                    ? { ...t, rotation: ((t.rotation || 0) + 45) % 360 }
                    : t
                )
              );
            }}
            title="Rotar 45°"
          >
            ↻ Rotar
          </button>
          <button
            type="button"
            className="btn-topping-action remove"
            onClick={removeSelectedTopping}
            title="Eliminar topping"
          >
            🗑 Quitar
          </button>
        </div>
      )}

      {toppings.length === 0 && (
        <div className="canvas-empty-hint">
          ✨ Hacé clic o arrastrá toppings desde el panel lateral para decorar tu pastel
        </div>
      )}
    </div>
  );
};

export default CakeCanvas;
