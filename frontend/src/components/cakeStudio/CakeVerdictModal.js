import React, { useState, useEffect } from 'react';
import { playFanfare } from '../../utils/cakeSoundEffects';
import { buildWhatsAppOrderUrl } from '../../utils/whatsappOrder';

const DEFAULT_WHATSAPP = '5492235512021';

const CakeVerdictModal = ({
  verdict,
  tier,
  frosting,
  drip,
  toppings,
  customText,
  config,
  svgRef,
  onClose
}) => {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    // Tocar fanfarria festiva al abrir el veredicto
    playFanfare();
  }, []);

  const handleCopyCoupon = () => {
    if (verdict?.couponCode) {
      navigator.clipboard.writeText(verdict.couponCode).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      });
    }
  };

  // Generar y descargar la imagen PNG a partir del SVG del pastel
  const handleDownloadImage = () => {
    if (!svgRef.current) return;
    setDownloading(true);

    try {
      const svgElement = svgRef.current;
      const serializer = new XMLSerializer();
      const svgString = serializer.serializeToString(svgElement);
      const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const URL = window.URL || window.webkitURL || window;
      const blobURL = URL.createObjectURL(svgBlob);

      const image = new Image();
      image.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 1000;
        canvas.height = 1040;
        const ctx = canvas.getContext('2d');

        // Fondo cálido elegante de postal
        ctx.fillStyle = '#FFF8F4';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Marco sutil dorado
        ctx.strokeStyle = '#D4AF37';
        ctx.lineWidth = 6;
        ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

        // Encabezado de la postal
        ctx.fillStyle = '#87324B';
        ctx.font = 'bold 36px Georgia, serif';
        ctx.textAlign = 'center';
        ctx.fillText('Madame Pastel — Creación Exclusiva', 500, 75);

        ctx.fillStyle = '#666';
        ctx.font = 'italic 22px Georgia, serif';
        ctx.fillText(`Título: ${verdict.title} · ${verdict.badge}`, 500, 110);

        // Dibujar el pastel
        ctx.drawImage(image, 50, 120, 900, 840);

        // Pie de página con el cupón
        ctx.fillStyle = '#87324B';
        ctx.font = 'bold 24px Arial, sans-serif';
        ctx.fillText(`Cupón de regalo: ${verdict.couponCode}`, 500, 990);

        // Descargar archivo
        const pngUrl = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.href = pngUrl;
        downloadLink.download = `madame-pastel-creacion-${Date.now()}.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);

        URL.revokeObjectURL(blobURL);
        setDownloading(false);
      };
      image.src = blobURL;
    } catch (err) {
      console.error('Error al descargar postal:', err);
      setDownloading(false);
    }
  };

  // Construir mensaje detallado de cotización para WhatsApp
  const handleWhatsAppQuote = () => {
    const phone = config?.socialLinks?.whatsapp || config?.contactInfo?.phone || DEFAULT_WHATSAPP;

    // Resumen de toppings agrupados
    const toppingCounts = toppings.reduce((acc, t) => {
      acc[t.name] = (acc[t.name] || 0) + 1;
      return acc;
    }, {});

    const toppingsSummary = Object.entries(toppingCounts)
      .map(([name, count]) => `  • ${name} x${count}`)
      .join('\n');

    const messageLines = [
      '¡Hola Madame Pastel! ✨ Acabo de crear un pastel personalizado en su Taller Interactivo y me gustaría cotizarlo:',
      '',
      `🎂 *Estructura:* ${tier.name} (${tier.subtitle})`,
      `🎨 *Cobertura:* ${frosting.name}`,
      `🍯 *Estilo de Drip:* ${drip?.name || 'Sin drip'}`,
      customText ? `🏷️ *Mensaje en Topper:* "${customText}"` : null,
      '',
      toppings.length > 0 ? `🍓 *Decoraciones seleccionadas:*\n${toppingsSummary}` : '🍓 *Decoraciones:* Estilo minimalista / liso',
      '',
      `🏆 *Veredicto obtenido:* ${verdict.title} (${verdict.score}/100 pts)`,
      `🎁 *Cupón ganado:* ${verdict.couponCode}`,
      '',
      '¿Podrían confirmarme disponibilidad de fecha y valor final? ¡Muchas gracias! 💕'
    ].filter(Boolean);

    const fullMessage = messageLines.join('\n');
    const waUrl = buildWhatsAppOrderUrl(phone, fullMessage);
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="cake-verdict-overlay" role="dialog" aria-modal="true" aria-labelledby="verdict-title">
      <div className="cake-verdict-card animate-pop">
        <button
          type="button"
          className="btn-verdict-close"
          onClick={onClose}
          aria-label="Cerrar veredicto"
        >
          ✕
        </button>

        <div className="verdict-confetti" aria-hidden="true">
          <span>✨</span>
          <span>🎉</span>
          <span>🍰</span>
          <span>⭐</span>
          <span>🎀</span>
        </div>

        <div className="verdict-badge-large">{verdict.badge}</div>

        <span className="verdict-subtitle">Veredicto de Madame Pastel</span>
        <h2 id="verdict-title" className="verdict-chef-title">
          {verdict.title}
        </h2>

        <div className="verdict-stars">
          {'★'.repeat(verdict.stars)}
          <span className="verdict-score">({verdict.score}/100 pts)</span>
        </div>

        <p className="verdict-critique">“{verdict.critique}”</p>

        {/* Tarjeta de recompensa / Cupón */}
        <div className="coupon-reward-box">
          <div className="coupon-label">TU RECOMPENSA DE REGALO</div>
          <div className="coupon-code-row">
            <span className="coupon-code-text">{verdict.couponCode}</span>
            <button
              type="button"
              className={`btn-copy-coupon ${copied ? 'copied' : ''}`}
              onClick={handleCopyCoupon}
            >
              {copied ? '¡Copiado! ✓' : 'Copiar'}
            </button>
          </div>
          <p className="coupon-benefit">{verdict.discountDescription}</p>
        </div>

        {/* Botones de acción */}
        <div className="verdict-actions">
          <button
            type="button"
            className="btn-verdict-action whatsapp"
            onClick={handleWhatsAppQuote}
          >
            <span>💬</span> Pedir Cotización por WhatsApp
          </button>

          <button
            type="button"
            className="btn-verdict-action download"
            onClick={handleDownloadImage}
            disabled={downloading}
          >
            <span>📷</span> {downloading ? 'Generando postal...' : 'Descargar Postal (.png)'}
          </button>
        </div>

        <button
          type="button"
          className="btn-verdict-back"
          onClick={onClose}
        >
          Seguir editando mi pastel
        </button>

        <div style={{ marginTop: '1rem', borderTop: '1px dashed #fad0d8', paddingTop: '0.85rem' }}>
          <p style={{ margin: '0 0 0.4rem', fontSize: '0.85rem', color: '#795d65' }}>
            ¿Querés ganar otro cupón de descuento y compartir tu historia?
          </p>
          <div style={{ display: 'flex', gap: '0.85rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a
              href="/macaron-de-la-suerte"
              style={{ color: '#B83B5E', fontWeight: '700', fontSize: '0.88rem', textDecoration: 'underline' }}
            >
              🥠 Macaron de la Suerte →
            </a>
            <a
              href="/que-dulce-sos"
              style={{ color: '#B83B5E', fontWeight: '700', fontSize: '0.88rem', textDecoration: 'underline' }}
            >
              🍓 Test: ¿Qué dulce sos? →
            </a>
            <a
              href="/trivia"
              style={{ color: '#B83B5E', fontWeight: '700', fontSize: '0.88rem', textDecoration: 'underline' }}
            >
              🎯 Trivia (15s) →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CakeVerdictModal;
