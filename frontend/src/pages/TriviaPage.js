import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  FaClock,
  FaTrophy,
  FaStar,
  FaFire,
  FaCheckCircle,
  FaTimesCircle,
  FaRedo,
  FaWhatsapp,
  FaCopy,
  FaVolumeUp,
  FaVolumeMute,
  FaArrowRight,
  FaLightbulb,
  FaGift,
  FaBirthdayCake
} from 'react-icons/fa';
import {
  getRandomTriviaQuestions,
  getTriviaRankAndReward
} from '../data/triviaData';
import {
  getSoundMuted,
  toggleSoundMuted,
  playCorrectChime,
  playIncorrectBuzz,
  playTimerTick,
  playGameStartSound,
  playFanfare
} from '../utils/cakeSoundEffects';
import '../styles/TriviaPage.css';

const QUESTION_TIME_LIMIT = 15; // 15 segundos por pregunta

const TriviaPage = () => {
  // Configuración y estado de la partida
  const [questionCount, setQuestionCount] = useState(5);
  const [gameState, setGameState] = useState('intro'); // 'intro' | 'playing' | 'revealed' | 'finished'
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isTimeout, setIsTimeout] = useState(false);
  const [score, setScore] = useState(0);
  const [correctAnswersCount, setCorrectAnswersCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME_LIMIT);
  const [muted, setMuted] = useState(getSoundMuted());
  const [couponCopied, setCouponCopied] = useState(false);

  const timerRef = useRef(null);

  // Sincronizar mute
  const handleToggleMute = () => {
    const nextMuted = toggleSoundMuted();
    setMuted(nextMuted);
  };

  // Iniciar nueva partida
  const handleStartGame = (count = questionCount) => {
    const newQuestions = getRandomTriviaQuestions(count);
    setQuestions(newQuestions);
    setCurrentIndex(0);
    setScore(0);
    setCorrectAnswersCount(0);
    setStreak(0);
    setMaxStreak(0);
    setSelectedOption(null);
    setIsTimeout(false);
    setTimeLeft(QUESTION_TIME_LIMIT);
    setGameState('playing');
    setCouponCopied(false);
    playGameStartSound();
  };

  // Callback de resolución de pregunta (por click o por timeout)
  const handleResolveQuestion = useCallback((chosenIdx, timedOut = false) => {
    if (gameState !== 'playing') return;

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    const currentQ = questions[currentIndex];
    const isCorrect = !timedOut && chosenIdx === currentQ.correctIndex;

    setSelectedOption(chosenIdx);
    setIsTimeout(timedOut);
    setGameState('revealed');

    if (isCorrect) {
      playCorrectChime();
      const timeBonus = Math.round(timeLeft * 10);
      const pointsEarned = 100 + timeBonus + streak * 20;
      setScore((prev) => prev + pointsEarned);
      setCorrectAnswersCount((prev) => prev + 1);
      setStreak((prev) => {
        const next = prev + 1;
        if (next > maxStreak) setMaxStreak(next);
        return next;
      });
    } else {
      playIncorrectBuzz();
      setStreak(0);
    }
  }, [gameState, questions, currentIndex, timeLeft, streak, maxStreak]);

  // Manejar click en una opción
  const handleSelectOption = (idx) => {
    if (gameState !== 'playing') return;
    handleResolveQuestion(idx, false);
  };

  // Temporizador de cuenta regresiva
  useEffect(() => {
    if (gameState !== 'playing') {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleResolveQuestion(null, true);
          return 0;
        }

        // Tictac de advertencia en los últimos 4 segundos
        if (prev <= 5) {
          playTimerTick();
        }

        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState, currentIndex, handleResolveQuestion]);

  // Avanzar a la siguiente pregunta o finalizar
  const handleNextQuestion = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsTimeout(false);
      setTimeLeft(QUESTION_TIME_LIMIT);
      setGameState('playing');
    } else {
      setGameState('finished');
      playFanfare();
    }
  };

  // Copiar cupón al portapapeles
  const handleCopyCoupon = (code) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(code).then(() => {
        setCouponCopied(true);
        setTimeout(() => setCouponCopied(false), 2500);
      });
    }
  };

  // Construir link para compartir en WhatsApp
  const currentReward = getTriviaRankAndReward(
    correctAnswersCount,
    questions.length || questionCount
  );

  const getWhatsAppShareUrl = () => {
    const text = `🧁 ¡Acabo de jugar al Desafío Pastelero de Madame Pastel! 🎂\n\n🏆 Título obtenido: *${currentReward.rankTitle}*\n✨ Aciertos: *${correctAnswersCount} de ${questions.length}* (${Math.round((correctAnswersCount / (questions.length || 1)) * 100)}%)\n🎁 Descuento ganado: *${currentReward.discountLabel}* con el cupón *${currentReward.couponCode}*\n\n¿Te animás a superarme en la Trivia? ¡Jugá acá! 👇\n${window.location.origin}/trivia`;
    return `https://wa.me/?text=${encodeURIComponent(text)}`;
  };

  const currentQuestion = questions[currentIndex];
  const timerPercentage = (timeLeft / QUESTION_TIME_LIMIT) * 100;
  const timerIsWarning = timeLeft <= 5;

  return (
    <div className="trivia-page">
      {/* Barra superior de control */}
      <header className="trivia-header">
        <div className="container trivia-header-container">
          <div className="trivia-brand-info">
            <span className="trivia-badge">🎯 El Desafío Pastelero</span>
            <h1 className="trivia-main-title">Trivia Madame Pastel</h1>
          </div>

          <div className="trivia-header-actions">
            <button
              type="button"
              className={`trivia-sound-toggle ${muted ? 'muted' : ''}`}
              onClick={handleToggleMute}
              title={muted ? 'Activar sonido' : 'Silenciar sonido'}
              aria-label="Control de sonido"
            >
              {muted ? <FaVolumeMute /> : <FaVolumeUp />}
              <span>{muted ? 'Silenciado' : 'Sonido Activo'}</span>
            </button>

            <Link to="/que-dulce-sos" className="trivia-switch-game-link" style={{ background: '#B83B5E' }}>
              <span>🍓 Test: ¿Qué dulce sos?</span>
            </Link>

            <Link to="/crea-tu-pastel" className="trivia-switch-game-link">
              <FaBirthdayCake /> <span>Crea tu Pastel</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="container trivia-main-container">
        {/* ============================================================== */}
        {/* 1. PANTALLA INTRODUCCIÓN / LOBBY                               */}
        {/* ============================================================== */}
        {gameState === 'intro' && (
          <section className="trivia-card trivia-intro-card">
            <div className="trivia-intro-icon-wrap" aria-hidden="true">
              <span className="trivia-hero-emoji">🧁</span>
            </div>

            <h2 className="trivia-intro-title">¿Cuánto sabés de alta pastelería?</h2>
            <p className="trivia-intro-subtitle">
              Poné a prueba tu intuición y conocimientos sobre técnicas francesas, secretos de horneado
              y combinaciones gourmet. ¡Respondé contra reloj y ganá cupones de descuento exclusivos para tu próxima delicia!
            </p>

            <div className="trivia-rules-grid">
              <div className="trivia-rule-pill">
                <span className="rule-icon"><FaClock /></span>
                <div>
                  <strong>15 Segundos</strong>
                  <p>Por pregunta para pensar rápido</p>
                </div>
              </div>
              <div className="trivia-rule-pill">
                <span className="rule-icon"><FaFire /></span>
                <div>
                  <strong>Racha & Puntos</strong>
                  <p>Encadená aciertos para mayor puntaje</p>
                </div>
              </div>
              <div className="trivia-rule-pill">
                <span className="rule-icon"><FaGift /></span>
                <div>
                  <strong>Descuento Real</strong>
                  <p>Hasta 15% OFF garantizado</p>
                </div>
              </div>
            </div>

            {/* Selector de cantidad de preguntas */}
            <div className="trivia-count-selector">
              <span className="count-selector-label">Elegí la duración de tu partida:</span>
              <div className="count-buttons-group">
                <button
                  type="button"
                  className={`btn-count-choice ${questionCount === 5 ? 'active' : ''}`}
                  onClick={() => setQuestionCount(5)}
                >
                  ⚡ Ronda Express (5 Preguntas)
                </button>
                <button
                  type="button"
                  className={`btn-count-choice ${questionCount === 6 ? 'active' : ''}`}
                  onClick={() => setQuestionCount(6)}
                >
                  👑 Desafío Gourmet (6 Preguntas)
                </button>
              </div>
            </div>

            <button
              type="button"
              className="btn btn-trivia-primary btn-start-trivia"
              onClick={() => handleStartGame(questionCount)}
            >
              ✨ ¡Comenzar el Desafío!
            </button>
          </section>
        )}

        {/* ============================================================== */}
        {/* 2. PANTALLA DE JUEGO ACTIVO (PLAYING / REVEALED)                */}
        {/* ============================================================== */}
        {(gameState === 'playing' || gameState === 'revealed') && currentQuestion && (
          <section className="trivia-card trivia-play-card">
            {/* Barra de progreso e indicadores de ronda */}
            <div className="trivia-round-bar">
              <div className="trivia-round-tag">
                <span className="round-current-pill">
                  Pregunta {currentIndex + 1} de {questions.length}
                </span>
                <span className="category-pill">
                  {currentQuestion.categoryIcon} {currentQuestion.category}
                </span>
              </div>

              <div className="trivia-score-stats">
                {streak > 1 && (
                  <span className="streak-badge" title="Racha consecutiva de aciertos">
                    <FaFire /> {streak} en racha!
                  </span>
                )}
                <span className="score-badge">
                  <FaStar /> {score} pts
                </span>
              </div>
            </div>

            {/* Temporizador circular / barra visual */}
            <div className="trivia-timer-wrapper">
              <div className={`trivia-timer-box ${timerIsWarning ? 'warning-pulse' : ''}`}>
                <FaClock className="timer-icon" />
                <span className="timer-number">{timeLeft}s</span>
              </div>
              <div className="trivia-timer-bar-track">
                <div
                  className={`trivia-timer-bar-fill ${timerIsWarning ? 'is-warning' : ''}`}
                  style={{ width: `${timerPercentage}%` }}
                />
              </div>
            </div>

            {/* Enunciado de la pregunta */}
            <h2 className="trivia-question-text">{currentQuestion.question}</h2>

            {/* Opciones de respuesta */}
            <div className="trivia-options-grid" role="group" aria-label="Opciones de respuesta">
              {currentQuestion.options.map((option, idx) => {
                const optionLetter = String.fromCharCode(65 + idx); // A, B, C, D
                const isSelected = selectedOption === idx;
                const isCorrect = idx === currentQuestion.correctIndex;
                const isRevealed = gameState === 'revealed';

                let optionStateClass = '';
                if (isRevealed) {
                  if (isCorrect) {
                    optionStateClass = 'option-correct';
                  } else if (isSelected) {
                    optionStateClass = 'option-incorrect';
                  } else {
                    optionStateClass = 'option-dimmed';
                  }
                }

                return (
                  <button
                    key={idx}
                    type="button"
                    disabled={isRevealed}
                    className={`trivia-option-btn ${optionStateClass} ${isSelected ? 'option-selected' : ''}`}
                    onClick={() => handleSelectOption(idx)}
                  >
                    <span className="option-letter">{optionLetter}</span>
                    <span className="option-label">{option}</span>
                    {isRevealed && isCorrect && (
                      <FaCheckCircle className="option-status-icon correct-icon" />
                    )}
                    {isRevealed && isSelected && !isCorrect && (
                      <FaTimesCircle className="option-status-icon incorrect-icon" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Tarjeta explicativa "¿Sabías que...?" al revelar */}
            {gameState === 'revealed' && (
              <div className="trivia-reveal-container">
                <div className={`trivia-result-banner ${selectedOption === currentQuestion.correctIndex ? 'result-success' : 'result-failure'}`}>
                  {isTimeout ? (
                    <p className="result-headline">⏳ ¡Tiempo agotado!</p>
                  ) : selectedOption === currentQuestion.correctIndex ? (
                    <p className="result-headline">✨ ¡Correcto! +{100 + Math.round(timeLeft * 10)} pts</p>
                  ) : (
                    <p className="result-headline">Dulce intento, pero no fue esa...</p>
                  )}

                  <div className="trivia-fact-box">
                    <span className="fact-badge">
                      <FaLightbulb /> El Secreto de Madame Pastel
                    </span>
                    <p className="fact-text">{currentQuestion.explanation}</p>
                  </div>
                </div>

                <div className="trivia-next-action-wrap">
                  <button
                    type="button"
                    className="btn btn-trivia-primary btn-next-question"
                    onClick={handleNextQuestion}
                  >
                    {currentIndex + 1 < questions.length ? (
                      <>
                        Siguiente Pregunta <FaArrowRight />
                      </>
                    ) : (
                      <>
                        Ver mi Veredicto Final <FaTrophy />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </section>
        )}

        {/* ============================================================== */}
        {/* 3. PANTALLA FINAL / RECOMPENSAS Y CUPÓN                         */}
        {/* ============================================================== */}
        {gameState === 'finished' && (
          <section className="trivia-card trivia-finished-card">
            <div className="finished-celebration-badge">
              <span className="badge-tag">{currentReward.badge}</span>
            </div>

            <div className="finished-trophy-wrap">
              <span className="finished-emoji">🏆</span>
            </div>

            <h2 className="finished-rank-title">{currentReward.rankTitle}</h2>

            <div className="finished-stars-row" aria-label={`Puntaje: ${currentReward.stars} de 5 estrellas`}>
              {[...Array(5)].map((_, i) => (
                <FaStar
                  key={i}
                  className={`finished-star ${i < currentReward.stars ? 'active-star' : 'inactive-star'}`}
                />
              ))}
            </div>

            <p className="finished-description">{currentReward.description}</p>

            <div className="finished-stats-grid">
              <div className="stat-pill">
                <span className="stat-num">{correctAnswersCount} / {questions.length}</span>
                <span className="stat-label">Aciertos</span>
              </div>
              <div className="stat-pill">
                <span className="stat-num">{Math.round((correctAnswersCount / (questions.length || 1)) * 100)}%</span>
                <span className="stat-label">Precisión</span>
              </div>
              <div className="stat-pill">
                <span className="stat-num">{score}</span>
                <span className="stat-label">Puntaje Final</span>
              </div>
              <div className="stat-pill">
                <span className="stat-num">{maxStreak}</span>
                <span className="stat-label">Mejor Racha</span>
              </div>
            </div>

            {/* Tarjeta de Cupón de Descuento */}
            <div className="finished-coupon-box">
              <div className="coupon-header">
                <FaGift className="coupon-gift-icon" />
                <div>
                  <h3 className="coupon-title">Tu Recompensa Dulce</h3>
                  <p className="coupon-discount-text">{currentReward.discountLabel}</p>
                </div>
              </div>

              <div className="coupon-code-container">
                <span className="coupon-code-display">{currentReward.couponCode}</span>
                <button
                  type="button"
                  className="btn-copy-coupon"
                  onClick={() => handleCopyCoupon(currentReward.couponCode)}
                  title="Copiar cupón de descuento"
                >
                  <FaCopy /> {couponCopied ? '¡Copiado!' : 'Copiar'}
                </button>
              </div>
              <p className="coupon-terms-note">{currentReward.minSpend}</p>
            </div>

            {/* Acciones finales */}
            <div className="finished-actions-group">
              <a
                href={getWhatsAppShareUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-whatsapp-share"
              >
                <FaWhatsapp /> Compartir mi Puntaje en WhatsApp
              </a>

              <Link to="/productos" className="btn btn-browse-shop">
                Ver Tienda para Canjear Cupón
              </Link>

              <button
                type="button"
                className="btn btn-restart-game"
                onClick={() => handleStartGame(questionCount)}
              >
                <FaRedo /> Jugar Otra Partida
              </button>
            </div>

            {/* Enlaces cruzados con los otros juegos */}
            <div className="finished-cross-promo">
              <p>¿Querés más experiencias dulces?</p>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link to="/que-dulce-sos" className="btn-cross-game">
                  🍓 ¡Descubrí qué dulce sos (Test)!
                </Link>
                <Link to="/crea-tu-pastel" className="btn-cross-game">
                  🎂 ¡Diseñá tu pastel en el Taller Creativo!
                </Link>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default TriviaPage;
