import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FaHeart,
  FaWhatsapp,
  FaDownload,
  FaRedo,
  FaCopy,
  FaArrowLeft,
  FaCheck
} from 'react-icons/fa';
import {
  QUIZ_QUESTIONS,
  calculatePersonalityResult
} from '../data/personalityTestData';
import {
  playToppingPop,
  playFanfare,
  getSoundMuted,
  toggleSoundMuted
} from '../utils/cakeSoundEffects';
import '../styles/PersonalityQuizPage.css';

const PersonalityQuizPage = () => {
  const [gameState, setGameState] = useState('intro'); // 'intro' | 'quiz' | 'result'
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [result, setResult] = useState(null);
  const [couponCopied, setCouponCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [muted, setMuted] = useState(getSoundMuted());

  const handleToggleMute = () => {
    const next = toggleSoundMuted();
    setMuted(next);
  };

  const handleStart = () => {
    setAnswers([]);
    setCurrentStep(0);
    setSelectedOption(null);
    setGameState('quiz');
    playToppingPop(1.1);
  };

  const handleSelectOption = (profileKey) => {
    setSelectedOption(profileKey);
    playToppingPop(1.3);

    const nextAnswers = [...answers, profileKey];
    setAnswers(nextAnswers);

    setTimeout(() => {
      if (currentStep + 1 < QUIZ_QUESTIONS.length) {
        setCurrentStep((prev) => prev + 1);
        setSelectedOption(null);
      } else {
        const finalResult = calculatePersonalityResult(nextAnswers);
        setResult(finalResult);
        setGameState('result');
        playFanfare();
      }
    }, 380);
  };

  const handlePreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
      setAnswers((prev) => prev.slice(0, -1));
      setSelectedOption(null);
    } else {
      setGameState('intro');
    }
  };

  const handleCopyCoupon = (code) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(code).then(() => {
        setCouponCopied(true);
        setTimeout(() => setCouponCopied(false), 2500);
      });
    }
  };

  const getWhatsAppShareUrl = () => {
    if (!result) return '#';
    const text = `✨ ¡Hice el Test de Personalidad de Madame Pastel y me encantó! ✨\n\n🍰 Mi Dulce Gemelo es: *${result.name}*\n👑 Arquetipo: *${result.archetype}*\n\n"${result.tagline}"\n\n🎁 Además me regalaron el cupón *${result.couponCode}* con *${result.couponDiscount}* para mimarme con algo rico.\n\n¿Y vos qué dulce sos? ¡Hacé el test acá! 👇\n${window.location.origin}/que-dulce-sos`;
    return `https://wa.me/?text=${encodeURIComponent(text)}`;
  };

  const drawRoundedRect = (ctx, x, y, width, height, radius) => {
    if (typeof ctx.roundRect === 'function') {
      ctx.beginPath();
      ctx.roundRect(x, y, width, height, radius);
    } else {
      ctx.beginPath();
      ctx.rect(x, y, width, height);
    }
  };

  // Generador de imagen vertical de alta resolución (1080x1920) estilo Instagram Story
  const handleDownloadStoryImage = () => {
    if (!result) return;
    setDownloading(true);

    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1080;
      canvas.height = 1920;
      const ctx = canvas.getContext('2d');

      // 1. Fondo degradado según el perfil
      const grad = ctx.createLinearGradient(0, 0, 1080, 1920);
      if (result.id === 'matilda') {
        grad.addColorStop(0, '#261309');
        grad.addColorStop(0.5, '#4a2511');
        grad.addColorStop(1, '#663317');
      } else if (result.id === 'pavlova') {
        grad.addColorStop(0, '#66142a');
        grad.addColorStop(0.5, '#992c4b');
        grad.addColorStop(1, '#cc4e72');
      } else if (result.id === 'macaron') {
        grad.addColorStop(0, '#1c2e1f');
        grad.addColorStop(0.5, '#355239');
        grad.addColorStop(1, '#537d59');
      } else if (result.id === 'lemonpie') {
        grad.addColorStop(0, '#422f00');
        grad.addColorStop(0.5, '#6e4f02');
        grad.addColorStop(1, '#9e7309');
      } else {
        grad.addColorStop(0, '#241a33');
        grad.addColorStop(0.5, '#402e5c');
        grad.addColorStop(1, '#61488a');
      }

      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1080, 1920);

      // Marco dorado sutil
      ctx.strokeStyle = 'rgba(255, 215, 0, 0.45)';
      ctx.lineWidth = 14;
      ctx.strokeRect(40, 40, 1000, 1840);

      // Marco interior
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
      ctx.lineWidth = 2;
      ctx.strokeRect(60, 60, 960, 1800);

      // Encabezado
      ctx.textAlign = 'center';
      ctx.fillStyle = '#FFD700';
      ctx.font = 'bold 36px sans-serif';
      ctx.fillText('M A D A M E   P A S T E L', 540, 180);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.font = '28px sans-serif';
      ctx.fillText('TEST DE PERSONALIDAD PASTELERA', 540, 230);

      // Emoji central
      ctx.font = '160px serif';
      ctx.fillText(result.emoji, 540, 450);

      // Badge
      ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
      drawRoundedRect(ctx, 320, 500, 440, 50, 25);
      ctx.fill();

      ctx.fillStyle = '#FFD700';
      ctx.font = 'bold 24px sans-serif';
      ctx.fillText('★ MI DULCE GEMELO ★', 540, 534);

      // Nombre del dulce
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 64px serif';
      ctx.fillText(result.name, 540, 640);

      // Arquetipo
      ctx.fillStyle = '#FFE4E6';
      ctx.font = 'italic 38px serif';
      ctx.fillText(`« ${result.archetype} »`, 540, 710);

      // Separador decorativo
      ctx.strokeStyle = 'rgba(255, 215, 0, 0.6)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(340, 760);
      ctx.lineTo(740, 760);
      ctx.stroke();

      // Frase lema
      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.font = '32px sans-serif';
      ctx.fillText(`"${result.tagline}"`, 540, 830);

      // Tarjeta de descripción
      ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
      drawRoundedRect(ctx, 140, 890, 800, 360, 24);
      ctx.fill();

      // Líneas de descripción con wrap
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '30px sans-serif';
      const words = result.description.split(' ');
      let line = '';
      let y = 960;
      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = ctx.measureText(testLine);
        if (metrics.width > 720 && n > 0) {
          ctx.fillText(line.trim(), 540, y);
          line = words[n] + ' ';
          y += 46;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line.trim(), 540, y);

      // Rasgos en pastillas
      ctx.fillStyle = '#FFD700';
      ctx.font = 'bold 28px sans-serif';
      ctx.fillText('MIS RASGOS:', 540, 1320);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 30px sans-serif';
      const traitsText = result.traits.join('  •  ');
      ctx.fillText(traitsText, 540, 1370);

      // Cupón de regalo
      ctx.fillStyle = 'rgba(255, 215, 0, 0.18)';
      ctx.strokeStyle = '#FFD700';
      ctx.lineWidth = 3;
      drawRoundedRect(ctx, 240, 1450, 600, 170, 20);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#FFD700';
      ctx.font = '26px sans-serif';
      ctx.fillText('CUPÓN EXCLUSIVO DE REGALO', 540, 1500);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 50px monospace';
      ctx.fillText(result.couponCode, 540, 1560);

      ctx.fillStyle = '#FFE4E6';
      ctx.font = '24px sans-serif';
      ctx.fillText(result.couponDiscount, 540, 1598);

      // Pie de foto para Instagram
      ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
      ctx.font = '26px sans-serif';
      ctx.fillText('¿Y vos qué dulce sos? Descubrilo en madamepastel.com', 540, 1720);
      ctx.fillText('Etiquetanos en @madamepastel 💕', 540, 1765);

      // Convertir y descargar
      canvas.toBlob((blob) => {
        if (!blob) {
          setDownloading(false);
          return;
        }
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `mi-dulce-gemelo-madame-pastel-${result.id}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        setDownloading(false);
      }, 'image/png');
    } catch (e) {
      setDownloading(false);
    }
  };

  const currentQ = QUIZ_QUESTIONS[currentStep];

  return (
    <div className="personality-quiz-page">
      {/* Barra superior */}
      <header className="quiz-header">
        <div className="container quiz-header-wrap">
          <div className="quiz-brand-box">
            <span className="quiz-top-badge">✨ Experiencia Sensorial</span>
            <h1 className="quiz-top-title">¿Qué Dulce de Madame Pastel sos?</h1>
          </div>

          <div className="quiz-header-links">
            <button
              type="button"
              className="quiz-mute-toggle"
              onClick={handleToggleMute}
              title={muted ? 'Activar sonido' : 'Silenciar sonido'}
            >
              {muted ? '🔇' : '🔊'}
            </button>
            <Link to="/macaron-de-la-suerte" className="quiz-other-link">
              🥠 Macaron Diario
            </Link>
            <Link to="/trivia" className="quiz-other-link">
              🎯 Ir a la Trivia
            </Link>
            <Link to="/crea-tu-pastel" className="quiz-other-link">
              🎂 Crea tu Pastel
            </Link>
          </div>
        </div>
      </header>

      <main className="container quiz-main-container">
        {/* ============================================================== */}
        {/* 1. INTRODUCCIÓN / PORTADA DEL TEST                             */}
        {/* ============================================================== */}
        {gameState === 'intro' && (
          <section className="quiz-card quiz-intro-card">
            <div className="quiz-hero-badge">
              <span>🌸 Test de Personalidad Pastelera</span>
            </div>

            <div className="quiz-intro-avatar" aria-hidden="true">
              <span className="avatar-emoji">✨</span>
            </div>

            <h2 className="quiz-intro-heading">
              Descubrí tu creación gemela en nuestro atelier
            </h2>

            <p className="quiz-intro-desc">
              Cada postre tiene un alma, una textura y un compás único. A través de{' '}
              <strong>5 preguntas sensoriales</strong> sobre tus gustos, tus rituales y tus sueños,
              Madame Pastel revelará qué delicia de nuestra carta resuena con tu esencia.
            </p>

            <div className="quiz-perks-row">
              <div className="quiz-perk-item">
                <span className="perk-icon">🔮</span>
                <strong>Tu Arquetipo Dulce</strong>
                <p>Un perfil poético y personalizado</p>
              </div>
              <div className="quiz-perk-item">
                <span className="perk-icon">📸</span>
                <strong>Historia de Instagram</strong>
                <p>Descargá tu postal 9:16 lista para compartir</p>
              </div>
              <div className="quiz-perk-item">
                <span className="perk-icon">🎁</span>
                <strong>Cupón 10% OFF</strong>
                <p>Para probar tu dulce gemelo en la tienda</p>
              </div>
            </div>

            <button
              type="button"
              className="btn btn-quiz-start"
              onClick={handleStart}
            >
              Comenzar mi Viaje Sensorial ✨
            </button>
          </section>
        )}

        {/* ============================================================== */}
        {/* 2. PREGUNTAS DEL TEST                                          */}
        {/* ============================================================== */}
        {gameState === 'quiz' && currentQ && (
          <section className="quiz-card quiz-step-card">
            {/* Barra de progreso */}
            <div className="quiz-progress-section">
              <div className="quiz-step-meta">
                <button
                  type="button"
                  className="btn-quiz-back"
                  onClick={handlePreviousStep}
                  title="Pregunta anterior"
                >
                  <FaArrowLeft /> Volver
                </button>
                <span className="quiz-step-counter">
                  Paso {currentStep + 1} de {QUIZ_QUESTIONS.length}
                </span>
              </div>

              <div className="quiz-progress-track">
                <div
                  className="quiz-progress-bar"
                  style={{
                    width: `${((currentStep + 1) / QUIZ_QUESTIONS.length) * 100}%`
                  }}
                />
              </div>
            </div>

            {/* Enunciado */}
            <div className="quiz-question-box">
              <span className="question-tag">Pregunta {currentStep + 1}</span>
              <h2 className="quiz-question-title">{currentQ.question}</h2>
              <p className="quiz-question-subtitle">{currentQ.subtitle}</p>
            </div>

            {/* Opciones */}
            <div className="quiz-options-list">
              {currentQ.options.map((opt, idx) => {
                const isChosen = selectedOption === opt.profile;
                return (
                  <button
                    key={idx}
                    type="button"
                    className={`quiz-option-card ${isChosen ? 'selected' : ''}`}
                    onClick={() => handleSelectOption(opt.profile)}
                  >
                    <span className="option-icon-wrap">{opt.icon}</span>
                    <span className="option-text">{opt.text}</span>
                    <span className="option-select-indicator">
                      {isChosen ? <FaCheck /> : <FaHeart />}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* ============================================================== */}
        {/* 3. RESULTADO: TU DULCE GEMELO & HISTORIA                       */}
        {/* ============================================================== */}
        {gameState === 'result' && result && (
          <section className="quiz-card quiz-result-card">
            {/* Tarjeta de Historia de Instagram */}
            <div
              className="story-preview-card"
              style={{ background: result.palette.bgGradient }}
            >
              <div className="story-inner-border">
                <div className="story-brand-header">
                  <span className="story-atelier-title">MADAME PASTEL</span>
                  <span className="story-quiz-tag">Test de Personalidad Pastelera</span>
                </div>

                <div className="story-emoji-hero" aria-hidden="true">
                  <span>{result.emoji}</span>
                </div>

                <div className="story-gemelo-badge">
                  ★ MI DULCE GEMELO ★
                </div>

                <h2 className="story-product-name">{result.name}</h2>
                <h3 className="story-archetype">« {result.archetype} »</h3>

                <p className="story-tagline">"{result.tagline}"</p>

                <div className="story-description-box">
                  <p>{result.description}</p>
                </div>

                <div className="story-traits-wrap">
                  {result.traits.map((trait, tIdx) => (
                    <span key={tIdx} className="story-trait-chip">
                      ✨ {trait}
                    </span>
                  ))}
                </div>

                {/* Cupón en la historia */}
                <div className="story-coupon-pill">
                  <span className="coupon-pill-title">Tu Recompensa Dulce:</span>
                  <span className="coupon-pill-code">{result.couponCode}</span>
                  <span className="coupon-pill-discount">{result.couponDiscount}</span>
                </div>

                <footer className="story-footer">
                  <span>@madamepastel • madamepastel.com</span>
                </footer>
              </div>
            </div>

            {/* Panel de acciones y conversión */}
            <div className="result-actions-panel">
              <div className="result-coupon-copy-box">
                <div>
                  <span className="copy-box-label">Código de descuento desbloqueado:</span>
                  <strong className="copy-box-code">{result.couponCode}</strong>
                </div>
                <button
                  type="button"
                  className="btn-copy-quiz-coupon"
                  onClick={() => handleCopyCoupon(result.couponCode)}
                >
                  <FaCopy /> {couponCopied ? '¡Copiado!' : 'Copiar Cupón'}
                </button>
              </div>

              <div className="result-buttons-group">
                <button
                  type="button"
                  className="btn btn-download-story"
                  onClick={handleDownloadStoryImage}
                  disabled={downloading}
                >
                  <FaDownload />{' '}
                  {downloading ? 'Generando postal...' : 'Descargar Historia de Instagram (PNG)'}
                </button>

                <a
                  href={getWhatsAppShareUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-whatsapp-quiz"
                >
                  <FaWhatsapp /> Compartir en WhatsApp
                </a>

                <Link to="/productos" className="btn btn-order-match">
                  🍰 Probar mi Dulce Gemelo en la Tienda
                </Link>

                <button
                  type="button"
                  className="btn btn-retry-quiz"
                  onClick={handleStart}
                >
                  <FaRedo /> Volver a hacer el test
                </button>
              </div>

              {/* Enlaces cruzados */}
              <div className="quiz-cross-links">
                <p>¿Querés más entretenimiento dulce?</p>
                <div className="cross-links-flex">
                  <Link to="/macaron-de-la-suerte" className="cross-link-pill">
                    🥠 Macaron de la Suerte (Ritual Diario)
                  </Link>
                  <Link to="/trivia" className="cross-link-pill">
                    🎯 Desafío Trivia (15s)
                  </Link>
                  <Link to="/crea-tu-pastel" className="cross-link-pill">
                    🎂 Diseñar mi Pastel
                  </Link>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default PersonalityQuizPage;
