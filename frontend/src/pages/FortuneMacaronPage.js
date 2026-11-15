import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FaGift,
  FaCopy,
  FaWhatsapp,
  FaClock,
  FaFire,
  FaRedo,
  FaVolumeUp,
  FaVolumeMute
} from 'react-icons/fa';
import {
  MACARON_VARIETIES,
  getTodayDateKey,
  getTimeUntilMidnight,
  getFortuneForDate
} from '../data/fortuneMacaronsData';
import {
  playMacaronCrackSound,
  playFanfare,
  getSoundMuted,
  toggleSoundMuted
} from '../utils/cakeSoundEffects';
import '../styles/FortuneMacaronPage.css';

const FortuneMacaronPage = () => {
  const [hasPlayedToday, setHasPlayedToday] = useState(false);
  const [selectedMacaron, setSelectedMacaron] = useState(null);
  const [isOpening, setIsOpening] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [fortuneData, setFortuneData] = useState(null);
  const [timeUntilReset, setTimeUntilReset] = useState(getTimeUntilMidnight());
  const [streak, setStreak] = useState(1);
  const [couponCopied, setCouponCopied] = useState(false);
  const [muted, setMuted] = useState(getSoundMuted());

  const todayKey = getTodayDateKey();

  // Control de sonido
  const handleToggleMute = () => {
    const next = toggleSoundMuted();
    setMuted(next);
  };

  // Cargar estado inicial desde localStorage
  useEffect(() => {
    try {
      const savedDate = localStorage.getItem('madame_pastel_fortune_date');
      const savedStreak = parseInt(localStorage.getItem('madame_pastel_fortune_streak') || '1', 10);
      setStreak(savedStreak);

      if (savedDate === todayKey) {
        setHasPlayedToday(true);
        setRevealed(true);
        setFortuneData(getFortuneForDate(todayKey));
      }
    } catch (e) {
      // Ignore localStorage errors
    }
  }, [todayKey]);

  // Actualizador del reloj de cuenta regresiva hasta medianoche
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeUntilReset(getTimeUntilMidnight());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Abrir un macaron
  const handleOpenMacaron = (macaron) => {
    if (hasPlayedToday || isOpening || revealed) return;

    setSelectedMacaron(macaron);
    setIsOpening(true);
    playMacaronCrackSound();

    // Actualizar racha y fecha en localStorage
    try {
      const lastDate = localStorage.getItem('madame_pastel_fortune_date');
      let newStreak = streak;

      if (lastDate) {
        const last = new Date(lastDate);
        const today = new Date(todayKey);
        const diffDays = Math.round((today - last) / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          newStreak += 1;
        } else if (diffDays > 1) {
          newStreak = 1;
        }
      } else {
        newStreak = 1;
      }

      setStreak(newStreak);
      localStorage.setItem('madame_pastel_fortune_date', todayKey);
      localStorage.setItem('madame_pastel_fortune_streak', String(newStreak));
    } catch (e) {}

    const todayFortune = getFortuneForDate(todayKey);
    setFortuneData(todayFortune);

    // Animación de apertura y revelación
    setTimeout(() => {
      setIsOpening(false);
      setRevealed(true);
      setHasPlayedToday(true);
      playFanfare();
    }, 1100);
  };

  // Botón para resetear (Modo Demo / probar nuevamente)
  const handleResetDemo = () => {
    try {
      localStorage.removeItem('madame_pastel_fortune_date');
    } catch (e) {}
    setHasPlayedToday(false);
    setRevealed(false);
    setSelectedMacaron(null);
    setIsOpening(false);
  };

  // Copiar cupón
  const handleCopyCoupon = (code) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(code).then(() => {
        setCouponCopied(true);
        setTimeout(() => setCouponCopied(false), 2500);
      });
    }
  };

  // WhatsApp Share URL
  const getWhatsAppShareUrl = () => {
    if (!fortuneData) return '#';
    const text = `🥠 ¡Abrí mi Macaron de la Suerte de Madame Pastel de hoy! ✨\n\n📜 Frase del día:\n"${fortuneData.quote.quote}"\n— ${fortuneData.quote.author} (${fortuneData.quote.theme})\n\n🎁 Mi beneficio de hoy: *${fortuneData.perk.discount}* con el cupón *${fortuneData.perk.code}*.\n\n¿Querés abrir tu macaron de hoy? ¡Entrá acá! 👇\n${window.location.origin}/macaron-de-la-suerte`;
    return `https://wa.me/?text=${encodeURIComponent(text)}`;
  };

  return (
    <div className="fortune-page">
      {/* Header superior */}
      <header className="fortune-header">
        <div className="container fortune-header-wrap">
          <div className="fortune-brand-box">
            <span className="fortune-badge">🥠 Ritual Diario de Fidelización</span>
            <h1 className="fortune-main-title">Macaron de la Suerte</h1>
          </div>

          <div className="fortune-header-actions">
            <button
              type="button"
              className="fortune-sound-toggle"
              onClick={handleToggleMute}
              title={muted ? 'Activar sonido' : 'Silenciar sonido'}
            >
              {muted ? <FaVolumeMute /> : <FaVolumeUp />}
              <span>{muted ? 'Silenciado' : 'Sonido'}</span>
            </button>

            <Link to="/que-dulce-sos" className="fortune-switch-link">
              🍓 ¿Qué dulce sos?
            </Link>
          </div>
        </div>
      </header>

      <main className="container fortune-main-container">
        {/* Banner de racha diaria */}
        <div className="fortune-streak-banner">
          <div className="streak-info">
            <FaFire className="streak-fire-icon" />
            <span>
              Tu Racha de Visitas: <strong>{streak} {streak === 1 ? 'día' : 'días consecutivos'}</strong>
            </span>
          </div>
          <div className="streak-tag">Ritual 1 vez por día</div>
        </div>

        {/* Tarjeta principal */}
        <section className="fortune-card">
          {!revealed ? (
            /* ============================================================== */
            /* 1. SELECCIÓN DEL MACARON (Caja cerrada)                        */
            /* ============================================================== */
            <div className="fortune-selection-view">
              <div className="fortune-intro-wrap">
                <span className="fortune-subtitle-tag">Elegí con el corazón</span>
                <h2 className="fortune-heading">Descubrí tu mensaje dulce de hoy</h2>
                <p className="fortune-subheading">
                  Cada mañana horneamos tres macarons especiales. Elegí el que llame tu atención para revelar
                  tu proverbio inspirador y un beneficio exclusivo para tu día.
                </p>
              </div>

              {/* Caja de macarons */}
              <div className={`macarons-box-container ${isOpening ? 'is-animating' : ''}`}>
                <div className="macarons-silk-bed" />

                <div className="macarons-row">
                  {MACARON_VARIETIES.map((macaron) => {
                    const isTarget = selectedMacaron?.id === macaron.id;
                    return (
                      <button
                        key={macaron.id}
                        type="button"
                        disabled={isOpening}
                        className={`macaron-item-btn ${isTarget && isOpening ? 'opening-macaron' : ''}`}
                        onClick={() => handleOpenMacaron(macaron)}
                      >
                        <div
                          className="macaron-visual"
                          style={{
                            '--macaron-top': macaron.colorTop,
                            '--macaron-fill': macaron.colorFilling,
                            '--macaron-bottom': macaron.colorBottom,
                            '--macaron-glow': macaron.glowColor
                          }}
                        >
                          <div className="macaron-shell shell-top" />
                          <div className="macaron-filling-layer" />
                          <div className="macaron-shell shell-bottom" />
                        </div>

                        <div className="macaron-label-box">
                          <span className="macaron-name">{macaron.name}</span>
                          <span className="macaron-sub">{macaron.sub}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <p className="fortune-hint-text">
                ✨ Hacé click en cualquier macaron para abrirlo y develar tu fortuna
              </p>
            </div>
          ) : (
            /* ============================================================== */
            /* 2. REVELACIÓN DEL PERGAMINO (Macaron abierto)                  */
            /* ============================================================== */
            <div className="fortune-revealed-view">
              <div className="fortune-parchment-card animate-unroll">
                <div className="parchment-inner">
                  <div className="parchment-seal-header">
                    <span className="seal-star">★</span>
                    <span className="seal-brand">MADAME PASTEL</span>
                    <span className="seal-theme">{fortuneData?.quote.theme}</span>
                    <span className="seal-star">★</span>
                  </div>

                  <div className="parchment-quote-body">
                    <span className="quote-mark open-quote">“</span>
                    <p className="quote-text">{fortuneData?.quote.quote}</p>
                    <span className="quote-mark close-quote">”</span>
                    <span className="quote-author">— {fortuneData?.quote.author}</span>
                  </div>

                  {/* Tarjeta de beneficio */}
                  <div className="parchment-reward-box">
                    <div className="reward-badge-tag">{fortuneData?.perk.badge}</div>
                    <h3 className="reward-title">{fortuneData?.perk.title}</h3>
                    <p className="reward-discount">{fortuneData?.perk.discount}</p>

                    <div className="reward-code-wrap">
                      <span className="reward-code-display">{fortuneData?.perk.code}</span>
                      <button
                        type="button"
                        className="btn-copy-fortune-code"
                        onClick={() => handleCopyCoupon(fortuneData?.perk.code)}
                      >
                        <FaCopy /> {couponCopied ? '¡Copiado!' : 'Copiar'}
                      </button>
                    </div>

                    <span className="reward-terms-note">{fortuneData?.perk.terms}</span>
                  </div>

                  {/* Contador de tiempo para el próximo día */}
                  <div className="fortune-countdown-box">
                    <FaClock className="countdown-icon" />
                    <span>
                      Tu próximo Macaron estará disponible a la medianoche:{' '}
                      <strong>{timeUntilReset.formatted}</strong>
                    </span>
                  </div>
                </div>
              </div>

              {/* Acciones */}
              <div className="fortune-actions-group">
                <a
                  href={getWhatsAppShareUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-whatsapp-fortune"
                >
                  <FaWhatsapp /> Compartir Frase & Fortuna en WhatsApp
                </a>

                <Link to="/productos" className="btn btn-shop-fortune">
                  <FaGift /> Usar mi Descuento en la Tienda
                </Link>

                <div className="fortune-extra-actions">
                  <button
                    type="button"
                    className="btn-demo-replay"
                    onClick={handleResetDemo}
                    title="Permite volver a abrir para probar la animación"
                  >
                    <FaRedo /> Probar otro macaron (Modo Demo)
                  </button>
                </div>
              </div>

              {/* Enlaces cruzados */}
              <div className="fortune-cross-links">
                <p>¿Querés seguir disfrutando de nuestro rincón de juegos?</p>
                <div className="cross-buttons-row">
                  <Link to="/que-dulce-sos" className="fortune-cross-btn">
                    🍓 Test: ¿Qué dulce sos?
                  </Link>
                  <Link to="/trivia" className="fortune-cross-btn">
                    🎯 Desafío Trivia (15s)
                  </Link>
                  <Link to="/crea-tu-pastel" className="fortune-cross-btn">
                    🎂 Diseñar mi Pastel
                  </Link>
                </div>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default FortuneMacaronPage;
