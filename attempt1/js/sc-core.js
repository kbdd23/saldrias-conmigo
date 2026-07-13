/* =============================================
   Saldrías Conmigo — Core: Constants & Utilities
   ============================================= */
window.SC = (function () {
  'use strict';

  const ACTIVITIES = [
    { emoji: '🎬', label: 'Cine' },
    { emoji: '🍝', label: 'Cena' },
    { emoji: '☕', label: 'Café' },
    { emoji: '🌳', label: 'Parque' },
    { emoji: '🎨', label: 'Museo' },
    { emoji: '🏖️', label: 'Playa' },
    { emoji: '🎤', label: 'Karaoke' },
    { emoji: '📖', label: 'Leer juntos' },
  ];

  const TIME_SLOTS = [
    '16:00', '17:00', '18:00', '19:00', '20:00', '21:00',
  ];

  const CONFIG = {
    DODGE_RADIUS: 200,
    STALK_THRESHOLD: 5,
    DODGE_COOLDOWN: 2000,
    HIDEOUT_THRESHOLD: 5,
  };

  const SUBTITLES = {
    initial: 'Una pregunta completamente normal para alguien especial.',
    firstDodge: '¡Será muy divertido!',
    chase: [
      'Casi...',
      'Uops, intentalo denuevo.',
      "Sorry..Didn't catch that",
      'Podrías intentarlo.',
    ],
    stalking: [
      'Quizás quisiste decir...',
      'Te tengo en la mira...',
      'Y esquivaba, y esquivaba...',
      '¿Segura?',
      'Eres libre de elegir lo que más quieras',
    ],
    hideout: 'Elige una opción. ^3^',
    fall: '¡Ala!',
    postFall: '¿Otra vez?... Fine...',
  };

  function $(id) { return document.getElementById(id); }

  function getAppRect(appEl) {
    return appEl.getBoundingClientRect();
  }

  function pickRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  return {
    ACTIVITIES: ACTIVITIES,
    TIME_SLOTS: TIME_SLOTS,
    CONFIG: CONFIG,
    SUBTITLES: SUBTITLES,
    $: $,
    getAppRect: getAppRect,
    pickRandom: pickRandom,
  };
})();
